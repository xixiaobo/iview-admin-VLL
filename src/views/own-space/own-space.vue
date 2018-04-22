<template>
  <Card>
    <p slot="title">
        <Icon type="person"></Icon>
        个人信息
    </p>
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
      <Row>
        <Col span="8" offset="8">
            <FormItem label="用户名" prop="username">
              <Input disabled v-model="formValidate.username" placeholder="请输入姓名"></Input>
            </FormItem>
             <FormItem label="中文名" prop="name_cn">
              <Input :disabled="buttonStachange" v-model="formValidate.name_cn" placeholder="请输入中文名"></Input>
            </FormItem>
             <FormItem label="手机号码" prop="phone">
              <Input :disabled="buttonStachange" v-model="formValidate.phone" placeholder="请输入手机号码"></Input>
            </FormItem>
            <FormItem label="邮箱" prop="email">
              <Input :disabled="buttonStachange" v-model="formValidate.email" placeholder="请输入邮箱"></Input>
            </FormItem>
            <FormItem label="性别" prop="sex">
              <Radio-group  v-model="formValidate.sex">
                <Radio disabled label="男">男</Radio>
                <Radio disabled label="女">女</Radio>
              </Radio-group>
            </FormItem>
        </Col>
      </Row>
      <Row style="text-align:center">
      <FormItem>
        <Col span="2" offset="9">
        <Button type="primary" v-show="buttonStachange" @click="changeButton()">修&nbsp;&nbsp;&nbsp;改</Button>
        <Button type="primary" v-show="buttonSta" @click="handleSubmit">提&nbsp;&nbsp;&nbsp;交</Button></Col>
        <Col span="2" offset="2">
        <Button type="ghost" @click="goBack">返&nbsp;&nbsp;&nbsp;回</Button>
        </Col>
      </FormItem>
      </Row>
    </Form>
  </Card>
</template>
<script>
  import util from '@/libs/util.js'
  export default {
    name: 'ownspace_index',
    data () {
      return {
        formValidate: {
          username: '',
          name_cn: '',
          phone: '',
          email: '',
          groups: '',
          status: '',
          role: ''
        },
        buttonSta: false,
        buttonStachange: true,
        ruleValidate: { 
          name_cn: [
            {required: true, message: '中文名不能为空', trigger: 'blur'},
            { validator: this.ChineseMess, trigger: 'blur' }
          ],
          phone: [
            {required: true, message: '手机号码号码不能为空', trigger: 'blur'},
            { validator: this.validateCycle, trigger: 'blur' }
          ],
          email: [
            {required: true, message: '邮箱不能为空', trigger: 'blur'},
            {type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
          ]
        },
        transferData: []
      }
    },
    methods: {
      changeButton () {
        this.buttonSta = true
        this.buttonStachange = false
      },
      usernameMess (rule, value, callback) {
        if ((/^[\u4e00-\u9fa5]{1,12}$/.test(value))) {
          callback(new Error('请输入英文'))
        } else {
          callback()
        }
      },
      ChineseMess (rule, value, callback) {
        if ((/^[\u4e00-\u9fa5]{1,12}$/.test(value))) {
          callback()
        } else {
          callback(new Error('请输入中文'))
        }
      },
      handleChange1 (newTargetKeys, direction, moveKeys) {
          this.formValidate.authorities = newTargetKeys;
      },
      validateCycle (rule, value, callback) {
        if (!(/^1[3|4|5|8][0-9]\d{4,8}$/.test(value))) {
          callback(new Error('请输入正确的手机号'))
        } else {
          callback()
        }
      },
      getUser () {
        let vm = this
        util.axios({
            method: 'get',
            url: '/jhipsteruaa/api/account',
            headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN}
        }).then(res2 =>{
            console.log('+++++++') 
            console.log(res2.data.id)
            vm.loading = false
            let userData = res2.data
            console.log(userData)
            this.formValidate.username = userData.username
            this.formValidate.name_cn =userData.name_cn
            this.formValidate.phone = userData.phone
            this.formValidate.email = userData.email
            this.formValidate.sex = userData.sex 
            window.localStorage.userMessage = JSON.stringify(res2.data)
            console.log(window.localStorage.userMessage.id)
        })
      },
      handleSubmit () {
        let vm = this
        vm.$refs['formValidate'].validate((valid) => {
          if (valid) {
            let formData = {}
            formData.name_cn = vm.formValidate.name_cn
            formData.phone = vm.formValidate.phone
            formData.email = vm.formValidate.email
            console.log(formData)
            util.axios({
                method: 'get',
                url: '/h2-console/csrf',
            }).then(res => {
                console.log(res)
                window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                util.axios({
                    method: 'post',
                    url: '/jhipsteruaa/api/account',
                    headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                    data: formData
                }).then(res => {
                    vm.loading = false
                    vm.$Message.success('修改成功!')
                    console.log(res)
                    vm.$router.push('/userList/index')
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
      goBack () {
        this.$router.push('/userList/index')
      }
    },
    mounted () {
      this.getUser()
    }
  }
</script>
