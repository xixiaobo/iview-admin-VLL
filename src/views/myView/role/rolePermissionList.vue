<template>
    <div>
        <Row style="text-align:center;margin-top:20px">
            <Col span="7" offset="8">
                <Input v-model.trim="searchInput" placeholder="请输入权限名称">
                </Input>
            </Col>
            <Col span="1">
                <Button long type="primary" @click="search" icon="ios-search"></Button>
            </Col>
            <Col span="8" style="text-align:right">
                <Button type="primary" icon="ios-compose-outline"
                        :disabled="thisRole.role_name === 'ROLE_ADMIN'"
                        @click="changePermission"
                        :loading="loadingChange">
                    更改权限
                </Button>
                <Modal v-model="modelChange" :width="600">
                    <p slot="header">
                        <span>更改权限</span>
                    </p>
                    <Tabs>
                        <TabPane label="接口权限" icon="network">
                            <div>
                                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
                                    <FormItem label="接口权限" prop="authorityids">
                                        <Transfer
                                                :titles="['权限列表','已选择的权限']"
                                                :data="transferData"
                                                :target-keys="formValidate.authorityids"
                                                @on-change="TransferChange"
                                        >
                                        </Transfer>
                                    </FormItem>
                                </Form>
                            </div>
                        </TabPane>
                    </Tabs>
                    <div slot="footer">
                        <Row>
                            <Col span="2">
                                <Button type="success" @click="RefreshPermissions" size="large">权限刷新</Button>
                            </Col>
                            <Button @click="closeModalChange" size="large">取消</Button>
                            <Button @click="submitModalChange" :loading="submitModalBtnLoading" type="primary"
                                    size="large">提交
                            </Button>
                        </Row>
                    </div>
                </Modal>
                <Button type="error" @click="delAllList()" icon="ios-trash-outline"
                        :disabled="thisRole.role_name === 'ROLE_ADMIN'">批量删除
                </Button>
                <!-- <Button type="error" @click="deleteAll()" icon="ios-trash-outline" :disabled="thisRole.role_name === 'ROLE_ADMIN'">全部删除</Button> -->
                <Modal v-model="modal2" width="360">
                    <p slot="header" style="color:#f60;text-align:center">
                        <Icon type="information-circled"></Icon>
                        <span>删除确认</span>
                    </p>
                    <div style="text-align:center">
                        <p>您确定要删除以下权限吗？</p>
                        <p v-for="item in AllSelect">{{item.authority_name}}</p>
                    </div>
                    <div slot="footer">
                        <Button type="error" size="large" :loading="delLoading" long @click="delOk">删除</Button>
                    </div>
                </Modal>
                <Modal v-model="modal3" width="360">
                    <p slot="header" style="color:#f60;text-align:center">
                        <Icon type="information-circled"></Icon>
                        <span>删除确认</span>
                    </p>
                    <div style="text-align:center">
                        <p>您确定要删除所有权限吗？</p>
                    </div>
                    <div slot="footer">
                        <Button type="error" size="large" :loading="delLoading1" long @click="deleteOk">删除</Button>
                    </div>
                </Modal>
            </Col>
        </Row>
        <Row style="margin-top:20px">
            <Tabs value='name1'>
                <TabPane label="接口权限" icon="network" name="name1">
                    <Card :padding='0'>
                        <Table border :loading="loading" @on-selection-change="selectChange" ref="selection"
                               :columns="columns" :data="dataresulet"></Table>
                        <Page placement="top" :total="data.length" show-sizer show-elevator @on-change="pageChange"
                              style="margin-top: 20px;margin-bottom: 20px;text-align:center"
                              @on-page-size-change="PageSizeChange" show-total></Page>
                    </Card>
                </TabPane>
            </Tabs>
        </Row>
    </div>
</template>
<script>
    import util from '@/libs/util.js'

    export default {
        name: 'rolePermissionList',
        data() {
            return {
                columns: [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: '权限名称',
                        key: 'authority_name'
                    },

                    {
                        title: '权限类型',
                        key: 'authority_type',
                        render: (h, params) => {
                            if (params.row.authority_type === '4') {
                                return h('div', [
                                    h('span', {
                                        style: {
                                            padding: '5px',
                                            borderRadius: '10px'
                                        }
                                    }, '接口权限')
                                ])
                            } else if (params.row.authority_type === '2') {
                                return h('div', [
                                    h('span', {
                                        style: {
                                            padding: '5px',
                                            borderRadius: '10px'
                                        }
                                    }, '视图权限')
                                ])
                            } else if (params.row.authority_type === '1') {
                                return h('div', [
                                    h('span', {
                                        style: {
                                            padding: '5px',
                                            borderRadius: '10px'
                                        }
                                    }, '产品权限')
                                ])
                            }
                        }
                    },
                    {
                        title: '接口状态',
                        key: 'authority_status',
                        align: 'center',
                        render: (h, params) => {
                            if (params.row.authority_status === 1) {
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
                                        content: '权限删除',
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
                                                this.dels(params.row)
                                            }
                                        }
                                    }, [
                                        h('Button', {
                                            props: {
                                                icon: 'ios-trash-outline',
                                                type: 'error',
                                                size: 'small',
                                                color: 'white',
                                                disabled: this.thisRole.role_name === 'ROLE_ADMIN'
                                            }
                                        })
                                    ])
                                ])
                            ])
                        }
                    }
                ],
                params: {
                    page: 1,
                    limit: 10
                },
                productparams: {
                    page: 1,
                    limit: 10
                },
                viewparams: {
                    page: 1,
                    limit: 10
                },
                dataresulet: [],
                productData: [],
                viewData: [],
                viewdata: [],
                data: [],
                delLoading: false,
                loading: false,
                searchInput: '',
                thisRole: {},
                permissionList: [],
                permissionProductList: [],
                permissionViewList: [],
                loadingChange: false,
                modelChange: false,
                transferData: [],
                transferData1: [],
                transferData2: [],
                AllProduct: [],
                AllView: [],
                userId: '',
                formData: [],
                authorityId: '',
                modal2: false,
                modal3: false,
                delLoading1: false,
                selectDatas: [],
                ALLtype: [],
                prodata: [],
                splitType: '',
                selectProDatas: [],
                selectVieDatas: [],
                changedata: [],
                changedata1: [],
                changedata2: [],
                AllSelect: [],
                dataSource: [],
                dataSource1: [],
                dataSource2: [],
                formValidate: {
                    authorityids: []
                },
                formValidate1: {
                    AllProduct: []
                },
                formValidate2: {
                    AllView: []
                },
                ruleValidate: {
                    authorityids: [
                        {required: true, type: 'array', min: 1, message: '最少选择一个权限', trigger: 'change'}
                    ]
                },
                ruleValidate1: {
                    AllProduct: [
                        {required: true, type: 'array', min: 1, message: '最少选择一个产品', trigger: 'change'}
                    ]
                },
                ruleValidate2: {
                    AllView: [
                        {required: true, type: 'array', min: 1, message: '最少选择一个视图', trigger: 'change'}
                    ]
                },
                submitModalBtnLoading: false
            }
        },
        methods: {
            RefreshPermissions() {
                util.axios({
                    method: 'get',
                    url: '/equipmentmodule/api/updateUrlMapping',
                }).then(res => {
                    this.changePermission()
                    this.getData()
                }).catch(function (error) {
                    this.$Notice.success({
                        title: '视图权限删除失败'
                    });
                    vm.submitModalBtnLoading = false
                    vm.modelChange = false
                });
            },
            deleteAll() {
                this.modal3 = true
            },
            deleteOk() {
                let vm = this
                this.delLoading1 = true
                let roleid = vm.thisRole.uuid
                util.axios({
                    method: 'get',
                    url: '/h2-console/csrf',
                }).then(res => {
                    window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                    util.axios({
                        method: 'delete',
                        url: '/jhipsteruaa/api/role_authority_deleteByAll',
                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                        data: roleid
                    }).then(ress => {
                        if (ress.data.error_code === 1) {
                            this.$Message.success('删除全部权限成功!')
                            this.delLoading1 = false
                            this.modal3 = false
                            vm.$router.push('/roleList/index')
                        } else {
                            this.$Message.error('删除全部权限失败!')
                            this.delLoading1 = false
                            this.modal3 = false
                            this.getData()
                        }
                    }).catch(function (error) {
                        this.$Message.error('删除全部权限失败')
                        this.delLoading1 = false
                        this.modal3 = false
                        this.loading = false
                    });
                })
            },
            delAllList() {
                let vm = this
                if (vm.selectDatas.length === 0 && vm.selectProDatas.length === 0 && vm.selectVieDatas.length === 0) {
                    vm.$Message.error('请至少选择一个要删除的数据')
                } else {
                    this.modal2 = true
                }
            },
            delOk() {
                let vm = this
                this.delLoading = true
                let formData = {}
                let formData1 = {}
                let formData2 = {}
                let dataId = []
                let dataId1 = []
                let dataId2 = []
                for (let i = 0; i < this.selectDatas.length; i++) {
                    dataId.push(this.selectDatas[i].uuid)
                }
                for (let i = 0; i < this.selectProDatas.length; i++) {
                    dataId1.push(this.selectProDatas[i].uuid)
                }
                for (let i = 0; i < this.selectVieDatas.length; i++) {
                    dataId2.push(this.selectVieDatas[i].uuid)
                }
                formData.authorityids = dataId
                formData.roleid = vm.thisRole.uuid
                formData1.authorityids = dataId1
                formData1.roleid = vm.thisRole.uuid
                formData2.authorityids = dataId2
                formData2.roleid = vm.thisRole.uuid
                util.axios({
                    method: 'get',
                    url: '/h2-console/csrf',
                }).then(res => {
                    window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                    util.axios({
                        method: 'delete',
                        url: '/jhipsteruaa/api/role_authority_deleteByMore',
                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                        data: formData
                    }).then(ress => {
                        if (ress.data.error_code === 1) {
                            this.$Notice.success({
                                title: '接口权限删除成功'
                            });
                            this.delLoading = false
                            this.modal2 = false
                            this.loading = false
                            this.getData()
                        }
                    }).catch(function (error) {
                        this.$Notice.error({
                            title: '接口权限删除失败'
                        });
                        this.delLoading = false
                        this.modal2 = false
                        this.loading = false
                        this.getData()
                    });
                })
            },
            selectChange(selection) {
                let vm = this
                this.selectDatas = selection
            },
            dels(data) {
                let vm = this
                let formData = {}
                formData.authorityid = data.uuid
                formData.roleid = vm.thisRole.uuid
                util.axios({
                    method: 'get',
                    url: '/h2-console/csrf',
                }).then(res => {
                    window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                    util.axios({
                        method: 'delete',
                        url: '/jhipsteruaa/api/role_authority_delete',
                        data: formData,
                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                    }).then(res => {
                        vm.loading = true
                        if (res.data.error_code === 1) {
                            if (data.authority_type === '4') {
                                this.getData()
                                this.$Notice.success({
                                    title: '接口权限删除成功'
                                });
                            }
                            vm.loading = false
                        } else {
                            if (data.authority_type === '4') {
                                this.getData()
                                this.$Notice.error({
                                    title: '接口权限删除失败'
                                });
                            }
                            vm.loading = false
                        }
                    }).catch(function (error) {
                        vm.loading = false
                    })
                });
            },
            TransferChange(newTargetKeys, direction, moveKeys) {
                this.formValidate.authorityids = newTargetKeys;
            },
            submitModalChange() {
                let vm = this
                let formData = {}
                formData.roleid = vm.thisRole.uuid
                formData.authorityids = vm.formValidate.authorityids
                formData.authoritytype = '4'
                let formData1 = {}
                formData1.roleid = vm.thisRole.uuid
                formData1.authorityids = vm.formValidate1.AllProduct
                formData1.authoritytype = '1'
                let formData2 = {}
                formData2.roleid = vm.thisRole.uuid
                formData2.authorityids = vm.formValidate2.AllView
                formData2.authoritytype = '2'
                util.axios({
                    method: 'get',
                    url: '/h2-console/csrf',
                }).then(res => {
                    window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                    util.axios({
                        method: 'post',
                        url: '/jhipsteruaa/api/role_authority',
                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                        data: formData
                    }).then(res => {
                        console.log(vm.formValidate.authorityids)
                        console.log(vm.changedata)
                        if (JSON.stringify(vm.formValidate.authorityids) !== JSON.stringify(vm.changedata)) {
                            this.$Notice.success({
                                title: '接口权限添加成功'
                            });
                        }
                        vm.submitModalBtnLoading = false
                        vm.modelChange = false
                        this.getData()
                    }).catch(function (error) {
                        this.$Notice.success({
                            title: '接口权限添加失败'
                        });
                        vm.submitModalBtnLoading = false
                        vm.modelChange = false
                    });
                }).catch(function (error) {
                    vm.$Message.error('请求失败，请查看您的网络或联系管理员')
                    vm.submitModalBtnLoading = false
                    vm.modelChange = false
                    this.getData()
                })
            },
            closeModalChange() {
                this.modelChange = false
            },
            changePermission() {
                let vm = this
                vm.modelChange = true
                vm.loadingChange = true
                util.axios({
                    method: 'get',
                    url: 'jhipsteruaa/api/getAllInterfaceAuthority',
                }).then(res => {
                    vm.loadingChange = false
                    if (res.data.error_code === 1) {
                        vm.permissionList = res.data.data
                        let arr = []
                        let arr2 = []
                        for (let i = 0; i < vm.permissionList.length; i++) {
                            arr.push({
                                key: vm.permissionList[i].uuid,
                                label: vm.permissionList[i].authority_name
                            })
                        }
                        vm.transferData = arr
                        for (let j = 0; j < vm.data.length; j++) {
                            arr2.push(vm.data[j].uuid)
                        }
                        vm.formValidate.authorityids = arr2
                        vm.changedata = arr2
                    }
                }).catch(function (error) {
                    vm.loadingChange = false
                });
            },

            search() {
                if (this.searchInput !== '') {
                    this.loading = true
                    setTimeout(() => {
                        this.loading = false
                        // this.dataTable = this.dataSource.filter(item => item.product_name.toLowerCase().indexOf(this.searchInput.toLowerCase()) > -1)
                        /**
                         * filter()方法创建一个新的匹配过滤条件的数组
                         * toLowerCase() 方法用于把字符串转换为小写
                         * indexOf()方法返回在该数组中第一个找到的元素位置，如果它不存在则返回-1
                         */
                        this.data = this.dataSource.filter(item => {
                            let flag = false
                            flag = (item.authority_name.toLowerCase().indexOf(this.searchInput.toLowerCase()) > -1)
                            return flag
                        })
                        this.setTableData()
                    }, 200);
                } else {
                    this.data = this.dataSource
                    this.setTableData()

                }
            },
            del(uuid) {
                let vm = this
                util.axios({
                    method: 'get',
                    url: '/h2-console/csrf',
                }).then(res => {
                    window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                    util.axios({
                        method: 'delete',
                        url: '/jhipsteruaa/api/role_delete/' + uuid,
                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                    }).then(res => {
                        vm.loading = true
                        this.getData()
                        vm.loading = false
                    }).catch(function (error) {
                        vm.loading = false
                    })
                });
            },
            getData() {
                console.log('获取接口')
                let vm = this
                vm.data = []
                let arr2 = []
                vm.loading = true
                vm.thisRole = JSON.parse(window.localStorage.data)
                util.axios({
                    method: 'get',
                    url: '/jhipsteruaa/api/getRoleAuthorityByInterface/' + vm.thisRole.uuid,
                }).then(res => {
                    vm.loading = false
                    if (res.data.error_code === 1) {
                        vm.dataSource = res.data.data
                        vm.data = res.data.data
                        for (let i = 0; i < res.data.data.length; i++) {
                            vm.ALLtype = res.data.data[i].authority_type
                        }
                        vm.setTableData()
                    } else if (res.data.error_code === 0) {
                        vm.data = []
                        vm.setTableData()
                    }
                }).catch(function (error) {
                    vm.loading = false
                });
            },
            setTableData() {
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
            pageChange(page) {  // 改变页数
                this.params.page = page
                this.setTableData()
            },
            PageSizeChange(limit) {  // 改变每页显示条数
                this.params.limit = limit
                this.setTableData()
            },
        },
        watch: {
            '$route'() {
                this.getData();
            }
        },
        created() {
            this.getData()
        }
    }
</script>


