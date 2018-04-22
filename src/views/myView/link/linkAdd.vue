<template>
    <Card>
        <Row>
            <Col span="8" offset="8">
                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
                    <FormItem label="VLL链路名称" prop="vll_link_name">
                        <Input v-model="formValidate.vll_link_name" placeholder="请输入链路名称"></Input>
                    </FormItem>
                    <FormItem label="主机设备" prop="src_device_id">
                        <Select v-model="formValidate.src_device_id" style="width:200px">
                            <Option v-for="item in deviceList" :value="item.value" :key="item.value">{{ item.label }}
                            </Option>
                        </Select>
                    </FormItem>
                    <FormItem label="目的端设备名称" prop="dst_device">
                        <Input v-model="formValidate.dst_device" placeholder="请输入目的设备名称"></Input>
                    </FormItem>
                    <FormItem label="目的端ip" prop="dst_port_ip">
                        <Input v-model="formValidate.dst_port_ip" placeholder="请输入ip地址"></Input>
                    </FormItem>
                    <Row style="text-align:center">
                        <FormItem>
                            <Col span="6" offset="2">
                                <Button type="primary" @click="handleSubmit">提&nbsp;&nbsp;&nbsp;交</Button>
                            </Col>
                            <Col span="6" offset="8">
                                <Button type="ghost" @click="toRegister">返&nbsp;&nbsp;&nbsp;回</Button>
                            </Col>
                        </FormItem>
                    </Row>
                </Form>
            </Col>
            <Col span="8"></Col>
        </Row>
    </Card>
</template>
<script>
    import util from '@/libs/util.js';

    export default {
        name: 'roleAdd',
        data() {
            return {
                formValidate: {
                    vll_link_name: '',
                    src_device_id: '',
                    dst_device: '',
                    dst_port_ip: ''
                },
                deviceList: [],
                ruleValidate: {
                    vll_link_name: [
                        {required: true, message: 'VLL链路名称不能为空', trigger: 'blur'}
                    ],
                    src_device_id: [
                        {required: true, message: '主机设备不能为空', trigger: 'blur'}
                    ],
                    dst_device: [
                        {required: true, message: '目的端设备名称不能为空', trigger: 'blur'}
                    ],
                    dst_port_ip: [
                        {required: true, message: '目的端端口ip不能为空', trigger: 'blur'},
                        {validator: this.ipValidation, trigger: 'blur'}
                    ],
                }
            }
        },
        methods: {
            ipValidation(rule, value, callback) {
                if (!(/^(\d|[1-9]\d|1\d{2}|2[0-5][0-5])\.(\d|[1-9]\d|1\d{2}|2[0-5][0-5])\.(\d|[1-9]\d|1\d{2}|2[0-5][0-5])\.(\d|[1-9]\d|1\d{2}|2[0-5][0-5])$/.test(value))) {
                    if (!(/^(?=^.{3,255}$)?(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\d+)*(\/\w+\.\w+)*$/.test(value))) {
                        callback('IP地址或者域名格式不正确')
                    }else{
                        callback()
                    }

                } else {
                    callback()
                }
            },
            rush() {
                this.formValidate.vll_link_name = ''
                this.formValidate.src_device_id = ''
                this.formValidate.dst_device = ''
                this.formValidate.dst_port_ip = ''
            },
            handleSubmit() {
                let vm = this
                this.$refs['formValidate'].validate((valid) => {
                    console.log(valid)
                    if (valid) {
                        let formData = {}
                        formData.vll_link_name = vm.formValidate.vll_link_name
                        formData.src_device_id = vm.formValidate.src_device_id
                        formData.dst_device = vm.formValidate.dst_device
                        formData.dst_port_ip = vm.formValidate.dst_port_ip
                        formData.vll_link_id=''
                        formData.link_status=1
                        formData.delay_average=0
                        formData.delay_maxnum=0
                        formData.delay_minnum=0
                        formData.packet_loss=''
                        formData.last_test_time=''
                        console.log(formData)
                        util.axios({
                            method: 'get',
                            url: '/h2-console/csrf',
                        }).then(res => {
                            console.log(res)
                            window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                            util.axios({
                                method: 'post',
                                url: '/equipmentmodule/api/Link',
                                data: formData,
                                headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                            }).then(res => {
                                vm.loading = false
                                vm.$Message.success('添加成功!')
                                console.log(res)
                                this.rush()
                                this.$store.commit('clearThisTags', this);
                                vm.$router.push('/linkList/index')
                            }).catch(function (error) {
                                console.log(error)
                                vm.$Message.error('添加失败')
                                vm.loading = false
                            });
                        }).catch(function (error) {
                            console.log(error)
                            vm.$Message.error('请求失败，请查看您的网络或联系管理员')
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
            toRegister() {
                this.rush()
                this.$store.commit('clearThisTags', this);
                this.$router.push('/linkList/index')
            },
            handleReset(name) {
                this.$refs[name].resetFields()
            },
            getData(){
                let vm=this
                util.axios({
                    method: 'get',
                    url: 'equipmentmodule/api/Device_getAll',
                }).then(res => {
                    console.log(res)
                    if (res.data.error_code === 1) {
                        vm.deviceList = []
                        var hosts=res.data.data
                        hosts.forEach(function (val, index, arr) {
                            var a={
                                value: val.ce_id,
                                label: val.ce_name+"-"+val.ce_ip
                            }
                            vm.deviceList .push(a)
                        })
                    } else if (res.data.error_code === 0) {
                        vm.deviceList  = []
                    }
                }).catch(function (error) {
                });
            }
        },
        created() {
            this.rush()
            this.getData()
        }
    }
</script>
