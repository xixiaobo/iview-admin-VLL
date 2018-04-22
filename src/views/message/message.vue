<style lang="less">
    @import './message.less';
</style>

<template>
    <div class="message-main-con">
        <div class="message-mainlist-con">
            <div>
                <Button @click="setCurrentMesType('unread')" size="large" long type="text">
                    <transition name="mes-current-type-btn">
                        <Icon v-show="currentMessageType === 'unread'" type="checkmark"></Icon>
                    </transition>
                    <span class="mes-type-btn-text">未读消息</span>
                    <Badge class="message-count-badge-outer" class-name="message-count-badge"
                           :count="unreadCount"></Badge>
                </Button>
            </div>
            <div>
                <Button @click="setCurrentMesType('hasread')" size="large" long type="text">
                    <transition name="mes-current-type-btn">
                        <Icon v-show="currentMessageType === 'hasread'" type="checkmark"></Icon>
                    </transition>
                    <span class="mes-type-btn-text">已读消息</span>
                    <Badge class="message-count-badge-outer" class-name="message-count-badge"
                           :count="hasreadCount"></Badge>
                </Button>
            </div>
            <div>
                <Button @click="setCurrentMesType('recyclebin')" size="large" long type="text">
                    <transition name="mes-current-type-btn">
                        <Icon v-show="currentMessageType === 'recyclebin'" type="checkmark"></Icon>
                    </transition>
                    <span class="mes-type-btn-text">回收站</span>
                    <Badge class="message-count-badge-outer" class-name="message-count-badge"
                           :count="recyclebinCount"></Badge>
                </Button>
            </div>
        </div>
        <div class="message-content-con">
            <transition name="view-message">
                <div v-if="showMesTitleList" class="message-title-list-con">
                    <Table ref="messageList" :columns="mesTitleColumns" :data="currentMesList"
                           :no-data-text="noDataText"></Table>
                </div>
            </transition>
            <transition name="back-message-list">
                <div v-if="!showMesTitleList" class="message-view-content-con">
                    <div class="message-content-top-bar">
                        <span class="mes-back-btn-con"><Button type="text" @click="backMesTitleList"><Icon
                                type="chevron-left"></Icon>&nbsp;&nbsp;返回</Button></span>
                        <h3 class="mes-title">{{ mes.title }}</h3>
                    </div>
                    <p class="mes-time-con">
                        <Icon type="android-time"></Icon>&nbsp;&nbsp;{{ mes.time }}
                    </p>
                    <div class="message-content-body">
                        <div v-html="mes.content" class="message-content"></div>
                        <p class="mes-sender">发件人:{{mes.sender }}</p>
                    </div>

                </div>
            </transition>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util.js';
    import Cookies from 'js-cookie';

    export default {
        name: 'message_index',
        data() {
            const MarkedUnreadBtn = (h, params) => {
                return h('Button', {
                    props: {
                        size: 'small',
                        type: 'info'
                    },
                    on: {
                        click: () => {
                            this.MarkedUnread(params)
                        }
                    }
                }, '标为未读');
            };
            const markAsreadBtn = (h, params) => {
                return h('Button', {
                    props: {
                        size: 'small'
                    },
                    on: {
                        click: () => {
                            this.markAsread(params)
                        }
                    }
                }, '标为已读');
            };
            const removeMesBtn = (h, params) => {
                return h('Button', {
                    props: {
                        size: 'small',
                        type: 'error'
                    },
                    on: {
                        click: () => {
                            this.removemes(params)
                        }
                    }
                }, '回收');
            };

            const deleteMesBtn = (h, params) => {
                return h('Button', {
                    props: {
                        size: 'small',
                        type: 'error'
                    },
                    on: {
                        click: () => {
                            this.deletemes(params)
                        }
                    }
                }, '删除');
            };
            const restoreBtn = (h, params) => {
                return h('Button', {
                    props: {
                        size: 'small'
                    },
                    on: {
                        click: () => {
                            this.restore(params)
                        }
                    }
                }, '还原');
            };
            return {
                currentMesList: [],
                unreadMesList: [],
                hasreadMesList: [],
                recyclebinList: [],
                currentMessageType: 'unread',
                showMesTitleList: true,
                unreadCount: 0,
                hasreadCount: 0,
                recyclebinCount: 0,
                noDataText: '暂无未读消息',
                mes: {
                    title: '',
                    time: '',
                    content: '',
                    sender: ''
                },
                mesTitleColumns: [
                    // {
                    //     type: 'selection',
                    //     width: 50,
                    //     align: 'center'
                    // },
                    {
                        title: ' ',
                        key: 'title',
                        align: 'left',
                        ellipsis: true,
                        render: (h, params) => {
                            return h('a', {
                                on: {
                                    click: () => {
                                        this.showMesTitleList = false;
                                        this.mes.title = params.row.title;
                                        this.mes.time = params.row.time
                                        this.mes.content = params.row.content;
                                        this.mes.sender = params.row.sender
                                        if (this.currentMessageType === 'unread') {
                                            this.markAsread(params)
                                        }
                                    }
                                }
                            }, params.row.title);
                        }
                    },
                    {
                        title: ' ',
                        key: 'time',
                        align: 'center',
                        width: 180,
                        render: (h, params) => {
                            return h('span', [
                                h('Icon', {
                                    props: {
                                        type: 'android-time',
                                        size: 12
                                    },
                                    style: {
                                        margin: '0 5px'
                                    }
                                }),
                                h('span', {
                                    props: {
                                        type: 'android-time',
                                        size: 12
                                    }
                                }, params.row.time)
                            ]);
                        }
                    },
                    {
                        title: ' ',
                        key: 'asread',
                        align: 'center',
                        width: 100,
                        render: (h, params) => {
                            if (this.currentMessageType === 'unread') {
                                return h('div', [
                                    markAsreadBtn(h, params)
                                ]);
                            } else if (this.currentMessageType === 'hasread') {
                                return h('div', [
                                    removeMesBtn(h, params),
                                    MarkedUnreadBtn(h, params)
                                ]);
                            } else {
                                return h('div', [
                                    restoreBtn(h, params),
                                    deleteMesBtn(h, params)
                                ]);
                            }
                        }
                    }
                ]
            };
        },
        methods: {
            backMesTitleList() {
                this.showMesTitleList = true;
            },
            setCurrentMesType(type) {
                if (this.currentMessageType !== type) {
                    this.showMesTitleList = true;
                }
                this.currentMessageType = type;
                if (type === 'unread') {
                    this.noDataText = '暂无未读消息';
                    this.currentMesList = this.unreadMesList;
                } else if (type === 'hasread') {
                    this.noDataText = '暂无已读消息';
                    this.currentMesList = this.hasreadMesList;
                } else {
                    this.noDataText = '回收站无消息';
                    this.currentMesList = this.recyclebinList;
                }
            },
            //标为未读
            MarkedUnread(params) {
                this.updataStatus(params, 0, 'unread')
            },
            //标为已读
            markAsread(params) {
                this.updataStatus(params, 1, 'read')
            },
            //回收
            removemes(params) {
                this.updataStatus(params, 2, 'remove')
            },
            //删除
            deletemes(params) {
                this.deleteData(params)
            },
            //还原
            restore(params) {
                this.updataStatus(params, 1, 'restore')
            },
            getData() {
                let vm = this
                util.axios({
                    method: 'get',
                    url: '/newsmodule/api/Notify_get',
                    params: {uuid: Cookies.get('userid')}
                }).then(res => {
                    if (res.data.error_code === 1) {
                        vm.currentMesList = []
                        vm.unreadMesList = []
                        vm.hasreadMesList = []
                        vm.recyclebinList = []
                        var hosts = res.data.data
                        hosts.forEach(function (val, index, arr) {
                            var a = {
                                id: val.id,
                                title: val.title,
                                time: val.time,
                                content: val.content,
                                sender: val.sender
                            }
                            if (val.status === 0) {
                                vm.unreadMesList.push(a)
                            } else if (val.status === 1) {
                                vm.hasreadMesList.push(a)
                            } else if (val.status === 2) {
                                vm.recyclebinList.push(a)
                            }
                        })
                        vm.currentMesList = vm.unreadMesList
                        vm.unreadCount = vm.unreadMesList.length;
                        vm.hasreadCount = vm.hasreadMesList.length;
                        vm.recyclebinCount = vm.recyclebinList.length;
                    }
                }).catch(function (error) {
                });
            },
            deleteData(params){

                var id = params.row.id
                let vm = this
                util.axios({
                    method: 'get',
                    url: '/h2-console/csrf',
                }).then(res => {
                    console.log(res)
                    window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                    util.axios({
                        method: 'delete',
                        url: '/newsmodule/api/Notify_delete', // 放方法
                        params: {id: id},
                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                    }).then(ress => {
                        if (ress.data.error_code === 1) {
                            vm.recyclebinList.splice(params.index, 1)
                        }
                    })
                })
            },
            updataStatus(params, status, execute) {
                var id = params.row.id
                let vm = this
                util.axios({
                    method: 'get',
                    url: '/h2-console/csrf',
                }).then(res => {
                    console.log(res)
                    window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                    util.axios({
                        method: 'put',
                        url: '/newsmodule/api/Notify_put', // 放方法
                        data: {id: id, status: status},
                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                    }).then(ress => {
                        if (ress.data.error_code === 1) {
                            if (execute === 'unread') {
                                this.unreadMesList.unshift(this.currentMesList.splice(params.index, 1)[0]);
                                this.$store.commit('setMessageCount', this.unreadMesList.length);
                            } else if (execute === 'read') {
                                this.hasreadMesList.unshift(this.currentMesList.splice(params.index, 1)[0]);
                                this.$store.commit('setMessageCount', this.unreadMesList.length);
                            } else if (execute === 'remove') {
                                this.recyclebinList.unshift(this.hasreadMesList.splice(params.index, 1)[0]);
                            } else if (execute === 'restore') {
                                this.hasreadMesList.unshift(this.recyclebinList.splice(params.index, 1)[0]);
                            }
                        }
                    })
                })
            }
        },
        mounted() {
            this.getData()
        },
        watch: {
            unreadMesList(arr) {
                this.unreadCount = arr.length;
            },
            hasreadMesList(arr) {
                this.hasreadCount = arr.length;
            },
            recyclebinList(arr) {
                this.recyclebinCount = arr.length;
            }
        }
    };
</script>

