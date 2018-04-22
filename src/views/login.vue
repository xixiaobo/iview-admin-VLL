<style lang="less">
    @import './login.less';
</style>

<template>
    <div class="login" @keydown.enter="handleSubmit">
        <div class="login-con">
            <Card :bordered="false">
                <p slot="title">
                    <Icon type="log-in"></Icon>
                    欢迎登录
                </p>
                <div class="form-con">
                    <Form ref="loginForm" :model="form" :rules="rules">
                        <FormItem prop="username">
                            <Input v-model="form.username" placeholder="请输入用户名">
                            <span slot="prepend">
                                    <Icon :size="16" type="person"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem prop="password" error="密码错误，请重新输入">
                            <Input type="password" v-model="form.password" placeholder="请输入密码">
                            <span slot="prepend">
                                    <Icon :size="14" type="locked"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem>
                            <Button @click="handleSubmit" type="primary" long :loading="loading">登录</Button>
                        </FormItem>
                    </Form>
                    <p class="login-tip">©HCYCOM</p>
                </div>
            </Card>
        </div>
    </div>
</template>

<script>
    import Cookies from 'js-cookie';
    import axios from 'axios';
    import util from '@/libs/util.js';

    export default {
        data() {
            return {
                form: {
                    username: '',
                    password: ''
                },
                loading: false,
                rules: {
                    username: [
                        {required: true, message: '账号不能为空', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '密码不能为空', trigger: 'blur'}
                    ]
                }
            };
        },
        methods: {
            handleSubmit() {
                delete window.localStorage.XSRF_TOKEN
                let vm = this
                vm.$refs.loginForm.validate((valid) => {
                    if (valid) {
                        vm.loading = true
                        util.axios({
                            method: 'get',
                            url: '/h2-console/csrf',
                        }).then(res => {
                            window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                            util.axios({
                                method: 'post',
                                url: '/auth/login',
                                headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                                data: {
                                    'username': vm.form.username,
                                    'password': vm.form.password,
                                    'rememberMe': true
                                }
                            }).then(res1 => {
                                if(res1.data.error_code===1){
                                    vm.$Message.error(res1.data.msg)
                                }else{
                                    util.axios({
                                        method: 'get',
                                        url: '/jhipsteruaa/api/account',
                                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN}
                                    }).then(res2 => {
                                        window.localStorage.nowUser = res2.data
                                        vm.loading = false
                                        window.localStorage.userMessage = JSON.stringify(res2.data)
                                        vm.$store.commit('setAvator', 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3448484253,3685836170&fm=27&gp=0.jpg');
                                        Cookies.set('user', vm.form.username);
                                        Cookies.set('password', vm.form.password);
                                        Cookies.set('authorities', vm.form.authorities);
                                        Cookies.set('userid', res2.data.id);
                                        Cookies.set('access', 0);
                                        this.$router.push({
                                            name: 'home_index'
                                        });
                                    })
                                }
                            }).catch(function (error) {
                                console.log(error)
                                vm.$Message.error('请求失败，请检查你的登录信息或者联系管理员修改登录状态')
                                vm.loading = false
                            });
                        }).catch(function (error) {
                            console.log(error)
                            vm.$Message.error('请求失败，请查看您的网络或联系管理员')
                            vm.loading = false
                        });
                    }
                });
            }
        }
    };
</script>

<style>

</style>
