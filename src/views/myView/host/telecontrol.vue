<template>
    <div>
        <Card>
            <Row>
                <Col span="8" offset="8">
                    <Form ref="formValidate" :model="formValidate" :label-width="80">
                        <FormItem label="主机设备" prop="src_device_id">
                            <Select v-model="formValidate.src_device_id" style="width:200px" @on-change="changeData">
                                <Option v-for="item in deviceList" :value="item.value" :key="item.value">
                                    {{ item.label}}
                                </Option>
                            </Select>
                        </FormItem>
                    </Form>
                </Col>
            </Row>
        </Card>
        <br/>
        <Row :gutter="8"  v-bind:class="{ active: isActive }">
            <Col span="10" id="tree">
                <Card>
                    <Tree :data="linuxdata" :load-data="loadData">
                    </Tree>
                    <span class="vue-contextmenu-listWrapper" id="btnB">
                        <li class="context-menu-list">
                          <button v-clipboard:copy="menuData.filename"
                                  v-clipboard:success="onCopy"
                                  v-clipboard:error="onError" >
                            <span>复制名称</span>
                          </button>
                        </li>
                        <li class="context-menu-list">
                          <button v-clipboard:copy="menuData.filepath"
                                  v-clipboard:success="onCopy"
                                  v-clipboard:error="onError" >
                            <span>复制路径</span>
                          </button>
                        </li>
                    </span>
                </Card>
            </Col>
            <Col span="14">
                <Card>
                    当前执行路径：{{path}}
                    <br/>
                </Card>
                <Card>
                    <Form :model="formItem" :label-width="80">
                        <FormItem label="脚本命令">
                            <Input v-model="formItem.textarea" type="textarea" :autosize="{minRows: 10,maxRows: 3}"></Input>
                        </FormItem>
                        <FormItem>
                            <Button type="primary" @click="submit">执行</Button>
                            <Button type="ghost" style="margin-left: 8px" @click="rush">清空</Button>
                        </FormItem>
                    </Form>
                </Card>
                <Card>
                    执行结果为：{{status}}<br>
                    <div v-html="connet" style="margin: 20px 20px 20px 10px;background-color:#000000;color:red;padding: 10px 10px;"></div>
                </Card>
            </Col>
        </Row>
    </div>
</template>
<script>
    import util from '@/libs/util.js';
    export default {
        name: "telecontrol",
        data() {
            return {
                formValidate: {
                    src_device_id: '',
                },
                isActive: true,
                path:'',
                formItem:{
                    textarea:''
                },
                connet:'',
                deviceList: [],
                root:[],
                menuData: {
                    filepath:'',
                    filename:''
                },
                contextMenuData: {
                    menuName: 'demo',
                    axios: {
                        x: null,
                        y: null
                    },
                    menulists: [
                        {
                            fnHandler: 'copyname', // Binding events(绑定事件)
                            btnName: '复制名称' // The name of the menu option (菜单名称)
                        },
                        {
                            fnHandler: 'copypath', // Binding events(绑定事件)
                            btnName: '复制路径' // The name of the menu option (菜单名称)
                        },
                    ]
                },
                linuxdata: [
                    {
                        title: '/',
                        loading: false,
                        expand: true,
                        render: (h, {root, node, data}) => {
                            return h('span', {
                                style: {
                                    display: 'inline-block',
                                    width: '100%'
                                }
                            }, [
                                h('span', [
                                    h('Icon', {
                                        props: {
                                            type: 'ios-folder-outline'
                                        },
                                        style: {
                                            marginRight: '8px'
                                        }
                                    }),
                                    h('a', {
                                        on: {
                                            click: () => {
                                                this.path=this.gatpath(node,root)
                                            },
                                            contextmenu: (parm) => {
                                                this.getMenu(parm,node,root,data,'folder')
                                            }
                                        },
                                    }, data.title),
                                    h('a', {
                                        on: {
                                            click: () => {
                                                this.gatnode(root)
                                            },
                                        },
                                        attrs: {
                                            id: 'foo'
                                        },
                                    })
                                ])
                            ]);
                        }
                    }
                ],
                status:''
            }
        },
        computed: {
            // 计算属性的 getter
            device: function () {
                // `this` 指向 vm 实例
                var ce_id = this.formValidate.src_device_id
                var celist = this.deviceList
                var a = {}
                celist.forEach(function (val, index, arr) {
                    if (val.value === ce_id) {
                        a = {
                            ce_ip: val.ce_ip,
                            ce_port: val.ce_port,
                            os: val.os,
                            ssh_password: val.ssh_password,
                            ssh_username: val.ssh_username
                        }

                    }
                })
                return a
            }
        },
        watch: {
        'contextMenuData.axios' (val) {
            var x = val.x
            var y = val.y
            var _this = this
            var index = _this.transferIndex
            var menuName = 'vue-contextmenuName-' + _this.contextMenuData.menuName
            var menu = document.getElementById("btnB");
            menu.style.display = 'block'
            menu.style.left = x + 'px'
            menu.style.top = y + 'px'
            document.addEventListener('mouseup', function () {
                menu.style.display = 'none'
            }, false)
        }
    },
        methods: {
            update (e) {
                this.input = e.target.value
                console.info(this.input)
            },
            changeData(value) {
                let vm = this
                var formData = this.device
                formData.module = "shell"
                formData.args = "cd / \n ls -l"
                console.info(formData)
                util.axios({
                    method: 'post',
                    url: 'http://47.94.147.210:10240/api/rest/CurrencyHost', // 接口地址
                    data: formData
                }).then(res => {
                    var ress = res.data.data.stdout_lines
                    var rs = this.getdirectory(ress)
                    this.$set(this.linuxdata[0], 'children', rs)
                    this.isActive=false
                    this.path='/root/'
                }).catch(function (error) {
                    console.log(error)
                });

            },
            loadData(item, callback) {
                var sub = document.getElementById("foo");
                sub.click();
                console.info(item)
                console.info(callback)
                var filename=this.gatpath(item,this.root)
                let vm = this
                var formData = this.device
                formData.module = "shell"
                formData.args = "cd "+filename+" \n ls -l"
                console.info(formData)
                util.axios({
                    method: 'post',
                    url: 'http://47.94.147.210:10240/api/rest/CurrencyHost', // 接口地址
                    data: formData
                }).then(res => {
                    var ress = res.data.data.stdout_lines
                    var rs = this.getdirectory(ress)
                    callback(rs);
                }).catch(function (error) {
                    console.log(error)
                });
            },
            rush() {
                this.formItem.textarea = ''
            },
            gatnode(root){
                this.root=root
            },
            getMenu(parm,node,root,data,type){
                console.info(type)
                this.menuData.filepath=this.gatpath(node,root)
                this.menuData.filename=data.title
                var x = parm.clientX
                var y = parm.clientY
                // Get the current location
                this.contextMenuData.axios = {
                    x, y
                }
            },
            gatpath(node,root){
                let vm=this
                if(node.nodeKey===0){
                    var path2=node.node.title
                    return path2
                }else{
                    var path2='/'
                    var nodeKey=node.nodeKey
                    while (nodeKey!=0){
                        var no=root[nodeKey]
                        var title=no.node.title
                        path2="/"+title+path2
                        nodeKey=no.parent
                    }
                    return path2
                }

            },
            getdirectory(a){
                let vm=this
                var rs = {}
                var folder = [];
                var file = [];
                a.forEach(function (val, index, arr) {
                    if (index > 0) {
                        var c = val.split(" ");
                        if (c[0][0] === 'd') {
                            folder.push(c[c.length - 1])
                        } else if (c[0][0] === '-') {
                            file.push(c[c.length - 1])
                        }
                    }
                })
                var datas = []
                folder.forEach(function (val, index) {
                    datas.push({
                        title: val,
                        loading: false,
                        render: (h, {root, node, data}) => {
                            return h('span', {
                                style: {
                                    display: 'inline-block',
                                    width: '100%'
                                }
                            }, [
                                h('span', [
                                    h('Icon', {
                                        props: {
                                            type: 'ios-folder-outline'
                                        },
                                        style: {
                                            marginRight: '8px'
                                        }
                                    }),
                                    h('a', {
                                        on: {
                                            click: () => {
                                                vm.path=vm.gatpath(node,root)
                                            },
                                            contextmenu: (parm) => {
                                                vm.getMenu(parm,node,root,data,'folder')
                                            }
                                        }
                                    }, data.title)
                                ])
                            ]);
                        },
                        children: []
                    })
                })
                file.forEach(function (val, index) {
                    datas.push({
                        title: val,
                        loading: false,
                        render: (h, {root, node, data}) => {
                            return h('span', {
                                style: {
                                    display: 'inline-block',
                                    width: '100%'
                                }
                            },
                                [
                                h('span', [
                                    h('Icon', {
                                        props: {
                                            type: 'ios-paper-outline'
                                        },
                                        style: {
                                            marginRight: '8px'
                                        }
                                    }),
                                    h('a', {
                                        on: {
                                            click: () => {
                                                vm.path=vm.gatpath(node,root)
                                            },
                                            contextmenu: (parm) => {
                                                vm.getMenu(parm,node,root,data,'file')
                                            }
                                        }
                                    }, data.title)
                                ])
                            ]);
                        }
                    })
                })
                return datas
            },
            getData() {
                let vm = this
                util.axios({
                    method: 'get',
                    url: 'equipmentmodule/api/Device_getAll',
                }).then(res => {
                    console.log(res)
                    if (res.data.error_code === 1) {
                        var hosts = res.data.data
                        vm.deviceList = []
                        hosts.forEach(function (val, index, arr) {
                            var a = {
                                value: val.ce_id,
                                label: val.ce_name + "-" + val.ce_ip,
                                ce_ip: val.ce_ip,
                                ce_port: val.ce_port,
                                os: val.os,
                                ssh_password: val.ssh_password,
                                ssh_username: val.ssh_username
                            }
                            vm.deviceList.push(a)
                        })
                    } else if (res.data.error_code === 0) {
                        vm.deviceList = []
                    }
                }).catch(function (error) {
                });
            },
            submit(){
                var arg=this.formItem.textarea
                let vm=this
                var formData = this.device
                formData.module = "shell"
                formData.args = "cd "+this.path+" \n "+arg
                console.info(formData)
                util.axios({
                    method: 'post',
                    url: 'http://47.94.147.210:10240/api/rest/CurrencyHost', // 接口地址
                    data: formData
                }).then(res => {
                    vm.connet=''
                    if(res.data.data.flag===true){
                        var ress = res.data.data.stdout_lines
                        vm.status='执行成功'
                        ress.forEach(function (val, index) {
                            vm.connet=vm.connet+"<p>"+val+"</p>"
                        })
                    }else {
                        vm.status='执行成功'
                        vm.connet="执行失败"
                    }
                }).catch(function (error) {
                    console.log(error)
                });
            },
            onCopy: function (e) {
                this.$Message.success('复制成功!--'+e.text)
            },
            onError: function (e) {
                this.$Message.error('复制失败!')
            },
            copyname () {
                this.copymessage=''
                var file=this.menuData.filename;
                this.copymessage=file
                var sub = document.getElementById("copy");
                sub.click();
            },
            copypath () {
                this.copymessage=''
                var filepath=this.menuData.filepath
                this.copymessage=filepath
                alert(this.copymessage)
                var sub = document.getElementById("copy");
                sub.click();
            },
        },
        created() {
            this.rush()
            this.getData()
        }
    }
</script>

<style scoped>
    .active {
        display:none
    }
</style>
<style>
    .vue-contextmenu-listWrapper {
        box-shadow: 2px 2px 2px #cccccc;
        display: none;
        position: fixed;
        z-index: 9999;
        top: 0;
        left: 0;
    }
    .vue-contextmenu-listWrapper .context-menu-list {
        width: 150px;
        height: 32px;
        border-radius: 4px;
        background: #F3F3F3;
        text-decoration: none;
        list-style: none;
    }
    .vue-contextmenu-listWrapper .context-menu-list button {
        cursor: pointer;
        width: 100%;
        height: 100%;
        display: block;
        outline: 0;
        border: 0;
        padding-left: 10px;
    }
    .vue-contextmenu-listWrapper .context-menu-list button i,  .vue-contextmenu-listWrapper .context-menu-list button span {
        float: left;
    }
    .vue-contextmenu-listWrapper .context-menu-list button i{
        padding: 0 10px 0 10px;
    }
    .vue-contextmenu-listWrapper .context-menu-list button:hover {
        box-shadow: 0px 1px 3px rgba(34, 25, 25, 0.2);
        color: #ffffff;
        border-radius: 4px;
        background: -webkit-linear-gradient(bottom, #5a6a76 , #2e3940); /* Safari 5.1 - 6.0 */
        background: -o-linear-gradient(bottom, #5a6a76, #2e3940); /* Opera 11.1 - 12.0 */
        background: -moz-linear-gradient(bottom, #5a6a76, #2e3940); /* Firefox 3.6 - 15 */
        background: linear-gradient(to bottom, #5a6a76 , #2e3940);
    }
</style>
