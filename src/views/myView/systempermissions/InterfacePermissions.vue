<template>
    <div>
        <Row style="text-align:center;margin-top:20px">
            <Col span="7" offset="8">
                <Input v-model.trim="authority_name" placeholder="请输入接口名称">
                </Input>
            </Col>
            <Col span="1">
                <Button long type="primary" @click="search" icon="ios-search"></Button>
            </Col>
            <Col span="8" style="text-align:right">
                <Button type="primary" @click="rush()" icon="ios-trash-outline">接口刷新</Button>
            </Col>
        </Row>
        <Row style="margin-top:20px">
            <Card :padding='0'>
                <Table border :loading="loading" ref="selection" :columns="columns" :data="dataresulet"></Table>
                <Page placement="top" :total="data.length" show-sizer show-elevator @on-change="pageChange"
                      style="margin-top: 20px;text-align:center;margin-bottom: 20px;text-align:center"
                      @on-page-size-change="PageSizeChange" show-total></Page>
            </Card>
        </Row>
    </div>
</template>
<script>
    import util from '@/libs/util.js'

    export default {
        name: 'roleList',
        data() {
            return {
                tableData: [],
                columns: [
                    {
                        title: '接口名称',
                        key: 'authority_name'
                    },
                    {
                        title: '接口类型',
                        key: 'authority_type',
                        align: 'center',
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
                            }
                        }
                    },
                    {
                        title: '所属接口',
                        key: 'foreign_uuid'
                    },
                    {
                        title: '接口地址',
                        key: 'authority_url'
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
                    }
                ],
                authority_name: '',
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
                delLoading: false,
                authority_name: '',
                type: ''
            }
        },
        methods: {
            search() {
                let vm = this
                let authority_name = this.authority_name
                let authority_type = vm.type
                vm.loading = true
                util.axios({
                    method: 'get',
                    url: '/jhipsteruaa/api/getAllAuthorityByLike',
                    params: {authority_name, authority_type},
                    headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                }).then(res => {
                    if (res.data.error_code === 1) {
                        this.$Message.success('角色权限搜索成功')
                        vm.loading = false
                        vm.data = res.data.data
                        this.setTableData()
                    } else {
                        this.$Message.error('没有该接口权限')
                        vm.data = []
                        this.setTableData()
                        vm.loading = false
                    }
                }).catch(function (error) {
                    vm.loading = false
                })
            },
            getData() {
                let vm = this
                vm.loading = true
                util.axios({
                    method: 'get',
                    url: '/jhipsteruaa/api/getAllAuthorityByAuthority_type?authority_type=4',
                }).then(res => {
                    if (res.data.error_code === 1) {
                        for (let i = 0; i < res.data.data.length; i++) {
                            vm.type = res.data.data[i].authority_type
                        }
                        vm.data = res.data.data
                        vm.setTableData()
                    }
                    vm.loading = false
                }).catch(function (error) {
                    vm.loading = false
                });
            },
            setTableData () {
                console.log('分页方法执行')
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
                console.log(vm.dataresulet)
            },
            pageChange(page) {  // 改变页数
                this.params.page = page
                this.setTableData()
            },
            PageSizeChange(limit) {  // 改变每页显示条数
                this.params.limit = limit
                this.setTableData()
            },
            rush(){
                util.axios({
                    method: 'get',
                    url: '/equipmentmodule/api/updateUrlMapping',
                }).then(res => {
                    this.getData()
                }).catch(function (error) {

                });
            }
        },
        created() {
            this.getData()
        }
    }
</script>


