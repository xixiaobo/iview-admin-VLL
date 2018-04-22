<style lang="less">
    @import './message.less';
</style>
<template>
    <div class="message-content-con" style="left: 10px">
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
                    <br/>收件人:{{mes.addressee }}
                </p>
                <div class="message-content-body">
                    <div v-html="mes.content" class="message-content"></div>
                </div>

            </div>
        </transition>
    </div>
</template>

<script>
    import util from '@/libs/util.js';
    import Cookies from 'js-cookie';
    export default {
        name: "sentmessage",
        data(){
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
            return{
                currentMesList: [],
                noDataText: '暂无未读消息',
                showMesTitleList: true,
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
                                        this.mes.addressee = params.row.addressee
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
                                return h('div', [
                                    deleteMesBtn(h, params)
                                ]);
                        }
                    }
                ]
            }
        },
        methods: {
            //删除
            deletemes(params) {
                this.deleteData(params)
            },
            backMesTitleList() {
                this.showMesTitleList = true;
            },
            getData(){
                let vm = this
                util.axios({
                    method: 'get',
                    url: '/newsmodule/api/SenderNotify_get',
                    params: {uuid: Cookies.get('userid')}
                }).then(res => {
                    if (res.data.error_code === 1) {
                        var hosts = res.data.data
                        vm.currentMesList=[]
                        hosts.forEach(function (val, index, arr) {
                            var a = {
                                id: val.id,
                                title: val.title,
                                time: val.time,
                                content: val.content,
                                addressee: val.addressee
                            }
                            vm.currentMesList.push(a)
                        })
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
                        url: '/newsmodule/api/SenderNotify_delete', // 放方法
                        params: {id: id},
                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                    }).then(ress => {
                        if (ress.data.error_code === 1) {
                            vm.currentMesList.splice(params.index, 1)
                        }
                    })
                })
            },
        },
        mounted(){
            this.getData()
        }
    }
</script>
