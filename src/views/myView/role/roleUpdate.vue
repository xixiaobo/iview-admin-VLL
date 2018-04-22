<template>
  <Card>
    <Row>
      <Col span="8" offset="8">
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
          <FormItem label="角色名" prop="role_name">
            <Input v-model="formValidate.role_name" placeholder="请输入角色名"></Input>
          </FormItem>
          <FormItem label="角色描述" prop="role_desc">
            <Input v-model="formValidate.role_desc" placeholder="请输入角色描述"></Input>
          </FormItem>
          <Row  style="text-align:center">
            <FormItem>
              <Col span="6" offset="2">
                <Button type="primary" @click="handleSubmit">提&nbsp;&nbsp;&nbsp;交</Button></Col>
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
  import Cookies from 'js-cookie';
  export default {
    name: 'roleAdd',
    data () {
      return {
        formValidate: {
          role_name: '',
          role_desc: '',
          uuid: ''
        },
        ruleValidate: {
          role_name: [
            {required: true, message: '姓名不能为空', trigger: 'blur'}
          ],
          role_desc: [
            {required: true, message: '密码不能为空', trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      getDate () {
        let vm = this
        console.log(window.localStorage.data)
        let dataresult = JSON.parse(window.localStorage.data)
        console.log(dataresult) 
        vm.formValidate.role_desc = dataresult.role_desc
        vm.formValidate.role_name = dataresult.role_name
        vm.formValidate.uuid = dataresult.uuid
        console.log(vm.formValidate.uuid)
      },
      handleSubmit () {
        console.log(Cookies.get('XSRF-TOKEN'))
        console.log(document.cookie)
        console.log(JSON.parse(window.localStorage.userMessage))
        let vm = this
        vm.$refs['formValidate'].validate((valid) => {
          if (valid) {
            let formData = {}
            formData.role_name = vm.formValidate.role_name
            formData.role_desc = vm.formValidate.role_desc
            formData.uuid = vm.formValidate.uuid
            console.log(formData)
            util.axios({
                method: 'get',
                url: '/h2-console/csrf', 
            }).then(res => {
                console.log(res)
                window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                util.axios({
                    method: 'put',
                    url: '/jhipsteruaa/api/role_update',
                    data: formData,
                    headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                }).then(res => {
                    vm.loading = false
                    vm.$Message.success('修改成功!')
                    console.log(res)
                    this.$store.commit('clearThisTags', this);
                    vm.$router.push('/roleList/index')
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
                    name: 'rolrList'
                });
                vm.loading = false
            });
            
          } else {
            vm.$Message.error('表单验证失败!')
          }
        })
      },
      toRegister () {
        this.$router.push('/roleList/index')
      },
      handleReset (name) {
        this.$refs[name].resetFields()
      }
    },
    watch: {
        '$route' () {
            this.getDate();
        }
    },
    created () {
      this.getDate()
    }
  }
</script>
