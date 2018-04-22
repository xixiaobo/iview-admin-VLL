<template>
  <div>
    <Row style="text-align:center;margin-top:20px">
     <Form ref="formValidate" :model="formValidate">
      <Col span="7" offset="8">
      <FormItem>
        <Input v-model.trim="formValidate.username" placeholder="请输入用户名"></Input>
      </FormItem>
      </Col>
      <Col span="1">
       <FormItem>
        <Button long type="primary" @click="search" icon="ios-search"></Button>
        </FormItem>
      </Col>
      </Form>
      <Col span="8" style="text-align:right">
        <router-link :to="{ name:'userAdd'}" >
          <Button type="primary" icon="ios-plus-empty">用户添加</Button>
        </router-link>
        <Button type="error" @click="del" icon="ios-trash-outline">批量删除</Button>
      </Col>
    </Row>
    <Row style="margin-top:20px">
      <Card :padding='0'>
        <Table border :stripe="true" :loading="loading" @on-selection-change="selectChange"  ref="selection" :columns="titleData" :data="dataresulet"></Table>
        <Page placement="top" :total="data.length" show-sizer show-elevator @on-change="pageChange" style="margin-top: 20px;text-align:center;margin-bottom: 20px;text-align:center"
              @on-page-size-change="PageSizeChange" show-total></Page>
      </Card>
    </Row>
    <Modal v-model="modal2" width="360">
        <p slot="header" style="color:#f60;text-align:center">
            <Icon type="information-circled"></Icon>
            <span>删除确认</span>
        </p>
        <div style="text-align:center">
            <p>您确定要删除以下用户吗？</p>
            <p v-for="item in tableData">{{item.username}}</p>
        </div>
        <div slot="footer">
            <Button type="error" size="large" :loading="delLoading" long @click="delOk">删除</Button>
        </div>
    </Modal>
    <Modal v-model="modal3" width="360">
        <p slot="header" style="color:#f60;text-align:center">
            <Icon type="information-circled"></Icon>
            <span>用户状态修改</span>
        </p>
        <div style="text-align:center">
            <p>该用户状态为{{aaa}}</p>
            <p>是否改变其激活状态</p>
        </div>
        <div slot="footer">
            <Button v-show= "stutasButton1" type="primary" size="large" :loading="delLoading1" long @click="statusChange(1)">激活</Button>
            <Button v-show= "stutasButton" style="margin: 0 auto" type="error" size="large" :loading="delLoading1" long @click="statusChange(0)">未激活</Button>
        </div>
    </Modal>
    <Modal
      v-model="modal1"
      title="用户密码修改"
      :loading="loadingmodal">
    <Form ref="formValidate1" :model="formValidate1" :rules="ruleValidate1" :label-width="80">
    <Form-item label="新密码" prop="password1">
      <Input type='password'  v-model="formValidate1.password1" placeholder="请输入新密码"></Input>
    </Form-item>
    <Form-item label="再次确认" prop="password">
      <Input type='password'  v-model="formValidate1.password" placeholder="请再次输入新密码"></Input>
    </Form-item>
  </Form>
  <div slot="footer">
    <Row>
      <Col span="12" offset="12">
        <Button type="ghost" size="large"  @click="quxiao" >取消</Button>
        <Button type="primary" size="large" @click="handleSubmit" >确认</Button>
      </Col></Row>
    </div>
    </Modal>
  </div>
</template>
<script>
  import util from '@/libs/util.js'
  import Cookies from 'js-cookie';
  export default {
    name: 'userList',
    data () {
      return {
        tableData:[],
        dataTitle: [],
        stutasButton: false,
        stutasButton1: false,
        formValidate: {
          username: ''
        },
        modal1: false,
        loadingmodal: false,
        formValidate1: {
           password1: '',
           password: ''
          },
          modal1: false,
          ruleValidate1: {
           password1: [
            {required: true, message: '新密码不能为空', trigger: 'blur'}
          ],
           password: [
            {required: true, message: '请再次输入新密码', trigger: 'blur'},
          { validator: this.passwordrule, trigger: 'blur' }
            ]
          },
        params: {
          page: 1,
          limit: 10
        },
        dataresulet: [],
        data: [],
        loading: false,
        modal2: false,
        modal3: false,
        delLoading1: false,
        delLoading: false,
        titleData: [],
        usernames: '',
        aaa: '',
        statusname: ''
      }
    },
    methods: {
      getTable () {
        this.titleData = [{
          type: 'selection',
          width: 60,
          align: 'center'
        }]
        for (var i = 0; i < this.dataTitle.length; i++) {
          if (this.dataTitle[i].is_enable === 2 || this.dataTitle[i].is_enable === 4 ) {
            if (this.dataTitle[i].attribute_name === '状态') {
              this.titleData.push({
              title: '状态',
              align: 'center',
              key: 'status',
              render: (h, params) => {
                  if (params.row.status === '1') {
                    return h('div', [
                      h('span', {
                        style: {
                          backgroundColor: 'green',
                          color: 'white',
                          padding: '5px',
                          borderRadius: '10px'
                        }
                      }, '已激活')
                    ])
                  } else {
                    return h('div', [
                      h('span', {
                        style: {
                          backgroundColor: 'red',
                          color: 'white',
                          padding: '5px',
                          borderRadius: '10px'
                        }
                      }, '未激活')
                    ])
                  }
                }
            })
            } else {
               this.titleData.push({
                title: this.dataTitle[i].attribute_name,
                align: 'center',
                key: this.dataTitle[i].attribute_key,
              })
            }
          }     
        }
        this.titleData.push({
          title: '操作',
          key: 'action',
          width: 180,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Tooltip',{
                props: {
                  content: '用户修改',
                  placement: 'top'
                }
              },[
                h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  icon: 'ios-compose-outline'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.edit(params.row.username)
                  }
                }
              })
              ]),
              h('Tooltip',{
                props: {
                  content: '密码修改',
                  placement: 'top'
                }
              },[
                h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  icon: 'ios-calculator'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.password(params.row.username)
                  }
                }
              })
              ]),
              h('Tooltip', {
                props: {
                  content: '状态修改',
                  placement: 'top'
                }
              },[
                h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  icon: 'ios-toggle-outline'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.stutas(params.row)
                  }
                }
              })
              ]),
              h('Tooltip', {
                props: {
                  content: '用户删除',
                  placement: 'top'
                }
              },[
                  h('Poptip', {
                props: {
                  confirm: true,
                  title: '确定要删除吗！',
                  type: 'primary',
                  transfer: true
                },
                on: {
                  'on-ok': () => {
                    this.remove(params.row.username)
                  }
                }
              }, [
              h('Button', {
                props: {
                  icon: 'ios-trash-outline',
                  type: 'error',
                  size: 'small',
                  color: 'white'
                }
              })
              ])
              ])
              ])
          }
        })
        this.getData()
      },
      gettitleData () {
        let vm = this
        vm.loading = true
        util.axios({
            method: 'get',
            url: '/jhipsteruaa/api/allusersTable',
        }).then(res => {
            console.log(res)
            console.log('----------------------')
            console.log(Cookies.get('XSRF-TOKEN'))
            if (res.data.error_code === 1) {
              vm.dataTitle = res.data.allUser
              this.getTable()
            }
        }).catch(function (error) {
            console.log(error)
            vm.loading = false
        });
      },
      cancel () {

      },
      passwordrule (rule, value, callback) {
                if (value === this.formValidate1.password1) {
                  callback()
                } else {
                  callback(new Error('两次密码不同，请重新输入'))
                }
                console.log(this.formValidate1.password1)
                callback()
            },
        quxiao () {

        },
        handleSubmit () {
        let vm = this
        vm.$refs['formValidate1'].validate((valid) => {
          if (valid) {
            let formData = {}
            formData.username = this.usernames
            formData.newPassword = vm.formValidate1.password
            console.log(formData)
            util.axios({
                method: 'get',
                url: '/h2-console/csrf',
            }).then(res => {
                console.log(res)
                window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                util.axios({
                    method: 'post',
                    url: '/jhipsteruaa/api/account/reset-password/finish',
                    headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                    data: formData
                }).then(res => {
                  if (res.data.error_code === 1) {
                    vm.loading = false
                    vm.$Message.success('用户修改成功!')
                    console.log(res)
                    this.modal1 = false
                    vm.$router.push('/userList/index')
                  } else {
                    vm.loading = false
                    vm.$Message.error('用户修改失败!')
                    console.log(res)
                    this.modal1 = false
                  }
                }).catch(function (error) {
                    console.log(error)
                    vm.$Message.error('用户修改失败')
                    this.modal1 = false
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
      stutas (statusdata) {
        this.statusname = statusdata.username
        console.log(statusdata.status)
        let data = statusdata.status
        if (data === '1') {
          this.aaa = '激活'
          this.modal3 = true
          this.stutasButton1 = false
          this.stutasButton = true
        } else {
          this.aaa = '未激活'
          this.modal3 = true
          this.stutasButton1 = true
          this.stutasButton = false
        }
      },
      statusChange (data) {
        console.log(this.statusname)
        console.log(data)
        console.log('状态修改成功')
        let params= {
          username: this.statusname,
          status: data
        }
        console.log(params)
        let vm = this
        vm.loading = true
        util.axios({
            method: 'get',
            url: '/jhipsteruaa/api/activate',
            headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
            params: {
              username: this.statusname,
              status: data
            }
        }).then(res => {
              vm.loading = false
              this.modal3 = false
              this.$Message.success('修改激活状态成功')
              this.getData()
        }).catch(function (error) {
            console.log(error)
            vm.loading = false
        });
      },
      password (data) {
        console.log(data)
        this.usernames = data
        this.modal1 = true
      },
      search () {
        console.log(this.formValidate.username)
        let vm = this
        let searchData = {}
        searchData.username = this.formValidate.username
        vm.loading = true
        util.axios({
            method: 'get',
            url: '/h2-console/csrf',
        }).then(res => {
          window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
           util.axios({
            method: 'post',
            url: '/jhipsteruaa/api/getusersByLike',
            data: searchData,
            headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
        }).then(res => {
            console.log(res)
            if (res.data.error_code === 1) {
              this.$Message.success('搜索成功')
              vm.loading = false
              vm.data = res.data.allUser
              console.log(vm.data)
              // for (let i = 0; i < vm.data.length; i++) {
              //   if (vm.data[i].status === '1') {
              //     vm.data.status === '激活'
              //   } else {
              //     vm.data.status === '未激活'
              //   }
              // }
              this.setTableData()
            }
        }).catch(function (error) {
            console.log(error)
            vm.loading = false
        });
       })
      },
      del () {
        console.log(this.tableData)
        if (this.tableData.length === 0) {
          this.$Message.error('请至少选择一个要删除的用户')
        }else {
          this.modal2 = true
        }
      },
      delOk () {
        this.delLoading = true
        let formData = []
        for (let i = 0; i < this.tableData.length; i++) {
          formData.push(this.tableData[i].id)
        }
        util.axios({
            method: 'get',
            url: '/h2-console/csrf',
        }).then(res => {
            window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
            util.axios({
              method: 'delete',
              url: '/jhipsteruaa/api/usersByMore',
              headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
              data:formData
            }).then(ress => {
              this.$Message.success('删除成功!')
              this.delLoading = false
              this.modal2 = false
              this.getData()
            }).catch(function (error) {
              this.$Message.error('删除失败')
              this.delLoading = false
              this.modal2 = false
              this.loading = false
            });
        })
      },
      selectChange (selection) {
        this.tableData = selection
      },
      handleSelectAll (status) {
        this.$refs.selection.selectAll(status);
      },
      getData () {
        console.log(this.titleData)
        let vm = this
        vm.loading = true
        util.axios({
            method: 'get',
            url: '/jhipsteruaa/api/allusers',
            headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
        }).then(res => {
            console.log(res)
            console.log('----------------------')
            console.log(Cookies.get('XSRF-TOKEN'))
            if (res.data.error_code === 1) {
              vm.loading = false
              vm.data = res.data.allUser
              console.log(vm.data)
              for (let i = 0; i < vm.data.length; i++) {
                if (vm.data[i].roles !== '') {
                  vm.data[i].roles = vm.data[i].authorities + ','
                } else {
                  vm.data[i].roles = '-'
                }
              }
              this.setTableData()
            } else if (res.data.error_code === 0) {
              vm.data = []
              this.setTableData()
            }
        }).catch(function (error) {
            console.log(error)
            vm.loading = false
        });
      },
      setTableData () {
        let vm = this
        let arr = []
        let x = vm.data.length
        if (vm.data.length > vm.params.page * vm.params.limit) {
          x = this.params.page * this.params.limit
        }
        for (let i = (this.params.page - 1) * this.params.limit; i < x; i++) {
          arr.push(vm.data[i])
        }
        vm.dataresulet = arr
      },
      pageChange (page) {  // 改变页数
        this.params.page = page
        this.setTableData()
      },
      PageSizeChange (limit) {  // 改变每页显示条数
        this.params.limit = limit
        this.setTableData()
      },
      edit (index) {
        console.log(index)
        window.localStorage.userName = index
        console.log(window.localStorage.userName )
        this.$router.push({name: 'userUpdate'})
      },
      remove (index) {
        util.axios({
          method: 'get',
          url: '/h2-console/csrf',
        }).then(res => {
          window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
          util.axios({
            method: 'delete',
            url: '/jhipsteruaa/api/users/'+index,
            headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN}
          }).then(ress => {
            this.$Message.success('删除成功!')
            this.getData()
          }).catch(function (error) {
            this.$Message.error('删除失败')
            this.loading = false
          });
        })
      },
    },
    mounted () {
      this.gettitleData()
    }
  }
</script>