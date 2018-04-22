<template>
    <Card>
        <Row>
            <Col>
                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
                    <FormItem label="消息标题" prop="title" style="width:300px">
                        <Input v-model="formValidate.title" placeholder="请输入标题"></Input>
                    </FormItem>
                    <FormItem label="收件用户" prop="addresseeuuid">
                        <Select v-model="formValidate.addresseeuuid" style="width:200px">
                            <Option v-for="item in userList" :value="item.value" :key="item.value">{{ item.label }}
                            </Option>
                        </Select>
                    </FormItem>
                    <quill-editor ref="myTextEditor" v-model="formValidate.content"
                                  style="height: 200px;margin-bottom: 80px"></quill-editor>
                    <Row style="text-align:center">
                        <FormItem>
                            <Col span="6" offset="2">
                                <Button type="primary" @click="handleSubmit">发&nbsp;&nbsp;&nbsp;送</Button>
                            </Col>
                            <Col span="6" offset="8">
                                <Button type="ghost" @click="toRegister">返&nbsp;&nbsp;&nbsp;回</Button>
                            </Col>
                        </FormItem>
                    </Row>
                </Form>
            </Col>
        </Row>
    </Card>
</template>

<script>
    import Cookies from 'js-cookie';
    import util from '@/libs/util.js';
    import 'quill/dist/quill.core.css'
    import 'quill/dist/quill.snow.css'
    import 'quill/dist/quill.bubble.css'

    import {quillEditor} from 'vue-quill-editor'

    export default {
        name: "sendmessage",
        components: {
            quillEditor
        },
        data() {
            return {
                formValidate: {
                    title: '',
                    content: '',
                    senderuuid: '',
                    sender: '',
                    addresseeuuid: '',
                },
                userList: [],
                ruleValidate: {
                    title: [
                        {required: true, message: '消息标题不能为空', trigger: 'blur'}
                    ],
                    addresseeuuid: [
                        {required: true, message: '收件人不能为空', trigger: 'blur'}
                    ],
                },
                content: '',
            }
        },
        methods: {
            getUserListData() {
                let vm = this
                util.axios({
                    method: 'get',
                    url: '/jhipsteruaa/api/getAllUserOnly',
                }).then(res => {
                    console.log(res)
                    var hosts = res.data.allUser
                    hosts.forEach(function (val, index, arr) {
                        var a = {
                            value: val.id,
                            label: val.username
                        }
                        vm.userList.push(a)
                    })
                }).catch(function (error) {
                });
            },
            init() {
                this.formValidate.sender = Cookies.get('user')
                this.formValidate.senderuuid = Cookies.get('userid')
                this.getUserListData()
            },
            handleSubmit() {
                let vm = this
                this.$refs['formValidate'].validate((valid) => {
                    console.log(valid)
                    if (valid) {
                        let formData = {}
                        formData.title = vm.formValidate.title
                        formData.time = vm.CurentTime()
                        formData.content = vm.formValidate.content
                        formData.senderuuid = vm.formValidate.senderuuid
                        formData.sender = vm.formValidate.sender
                        formData.addresseeuuid = vm.formValidate.addresseeuuid
                        let hosts = vm.userList
                        hosts.forEach(function (val) {
                            if (val.value === formData.addresseeuuid) {
                                formData.addressee = val.label
                            }
                        })
                        console.log(formData)
                        util.axios({
                            method: 'get',
                            url: '/h2-console/csrf',
                        }).then(res => {
                            console.log(res)
                            window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                            util.axios({
                                method: 'post',
                                url: '/newsmodule/api/Notify',
                                data: formData,
                                headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                            }).then(res => {
                                vm.loading = false
                                vm.$Message.success('信息发送成功!')
                                console.log(res)
                                vm.rush()
                                vm.init()
                            }).catch(function (error) {
                                console.log(error)
                                vm.$Message.error('消息发送失败')
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
            rush() {
                this.formValidate = {
                    title: '',
                    time: '',
                    content: '',
                    senderuuid: '',
                    sender: '',
                    addresseeuuid: '',
                    addressee: '',
                }
            },
            CurentTime() {
                var now = new Date();
                var year = now.getFullYear();       //年
                var month = now.getMonth() + 1;     //月
                var day = now.getDate();            //日
                var hh = now.getHours();            //时
                var mm = now.getMinutes();          //分
                var ss = now.getSeconds();           //秒
                var clock = year + "-";
                if (month < 10)
                    clock += "0";
                clock += month + "-";
                if (day < 10)
                    clock += "0";
                clock += day + " ";
                if (hh < 10)
                    clock += "0";
                clock += hh + ":";
                if (mm < 10) clock += '0';
                clock += mm + ":";
                if (ss < 10) clock += '0';
                clock += ss;
                return (clock);
            },
            toRegister() {
                this.rush()
                this.$store.commit('clearThisTags', this);
                this.$router.push('/messagelist/index')
            }
        },
        created() {
        },
        mounted() {
            this.init()
        },
    }
</script>

<style scoped>

</style>