<template>
  <Card>
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
      <Row :gutter="16">
        <Col :xs="24" :sm="24" :md="24" :lg="10" :style="{marginBottom: '10px'}">
          <Card style="height:433px">
            <p slot="title">
              <Icon type="person"></Icon>
              基本信息
            </p>
            <FormItem label="用户名" prop="username">
              <Input disabled v-model="formValidate.username" placeholder="请输入姓名"></Input>
            </FormItem>
             <FormItem label="中文名" prop="name_cn">
              <Input v-model="formValidate.name_cn" placeholder="请输入中文名"></Input>
            </FormItem>
             <FormItem label="手机号码" prop="phone">
              <Input v-model="formValidate.phone" placeholder="请输入手机号码"></Input>
            </FormItem>
            <FormItem label="邮箱" prop="email">
              <Input v-model="formValidate.email" placeholder="请输入邮箱"></Input>
            </FormItem>
            <FormItem label="性别" prop="sex">
              <Radio-group v-model="formValidate.sex">
                <Radio label="男">男</Radio>
                <Radio label="女">女</Radio>
              </Radio-group>
            </FormItem>
          </Card>
        </Col>
        <Col :xs="24" :sm="24" :md="24" :lg="14" :style="{marginBottom: '10px'}">
          <Card>
            <p slot="title">
              <Icon type="ios-locked"></Icon>
              权限相关
            </p>
            <!-- <FormItem label="分组" prop="groups">
              <Select v-model="formValidate.groups" placeholder="请选择分组">
                <Option value="">请选择分组</Option>
                <Option value="1">分组一</Option>
                <Option value="2">分组二</Option>
              </Select>
            </FormItem> -->
            <FormItem label="分组" prop="groups">
              <Transfer
                :titles="['分组列表','已选择的分组']"
                :data="transferData1"
                :target-keys="formValidate.groups"
                @on-change="handleChange2"></Transfer>
            </FormItem>
            <FormItem label="角色" prop="authorities">
              <!-- <CheckboxGroup v-model="formValidate.authorities">
                <Checkbox :label="item" v-for="(item, index) in roleList" :key="index">{{item}}</Checkbox>
              </CheckboxGroup> -->
              <Transfer
                :titles="['角色列表','已选择的角色']"
                :data="transferData"
                :target-keys="formValidate.authorities"
                @on-change="handleChange1"></Transfer>
            </FormItem>
          </Card>
        </Col>
      </Row>
      <Row style="text-align:center">
      <FormItem>
        <Col span="2" offset="8">
        <Button type="primary" @click="handleSubmit">提&nbsp;&nbsp;&nbsp;交</Button></Col>
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
    name: 'userAdd',
    data () {
      return {
        formValidate: {
          username: '',
          name_cn: '',
          phone: '',
          email: '',
          groups: [],
          status: '',
          role: '',
          authorities: []
        },
        ruleValidate: {
          username: [
            {required: true, message: '姓名不能为空', trigger: 'blur'},
            { validator: this.usernameMess, trigger: 'blur' }
          ],
          name_cn: [
            {required: true, message: '中文名不能为空', trigger: 'blur'}
          ],
          phone: [
            {required: true, message: '手机号码号码不能为空', trigger: 'blur'},
            { validator: this.validateCycle, trigger: 'blur' }
          ],
          email: [
            {required: true, message: '邮箱不能为空', trigger: 'blur'},
            {type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
          ],
          groups: [
             { required: true, type: 'array', min: 1, message: '最少选择一个角色', trigger: 'change' }
          ],
          status: [
            {required: true, message: '请选择状态', trigger: 'blur'}
          ],
          authorities: [
            { required: true, type: 'array', min: 1, message: '最少选择一个角色', trigger: 'change' }
          ]
        },
        transferData: [],
        transferData1: this.getMockData()   
      }
    },
    methods: {
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
      getMockData () {
        let mockData = [];
        for (let i = 1; i <= 3; i++) {
            mockData.push({
                key: i.toString(),
                label: '分组 ' + i,
            });
        }
        return mockData;
      },
      handleChange1 (newTargetKeys, direction, moveKeys) {
          this.formValidate.authorities = newTargetKeys;
      },
      handleChange2 (newTargetKeys, direction, moveKeys) {
          this.formValidate.groups = newTargetKeys;
      },
      validateCycle (rule, value, callback) {
        if (!(/^1[3|4|5|8][0-9]\d{4,8}$/.test(value))) {
          callback(new Error('请输入正确的手机号'))
        } else {
          callback()
        }
      },
      getData (userName) {
        let vm = this
        let login = userName
        util.axios({
          method: 'get',
          url: '/h2-console/csrf',
        }).then(res => {
          window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
          util.axios({
            method: 'get',
            url: '/jhipsteruaa/api/users/'+login,
            headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN}
          }).then(ress => {
            console.log(ress.data)
            this.formValidate = ress.data
            // this.formValidate.status = JSON.stringify(ress.data.status)
          }).catch(function (error) {
            vm.$Message.error('信息查询失败')
            vm.loading = false
          });
        })
      },
      handleSubmit () {
        let vm = this
        vm.$refs['formValidate'].validate((valid) => {
          if (valid) {
            let formData = {}
            formData.username = vm.formValidate.username
            formData.password = vm.formValidate.password
            formData.name_cn = vm.formValidate.name_cn
            formData.phone = vm.formValidate.phone
            formData.groups = vm.formValidate.groups
            formData.status = vm.formValidate.status
            formData.roles = ''
            formData.email = vm.formValidate.email
            formData.sex = vm.formValidate.sex
            formData.head_image = ''
            formData.authorities = vm.formValidate.authorities
            formData.id = vm.formValidate.id
            formData.login = ''
            console.log(formData)
            util.axios({
                method: 'get',
                url: '/h2-console/csrf',
            }).then(res => {
                console.log(res)
                window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                util.axios({
                    method: 'put',
                    url: '/jhipsteruaa/api/users',
                    headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                    data: formData
                }).then(res => {
                    vm.loading = false
                    vm.$Message.success('修改成功!')
                    console.log(res)
                    this.$store.commit('clearThisTags', this);
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
      // handleReset (name) {
      //   this.$refs[name].resetFields()
      // }
    },
    mounted () {
      let vm = this
      util.axios({
          method: 'get',
          url: '/jhipsteruaa/api/users/authorities',
          headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
      }).then(res => {
          console.log(res)
          let arr = []
          for (let i = 0; i < res.data.length; i++) {
            arr.push({
              key: res.data[i],
              label: res.data[i]
            })
          }
          vm.transferData = arr
      }).catch(function (error) {
          console.log(error)
      });
    },
    created () {
      let vm = this
      console.log('sssssssssssss')
      this.getData(window.localStorage.userName)
      console.log(window.localStorage.userName)
    }
  }
</script>
