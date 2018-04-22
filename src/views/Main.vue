<style lang="less">
    @import "./main.less";
</style>
<template>
    <div class="main" :class="{'main-hide-text': shrink}">
        <div class="sidebar-menu-con" :style="{width: shrink?'60px':'200px', overflow: shrink ? 'visible' : 'auto'}">
            <shrinkable-menu 
                :shrink="shrink"
                @on-change="handleSubmenuChange"
                :theme="menuTheme" 
                :before-push="beforePush"
                :open-names="openedSubmenuArr"
                :menu-list="menuList" style="overflow-x:hidden;">
                <div slot="top" class="logo-con">
                    <img v-show="!shrink"  src="../images/logo.png" key="max-logo" />
                    <img v-show="shrink" src="../images/logo-min.jpg" key="min-logo" />
                </div>
            </shrinkable-menu>
        </div>
        <div class="main-header-con" :style="{paddingLeft: shrink?'60px':'200px'}">
            <div class="main-header">
                <div class="navicon-con">
                    <Button :style="{transform: 'rotateZ(' + (this.shrink ? '-90' : '0') + 'deg)'}" type="text" @click="toggleClick">
                        <Icon type="navicon" size="32"></Icon>
                    </Button>
                </div>
                <div class="header-middle-con">
                    <div class="main-breadcrumb" style="text-align:right">
                        <!-- <breadcrumb-nav :currentPath="currentPath"></breadcrumb-nav> -->
                        <Button type="text" 
                        v-for="item in headerMenuList" 
                        :key="item.id" 
                        @click="clickHeaderMenu(item)">
                            {{item.product_name}}
                        </Button>
                    </div>
                </div>
                <div class="header-avator-con">
                    <full-screen v-model="isFullScreen" @on-change="fullscreenChange"></full-screen>
                    <lock-screen></lock-screen>
                    <message-tip v-model="mesCount"></message-tip>
                    <theme-switch></theme-switch>
                    
                    <div class="user-dropdown-menu-con">
                        <Row type="flex" justify="end" align="middle" class="user-dropdown-innercon">
                            <Dropdown transfer trigger="click" @on-click="handleClickUserDropdown">
                                <a href="javascript:void(0)">
                                    <span class="main-user-name">{{ userName }}</span>
                                    <Icon type="arrow-down-b"></Icon>
                                </a>
                                <DropdownMenu slot="list">
                                    <DropdownItem name="ownSpace">个人中心</DropdownItem>
                                    <DropdownItem name="changePassword" divided>密码修改</DropdownItem>
                                    <DropdownItem name="loginout" divided>退出登录</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <Avatar :src="avatorPath" style="background: #619fe7;margin-left: 10px;"></Avatar>
                        </Row>
                    </div>
                </div>
            </div>
            <div class="tags-con">
                <tags-page-opened :pageTagsList="pageTagsList"></tags-page-opened>
            </div>
        </div>
        <div class="single-page-con" :style="{left: shrink?'60px':'200px'}">
            <div class="single-page">
                <keep-alive :include="cachePage">
                    <router-view></router-view>
                </keep-alive>
            </div>
        </div>
        <Modal
            v-model="modal1"
            title="个人密码修改"
            :loading="loadingmodal">
          <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
          <Form-item label="新密码" prop="password1">
            <Input type='password'  v-model="formValidate.password1" placeholder="请输入新密码"></Input>
          </Form-item>
          <Form-item label="再次确认" prop="password">
            <Input type='password'  v-model="formValidate.password" placeholder="请再次输入新密码"></Input>
          </Form-item>
        </Form>
        <div slot="footer">
          <Row>
            <Col span="12" offset="12">
              <Button type="ghost" size="large"  @click="quxiao" >取消</Button>
              <Button type="primary" size="large" @click="handleSubmit" >确认</Button>
            </Col></Row>
          </div>
    </Modal>
    </div>
</template>
<script>
    import shrinkableMenu from './main-components/shrinkable-menu/shrinkable-menu.vue';
    import tagsPageOpened from './main-components/tags-page-opened.vue';
    import breadcrumbNav from './main-components/breadcrumb-nav.vue';
    import fullScreen from './main-components/fullscreen.vue';
    import lockScreen from './main-components/lockscreen/lockscreen.vue';
    import messageTip from './main-components/message-tip.vue';
    import themeSwitch from './main-components/theme-switch/theme-switch.vue';
    import Cookies from 'js-cookie';
    import util from '@/libs/util.js';
    
    export default {
        components: {
            shrinkableMenu,
            tagsPageOpened,
            breadcrumbNav,
            fullScreen,
            lockScreen,
            messageTip,
            themeSwitch
        },
        data () {
            return {
                loadingmodal: false,
                formValidate: {
                 password1: '',
                 password: ''
                },
                modal1: false,
                ruleValidate: {
                 password1: [
                  {required: true, message: '新密码不能为空', trigger: 'blur'}
                ],
                 password: [
                  {required: true, message: '请再次输入新密码', trigger: 'blur'},
                { validator: this.passwordrule, trigger: 'blur' }
                  ]
                },
                shrink: false,
                userName: '',
                isFullScreen: false,
                openedSubmenuArr: this.$store.state.app.openedSubmenuArr
            };
        },
        computed: {
            nowHeader () {
                return this.$store.state.app.nowHeader;
            },
            headerMenuList () {
                if (window.localStorage.headerMenuList !== undefined) {
                    this.$store.state.app.headerMenuList = JSON.parse(window.localStorage.headerMenuList)
                }
                return this.$store.state.app.headerMenuList;
            },
            menuList () {
                return this.$store.state.app.menuList;
            },
            pageTagsList () {
                return this.$store.state.app.pageOpenedList;  // 打开的页面的页面对象
            },
            currentPath () {
                return this.$store.state.app.currentPath;  // 当前面包屑数组
            },
            avatorPath () {
                return localStorage.avatorImgPath;
            },
            cachePage () {
                return this.$store.state.app.cachePage;
            },
            lang () {
                return this.$store.state.app.lang;
            },
            menuTheme () {
                return this.$store.state.app.menuTheme;
            },
            mesCount () {
                return this.$store.state.app.messageCount;
            }
        },
        methods: {
            passwordrule (rule, value, callback) {
                if (value === this.formValidate.password1) {
                  callback()
                } else {
                  callback(new Error('两次密码不同，请重新输入'))
                }
                console.log(this.formValidate.password1)
                callback()
            },
            quxiao () {

            },
            handleSubmit () {
            let vm = this
            vm.$refs['formValidate'].validate((valid) => {
              if (valid) {
                let formData = {}
                formData.name_cn = vm.formValidate.password
                console.log(formData)
                util.axios({
                    method: 'get',
                    url: '/h2-console/csrf',
                }).then(res => {
                    console.log(res)
                    window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                    util.axios({
                        method: 'post',
                        url: '/jhipsteruaa/api/account/change-password',
                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                        data: formData
                    }).then(res => {
                        vm.loading = false
                        vm.$Message.success('修改成功!')
                        console.log(res)
                        this.modal1 = false
                        // vm.$router.push('/login')
                    }).catch(function (error) {
                        console.log(error)
                        vm.$Message.error('修改失败')
                        vm.loading = false
                    });
                }).catch(function (error) {
                    console.log(error)
                    vm.$Message.error('请求失败，请查看您的网络或联系管理员')
                    Cookies.set('user', vm.form.username);
                    Cookies.set('password', vm.form.password);
                    Cookies.set('authorities', vm.form.authorities);
                    Cookies.set('userid', vm.form.id);
                    Cookies.set('access', 0);
                    vm.$router.push({
                        name: 'home_index'
                    });
                    vm.loading = false
                });

              } else {
                vm.$Message.error('表单验证失败!')
              }
            })
          },
            clickHeaderMenu (item) {
                window.localStorage.nowHeader = JSON.stringify(item)
                this.$store.state.app.nowHeader = item
                this.$store.commit('updateMenulist');
                // this.$store.state.app.menuList = []
            },
            init () {
                let v=this.mesCount
                let vm = this
                util.axios({
                    method: 'get',
                    url: '/newsmodule/api/Notify_getcount',
                    params:{uuid:Cookies.get('userid')}
                }).then(res => {
                    if(res.data.error_code===1){
                        this.$store.commit('setMessageCount', res.data.data);
                    }
                }).catch(function (error) {
                });
                let pathArr = util.setCurrentPath(this, this.$route.name);
                this.$store.commit('updateMenulist');
                if (pathArr.length >= 2) {
                    this.$store.commit('addOpenSubmenu', pathArr[1].name);
                }
                this.userName = Cookies.get('user');
                let messageCount = 3;
                this.messageCount = messageCount.toString();
                this.checkTag(this.$route.name);
                console.info(Cookies.get('user'))
                console.info(Cookies.get('userid'))
            },
            getmesDara(){
                let v=this.mesCount
                let vm = this
                util.axios({
                    method: 'get',
                    url: '/newsmodule/api/Notify_getcount',
                    params:{uuid:Cookies.get('userid')}
                }).then(res => {
                    if(res.data.error_code===1){
                        this.$store.commit('setMessageCount', res.data.data);
                        if(v<this.mesCount){
                            this.open()
                        }
                    }
                }).catch(function (error) {
                });


            },
            open () {
                this.$Notice.open({
                    title: '您有未读消息通知',
                });
            },
            toggleClick () {
                this.shrink = !this.shrink;
            },
            handleClickUserDropdown (name) {
                if (name === 'ownSpace') {
                    util.openNewPage(this, 'ownspace_index');
                    this.$router.push({
                        name: 'ownspace_index'
                    });
                } else if (name === 'loginout') {
                    // 退出登录
                    util.axios({
                        method: 'get',
                        url: '/h2-console/csrf',
                    }).then(res => {
                            window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                            util.axios({
                                method: 'post',
                                url: '/auth/logout',
                                headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                            }).then(res1 => {
                                this.$store.commit('logout', this);
                                this.$store.commit('clearOpenedSubmenu');
                                this.$router.push({
                                    name: 'login'
                                });
                                location.reload()
                            })
                    }).catch(function (error) {
                        console.log(error)
                        vm.$Message.error('请求失败，请查看您的网络或联系管理员')
                        vm.loading = false
                    });
                } else if (name === 'changePassword') {
                    this.modal1 = true
                }
            },
            checkTag (name) {
                let openpageHasTag = this.pageTagsList.some(item => {
                    if (item.name === name) {
                        return true;
                    }
                });
                if (!openpageHasTag) {  //  解决关闭当前标签后再点击回退按钮会退到当前页时没有标签的问题
                    util.openNewPage(this, name, this.$route.params || {}, this.$route.query || {});
                }
            },
            handleSubmenuChange (val) {
                // console.log(val)
            },
            beforePush (name) {
                // if (name === 'accesstest_index') {
                //     return false;
                // } else {
                //     return true;
                // }
                return true;
            },
            fullscreenChange (isFullScreen) {
                // console.log(isFullScreen);
            }
        },
        watch: {
            '$route' (to) {
                this.$store.commit('setCurrentPageName', to.name);
                let pathArr = util.setCurrentPath(this, to.name);
                if (pathArr.length > 2) {
                    this.$store.commit('addOpenSubmenu', pathArr[1].name);
                }
                this.checkTag(to.name);
                localStorage.currentPageName = to.name;
            },
            lang () {
                util.setCurrentPath(this, this.$route.name);  // 在切换语言时用于刷新面包屑
            }
        },
        mounted () {
        },
        beforeMount() {
            //设置定时器，每3秒刷新一次
            let vm=this
            setInterval(getTotelNumber,3000)
            function getTotelNumber() {
                vm.getmesDara()
            }
            getTotelNumber()
        },
        created () {
            this.init();
            // 显示打开的页面的列表
            this.$store.commit('setOpenedList');
        }
    };
</script>
