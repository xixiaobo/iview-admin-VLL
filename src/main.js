import 'babel-polyfill';
import Vue from 'vue';
import iView from 'iview';
import {router} from './router/index';
import {appRouter} from './router/router';
import store from './store';
import App from './app.vue';
import '@/locale';
import 'iview/dist/styles/iview.css';
import VueI18n from 'vue-i18n';
import util from '@/libs/util';
import VueContextMenu from 'vue-contextmenu'
import 'vue-contextmenu/style/css/font-awesome.min.css'
import VueClipboard from 'vue-clipboard2'

Vue.use(VueClipboard)
Vue.use(VueContextMenu)

Vue.use(VueI18n);
Vue.use(iView);
if (window.sessionStorage.storeApp !== undefined) {
	store.state.app = JSON.parse(window.sessionStorage.storeApp)
}

new Vue({
    el: '#app',     //el用于指定一个页面中已存在的DOM元素来挂载Vue实例
    router: router,
    store: store,
    render: h => h(App),
    data: {
        currentPageName: ''
    },
    mounted () {
        this.currentPageName = this.$route.name;
        // 显示打开的页面的列表
        this.$store.commit('setOpenedList');
        this.$store.commit('initCachepage');
        // 权限菜单过滤相关
        this.$store.commit('updateMenulist');
        // iview-admin检查更新
        util.checkUpdate(this);
    },
    created () {
    		if (window.sessionStorage.RouterList !== undefined) {
					let list = JSON.parse(window.sessionStorage.RouterList)
					store.state.app.menuListall = []
				  for (let  i = 0; i <list.length; i++ ) {
				  	util.setMyMenu(this,list[i])
				  }
				}
        let tagsList = [];
        appRouter.map((item) => {
            if (item.children.length <= 1) {
                tagsList.push(item.children[0]);
            } else {
                tagsList.push(...item.children);
            }
        });
        this.$store.commit('setTagsList', tagsList);
    }
});


window.onload=function(){
        document.oncontextmenu = function(){
            return false;
        }
    }
