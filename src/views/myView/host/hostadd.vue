<style type="text/css">
    .ivu-input[disabled], fieldset[disabled] .ivu-input {
        background-color: lightgrey;
        opacity: 1;
        cursor: not-allowed;
        color: #657180;
    }

    .ivu-select-disabled .ivu-select-selection {
        background-color: lightgrey;
        opacity: 1;
        cursor: not-allowed;
        color: #657180;
    }
</style>
<template>
    <Card dis-hover>
        <Row style="padding:0px;margin-top:20px;text-align:center">
            <Steps :current="current">
                <Step title="基本信息" content="请填写基本信息"></Step>
                <Step title="详细信息" content="请填写详细信息"></Step>
            </Steps>
        </Row>
        <Row style="padding:0px;margin-top:50px" v-if="current === 0">
            <Col span="8">
            <H1 style="text-align:center">录入提示</H1>
            <p style="margin-left:20px;margin-right:20px">Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.
                Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur
                ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus
                sapien nunc eget.</p>
            </Col>
            <Col span="15" offset="1">
            <Card>
                <p slot="title">添加主机</p>
                <Form label-position="top" ref="formValidate1" :model="formValidate1" :rules="ruleValidate1">
                    <Row :gutter="16">
                        <Col span="11" offset="1">
                        <FormItem label="IP地址" prop="ce_ip">
                            <Input v-model="formValidate1.ce_ip"></Input>
                        </FormItem>
                        </Col>
                        <Col span="11">
                        <FormItem label="主机名" prop="ce_name">
                            <Input v-model="formValidate1.ce_name"></Input>
                        </FormItem>
                        </Col>
                    </Row>
                    <Row :gutter="16">
                        <Col span="11" offset="1">
                        <FormItem label="用户名" prop="ssh_username">
                            <Input v-model="formValidate1.ssh_username"></Input>
                        </FormItem>
                        </Col>
                        <Col span="11">
                        <FormItem label="密码" prop="ssh_password">
                            <Input type="password" v-model="formValidate1.ssh_password"></Input>
                        </FormItem>
                        </Col>
                    </Row>
                    <Row :gutter="16">
                        <Col span="11" offset="1">
                        <FormItem label="操作系统类型" prop="os">
                            <Select v-model="formValidate1.os" placeholder="请选择">
                                <Option value="Linux">Linux</Option>
                                <Option value="Windows">Windows</Option>
                            </Select>
                        </FormItem>
                        </Col>
                        <Col span="11">
                        <FormItem label="端口" prop="ce_port">
                            <!--<Input v-model="formValidate1.ce_port"></Input>-->
                            <InputNumber :max="1000" :min="1" v-model="formValidate1.ce_port"></InputNumber>
                        </FormItem>
                        </Col>
                    </Row>
                </Form>
            </Card>
            </Col>
        </Row>
        <Row style="padding:0px;margin-top:20px" v-if="current === 1">
            <Col span="16" offset="4">
            <Form label-position="top" ref="formValidate2" :model="formValidate2">
                <Card style="margin-top:20px">
                    <p slot="title">连接信息</p>
                    <Row :gutter="16">
                        <Col span="11" offset="1">
                        <FormItem label="设备名称" prop="ce_name">
                            <Input v-model="formValidate2.ce_name" disabled></Input>
                        </FormItem>
                        </Col>
                        <Col span="11">
                        <FormItem label="设备连接IP" prop="ce_ip">
                            <Input v-model="formValidate2.ce_ip" style="color:black" disabled></Input>
                        </FormItem>
                        </Col>
                    </Row>
                    <Row :gutter="16">
                        <Col span="11" offset="1">
                        <FormItem label="设备端口" prop="ce_port">
                            <Input v-model="formValidate2.ce_port" disabled></Input>
                        </FormItem>
                        </Col>
                        <Col span="11">
                        <FormItem label="登录用户名" prop="ssh_username">
                            <Input v-model="formValidate2.ssh_username" disabled></Input>
                        </FormItem>
                        </Col>
                    </Row>
                    <Row :gutter="16">
                        <Col span="11" offset="1">
                        <FormItem label="系统类型" prop="os">
                            <Input v-model="formValidate2.os" disabled></Input>
                        </FormItem>
                        </Col>
                    </Row>
                </Card>
                <Card style="margin-top:20px">
                    <p slot="title">硬件信息</p>
                    <Row :gutter="16">
                        <Col span="11" offset="1">
                        <FormItem label="系统内核型号 ">
                            <Input style="width:100%" v-model="formValidate2.os_kernel" disabled></Input>
                        </FormItem>
                        </Col>
                        <Col span="11">
                        <FormItem label="CPU核心数(个)">
                            <Input style="width:100%" v-model="formValidate2.cpu_total" disabled></Input>
                        </FormItem>
                        </Col>
                    </Row>
                    <Row :gutter="16">
                        <Col span="22" offset="1">
                        <FormItem label="挂载名及容量">
                            <Input type="textarea" v-model="formValidate2.disk_mount" disabled></Input>
                        </FormItem>
                        </Col>
                    </Row>
                    <Row :gutter="16">
                        <Col span="22" offset="1">
                        <FormItem label="虚拟内容容量">
                            <Input type="textarea" v-model="formValidate2.swap_total" disabled></Input>
                        </FormItem>
                        </Col>
                    </Row>
                    <Row :gutter="16">
                        <Col span="22" offset="1">
                        <FormItem label="服务器型号">
                            <Input type="textarea" v-model="formValidate2.server_type" disabled></Input>
                        </FormItem>
                        </Col>
                    </Row>
                    <Row :gutter="16">
                        <Col span="22" offset="1">
                        <FormItem label="硬盘总容量 ">
                            <Input type="textarea" v-model="formValidate2.disk_total" disabled></Input>
                        </FormItem>
                        </Col>
                    </Row>
                    <Row :gutter="16">
                        <Col span="22" offset="1">
                        <FormItem label="物理内存容量 ">
                            <Input type="textarea" v-model="formValidate2.mem_total" disabled></Input>
                        </FormItem>
                        </Col>
                    </Row>
                    <Row :gutter="16">
                        <Col span="22" offset="1">
                        <FormItem label="操作系统类型版本">
                            <Input type="textarea" v-model="formValidate2.os_type" disabled></Input>
                        </FormItem>
                        </Col>
                    </Row>
                    <Row :gutter="16">
                        <Col span="22" offset="1">
                        <FormItem label="服务器ipv4地址">
                            <Input type="textarea" v-model="formValidate2.ipv4" disabled></Input>
                        </FormItem>
                        </Col>
                    </Row>
                    <Row :gutter="16">
                        <Col span="22" offset="1">
                        <FormItem label="服务器主机名">
                            <Input type="textarea" v-model="formValidate2.host_name" disabled></Input>
                        </FormItem>
                        </Col>
                    </Row>
                    <Row :gutter="16">
                        <Col span="22" offset="1">
                        <FormItem label="CPU型号">
                            <Input type="textarea" v-model="formValidate2.cpu_type" disabled></Input>
                        </FormItem>
                        </Col>
                    </Row>
                </Card>
            </Form>
            </Col>
        </Row>
        <Row style="padding:0px;margin-top:20px">
            <Col span="8" offset="4" style="text-align:let">
            <Button type="primary" v-if="current !== 0" @click="previous">
                <Icon type="chevron-left"></Icon>&nbsp;上一步
            </Button>
            </Col>
            <Col span="19" offset="4" style="text-align:right" v-if="current === 0">
            <Button type="primary" :loading="loadingNext" @click="next">下一步&nbsp;<Icon type="chevron-right"></Icon>
            </Button>
            </Col>
            <Col span="8" style="text-align:right" v-if="current !== 0">
            <Button type="primary" v-if="current === 1" :loading="loadingSubmit" @click="submit">提&nbsp;&nbsp;&nbsp;&nbsp;交</Button>
            </Col>
        </Row>
    </Card>
</template>
<script>
    import util from '@/libs/util.js';

    export default {
        name: 'hostAdd',    // 分表单，分步骤请求。
        data() {
            return {
                current: 0,
                formValidate1: {
                    ce_name: '',
                    os: 'Linux',
                    ce_ip: '',
                    ce_port: 22,
                    ssh_username: '',
                    ssh_password: ''
                },
                modal1: false,
                ruleValidate1: {
                    ce_ip: [
                        {required: true, message: 'IP地址不能为空', trigger: 'blur'},
                        {validator: this.ipValidation, trigger: 'blur'}
                    ],
                    ce_name: [
                        {required: true, message: '主机名不能为空', trigger: 'blur'}
                    ],
                    ssh_username: [
                        {required: true, message: '用户名不能为空', trigger: 'blur'}
                    ],
                    ssh_password: [
                        {required: true, message: '密码不能为空', trigger: 'blur'}
                    ],
                    os: [
                        {type: 'string', required: true, message: '操作系统不能为空', trigger: 'change'}
                    ]
                },
                formValidate2: {
                    ce_name: '',
                    ce_ip: '',
                    ce_port: '',
                    ssh_username: '',
                    ssh_password: '',
                    os: '',
                    os_kernel: '',
                    cpu_total: '',
                    disk_mount: '',
                    swap_total: '',
                    server_type: '',
                    disk_total: '',
                    mem_total: '',
                    os_type: '',
                    ipv4: '',
                    host_name: '',
                    cpu_type: ''
                },
                loading: false,
                loadingNext: false,
                loadingSubmit: false
            }
        },
        methods: {
            ipValidation(rule, value, callback) {
                if (!(/^(\d|[1-9]\d|1\d{2}|2[0-5][0-5])\.(\d|[1-9]\d|1\d{2}|2[0-5][0-5])\.(\d|[1-9]\d|1\d{2}|2[0-5][0-5])\.(\d|[1-9]\d|1\d{2}|2[0-5][0-5])$/.test(value))) {
                    callback('IP格式不正确')
                } else {
                    callback()
                }
            },
            portValidation(rule, value, callback) {
                if (!(/^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/.test(value))) {
                    callback('端口格式不正确')
                } else {
                    callback()
                }
            },
            next() {
                console.log(this.formValidate1)
                if (this.current === 0) {
                    this.$refs['formValidate1'].validate((valid) => {
                        if (!valid) {
                            this.$Message.error('表单验证失败!')
                        } else {
                            this.loadingNext = true
                            let portint = parseInt(this.formValidate1.ce_port)
                            let formData = {
                                'ce_ip': this.formValidate1.ce_ip,
                                'ssh_username': this.formValidate1.ssh_username,
                                'ssh_password': this.formValidate1.ssh_password,
                                'os': this.formValidate1.os,
                                'ce_port': portint,
                            }
                            let vm = this
                            util.axios({
                                method: 'post',
                                url: 'http://47.94.147.210:10240/api/rest/QueryHost', // 获取主机配置详情
                                data: formData
                            }).then(res => {
                                if (res.data.error_code === 1) {
                                    console.log(res.data)
                                    vm.formValidate2.ce_name = vm.formValidate1.ce_name
                                    vm.formValidate2.ce_ip = vm.formValidate1.ce_ip
                                    vm.formValidate2.ce_port = vm.formValidate1.ce_port
                                    vm.formValidate2.ssh_username = vm.formValidate1.ssh_username
                                    vm.formValidate2.ssh_password = vm.formValidate1.ssh_password
                                    vm.formValidate2.os = vm.formValidate1.os
                                    vm.formValidate2.os_kernel = res.data.data.os_kernel
                                    vm.formValidate2.cpu_total = res.data.data.cpu_total
                                    vm.formValidate2.disk_mount = res.data.data.disk_mount
                                    vm.formValidate2.server_type = res.data.data.server_type
                                    vm.formValidate2.disk_total = res.data.data.disk_total
                                    vm.formValidate2.mem_total = res.data.data.mem_total
                                    vm.formValidate2.os_type = res.data.data.os_type
                                    vm.formValidate2.ipv4 = res.data.data.ipv4
                                    vm.formValidate2.host_name = res.data.data.host_name

                                    console.log("res.data.data.host_name:" + res.data.data.host_name)
                                    vm.formValidate2.cpu_type = res.data.data.cpu_type
                                    vm.formValidate2.swap_total = res.data.data.swap_total
                                    vm.current += 1;
                                    vm.loadingNext = false;
                                }else{
                                    this.$Message.error('主机信息有误或主机不在线，请检查后添加！')
                                }
                            }).catch(function (error) {
                                console.log(error)
                                vm.modalAdd = false
                            });

                            console.log(vm.formValidate2);
                        }
                    })
                }
            },
            previous() {
                if (this.current === 0) {
                    this.current = 0
                } else {
                    this.current -= 1
                }
            },
            submit() {
                let vm = this
                let formData = {}
                formData.ce_name = vm.formValidate2.ce_name
                formData.ce_ip = vm.formValidate2.ce_ip
                formData.ce_port = vm.formValidate2.ce_port
                formData.ssh_username = vm.formValidate2.ssh_username
                formData.ssh_password = vm.formValidate2.ssh_password
                formData.os = vm.formValidate2.os
                formData.os_kernel = vm.formValidate2.os_kernel
                formData.cpu_total = vm.formValidate2.cpu_total
                formData.disk_mount = vm.formValidate2.disk_mount
                formData.server_type = vm.formValidate2.server_type
                formData.disk_total = vm.formValidate2.disk_total
                formData.mem_total = vm.formValidate2.mem_total
                formData.os_type = vm.formValidate2.os_type
                formData.ipv4 = vm.formValidate2.ipv4
                formData.host_name = vm.formValidate2.host_name
                formData.cpu_type = vm.formValidate2.cpu_type
                formData.swap_total = vm.formValidate2.swap_total
                util.axios({
                    method: 'get',
                    url: '/h2-console/csrf',
                }).then(res => {
                    console.log(res)
                    window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                    util.axios({
                        method: 'post',
                        url: '/equipmentmodule/api/Device', // 放方法
                        data: formData,
                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                    }).then(res => {
                        vm.$Message.success('添加成功!')
                        vm.formValidate1.ce_name = ''
                        vm.formValidate1.ce_ip = ''
                        vm.formValidate1.ce_port = 22
                        vm.formValidate1.ssh_username = ''
                        vm.formValidate1.ssh_password = ''
                        vm.formValidate1.os = ''
                        vm.formValidate2.ce_name = ''
                        vm.formValidate2.ce_ip = ''
                        vm.formValidate2.ce_port = ''
                        vm.formValidate2.os = ''
                        vm.formValidate2.ssh_username = ''
                        vm.formValidate2.ssh_password = ''
                        vm.formValidate2.os_kernel = ''
                        vm.formValidate2.cpu_total = ''
                        vm.formValidate2.disk_mount = ''
                        vm.formValidate2.server_type = ''
                        vm.formValidate2.disk_total = ''
                        vm.formValidate2.mem_total = ''
                        vm.formValidate2.os_type = ''
                        vm.formValidate2.ipv4 = ''
                        vm.formValidate2.host_name = ''
                        this.current = 0
                        this.$store.commit('clearThisTags', this);
                        vm.$router.push('/hostList/index') //跳转页面
                    }).catch(function (error) {
                        console.log(error)
                        vm.$Message.error('添加失败')
                        vm.loading = false
                    });
                }).catch(function (error) {
                    console.log(error)
                    vm.$Message.error('请求失败，请查看您的网络或联系管理员')
                    Cookies.set('user', vm.form.username);
                    Cookies.set('password', vm.form.password);
                    Cookies.set('access', 0);
                    vm.$router.push({
                        name: 'home_index'
                    });
                    vm.loading = false
                });
            }
        },
        created() {
        }
    }
</script>


