<template>
  <div>
    <Row style="text-align:center;margin-top:20px">
     <Col span="7" offset="8">
        <Input v-model.trim="link_name" placeholder="请输入链路名称"></Input>
      </Col>
      <Col span="1">
        <Button long type="primary" @click="search" icon="ios-search"></Button>
      </Col>
      <Col span="8" style="text-align:right">
        <router-link :to="{ name:'linkAdd'}" >
          <Button type="primary" icon="ios-plus-empty">链路添加</Button>
        </router-link>
        <Button type="error" @click="dels()" icon="ios-trash-outline">批量删除</Button>
      </Col>
    </Row>
    <Row style="margin-top:20px">
      <Card :padding='0'>
        <Table border :stripe="true" :loading="loading" @on-selection-change="selectChange" ref="selection" :columns="columns" :data="dataresulet"></Table>
         <Page placement="top" :total="data.length" show-sizer show-elevator @on-change="pageChange" style="margin-top: 20px;text-align:center;margin-bottom: 20px;text-align:center" @on-page-size-change="PageSizeChange" show-total></Page>
       </Card>
    </Row>
     <Modal v-model="modal2" width="360">
        <p slot="header" style="color:#f60;text-align:center">
            <Icon type="information-circled"></Icon>
            <span>删除确认</span>
        </p>
        <div style="text-align:center">
            <p>您确定要删除以下用户吗？</p>
            <p v-for="item in tableData">{{item.role_name}}</p>
        </div>
        <div slot="footer">
            <Button type="error" size="large" :loading="delLoading" long @click="delOk">删除</Button>
        </div>
    </Modal>
  </div>
</template>
<script>
  import util from '@/libs/util.js'
  export default {
    name: 'roleList',
    data () {
      return {
        tableData:[],
        columns: [
            {
              type: 'selection',
              width: 60,
              align: 'center'
            },
            {
              title: '链路名称',
              key: 'vll_link_name'
            },
            {
                title: '目的端设备名称',
                key: 'dst_device'
            },
            {
                title: '链路状态',
                key: 'link_status'
            },
            {
                title: '当前平均时延',
                key: 'delay_average'
            },
            {
                title: '当前最大时延',
                key: 'delay_maxnum'
            },
            {
                title: '当前最小时延',
                key: 'delay_minnum'
            },
            {
                title: '丢包率',
                key: 'packet_loss'
            },
            {
                title: '最后测试时间',
                key: 'last_test_time'
            },
            {
              title: '操作',
              key: 'action',
              width: 220,
              align: 'center',
              render: (h, params) => {
                return h('div', [
                  h('Tooltip', {
                    props: {
                      content: '链路详情',
                      placement: 'top'
                    }
                  }, [
                     h('Button', {
                    props: {
                      type: 'primary',
                      size: 'small',
                      icon: 'clipboard'
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.linkgetId(params.row.vll_link_id)
                      }
                    }
                  })
                  ]),
                  h('Tooltip', {
                    props: {
                      content: '链路删除',
                      placement: 'top'
                    }
                  }, [
                    h('Poptip', {
                    props: {
                      confirm: true,
                      title: '确定要删除吗！',
                      type: 'primary',
                      transfer: true
                    },
                    on: {
                      'on-ok': () => {
                        this.del(params.row.vll_link_id)
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
        }
        ],
        link_name: '',
        params: {
          page: 1,
          limit: 10
        },
        dataresulet: [],
        data: [],
        loading: false,
        searchInput: '',
        loading: false,
        modal2: false,
        delLoading: false
      }
    },
    methods: {
      cancel () {
      },
      dels () {
        let vm = this
        console.log(vm.tableData)
        if (this.tableData.length === 0) {
          this.$Message.error('请至少选择一个要删除的角色')
        }else {
          this.modal2 = true
        }
      },
      delOk () {
        this.delLoading = true
        let formData = []
        for (let i = 0; i < this.tableData.length; i++) {
          formData.push(this.tableData[i].uuid)
        }
        util.axios({
            method: 'get',
            url: '/h2-console/csrf',
        }).then(res => {
            window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
            util.axios({
              method: 'delete',
              url: '/equipmentmodule/api/Link_deleteByMore',
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
        let vm = this
        vm.tableData = selection
      },
      search () {
        console.log(this.link_name)
        let vm = this
        let link_name = this.link_name
        vm.loading = true
           util.axios({
            method: 'get',
            url: '/equipmentmodule/api/getLinkByLike',
            params: {link_name},
            headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
        }).then(res => {
            console.log(res)
            if (res.data.error_code === 1) {
              this.$Message.success('链路搜索成功')
              vm.loading = false
              vm.data = res.data.data
              console.log(vm.data)
              this.setTableData()
            } else {
              this.$Message.error('链路搜索失败')
              this.getData()
            }
        }).catch(function (error) {
            console.log(error)
            vm.loading = false
        })
      },
      getRoleAuthority (data) {
        window.localStorage.data = JSON.stringify(data)
        console.log(window.localStorage.data)
        this.$router.push({name: 'rolePermissionList'})
      },
      linkgetId (vll_link_id) {
          this.$router.push(
              {
                  path: '/updatelink',
                  query: {vll_link_id: vll_link_id}
              }
          )
      },
      del (uuid) {
        let vm = this
        util.axios({
                method: 'get',
                url: '/h2-console/csrf',
            }).then(res => {
                window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
        util.axios({
          method: 'delete',
          url: '/equipmentmodule/api/Link_delete/' + uuid,
          headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
        }).then(res => {
          vm.loading = true
          this.getData()
          vm.loading = false
        }).catch(function (error) {
          vm.loading = false
        })
        });
        // this.$store.commit('logout', this);
        // // this.$store.commit('clearOpenedSubmenu');
        // this.$router.push({
        //     name: 'login'
        // });
      },
      selectChange (selection) {
        console.log(selection)
        this.tableData = selection
      },
      handleSelectAll (status) {
        this.$refs.selection.selectAll(status);
      },
      getData () {
        let vm = this
        vm.loading = true
        util.axios({
          method: 'get',
          url: 'equipmentmodule/api/Link_getAll',
        }).then(res => {
          console.log(res)
          if (res.data.error_code === 1) {
            vm.loading = false
            vm.data = res.data.data
            this.setTableData()
          } else if (res.data.error_code === 0) {
            vm.data = []
            vm.loading = false
            this.setTableData()
          }
        }).catch(function (error) {
          vm.loading = false
        });
      },
      setTableData () {
        console.log('方法执行')
        let vm = this
        let arr = []
        console.log(vm.data)
        let x = vm.data.length
        if (vm.data.length > vm.params.page * vm.params.limit) {
          x = this.params.page * this.params.limit
        }
        for (let i = (this.params.page - 1) * this.params.limit; i < x; i++) {
          arr.push(vm.data[i])
        }
        vm.dataresulet = arr
        console.log(vm.dataresulet)
      },
      pageChange (page) {  // 改变页数
        this.params.page = page
        this.setTableData()
      },
      PageSizeChange (limit) {  // 改变每页显示条数
        this.params.limit = limit
        this.setTableData()
      },
    },
    mounted () {
      this.getData()
    }
  }
</script>


