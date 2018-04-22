<template>
  <Card>
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
      <Row :gutter="16">
        <Col :xs="24" :sm="24" :md="24" :lg="10" :style="{marginBottom: '10px'}">
          <Card>
            <p slot="title">
              <Icon type="person"></Icon>
              基本信息
            </p>
            <div v-for="item in dynamicForm">
            <FormItem 
            :label="item.attribute_name" 
            :prop="item.attribute_key"
            v-if="item.attribute_type === 'input' && item.is_enable === 1 || item.is_enable === 2"
            >
            <Input
             v-model="formValidate[item.attribute_key]" v-if="item.attribute_type === 'input' || item.is_enable === 1 || item.is_enable === 2"
             :placeholder="item.placeholder" >
             </Input>
            </FormItem>
            <FormItem 
            :label="item.attribute_name" 
            :prop="item.attribute_key"
            v-if="item.attribute_type === 'password'"
            >
            <Input
             v-model="formValidate[item.attribute_key]" type = 'password' v-if="item.attribute_type === 'password'"
             :placeholder="item.placeholder" >
             </Input>
            </FormItem>
            <FormItem
            :label="item.attribute_name" 
            :prop="item.attribute_key" 
            v-if="item.attribute_type === 'RadioGroup'">
              <RadioGroup  v-model="formValidate.sex"  v-if="item.attribute_type === 'RadioGroup'">
                <Radio label="男">男</Radio>
                <Radio label="女">女</Radio>
              </RadioGroup >
            </FormItem>
            </div>
          </Card>
        </Col>
        <Col :xs="24" :sm="24" :md="24" :lg="14" :style="{marginBottom: '10px'}">
          <Card>
            <p slot="title">
              <Icon type="ios-locked"></Icon>
              权限相关
            </p>
            <FormItem label="分组" prop="groups">
             <Transfer
                :titles="['分组列表','已选择的分组']"
                :data="groupsData"
                :target-keys="formValidate.groups"
                @on-change="handleChange2">
                </Transfer>
            <!-- </FormItem>
              <Select v-model="formValidate.groups" placeholder="请选择分组">
                <Option value="">请选择分组</Option>
                <Option value="1">分组一</Option>
                <Option value="2">分组二</Option>
              </Select> -->
            </FormItem> 
             <!-- <FormItem label="状态" prop="status">
              <Select v-model="formValidate.status" placeholder="请选择状态">
                <Option value="1">激活</Option>
                <Option value="0">未激活</Option>
              </Select>
            </FormItem> -->
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
          password: '',
          name_cn: '',
          phone: '',
          email: '',
          groups: [],
          status: '1',
          roles: [],
          authorities: [],
          resultdata: [],
          sex: '男'
        },
        dynamicForm: [],
        groupsData: this.getMockData(),
        ruleValidate: {
          // username: [
          //   {required: true, message: '姓名不能为空', trigger: 'blur'},
          //   {message: '姓名不能为中文', pattern: '/^[0-9a-zA_Z]+$/', trigger: 'blur'}
          //   // { validator: this.usernameMess, trigger: 'blur' }
          // ],
          // password: [
          //   {required: true, message: '密码不能为空', trigger: 'blur'}
          // ],
          // name_cn: [
          //   {required: true, message: '中文名不能为空', trigger: 'blur'},
          //   { validator: this.ChineseMess, trigger: 'blur' }
          // ],
          // phone: [
          //   {required: true, message: '手机号码号码不能为空', trigger: 'blur'},
          //   { validator: this.validateCycle, trigger: 'blur' }
          // ],
          // email: [
          //   {required: true, message: '邮箱不能为空', trigger: 'blur'},
          //   {type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
          // ],
          groups: [
            {required: true, type: 'array', min: 1, message: '最少选择一个分组', trigger: 'change'}
          ],
          // // status: [
          // //   {required: true, message: '请选择状态', trigger: 'blur'}
          // // ],
          authorities: [
            { required: true, type: 'array', min: 1, message: '最少选择一个角色', trigger: 'change' }
          ]
        },
        transferData: [],
      }
    },
    methods: {
      getFormData () {
        let vm = this
        vm.loading = true
        util.axios({
            method: 'get',
            url: '/jhipsteruaa/api/allusersTable',
        }).then(res => {
            console.log(res)
            console.log('----------------------')
            if (res.data.error_code === 1) {
              vm.dynamicForm = res.data.allUser
              for (let i = 0; i < vm.dynamicForm.length; i++) {
                if (vm.dynamicForm[i].attribute_type === 'input' || vm.dynamicForm[i].attribute_type === 'password') {
                  vm.dynamicForm[i].placeholder = '请输入' + vm.dynamicForm[i].attribute_name
                } else if (vm.dynamicForm[i].attribute_type === 'select') {
                  vm.dynamicForm[i].placeholder = '请选择' + vm.dynamicForm[i].attribute_name
                }
                // console.log(vm.dynamicForm[i].is_enable)
                if (vm.dynamicForm[i].attribute_validate !== '' && vm.dynamicForm[i].attribute_validate !== null) {
                  let index = vm.dynamicForm[i].attribute_key
                  let dynam = JSON.parse(vm.dynamicForm[i].attribute_validate)
                  console.log(dynam)
                  if (vm.dynamicForm[i].attribute_validate.indexOf("pattern") !== -1) {
                    for (let t = 0; t < dynam.length; t++) {
                      if (dynam[t].pattern !== undefined) {
                        dynam[t].pattern = eval(dynam[t].pattern)
                      }
                    }
                  }
                  this.ruleValidate[index] = dynam
                }
              }
              // this.ruleValidate.username[1].pattern = /^[0-9a-zA_Z]+$/
              console.log(this.ruleValidate)
              console.log(vm.dynamicForm)
            }
        }).catch(function (error) {
            console.log(error)
            vm.loading = false
        });
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
          console.log(newTargetKeys)
          console.log(direction)
          console.log(moveKeys)
          this.formValidate.groups = newTargetKeys;
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
      validateCycle (rule, value, callback) {
        if (!(/^1[3|4|5|8][0-9]\d{4,8}$/.test(value))) {
          callback(new Error('请输入正确的手机号'))
        } else {
          callback()
        }
      },
      handleSubmit () {
        // for (let i = 0; i < this.dynamicForm.length; i++) {
        //   console.log(this.dynamicForm[i].attribute_validate)
        // }
        let vm = this
        console.log(vm.formValidate)
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
            formData.id = ''
            formData.login = ''
            console.log(vm.formValidate.groups)
            util.axios({
                method: 'get',
                url: '/h2-console/csrf',
            }).then(res => {
                console.log(res)
                window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                util.axios({
                    method: 'post',
                    url: '/jhipsteruaa/api/users',
                    headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                    data: formData
                }).then(res => {
                    vm.loading = false
                    vm.$Message.success('添加成功!')
                    console.log(res)
                    vm.formValidate.username = ''
                    vm.formValidate.password = ''
                    vm.formValidate.name_cn = ''
                    vm.formValidate.phone = ''
                    vm.formValidate.groups = []
                    vm.formValidate.status = ''
                    vm.formValidate.email = ''
                    vm.formValidate.sex = ''
                    vm.formValidate.authorities = []
                    this.$store.commit('clearThisTags', this);
                    vm.$router.push('/userList/index')
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
          let arr = []
          for (let i = 0; i < res.data.length; i++) {
            arr.push({
              key: res.data[i],
              label: res.data[i]
            })
          }
          vm.transferData = arr
          this.getFormData()
      }).catch(function (error) {
          console.log(error)
      });
    }
  }
</script>
