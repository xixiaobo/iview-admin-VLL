import axios from 'axios';
import env from '../../build/env';
import semver from 'semver';
import packjson from '../../package.json';
import Cookies from 'js-cookie';
import Vue from 'vue'
import {router} from '../router/index';
import iView, {Notice } from 'iview'
import store from '../store/modules/app';
import Main from '@/views/Main.vue';
import {otherRouter, appRouter} from '@/router/router';
Vue.use(iView)

let util = {

};
let that
util.title = function (title) {
    title = title || 'VLL链路管理';
    window.document.title = title;
};

// const ajaxUrl = env === 'development'
//     ? 'http://127.0.0.1:8888'
//     : env === 'production'
//     ? 'https://www.url.com'
//     : 'https://debug.url.com';
    
const baseUrl = 'http://47.94.147.210:8080/'
axios.defaults.withCredentials = true
// axios.defaults.xsrfCookieName = 'X-XSRF-TOKEN'
// axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN'
// `xsrfCookieName` 是用作 xsrf token 的值的cookie的名称
// xsrfCookieName: 'csrftoken',
// `xsrfHeaderName` 是承载 xsrf token 的值的 HTTP 头的名称
// xsrfHeaderName: 'X-CSRFTOKEN',

// axios.defaults.headers.common['Authorization'] = "Token "+'123123123123';
if (Cookies.get('XSRF-TOKEN') !== undefined) {
    axios.defaults.headers["X-XSRF-TOKEN"] =  Cookies.get('XSRF-TOKEN')
}
// axios.defaults.headers.xsrfHeaderName = 'X-XSRF-TOKEN'
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

util.axios = axios.create({
    // xsrfHeaderName: 'X-XSRF-TOKEN' + window.localStorage.XSRF_TOKEN,
    baseURL: baseUrl,
    timeout: 36000,
    withCredentials: true
});

// 添加请求拦截器
util.axios.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
util.axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    // console.log(document.cookie)
    // console.log(Cookies.get('XSRF-TOKEN'))
    return response;
}, function (error) {
    switch (error.response.status) {
        case 401:
        Notice.error({
            title: '认证失败',
            desc: '请重新登录',
            duration: 0
        })
        that.$store.commit('logout', that)
        that.$store.commit('clearOpenedSubmenu')
        delete window.localStorage.XSRF_TOKEN
        router.push({
            name: 'login'
        })
        case 403:
            Notice.error({
                title: '无权限',
                desc: '请联系管理员赋予权限',
                duration: 0
            })

    }
    // 对响应错误做点什么
    return Promise.reject(error);
});

util.inOf = function (arr, targetArr) {
    let res = true;
    arr.map(item => {
        if (targetArr.indexOf(item) < 0) {
            res = false;
        }
    });
    return res;
};

util.oneOf = function (ele, targetArr) {
    if (targetArr.indexOf(ele) >= 0) {
        return true;
    } else {
        return false;
    }
};

util.showThisRoute = function (itAccess, currentAccess) {
    if (typeof itAccess === 'object' && Array.isArray(itAccess)) {
        return util.oneOf(currentAccess, itAccess);
    } else {
        return itAccess === currentAccess;
    }
};

util.getRouterObjByName = function (routers, name) {
    if (!name || !routers || !routers.length) {
        return null;
    }
    // debugger;
    let routerObj = null;
    for (let item of routers) {
        if (item.name === name) {
            return item;
        }
        routerObj = util.getRouterObjByName(item.children, name);
        if (routerObj) {
            return routerObj;
        }
    }
    return null;
};

util.handleTitle = function (vm, item) {
    if (typeof item.title === 'object') {
        return vm.$t(item.title.i18n);
    } else {
        return item.title;
    }
};

util.setCurrentPath = function (vm, name) {
    let title = '';
    let isOtherRouter = false;
    vm.$store.state.app.routers.forEach(item => {
        if (item.children.length === 1) {
            if (item.children[0].name === name) {
                title = util.handleTitle(vm, item);
                if (item.name === 'otherRouter') {
                    isOtherRouter = true;
                }
            }
        } else {
            item.children.forEach(child => {
                if (child.name === name) {
                    title = util.handleTitle(vm, child);
                    if (item.name === 'otherRouter') {
                        isOtherRouter = true;
                    }
                }
            });
        }
    });
    let currentPathArr = [];
    if (name === 'home_index') {
        currentPathArr = [
            {
                title: util.handleTitle(vm, util.getRouterObjByName(vm.$store.state.app.routers, 'home_index')),
                path: '',
                name: 'home_index'
            }
        ];
    } else if ((name.indexOf('_index') >= 0 || isOtherRouter) && name !== 'home_index') {
        currentPathArr = [
            {
                title: util.handleTitle(vm, util.getRouterObjByName(vm.$store.state.app.routers, 'home_index')),
                path: '/home',
                name: 'home_index'
            },
            {
                title: title,
                path: '',
                name: name
            }
        ];
    } else {
        let currentPathObj = vm.$store.state.app.routers.filter(item => {
            if (item.children.length <= 1) {
                return item.children[0].name === name;
            } else {
                let i = 0;
                let childArr = item.children;
                let len = childArr.length;
                while (i < len) {
                    if (childArr[i].name === name) {
                        return true;
                    }
                    i++;
                }
                return false;
            }
        })[0];
        if (currentPathObj.children.length <= 1 && currentPathObj.name === 'home') {
            currentPathArr = [
                {
                    title: '首页',
                    path: '',
                    name: 'home_index'
                }
            ];
        } else if (currentPathObj.children.length <= 1 && currentPathObj.name !== 'home') {
            currentPathArr = [
                {
                    title: '首页',
                    path: '/home',
                    name: 'home_index'
                },
                {
                    title: currentPathObj.title,
                    path: '',
                    name: name
                }
            ];
        } else {
            let childObj = currentPathObj.children.filter((child) => {
                return child.name === name;
            })[0];
            currentPathArr = [
                {
                    title: '首页',
                    path: '/home',
                    name: 'home_index'
                },
                {
                    title: currentPathObj.title,
                    path: '',
                    name: currentPathObj.name
                },
                {
                    title: childObj.title,
                    path: currentPathObj.path + '/' + childObj.path,
                    name: name
                }
            ];
        }
    }
    vm.$store.commit('setCurrentPath', currentPathArr);

    return currentPathArr;
};

util.openNewPage = function (vm, name, argu, query) {
    let pageOpenedList = vm.$store.state.app.pageOpenedList;
    let openedPageLen = pageOpenedList.length;
    let i = 0;
    let tagHasOpened = false;
    while (i < openedPageLen) {
        if (name === pageOpenedList[i].name) {  // 页面已经打开
            vm.$store.commit('pageOpenedList', {
                index: i,
                argu: argu,
                query: query
            });
            tagHasOpened = true;
            break;
        }
        i++;
    }
    if (!tagHasOpened) {
        let tag = vm.$store.state.app.tagsList.filter((item) => {
            if (item.children) {
                return name === item.children[0].name;
            } else {
                return name === item.name;
            }
        });
        tag = tag[0];
        if (tag) {
            tag = tag.children ? tag.children[0] : tag;
            if (argu) {
                tag.argu = argu;
            }
            if (query) {
                tag.query = query;
            }
            vm.$store.commit('increateTag', tag);
        }
    }
    vm.$store.commit('setCurrentPageName', name);
};

util.toDefaultPage = function (routers, name, route, next) {
    let len = routers.length;
    let i = 0;
    let notHandle = true;
    while (i < len) {
        if (routers[i].name === name && routers[i].children && routers[i].redirect === undefined) {
            route.replace({
                name: routers[i].children[0].name
            });
            notHandle = false;
            next();
            break;
        }
        i++;
    }
    if (notHandle) {
        next();
    }
};

util.fullscreenEvent = function (vm) {
    vm.$store.commit('initCachepage');
    // 权限菜单过滤相关
    vm.$store.commit('updateMenulist');
    // 全屏相关
};

util.checkUpdate = function (vm) {
    that = vm
    // axios.get('https://api.github.com/repos/iview/iview-admin/releases/latest').then(res => {
    //     let version = res.data.tag_name;
    //     vm.$Notice.config({
    //         duration: 0
    //     });
    //     if (semver.lt(packjson.version, version)) {
    //         vm.$Notice.info({
    //             title: 'iview-admin更新啦',
    //             desc: '<p>iView-admin更新到了' + version + '了，去看看有哪些变化吧</p><a style="font-size:13px;" href="https://github.com/iview/iview-admin/releases" target="_blank">前往github查看</a>'
    //         });
    //     }
    // });
};

util.getRouter = function (vm) {
	vm.$store.state.app.menuListall = []
	vm.$store.state.app.tagsList = [...otherRouter.children]
	util.axios({
      method: 'get',
      url: '/productmodule/api/getuser_ProductAndViews', 
  }).then(res => {
  	// 获取产品
  	console.log(res.data)
  	let arr = JSON.parse(JSON.stringify(res.data.productsDate))
      arr.push({
        'product_name' : '系统',
        'uuid': 0
      })
      vm.$store.state.app.headerMenuList = arr
      window.localStorage.headerMenuList = JSON.stringify(arr)
      vm.$router.push({
  			name: 'home_index'
			});
			// 获取动态路由
			let list = res.data.viewsDate
			vm.$store.state.app.menuListall = []
			
      for (let  i = 0; i <list.length; i++ ) {
      	list[i].children = []
      	for (let j = 0; j < list.length; j++) {
      		if (list[j].views_level === '2') {
      			let supera = list[i].views_super +'/'+ list[i].views_name_cn
      			if (supera === list[j].views_super) {
      				list[i].children.push(list[j])
      			}
      		}
      	}
      	util.setMyMenu(vm,list[i])
      }
      window.sessionStorage.RouterList = JSON.stringify(list)
      window.sessionStorage.storeApp = JSON.stringify(vm.$store.state.app)
  }).catch(function (error) {
      console.log(error)
  });
}

util.setMyMenu = function (vm, item) {
		let children = []
		let children1 = []
		let num = []
		let index = { 
            	path: item.views_name_en, 
            	title: item.views_name_cn, 
            	meta: {
        				access: 1,
        				routerpath: item.views_name_en,
        				supper: item.views_super,
        				level: item.views_level,
        			},
        			icon: item.views_icon,
            	name: item.views_name_cn + '_index', 
            	component: resolve => { require(['@/views/myView/myView.vue'], resolve); } 
            }
		children.push(index)
		children1.push(index)
		if (item.children !== undefined) {
			if (item.children.length !== 0) {
				num = []
				for (let i = 0; i < item.children.length; i++) {
					let indexone = {
	        	path: item.children[i].views_name_cn +"_"+item.children[i].views_name_en, 
	        	title: item.children[i].views_name_cn, 
	        	meta: {
	    				access: 1,
	    				routerpath: item.children[i].views_name_en,
	    				supper: item.children[i].views_super,
	    				level: item.children[i].views_level,
	    			},
	    			icon: item.children[i].views_icon,
	        	name: item.children[i].views_name_cn + '_index', 
	        	component: resolve => { require(['@/views/myView/myView.vue'], resolve); } 
	        }
					num.push(indexone)
					children1.push(indexone)
				}
			}
		}
		if (num.length !== 0) {
			children = num
		}
    vm.$router.addRoutes([{
        path: '/' + item.views_super,
        icon: item.views_icon,
        name: item.views_name_cn,
        title: item.views_name_cn,
        meta: {
        	access: 1,
        	routerpath: item.views_name_en,
        	supper: item.views_super,
        	level: item.views_level,
        },
        component: Main,
        children: children1
    }])
    vm.$store.state.app.menuListall.push({
        path: '/' + item.views_super,
        icon: item.views_icon,
        name: item.views_name_cn,
        title: item.views_name_cn,
        access: 1,
        routerpath: item.views_name_en,
        supper: item.views_super,
        level: item.views_level,
        component: Main,
        children: children
    })
    vm.$store.state.app.tagsList.push({
        path: item.views_name_en,
        icon: item.views_icon,
        name: item.views_name_cn,
        title: item.views_name_cn,
        component: Main,
        children: children
    })
};


util.iconList = function () {
    let iconList = [
        {'id': 1, 'type': 'ionic', 'btnType': 'ghost'},
        {'id': 2, 'type': 'arrow-up-a', 'btnType': 'ghost'},
        {'id': 3, 'type': 'arrow-right-a', 'btnType': 'ghost'},
        {'id': 4, 'type': 'arrow-down-a', 'btnType': 'ghost'},
        {'id': 5, 'type': 'arrow-left-a', 'btnType': 'ghost'},
        {'id': 6, 'type': 'arrow-up-b', 'btnType': 'ghost'},
        {'id': 7, 'type': 'arrow-right-b', 'btnType': 'ghost'},
        {'id': 8, 'type': 'arrow-down-b', 'btnType': 'ghost'},
        {'id': 9, 'type': 'arrow-left-b', 'btnType': 'ghost'},
        {'id': 10, 'type': 'arrow-up-c', 'btnType': 'ghost'},
        {'id': 11, 'type': 'arrow-right-c', 'btnType': 'ghost'},
        {'id': 12, 'type': 'arrow-down-c', 'btnType': 'ghost'},
        {'id': 13, 'type': 'arrow-left-c', 'btnType': 'ghost'},
        {'id': 14, 'type': 'arrow-return-right', 'btnType': 'ghost'},
        {'id': 15, 'type': 'arrow-return-left', 'btnType': 'ghost'},
        {'id': 16, 'type': 'arrow-swap', 'btnType': 'ghost'},
        {'id': 17, 'type': 'arrow-shrink', 'btnType': 'ghost'},
        {'id': 18, 'type': 'arrow-expand', 'btnType': 'ghost'},
        {'id': 19, 'type': 'arrow-move', 'btnType': 'ghost'},
        {'id': 20, 'type': 'arrow-resize', 'btnType': 'ghost'},
        {'id': 21, 'type': 'chevron-up', 'btnType': 'ghost'},
        {'id': 22, 'type': 'chevron-right', 'btnType': 'ghost'},
        {'id': 23, 'type': 'chevron-down', 'btnType': 'ghost'},
        {'id': 24, 'type': 'chevron-left', 'btnType': 'ghost'},
        {'id': 25, 'type': 'navicon-round', 'btnType': 'ghost'},
        {'id': 26, 'type': 'navicon', 'btnType': 'ghost'},
        {'id': 27, 'type': 'drag', 'btnType': 'ghost'},
        {'id': 28, 'type': 'log-in', 'btnType': 'ghost'},
        {'id': 29, 'type': 'log-out', 'btnType': 'ghost'},
        {'id': 30, 'type': 'checkmark-round', 'btnType': 'ghost'},
        {'id': 31, 'type': 'checkmark', 'btnType': 'ghost'},
        {'id': 32, 'type': 'checkmark-circled', 'btnType': 'ghost'},
        {'id': 33, 'type': 'close-round', 'btnType': 'ghost'},
        {'id': 34, 'type': 'close', 'btnType': 'ghost'},
        {'id': 35, 'type': 'close-circled', 'btnType': 'ghost'},
        {'id': 36, 'type': 'plus-round', 'btnType': 'ghost'},
        {'id': 37, 'type': 'plus', 'btnType': 'ghost'},
        {'id': 38, 'type': 'plus-circled', 'btnType': 'ghost'},
        {'id': 39, 'type': 'minus-round', 'btnType': 'ghost'},
        {'id': 40, 'type': 'minus', 'btnType': 'ghost'},
        {'id': 41, 'type': 'minus-circled', 'btnType': 'ghost'},
        {'id': 42, 'type': 'information', 'btnType': 'ghost'},
        {'id': 43, 'type': 'information-circled', 'btnType': 'ghost'},
        {'id': 44, 'type': 'help', 'btnType': 'ghost'},
        {'id': 45, 'type': 'help-circled', 'btnType': 'ghost'},
        {'id': 46, 'type': 'backspace-outline', 'btnType': 'ghost'},
        {'id': 47, 'type': 'backspace', 'btnType': 'ghost'},
        {'id': 48, 'type': 'help-buoy', 'btnType': 'ghost'},
        {'id': 49, 'type': 'asterisk', 'btnType': 'ghost'},
        {'id': 50, 'type': 'alert', 'btnType': 'ghost'},
        {'id': 51, 'type': 'alert-circled', 'btnType': 'ghost'},
        {'id': 52, 'type': 'refresh', 'btnType': 'ghost'},
        {'id': 53, 'type': 'loop', 'btnType': 'ghost'},
        {'id': 54, 'type': 'shuffle', 'btnType': 'ghost'},
        {'id': 55, 'type': 'home', 'btnType': 'ghost'},
        {'id': 56, 'type': 'search', 'btnType': 'ghost'},
        {'id': 57, 'type': 'flag', 'btnType': 'ghost'},
        {'id': 58, 'type': 'star', 'btnType': 'ghost'},
        {'id': 59, 'type': 'heart', 'btnType': 'ghost'},
        {'id': 60, 'type': 'heart-broken', 'btnType': 'ghost'},
        {'id': 61, 'type': 'gear-a', 'btnType': 'ghost'},
        {'id': 62, 'type': 'gear-b', 'btnType': 'ghost'},
        {'id': 63, 'type': 'toggle-filled', 'btnType': 'ghost'},
        {'id': 64, 'type': 'toggle', 'btnType': 'ghost'},
        {'id': 65, 'type': 'settings', 'btnType': 'ghost'},
        {'id': 66, 'type': 'wrench', 'btnType': 'ghost'},
        {'id': 67, 'type': 'hammer', 'btnType': 'ghost'},
        {'id': 68, 'type': 'edit', 'btnType': 'ghost'},
        {'id': 69, 'type': 'trash-a', 'btnType': 'ghost'},
        {'id': 70, 'type': 'trash-b', 'btnType': 'ghost'},
        {'id': 71, 'type': 'document', 'btnType': 'ghost'},
        {'id': 72, 'type': 'document-text', 'btnType': 'ghost'},
        {'id': 73, 'type': 'clipboard', 'btnType': 'ghost'},
        {'id': 74, 'type': 'scissors', 'btnType': 'ghost'},
        {'id': 75, 'type': 'funnel', 'btnType': 'ghost'},
        {'id': 76, 'type': 'bookmark', 'btnType': 'ghost'},
        {'id': 77, 'type': 'email', 'btnType': 'ghost'},
        {'id': 78, 'type': 'email-unread', 'btnType': 'ghost'},
        {'id': 79, 'type': 'folder', 'btnType': 'ghost'},
        {'id': 80, 'type': 'filing', 'btnType': 'ghost'},
        {'id': 81, 'type': 'archive', 'btnType': 'ghost'},
        {'id': 82, 'type': 'reply', 'btnType': 'ghost'},
        {'id': 83, 'type': 'reply-all', 'btnType': 'ghost'},
        {'id': 84, 'type': 'forward', 'btnType': 'ghost'},
        {'id': 85, 'type': 'share', 'btnType': 'ghost'},
        {'id': 86, 'type': 'paper-airplane', 'btnType': 'ghost'},
        {'id': 87, 'type': 'link', 'btnType': 'ghost'},
        {'id': 88, 'type': 'paperclip', 'btnType': 'ghost'},
        {'id': 89, 'type': 'compose', 'btnType': 'ghost'},
        {'id': 90, 'type': 'briefcase', 'btnType': 'ghost'},
        {'id': 91, 'type': 'medkit', 'btnType': 'ghost'},
        {'id': 92, 'type': 'at', 'btnType': 'ghost'},
        {'id': 93, 'type': 'pound', 'btnType': 'ghost'},
        {'id': 94, 'type': 'quote', 'btnType': 'ghost'},
        {'id': 95, 'type': 'cloud', 'btnType': 'ghost'},
        {'id': 96, 'type': 'upload', 'btnType': 'ghost'},
        {'id': 97, 'type': 'more', 'btnType': 'ghost'},
        {'id': 98, 'type': 'grid', 'btnType': 'ghost'},
        {'id': 99, 'type': 'calendar', 'btnType': 'ghost'},
        {'id': 100, 'type': 'clock', 'btnType': 'ghost'},
        {'id': 101, 'type': 'compass', 'btnType': 'ghost'},
        {'id': 102, 'type': 'pinpoint', 'btnType': 'ghost'},
        {'id': 103, 'type': 'pin', 'btnType': 'ghost'},
        {'id': 104, 'type': 'navigate', 'btnType': 'ghost'},
        {'id': 105, 'type': 'location', 'btnType': 'ghost'},
        {'id': 106, 'type': 'map', 'btnType': 'ghost'},
        {'id': 107, 'type': 'lock-combination', 'btnType': 'ghost'},
        {'id': 108, 'type': 'locked', 'btnType': 'ghost'},
        {'id': 109, 'type': 'unlocked', 'btnType': 'ghost'},
        {'id': 110, 'type': 'key', 'btnType': 'ghost'},
        {'id': 111, 'type': 'arrow-graph-up-right', 'btnType': 'ghost'},
        {'id': 112, 'type': 'arrow-graph-down-right', 'btnType': 'ghost'},
        {'id': 113, 'type': 'arrow-graph-up-left', 'btnType': 'ghost'},
        {'id': 114, 'type': 'arrow-graph-down-left', 'btnType': 'ghost'},
        {'id': 115, 'type': 'stats-bars', 'btnType': 'ghost'},
        {'id': 116, 'type': 'connection-bars', 'btnType': 'ghost'},
        {'id': 117, 'type': 'pie-graph', 'btnType': 'ghost'},
        {'id': 118, 'type': 'chatbubble', 'btnType': 'ghost'},
        {'id': 119, 'type': 'chatbubble-working', 'btnType': 'ghost'},
        {'id': 120, 'type': 'chatbubbles', 'btnType': 'ghost'},
        {'id': 121, 'type': 'chatbox', 'btnType': 'ghost'},
        {'id': 122, 'type': 'chatbox-working', 'btnType': 'ghost'},
        {'id': 123, 'type': 'chatboxes', 'btnType': 'ghost'},
        {'id': 124, 'type': 'person', 'btnType': 'ghost'},
        {'id': 125, 'type': 'person-add', 'btnType': 'ghost'},
        {'id': 126, 'type': 'person-stalker', 'btnType': 'ghost'},
        {'id': 127, 'type': 'woman', 'btnType': 'ghost'},
        {'id': 128, 'type': 'man', 'btnType': 'ghost'},
        {'id': 129, 'type': 'female', 'btnType': 'ghost'},
        {'id': 130, 'type': 'male', 'btnType': 'ghost'},
        {'id': 131, 'type': 'transgender', 'btnType': 'ghost'},
        {'id': 132, 'type': 'fork', 'btnType': 'ghost'},
        {'id': 133, 'type': 'knife', 'btnType': 'ghost'},
        {'id': 134, 'type': 'spoon', 'btnType': 'ghost'},
        {'id': 135, 'type': 'soup-can-outline', 'btnType': 'ghost'},
        {'id': 136, 'type': 'soup-can', 'btnType': 'ghost'},
        {'id': 137, 'type': 'beer', 'btnType': 'ghost'},
        {'id': 138, 'type': 'wineglass', 'btnType': 'ghost'},
        {'id': 139, 'type': 'coffee', 'btnType': 'ghost'},
        {'id': 140, 'type': 'icecream', 'btnType': 'ghost'},
        {'id': 141, 'type': 'pizza', 'btnType': 'ghost'},
        {'id': 142, 'type': 'power', 'btnType': 'ghost'},
        {'id': 143, 'type': 'mouse', 'btnType': 'ghost'},
        {'id': 144, 'type': 'battery-full', 'btnType': 'ghost'},
        {'id': 145, 'type': 'battery-half', 'btnType': 'ghost'},
        {'id': 146, 'type': 'battery-low', 'btnType': 'ghost'},
        {'id': 147, 'type': 'battery-empty', 'btnType': 'ghost'},
        {'id': 148, 'type': 'battery-charging', 'btnType': 'ghost'},
        {'id': 149, 'type': 'wifi', 'btnType': 'ghost'},
        {'id': 150, 'type': 'bluetooth', 'btnType': 'ghost'},
        {'id': 151, 'type': 'calculator', 'btnType': 'ghost'},
        {'id': 152, 'type': 'camera', 'btnType': 'ghost'},
        {'id': 153, 'type': 'eye', 'btnType': 'ghost'},
        {'id': 154, 'type': 'eye-disabled', 'btnType': 'ghost'},
        {'id': 155, 'type': 'flash', 'btnType': 'ghost'},
        {'id': 156, 'type': 'flash-off', 'btnType': 'ghost'},
        {'id': 157, 'type': 'qr-scanner', 'btnType': 'ghost'},
        {'id': 158, 'type': 'image', 'btnType': 'ghost'},
        {'id': 159, 'type': 'images', 'btnType': 'ghost'},
        {'id': 160, 'type': 'wand', 'btnType': 'ghost'},
        {'id': 161, 'type': 'contrast', 'btnType': 'ghost'},
        {'id': 162, 'type': 'aperture', 'btnType': 'ghost'},
        {'id': 163, 'type': 'crop', 'btnType': 'ghost'},
        {'id': 164, 'type': 'easel', 'btnType': 'ghost'},
        {'id': 165, 'type': 'paintbrush', 'btnType': 'ghost'},
        {'id': 166, 'type': 'paintbucket', 'btnType': 'ghost'},
        {'id': 167, 'type': 'monitor', 'btnType': 'ghost'},
        {'id': 168, 'type': 'laptop', 'btnType': 'ghost'},
        {'id': 169, 'type': 'ipad', 'btnType': 'ghost'},
        {'id': 170, 'type': 'iphone', 'btnType': 'ghost'},
        {'id': 171, 'type': 'ipod', 'btnType': 'ghost'},
        {'id': 172, 'type': 'printer', 'btnType': 'ghost'},
        {'id': 173, 'type': 'usb', 'btnType': 'ghost'},
        {'id': 174, 'type': 'outlet', 'btnType': 'ghost'},
        {'id': 175, 'type': 'bug', 'btnType': 'ghost'},
        {'id': 176, 'type': 'code', 'btnType': 'ghost'},
        {'id': 177, 'type': 'code-working', 'btnType': 'ghost'},
        {'id': 178, 'type': 'code-download', 'btnType': 'ghost'},
        {'id': 179, 'type': 'fork-repo', 'btnType': 'ghost'},
        {'id': 180, 'type': 'network', 'btnType': 'ghost'},
        {'id': 181, 'type': 'pull-request', 'btnType': 'ghost'},
        {'id': 182, 'type': 'merge', 'btnType': 'ghost'},
        {'id': 183, 'type': 'xbox', 'btnType': 'ghost'},
        {'id': 184, 'type': 'playstation', 'btnType': 'ghost'},
        {'id': 185, 'type': 'steam', 'btnType': 'ghost'},
        {'id': 186, 'type': 'closed-captioning', 'btnType': 'ghost'},
        {'id': 187, 'type': 'videocamera', 'btnType': 'ghost'},
        {'id': 188, 'type': 'film-marker', 'btnType': 'ghost'},
        {'id': 189, 'type': 'disc', 'btnType': 'ghost'},
        {'id': 190, 'type': 'headphone', 'btnType': 'ghost'},
        {'id': 191, 'type': 'music-note', 'btnType': 'ghost'},
        {'id': 192, 'type': 'radio-waves', 'btnType': 'ghost'},
        {'id': 193, 'type': 'speakerphone', 'btnType': 'ghost'},
        {'id': 194, 'type': 'mic-a', 'btnType': 'ghost'},
        {'id': 195, 'type': 'mic-b', 'btnType': 'ghost'},
        {'id': 196, 'type': 'mic-c', 'btnType': 'ghost'},
        {'id': 197, 'type': 'volume-high', 'btnType': 'ghost'},
        {'id': 198, 'type': 'volume-medium', 'btnType': 'ghost'},
        {'id': 199, 'type': 'volume-low', 'btnType': 'ghost'},
        {'id': 200, 'type': 'volume-mute', 'btnType': 'ghost'},
        {'id': 201, 'type': 'levels', 'btnType': 'ghost'},
        {'id': 202, 'type': 'play', 'btnType': 'ghost'},
        {'id': 203, 'type': 'pause', 'btnType': 'ghost'},
        {'id': 204, 'type': 'stop', 'btnType': 'ghost'},
        {'id': 205, 'type': 'record', 'btnType': 'ghost'},
        {'id': 206, 'type': 'skip-forward', 'btnType': 'ghost'},
        {'id': 207, 'type': 'skip-backward', 'btnType': 'ghost'},
        {'id': 208, 'type': 'eject', 'btnType': 'ghost'},
        {'id': 209, 'type': 'bag', 'btnType': 'ghost'},
        {'id': 210, 'type': 'card', 'btnType': 'ghost'},
        {'id': 211, 'type': 'cash', 'btnType': 'ghost'},
        {'id': 212, 'type': 'pricetag', 'btnType': 'ghost'},
        {'id': 213, 'type': 'pricetags', 'btnType': 'ghost'},
        {'id': 214, 'type': 'thumbsup', 'btnType': 'ghost'},
        {'id': 215, 'type': 'thumbsdown', 'btnType': 'ghost'},
        {'id': 216, 'type': 'happy-outline', 'btnType': 'ghost'},
        {'id': 217, 'type': 'happy', 'btnType': 'ghost'},
        {'id': 218, 'type': 'sad-outline', 'btnType': 'ghost'},
        {'id': 219, 'type': 'sad', 'btnType': 'ghost'},
        {'id': 220, 'type': 'bowtie', 'btnType': 'ghost'},
        {'id': 221, 'type': 'tshirt-outline', 'btnType': 'ghost'},
        {'id': 222, 'type': 'tshirt', 'btnType': 'ghost'},
        {'id': 223, 'type': 'trophy', 'btnType': 'ghost'},
        {'id': 224, 'type': 'podium', 'btnType': 'ghost'},
        {'id': 225, 'type': 'ribbon-a', 'btnType': 'ghost'},
        {'id': 226, 'type': 'ribbon-b', 'btnType': 'ghost'},
        {'id': 227, 'type': 'university', 'btnType': 'ghost'},
        {'id': 228, 'type': 'magnet', 'btnType': 'ghost'},
        {'id': 229, 'type': 'beaker', 'btnType': 'ghost'},
        {'id': 230, 'type': 'erlenmeyer-flask', 'btnType': 'ghost'},
        {'id': 231, 'type': 'egg', 'btnType': 'ghost'},
        {'id': 232, 'type': 'earth', 'btnType': 'ghost'},
        {'id': 233, 'type': 'planet', 'btnType': 'ghost'},
        {'id': 234, 'type': 'lightbulb', 'btnType': 'ghost'},
        {'id': 235, 'type': 'cube', 'btnType': 'ghost'},
        {'id': 236, 'type': 'leaf', 'btnType': 'ghost'},
        {'id': 237, 'type': 'waterdrop', 'btnType': 'ghost'},
        {'id': 238, 'type': 'flame', 'btnType': 'ghost'},
        {'id': 239, 'type': 'fireball', 'btnType': 'ghost'},
        {'id': 240, 'type': 'bonfire', 'btnType': 'ghost'},
        {'id': 241, 'type': 'umbrella', 'btnType': 'ghost'},
        {'id': 242, 'type': 'nuclear', 'btnType': 'ghost'},
        {'id': 243, 'type': 'no-smoking', 'btnType': 'ghost'},
        {'id': 244, 'type': 'thermometer', 'btnType': 'ghost'},
        {'id': 245, 'type': 'speedometer', 'btnType': 'ghost'},
        {'id': 246, 'type': 'model-s', 'btnType': 'ghost'},
        {'id': 247, 'type': 'plane', 'btnType': 'ghost'},
        {'id': 248, 'type': 'jet', 'btnType': 'ghost'},
        {'id': 249, 'type': 'load-a', 'btnType': 'ghost'},
        {'id': 250, 'type': 'load-b', 'btnType': 'ghost'},
        {'id': 251, 'type': 'load-c', 'btnType': 'ghost'},
        {'id': 252, 'type': 'load-d', 'btnType': 'ghost'},
        {'id': 253, 'type': 'ios-ionic-outline', 'btnType': 'ghost'},
        {'id': 254, 'type': 'ios-arrow-back', 'btnType': 'ghost'},
        {'id': 255, 'type': 'ios-arrow-forward', 'btnType': 'ghost'},
        {'id': 256, 'type': 'ios-arrow-up', 'btnType': 'ghost'},
        {'id': 257, 'type': 'ios-arrow-right', 'btnType': 'ghost'},
        {'id': 258, 'type': 'ios-arrow-down', 'btnType': 'ghost'},
        {'id': 259, 'type': 'ios-arrow-left', 'btnType': 'ghost'},
        {'id': 260, 'type': 'ios-arrow-thin-up', 'btnType': 'ghost'},
        {'id': 261, 'type': 'ios-arrow-thin-right', 'btnType': 'ghost'},
        {'id': 262, 'type': 'ios-arrow-thin-down', 'btnType': 'ghost'},
        {'id': 263, 'type': 'ios-arrow-thin-left', 'btnType': 'ghost'},
        {'id': 264, 'type': 'ios-circle-filled', 'btnType': 'ghost'},
        {'id': 265, 'type': 'ios-circle-outline', 'btnType': 'ghost'},
        {'id': 266, 'type': 'ios-checkmark-empty', 'btnType': 'ghost'},
        {'id': 267, 'type': 'ios-checkmark-outline', 'btnType': 'ghost'},
        {'id': 268, 'type': 'ios-checkmark', 'btnType': 'ghost'},
        {'id': 269, 'type': 'ios-plus-empty', 'btnType': 'ghost'},
        {'id': 270, 'type': 'ios-plus-outline', 'btnType': 'ghost'},
        {'id': 271, 'type': 'ios-plus', 'btnType': 'ghost'},
        {'id': 272, 'type': 'ios-close-empty', 'btnType': 'ghost'},
        {'id': 273, 'type': 'ios-close-outline', 'btnType': 'ghost'},
        {'id': 274, 'type': 'ios-close', 'btnType': 'ghost'},
        {'id': 275, 'type': 'ios-minus-empty', 'btnType': 'ghost'},
        {'id': 276, 'type': 'ios-minus-outline', 'btnType': 'ghost'},
        {'id': 277, 'type': 'ios-minus', 'btnType': 'ghost'},
        {'id': 278, 'type': 'ios-information-empty', 'btnType': 'ghost'},
        {'id': 279, 'type': 'ios-information-outline', 'btnType': 'ghost'},
        {'id': 280, 'type': 'ios-information', 'btnType': 'ghost'},
        {'id': 281, 'type': 'ios-help-empty', 'btnType': 'ghost'},
        {'id': 282, 'type': 'ios-help-outline', 'btnType': 'ghost'},
        {'id': 283, 'type': 'ios-help', 'btnType': 'ghost'},
        {'id': 284, 'type': 'ios-search', 'btnType': 'ghost'},
        {'id': 285, 'type': 'ios-search-strong', 'btnType': 'ghost'},
        {'id': 286, 'type': 'ios-star', 'btnType': 'ghost'},
        {'id': 287, 'type': 'ios-star-half', 'btnType': 'ghost'},
        {'id': 288, 'type': 'ios-star-outline', 'btnType': 'ghost'},
        {'id': 289, 'type': 'ios-heart', 'btnType': 'ghost'},
        {'id': 290, 'type': 'ios-heart-outline', 'btnType': 'ghost'},
        {'id': 291, 'type': 'ios-more', 'btnType': 'ghost'},
        {'id': 292, 'type': 'ios-more-outline', 'btnType': 'ghost'},
        {'id': 293, 'type': 'ios-home', 'btnType': 'ghost'},
        {'id': 294, 'type': 'ios-home-outline', 'btnType': 'ghost'},
        {'id': 295, 'type': 'ios-cloud', 'btnType': 'ghost'},
        {'id': 296, 'type': 'ios-cloud-outline', 'btnType': 'ghost'},
        {'id': 297, 'type': 'ios-cloud-upload', 'btnType': 'ghost'},
        {'id': 298, 'type': 'ios-cloud-upload-outline', 'btnType': 'ghost'},
        {'id': 299, 'type': 'ios-cloud-download', 'btnType': 'ghost'},
        {'id': 300, 'type': 'ios-cloud-download-outline', 'btnType': 'ghost'},
        {'id': 301, 'type': 'ios-upload', 'btnType': 'ghost'},
        {'id': 302, 'type': 'ios-upload-outline', 'btnType': 'ghost'},
        {'id': 303, 'type': 'ios-download', 'btnType': 'ghost'},
        {'id': 304, 'type': 'ios-download-outline', 'btnType': 'ghost'},
        {'id': 305, 'type': 'ios-refresh', 'btnType': 'ghost'},
        {'id': 306, 'type': 'ios-refresh-outline', 'btnType': 'ghost'},
        {'id': 307, 'type': 'ios-refresh-empty', 'btnType': 'ghost'},
        {'id': 308, 'type': 'ios-reload', 'btnType': 'ghost'},
        {'id': 309, 'type': 'ios-loop-strong', 'btnType': 'ghost'},
        {'id': 310, 'type': 'ios-loop', 'btnType': 'ghost'},
        {'id': 311, 'type': 'ios-bookmarks', 'btnType': 'ghost'},
        {'id': 312, 'type': 'ios-bookmarks-outline', 'btnType': 'ghost'},
        {'id': 313, 'type': 'ios-book', 'btnType': 'ghost'},
        {'id': 314, 'type': 'ios-book-outline', 'btnType': 'ghost'},
        {'id': 315, 'type': 'ios-flag', 'btnType': 'ghost'},
        {'id': 316, 'type': 'ios-flag-outline', 'btnType': 'ghost'},
        {'id': 317, 'type': 'ios-glasses', 'btnType': 'ghost'},
        {'id': 318, 'type': 'ios-glasses-outline', 'btnType': 'ghost'},
        {'id': 319, 'type': 'ios-browsers', 'btnType': 'ghost'},
        {'id': 320, 'type': 'ios-browsers-outline', 'btnType': 'ghost'},
        {'id': 321, 'type': 'ios-at', 'btnType': 'ghost'},
        {'id': 322, 'type': 'ios-at-outline', 'btnType': 'ghost'},
        {'id': 323, 'type': 'ios-pricetag', 'btnType': 'ghost'},
        {'id': 324, 'type': 'ios-pricetag-outline', 'btnType': 'ghost'},
        {'id': 325, 'type': 'ios-pricetags', 'btnType': 'ghost'},
        {'id': 326, 'type': 'ios-pricetags-outline', 'btnType': 'ghost'},
        {'id': 327, 'type': 'ios-cart', 'btnType': 'ghost'},
        {'id': 328, 'type': 'ios-cart-outline', 'btnType': 'ghost'},
        {'id': 329, 'type': 'ios-chatboxes', 'btnType': 'ghost'},
        {'id': 330, 'type': 'ios-chatboxes-outline', 'btnType': 'ghost'},
        {'id': 331, 'type': 'ios-chatbubble', 'btnType': 'ghost'},
        {'id': 332, 'type': 'ios-chatbubble-outline', 'btnType': 'ghost'},
        {'id': 333, 'type': 'ios-cog', 'btnType': 'ghost'},
        {'id': 334, 'type': 'ios-cog-outline', 'btnType': 'ghost'},
        {'id': 335, 'type': 'ios-gear', 'btnType': 'ghost'},
        {'id': 336, 'type': 'ios-gear-outline', 'btnType': 'ghost'},
        {'id': 337, 'type': 'ios-settings', 'btnType': 'ghost'},
        {'id': 338, 'type': 'ios-settings-strong', 'btnType': 'ghost'},
        {'id': 339, 'type': 'ios-toggle', 'btnType': 'ghost'},
        {'id': 340, 'type': 'ios-toggle-outline', 'btnType': 'ghost'},
        {'id': 341, 'type': 'ios-analytics', 'btnType': 'ghost'},
        {'id': 342, 'type': 'ios-analytics-outline', 'btnType': 'ghost'},
        {'id': 343, 'type': 'ios-pie', 'btnType': 'ghost'},
        {'id': 344, 'type': 'ios-pie-outline', 'btnType': 'ghost'},
        {'id': 345, 'type': 'ios-pulse', 'btnType': 'ghost'},
        {'id': 346, 'type': 'ios-pulse-strong', 'btnType': 'ghost'},
        {'id': 347, 'type': 'ios-filing', 'btnType': 'ghost'},
        {'id': 348, 'type': 'ios-filing-outline', 'btnType': 'ghost'},
        {'id': 349, 'type': 'ios-box', 'btnType': 'ghost'},
        {'id': 350, 'type': 'ios-box-outline', 'btnType': 'ghost'},
        {'id': 351, 'type': 'ios-compose', 'btnType': 'ghost'},
        {'id': 352, 'type': 'ios-compose-outline', 'btnType': 'ghost'},
        {'id': 353, 'type': 'ios-trash', 'btnType': 'ghost'},
        {'id': 354, 'type': 'ios-trash-outline', 'btnType': 'ghost'},
        {'id': 355, 'type': 'ios-copy', 'btnType': 'ghost'},
        {'id': 356, 'type': 'ios-copy-outline', 'btnType': 'ghost'},
        {'id': 357, 'type': 'ios-email', 'btnType': 'ghost'},
        {'id': 358, 'type': 'ios-email-outline', 'btnType': 'ghost'},
        {'id': 359, 'type': 'ios-undo', 'btnType': 'ghost'},
        {'id': 360, 'type': 'ios-undo-outline', 'btnType': 'ghost'},
        {'id': 361, 'type': 'ios-redo', 'btnType': 'ghost'},
        {'id': 362, 'type': 'ios-redo-outline', 'btnType': 'ghost'},
        {'id': 363, 'type': 'ios-paperplane', 'btnType': 'ghost'},
        {'id': 364, 'type': 'ios-paperplane-outline', 'btnType': 'ghost'},
        {'id': 365, 'type': 'ios-folder', 'btnType': 'ghost'},
        {'id': 366, 'type': 'ios-folder-outline', 'btnType': 'ghost'},
        {'id': 367, 'type': 'ios-paper', 'btnType': 'ghost'},
        {'id': 368, 'type': 'ios-paper-outline', 'btnType': 'ghost'},
        {'id': 369, 'type': 'ios-list', 'btnType': 'ghost'},
        {'id': 370, 'type': 'ios-list-outline', 'btnType': 'ghost'},
        {'id': 371, 'type': 'ios-world', 'btnType': 'ghost'},
        {'id': 372, 'type': 'ios-world-outline', 'btnType': 'ghost'},
        {'id': 373, 'type': 'ios-alarm', 'btnType': 'ghost'},
        {'id': 374, 'type': 'ios-alarm-outline', 'btnType': 'ghost'},
        {'id': 375, 'type': 'ios-speedometer', 'btnType': 'ghost'},
        {'id': 376, 'type': 'ios-speedometer-outline', 'btnType': 'ghost'},
        {'id': 377, 'type': 'ios-stopwatch', 'btnType': 'ghost'},
        {'id': 378, 'type': 'ios-stopwatch-outline', 'btnType': 'ghost'},
        {'id': 379, 'type': 'ios-timer', 'btnType': 'ghost'},
        {'id': 380, 'type': 'ios-timer-outline', 'btnType': 'ghost'},
        {'id': 381, 'type': 'ios-clock', 'btnType': 'ghost'},
        {'id': 382, 'type': 'ios-clock-outline', 'btnType': 'ghost'},
        {'id': 383, 'type': 'ios-time', 'btnType': 'ghost'},
        {'id': 384, 'type': 'ios-time-outline', 'btnType': 'ghost'},
        {'id': 385, 'type': 'ios-calendar', 'btnType': 'ghost'},
        {'id': 386, 'type': 'ios-calendar-outline', 'btnType': 'ghost'},
        {'id': 387, 'type': 'ios-photos', 'btnType': 'ghost'},
        {'id': 388, 'type': 'ios-photos-outline', 'btnType': 'ghost'},
        {'id': 389, 'type': 'ios-albums', 'btnType': 'ghost'},
        {'id': 390, 'type': 'ios-albums-outline', 'btnType': 'ghost'},
        {'id': 391, 'type': 'ios-camera', 'btnType': 'ghost'},
        {'id': 392, 'type': 'ios-camera-outline', 'btnType': 'ghost'},
        {'id': 393, 'type': 'ios-reverse-camera', 'btnType': 'ghost'},
        {'id': 394, 'type': 'ios-reverse-camera-outline', 'btnType': 'ghost'},
        {'id': 395, 'type': 'ios-eye', 'btnType': 'ghost'},
        {'id': 396, 'type': 'ios-eye-outline', 'btnType': 'ghost'},
        {'id': 397, 'type': 'ios-bolt', 'btnType': 'ghost'},
        {'id': 398, 'type': 'ios-bolt-outline', 'btnType': 'ghost'},
        {'id': 399, 'type': 'ios-color-wand', 'btnType': 'ghost'},
        {'id': 400, 'type': 'ios-color-wand-outline', 'btnType': 'ghost'},
        {'id': 401, 'type': 'ios-color-filter', 'btnType': 'ghost'},
        {'id': 402, 'type': 'ios-color-filter-outline', 'btnType': 'ghost'},
        {'id': 403, 'type': 'ios-grid-view', 'btnType': 'ghost'},
        {'id': 404, 'type': 'ios-grid-view-outline', 'btnType': 'ghost'},
        {'id': 405, 'type': 'ios-crop-strong', 'btnType': 'ghost'},
        {'id': 406, 'type': 'ios-crop', 'btnType': 'ghost'},
        {'id': 407, 'type': 'ios-barcode', 'btnType': 'ghost'},
        {'id': 408, 'type': 'ios-barcode-outline', 'btnType': 'ghost'},
        {'id': 409, 'type': 'ios-briefcase', 'btnType': 'ghost'},
        {'id': 410, 'type': 'ios-briefcase-outline', 'btnType': 'ghost'},
        {'id': 411, 'type': 'ios-medkit', 'btnType': 'ghost'},
        {'id': 412, 'type': 'ios-medkit-outline', 'btnType': 'ghost'},
        {'id': 413, 'type': 'ios-medical', 'btnType': 'ghost'},
        {'id': 414, 'type': 'ios-medical-outline', 'btnType': 'ghost'},
        {'id': 415, 'type': 'ios-infinite', 'btnType': 'ghost'},
        {'id': 416, 'type': 'ios-infinite-outline', 'btnType': 'ghost'},
        {'id': 417, 'type': 'ios-calculator', 'btnType': 'ghost'},
        {'id': 418, 'type': 'ios-calculator-outline', 'btnType': 'ghost'},
        {'id': 419, 'type': 'ios-keypad', 'btnType': 'ghost'},
        {'id': 420, 'type': 'ios-keypad-outline', 'btnType': 'ghost'},
        {'id': 421, 'type': 'ios-telephone', 'btnType': 'ghost'},
        {'id': 422, 'type': 'ios-telephone-outline', 'btnType': 'ghost'},
        {'id': 423, 'type': 'ios-drag', 'btnType': 'ghost'},
        {'id': 424, 'type': 'ios-location', 'btnType': 'ghost'},
        {'id': 425, 'type': 'ios-location-outline', 'btnType': 'ghost'},
        {'id': 426, 'type': 'ios-navigate', 'btnType': 'ghost'},
        {'id': 427, 'type': 'ios-navigate-outline', 'btnType': 'ghost'},
        {'id': 428, 'type': 'ios-locked', 'btnType': 'ghost'},
        {'id': 429, 'type': 'ios-locked-outline', 'btnType': 'ghost'},
        {'id': 430, 'type': 'ios-unlocked', 'btnType': 'ghost'},
        {'id': 431, 'type': 'ios-unlocked-outline', 'btnType': 'ghost'},
        {'id': 432, 'type': 'ios-monitor', 'btnType': 'ghost'},
        {'id': 433, 'type': 'ios-monitor-outline', 'btnType': 'ghost'},
        {'id': 434, 'type': 'ios-printer', 'btnType': 'ghost'},
        {'id': 435, 'type': 'ios-printer-outline', 'btnType': 'ghost'},
        {'id': 436, 'type': 'ios-game-controller-a', 'btnType': 'ghost'},
        {'id': 437, 'type': 'ios-game-controller-a-outline', 'btnType': 'ghost'},
        {'id': 438, 'type': 'ios-game-controller-b', 'btnType': 'ghost'},
        {'id': 439, 'type': 'ios-game-controller-b-outline', 'btnType': 'ghost'},
        {'id': 440, 'type': 'ios-americanfootball', 'btnType': 'ghost'},
        {'id': 441, 'type': 'ios-americanfootball-outline', 'btnType': 'ghost'},
        {'id': 442, 'type': 'ios-baseball', 'btnType': 'ghost'},
        {'id': 443, 'type': 'ios-baseball-outline', 'btnType': 'ghost'},
        {'id': 444, 'type': 'ios-basketball', 'btnType': 'ghost'},
        {'id': 445, 'type': 'ios-basketball-outline', 'btnType': 'ghost'},
        {'id': 446, 'type': 'ios-tennisball', 'btnType': 'ghost'},
        {'id': 447, 'type': 'ios-tennisball-outline', 'btnType': 'ghost'},
        {'id': 448, 'type': 'ios-football', 'btnType': 'ghost'},
        {'id': 449, 'type': 'ios-football-outline', 'btnType': 'ghost'},
        {'id': 450, 'type': 'ios-body', 'btnType': 'ghost'},
        {'id': 451, 'type': 'ios-body-outline', 'btnType': 'ghost'},
        {'id': 452, 'type': 'ios-person', 'btnType': 'ghost'},
        {'id': 453, 'type': 'ios-person-outline', 'btnType': 'ghost'},
        {'id': 454, 'type': 'ios-personadd', 'btnType': 'ghost'},
        {'id': 455, 'type': 'ios-personadd-outline', 'btnType': 'ghost'},
        {'id': 456, 'type': 'ios-people', 'btnType': 'ghost'},
        {'id': 457, 'type': 'ios-people-outline', 'btnType': 'ghost'},
        {'id': 458, 'type': 'ios-musical-notes', 'btnType': 'ghost'},
        {'id': 459, 'type': 'ios-musical-note', 'btnType': 'ghost'},
        {'id': 460, 'type': 'ios-bell', 'btnType': 'ghost'},
        {'id': 461, 'type': 'ios-bell-outline', 'btnType': 'ghost'},
        {'id': 462, 'type': 'ios-mic', 'btnType': 'ghost'},
        {'id': 463, 'type': 'ios-mic-outline', 'btnType': 'ghost'},
        {'id': 464, 'type': 'ios-mic-off', 'btnType': 'ghost'},
        {'id': 465, 'type': 'ios-volume-high', 'btnType': 'ghost'},
        {'id': 466, 'type': 'ios-volume-low', 'btnType': 'ghost'},
        {'id': 467, 'type': 'ios-play', 'btnType': 'ghost'},
        {'id': 468, 'type': 'ios-play-outline', 'btnType': 'ghost'},
        {'id': 469, 'type': 'ios-pause', 'btnType': 'ghost'},
        {'id': 470, 'type': 'ios-pause-outline', 'btnType': 'ghost'},
        {'id': 471, 'type': 'ios-recording', 'btnType': 'ghost'},
        {'id': 472, 'type': 'ios-recording-outline', 'btnType': 'ghost'},
        {'id': 473, 'type': 'ios-fastforward', 'btnType': 'ghost'},
        {'id': 474, 'type': 'ios-fastforward-outline', 'btnType': 'ghost'},
        {'id': 475, 'type': 'ios-rewind', 'btnType': 'ghost'},
        {'id': 476, 'type': 'ios-rewind-outline', 'btnType': 'ghost'},
        {'id': 477, 'type': 'ios-skipbackward', 'btnType': 'ghost'},
        {'id': 478, 'type': 'ios-skipbackward-outline', 'btnType': 'ghost'},
        {'id': 479, 'type': 'ios-skipforward', 'btnType': 'ghost'},
        {'id': 480, 'type': 'ios-skipforward-outline', 'btnType': 'ghost'},
        {'id': 481, 'type': 'ios-shuffle-strong', 'btnType': 'ghost'},
        {'id': 482, 'type': 'ios-shuffle', 'btnType': 'ghost'},
        {'id': 483, 'type': 'ios-videocam', 'btnType': 'ghost'},
        {'id': 484, 'type': 'ios-videocam-outline', 'btnType': 'ghost'},
        {'id': 485, 'type': 'ios-film', 'btnType': 'ghost'},
        {'id': 486, 'type': 'ios-film-outline', 'btnType': 'ghost'},
        {'id': 487, 'type': 'ios-flask', 'btnType': 'ghost'},
        {'id': 488, 'type': 'ios-flask-outline', 'btnType': 'ghost'},
        {'id': 489, 'type': 'ios-lightbulb', 'btnType': 'ghost'},
        {'id': 490, 'type': 'ios-lightbulb-outline', 'btnType': 'ghost'},
        {'id': 491, 'type': 'ios-wineglass', 'btnType': 'ghost'},
        {'id': 492, 'type': 'ios-wineglass-outline', 'btnType': 'ghost'},
        {'id': 493, 'type': 'ios-pint', 'btnType': 'ghost'},
        {'id': 494, 'type': 'ios-pint-outline', 'btnType': 'ghost'},
        {'id': 495, 'type': 'ios-nutrition', 'btnType': 'ghost'},
        {'id': 496, 'type': 'ios-nutrition-outline', 'btnType': 'ghost'},
        {'id': 497, 'type': 'ios-flower', 'btnType': 'ghost'},
        {'id': 498, 'type': 'ios-flower-outline', 'btnType': 'ghost'},
        {'id': 499, 'type': 'ios-rose', 'btnType': 'ghost'},
        {'id': 500, 'type': 'ios-rose-outline', 'btnType': 'ghost'},
        {'id': 501, 'type': 'ios-paw', 'btnType': 'ghost'},
        {'id': 502, 'type': 'ios-paw-outline', 'btnType': 'ghost'},
        {'id': 503, 'type': 'ios-flame', 'btnType': 'ghost'},
        {'id': 504, 'type': 'ios-flame-outline', 'btnType': 'ghost'},
        {'id': 505, 'type': 'ios-sunny', 'btnType': 'ghost'},
        {'id': 506, 'type': 'ios-sunny-outline', 'btnType': 'ghost'},
        {'id': 507, 'type': 'ios-partlysunny', 'btnType': 'ghost'},
        {'id': 508, 'type': 'ios-partlysunny-outline', 'btnType': 'ghost'},
        {'id': 509, 'type': 'ios-cloudy', 'btnType': 'ghost'},
        {'id': 510, 'type': 'ios-cloudy-outline', 'btnType': 'ghost'},
        {'id': 511, 'type': 'ios-rainy', 'btnType': 'ghost'},
        {'id': 512, 'type': 'ios-rainy-outline', 'btnType': 'ghost'},
        {'id': 513, 'type': 'ios-thunderstorm', 'btnType': 'ghost'},
        {'id': 514, 'type': 'ios-thunderstorm-outline', 'btnType': 'ghost'},
        {'id': 515, 'type': 'ios-snowy', 'btnType': 'ghost'},
        {'id': 516, 'type': 'ios-moon', 'btnType': 'ghost'},
        {'id': 517, 'type': 'ios-moon-outline', 'btnType': 'ghost'},
        {'id': 518, 'type': 'ios-cloudy-night', 'btnType': 'ghost'},
        {'id': 519, 'type': 'ios-cloudy-night-outline', 'btnType': 'ghost'},
        {'id': 520, 'type': 'android-arrow-up', 'btnType': 'ghost'},
        {'id': 521, 'type': 'android-arrow-forward', 'btnType': 'ghost'},
        {'id': 522, 'type': 'android-arrow-down', 'btnType': 'ghost'},
        {'id': 523, 'type': 'android-arrow-back', 'btnType': 'ghost'},
        {'id': 524, 'type': 'android-arrow-dropup', 'btnType': 'ghost'},
        {'id': 525, 'type': 'android-arrow-dropup-circle', 'btnType': 'ghost'},
        {'id': 526, 'type': 'android-arrow-dropright', 'btnType': 'ghost'},
        {'id': 527, 'type': 'android-arrow-dropright-circle', 'btnType': 'ghost'},
        {'id': 528, 'type': 'android-arrow-dropdown', 'btnType': 'ghost'},
        {'id': 529, 'type': 'android-arrow-dropdown-circle', 'btnType': 'ghost'},
        {'id': 530, 'type': 'android-arrow-dropleft', 'btnType': 'ghost'},
        {'id': 531, 'type': 'android-arrow-dropleft-circle', 'btnType': 'ghost'},
        {'id': 532, 'type': 'android-add', 'btnType': 'ghost'},
        {'id': 533, 'type': 'android-add-circle', 'btnType': 'ghost'},
        {'id': 534, 'type': 'android-remove', 'btnType': 'ghost'},
        {'id': 535, 'type': 'android-remove-circle', 'btnType': 'ghost'},
        {'id': 536, 'type': 'android-close', 'btnType': 'ghost'},
        {'id': 537, 'type': 'android-cancel', 'btnType': 'ghost'},
        {'id': 538, 'type': 'android-radio-button-off', 'btnType': 'ghost'},
        {'id': 539, 'type': 'android-radio-button-on', 'btnType': 'ghost'},
        {'id': 540, 'type': 'android-checkmark-circle', 'btnType': 'ghost'},
        {'id': 541, 'type': 'android-checkbox-outline-blank', 'btnType': 'ghost'},
        {'id': 542, 'type': 'android-checkbox-outline', 'btnType': 'ghost'},
        {'id': 543, 'type': 'android-checkbox-blank', 'btnType': 'ghost'},
        {'id': 544, 'type': 'android-checkbox', 'btnType': 'ghost'},
        {'id': 545, 'type': 'android-done', 'btnType': 'ghost'},
        {'id': 546, 'type': 'android-done-all', 'btnType': 'ghost'},
        {'id': 547, 'type': 'android-menu', 'btnType': 'ghost'},
        {'id': 548, 'type': 'android-more-horizontal', 'btnType': 'ghost'},
        {'id': 549, 'type': 'android-more-vertical', 'btnType': 'ghost'},
        {'id': 550, 'type': 'android-refresh', 'btnType': 'ghost'},
        {'id': 551, 'type': 'android-sync', 'btnType': 'ghost'},
        {'id': 552, 'type': 'android-wifi', 'btnType': 'ghost'},
        {'id': 553, 'type': 'android-call', 'btnType': 'ghost'},
        {'id': 554, 'type': 'android-apps', 'btnType': 'ghost'},
        {'id': 555, 'type': 'android-settings', 'btnType': 'ghost'},
        {'id': 556, 'type': 'android-options', 'btnType': 'ghost'},
        {'id': 557, 'type': 'android-funnel', 'btnType': 'ghost'},
        {'id': 558, 'type': 'android-search', 'btnType': 'ghost'},
        {'id': 559, 'type': 'android-home', 'btnType': 'ghost'},
        {'id': 560, 'type': 'android-cloud-outline', 'btnType': 'ghost'},
        {'id': 561, 'type': 'android-cloud', 'btnType': 'ghost'},
        {'id': 562, 'type': 'android-download', 'btnType': 'ghost'},
        {'id': 563, 'type': 'android-upload', 'btnType': 'ghost'},
        {'id': 564, 'type': 'android-cloud-done', 'btnType': 'ghost'},
        {'id': 565, 'type': 'android-cloud-circle', 'btnType': 'ghost'},
        {'id': 566, 'type': 'android-favorite-outline', 'btnType': 'ghost'},
        {'id': 567, 'type': 'android-favorite', 'btnType': 'ghost'},
        {'id': 568, 'type': 'android-star-outline', 'btnType': 'ghost'},
        {'id': 569, 'type': 'android-star-half', 'btnType': 'ghost'},
        {'id': 570, 'type': 'android-star', 'btnType': 'ghost'},
        {'id': 571, 'type': 'android-calendar', 'btnType': 'ghost'},
        {'id': 572, 'type': 'android-alarm-clock', 'btnType': 'ghost'},
        {'id': 573, 'type': 'android-time', 'btnType': 'ghost'},
        {'id': 574, 'type': 'android-stopwatch', 'btnType': 'ghost'},
        {'id': 575, 'type': 'android-watch', 'btnType': 'ghost'},
        {'id': 576, 'type': 'android-locate', 'btnType': 'ghost'},
        {'id': 577, 'type': 'android-navigate', 'btnType': 'ghost'},
        {'id': 578, 'type': 'android-pin', 'btnType': 'ghost'},
        {'id': 579, 'type': 'android-compass', 'btnType': 'ghost'},
        {'id': 580, 'type': 'android-map', 'btnType': 'ghost'},
        {'id': 581, 'type': 'android-walk', 'btnType': 'ghost'},
        {'id': 582, 'type': 'android-bicycle', 'btnType': 'ghost'},
        {'id': 583, 'type': 'android-car', 'btnType': 'ghost'},
        {'id': 584, 'type': 'android-bus', 'btnType': 'ghost'},
        {'id': 585, 'type': 'android-subway', 'btnType': 'ghost'},
        {'id': 586, 'type': 'android-train', 'btnType': 'ghost'},
        {'id': 587, 'type': 'android-boat', 'btnType': 'ghost'},
        {'id': 588, 'type': 'android-plane', 'btnType': 'ghost'},
        {'id': 589, 'type': 'android-restaurant', 'btnType': 'ghost'},
        {'id': 590, 'type': 'android-bar', 'btnType': 'ghost'},
        {'id': 591, 'type': 'android-cart', 'btnType': 'ghost'},
        {'id': 592, 'type': 'android-camera', 'btnType': 'ghost'},
        {'id': 593, 'type': 'android-image', 'btnType': 'ghost'},
        {'id': 594, 'type': 'android-film', 'btnType': 'ghost'},
        {'id': 595, 'type': 'android-color-palette', 'btnType': 'ghost'},
        {'id': 596, 'type': 'android-create', 'btnType': 'ghost'},
        {'id': 597, 'type': 'android-mail', 'btnType': 'ghost'},
        {'id': 598, 'type': 'android-drafts', 'btnType': 'ghost'},
        {'id': 599, 'type': 'android-send', 'btnType': 'ghost'},
        {'id': 600, 'type': 'android-archive', 'btnType': 'ghost'},
        {'id': 601, 'type': 'android-delete', 'btnType': 'ghost'},
        {'id': 602, 'type': 'android-attach', 'btnType': 'ghost'},
        {'id': 603, 'type': 'android-share', 'btnType': 'ghost'},
        {'id': 604, 'type': 'android-share-alt', 'btnType': 'ghost'},
        {'id': 605, 'type': 'android-bookmark', 'btnType': 'ghost'},
        {'id': 606, 'type': 'android-document', 'btnType': 'ghost'},
        {'id': 607, 'type': 'android-clipboard', 'btnType': 'ghost'},
        {'id': 608, 'type': 'android-list', 'btnType': 'ghost'},
        {'id': 609, 'type': 'android-folder-open', 'btnType': 'ghost'},
        {'id': 610, 'type': 'android-folder', 'btnType': 'ghost'},
        {'id': 611, 'type': 'android-print', 'btnType': 'ghost'},
        {'id': 612, 'type': 'android-open', 'btnType': 'ghost'},
        {'id': 613, 'type': 'android-exit', 'btnType': 'ghost'},
        {'id': 614, 'type': 'android-contract', 'btnType': 'ghost'},
        {'id': 615, 'type': 'android-expand', 'btnType': 'ghost'},
        {'id': 616, 'type': 'android-globe', 'btnType': 'ghost'},
        {'id': 617, 'type': 'android-chat', 'btnType': 'ghost'},
        {'id': 618, 'type': 'android-textsms', 'btnType': 'ghost'},
        {'id': 619, 'type': 'android-hangout', 'btnType': 'ghost'},
        {'id': 620, 'type': 'android-happy', 'btnType': 'ghost'},
        {'id': 621, 'type': 'android-sad', 'btnType': 'ghost'},
        {'id': 622, 'type': 'android-person', 'btnType': 'ghost'},
        {'id': 623, 'type': 'android-people', 'btnType': 'ghost'},
        {'id': 624, 'type': 'android-person-add', 'btnType': 'ghost'},
        {'id': 625, 'type': 'android-contact', 'btnType': 'ghost'},
        {'id': 626, 'type': 'android-contacts', 'btnType': 'ghost'},
        {'id': 627, 'type': 'android-playstore', 'btnType': 'ghost'},
        {'id': 628, 'type': 'android-lock', 'btnType': 'ghost'},
        {'id': 629, 'type': 'android-unlock', 'btnType': 'ghost'},
        {'id': 630, 'type': 'android-microphone', 'btnType': 'ghost'},
        {'id': 631, 'type': 'android-microphone-off', 'btnType': 'ghost'},
        {'id': 632, 'type': 'android-notifications-none', 'btnType': 'ghost'},
        {'id': 633, 'type': 'android-notifications', 'btnType': 'ghost'},
        {'id': 634, 'type': 'android-notifications-off', 'btnType': 'ghost'},
        {'id': 635, 'type': 'android-volume-mute', 'btnType': 'ghost'},
        {'id': 636, 'type': 'android-volume-down', 'btnType': 'ghost'},
        {'id': 637, 'type': 'android-volume-up', 'btnType': 'ghost'},
        {'id': 638, 'type': 'android-volume-off', 'btnType': 'ghost'},
        {'id': 639, 'type': 'android-hand', 'btnType': 'ghost'},
        {'id': 640, 'type': 'android-desktop', 'btnType': 'ghost'},
        {'id': 641, 'type': 'android-laptop', 'btnType': 'ghost'},
        {'id': 642, 'type': 'android-phone-portrait', 'btnType': 'ghost'},
        {'id': 643, 'type': 'android-phone-landscape', 'btnType': 'ghost'},
        {'id': 644, 'type': 'android-bulb', 'btnType': 'ghost'},
        {'id': 645, 'type': 'android-sunny', 'btnType': 'ghost'},
        {'id': 646, 'type': 'android-alert', 'btnType': 'ghost'},
        {'id': 647, 'type': 'android-warning', 'btnType': 'ghost'},
        {'id': 648, 'type': 'social-twitter', 'btnType': 'ghost'},
        {'id': 649, 'type': 'social-twitter-outline', 'btnType': 'ghost'},
        {'id': 650, 'type': 'social-facebook', 'btnType': 'ghost'},
        {'id': 651, 'type': 'social-facebook-outline', 'btnType': 'ghost'},
        {'id': 652, 'type': 'social-googleplus', 'btnType': 'ghost'},
        {'id': 653, 'type': 'social-googleplus-outline', 'btnType': 'ghost'},
        {'id': 654, 'type': 'social-google', 'btnType': 'ghost'},
        {'id': 655, 'type': 'social-google-outline', 'btnType': 'ghost'},
        {'id': 656, 'type': 'social-dribbble', 'btnType': 'ghost'},
        {'id': 657, 'type': 'social-dribbble-outline', 'btnType': 'ghost'},
        {'id': 658, 'type': 'social-octocat', 'btnType': 'ghost'},
        {'id': 659, 'type': 'social-github', 'btnType': 'ghost'},
        {'id': 660, 'type': 'social-github-outline', 'btnType': 'ghost'},
        {'id': 661, 'type': 'social-instagram', 'btnType': 'ghost'},
        {'id': 662, 'type': 'social-instagram-outline', 'btnType': 'ghost'},
        {'id': 663, 'type': 'social-whatsapp', 'btnType': 'ghost'},
        {'id': 664, 'type': 'social-whatsapp-outline', 'btnType': 'ghost'},
        {'id': 665, 'type': 'social-snapchat', 'btnType': 'ghost'},
        {'id': 666, 'type': 'social-snapchat-outline', 'btnType': 'ghost'},
        {'id': 667, 'type': 'social-foursquare', 'btnType': 'ghost'},
        {'id': 668, 'type': 'social-foursquare-outline', 'btnType': 'ghost'},
        {'id': 669, 'type': 'social-pinterest', 'btnType': 'ghost'},
        {'id': 670, 'type': 'social-pinterest-outline', 'btnType': 'ghost'},
        {'id': 671, 'type': 'social-rss', 'btnType': 'ghost'},
        {'id': 672, 'type': 'social-rss-outline', 'btnType': 'ghost'},
        {'id': 673, 'type': 'social-tumblr', 'btnType': 'ghost'},
        {'id': 674, 'type': 'social-tumblr-outline', 'btnType': 'ghost'},
        {'id': 675, 'type': 'social-wordpress', 'btnType': 'ghost'},
        {'id': 676, 'type': 'social-wordpress-outline', 'btnType': 'ghost'},
        {'id': 677, 'type': 'social-reddit', 'btnType': 'ghost'},
        {'id': 678, 'type': 'social-reddit-outline', 'btnType': 'ghost'},
        {'id': 679, 'type': 'social-hackernews', 'btnType': 'ghost'},
        {'id': 680, 'type': 'social-hackernews-outline', 'btnType': 'ghost'},
        {'id': 681, 'type': 'social-designernews', 'btnType': 'ghost'},
        {'id': 682, 'type': 'social-designernews-outline', 'btnType': 'ghost'},
        {'id': 683, 'type': 'social-yahoo', 'btnType': 'ghost'},
        {'id': 684, 'type': 'social-yahoo-outline', 'btnType': 'ghost'},
        {'id': 685, 'type': 'social-buffer', 'btnType': 'ghost'},
        {'id': 686, 'type': 'social-buffer-outline', 'btnType': 'ghost'},
        {'id': 687, 'type': 'social-skype', 'btnType': 'ghost'},
        {'id': 688, 'type': 'social-skype-outline', 'btnType': 'ghost'},
        {'id': 689, 'type': 'social-linkedin', 'btnType': 'ghost'},
        {'id': 690, 'type': 'social-linkedin-outline', 'btnType': 'ghost'},
        {'id': 691, 'type': 'social-vimeo', 'btnType': 'ghost'},
        {'id': 692, 'type': 'social-vimeo-outline', 'btnType': 'ghost'},
        {'id': 693, 'type': 'social-twitch', 'btnType': 'ghost'},
        {'id': 694, 'type': 'social-twitch-outline', 'btnType': 'ghost'},
        {'id': 695, 'type': 'social-youtube', 'btnType': 'ghost'},
        {'id': 696, 'type': 'social-youtube-outline', 'btnType': 'ghost'},
        {'id': 697, 'type': 'social-dropbox', 'btnType': 'ghost'},
        {'id': 698, 'type': 'social-dropbox-outline', 'btnType': 'ghost'},
        {'id': 699, 'type': 'social-apple', 'btnType': 'ghost'},
        {'id': 700, 'type': 'social-apple-outline', 'btnType': 'ghost'},
        {'id': 701, 'type': 'social-android', 'btnType': 'ghost'},
        {'id': 702, 'type': 'social-android-outline', 'btnType': 'ghost'},
        {'id': 703, 'type': 'social-windows', 'btnType': 'ghost'},
        {'id': 704, 'type': 'social-windows-outline', 'btnType': 'ghost'},
        {'id': 705, 'type': 'social-html5', 'btnType': 'ghost'},
        {'id': 706, 'type': 'social-html5-outline', 'btnType': 'ghost'},
        {'id': 707, 'type': 'social-css3', 'btnType': 'ghost'},
        {'id': 708, 'type': 'social-css3-outline', 'btnType': 'ghost'},
        {'id': 709, 'type': 'social-javascript', 'btnType': 'ghost'},
        {'id': 710, 'type': 'social-javascript-outline', 'btnType': 'ghost'},
        {'id': 711, 'type': 'social-angular', 'btnType': 'ghost'},
        {'id': 712, 'type': 'social-angular-outline', 'btnType': 'ghost'},
        {'id': 713, 'type': 'social-nodejs', 'btnType': 'ghost'},
        {'id': 714, 'type': 'social-sass', 'btnType': 'ghost'},
        {'id': 715, 'type': 'social-python', 'btnType': 'ghost'},
        {'id': 716, 'type': 'social-chrome', 'btnType': 'ghost'},
        {'id': 717, 'type': 'social-chrome-outline', 'btnType': 'ghost'},
        {'id': 718, 'type': 'social-codepen', 'btnType': 'ghost'},
        {'id': 719, 'type': 'social-codepen-outline', 'btnType': 'ghost'},
        {'id': 720, 'type': 'social-markdown', 'btnType': 'ghost'},
        {'id': 721, 'type': 'social-tux', 'btnType': 'ghost'},
        {'id': 722, 'type': 'social-freebsd-devil', 'btnType': 'ghost'},
        {'id': 723, 'type': 'social-usd', 'btnType': 'ghost'},
        {'id': 724, 'type': 'social-usd-outline', 'btnType': 'ghost'},
        {'id': 725, 'type': 'social-bitcoin', 'btnType': 'ghost'},
        {'id': 726, 'type': 'social-bitcoin-outline', 'btnType': 'ghost'},
        {'id': 727, 'type': 'social-yen', 'btnType': 'ghost'},
        {'id': 728, 'type': 'social-yen-outline', 'btnType': 'ghost'},
        {'id': 729, 'type': 'social-euro', 'btnType': 'ghost'},
        {'id': 730, 'type': 'social-euro-outline', 'btnType': 'ghost'}
    ]
    return iconList
}

export default util;
