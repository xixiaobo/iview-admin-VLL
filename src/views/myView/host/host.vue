<template>
    <div>
        <Row style="text-align:center;margin-top:20px">
            <Form ref="formValidate" :model="formValidate">
                <Col span="7" offset="8">
                <FormItem>
                    <Input v-model.trim="formValidate.device_name" placeholder="请输入主机"></Input>
                </FormItem>
                </Col>
                <Col span="1">
                <FormItem>
                    <Button long type="primary" @click="search" icon="ios-search"></Button>
                </FormItem>
                </Col>
            </Form>
            <Col span="8" style="text-align:right">
            <router-link :to="{ name:'hostAdd'}">
                <Button type="primary" icon="ios-plus-empty">主机添加</Button>
            </router-link>
            </Col>
        </Row>
        <Row style="margin-top:20px" v-if="data.length>0">
            <Card :bordered="false" class="device_crde" v-for="site in dataresulet">
                <p slot="title" @click="getOnly(site.ce_id)" style="cursor: pointer">
                    服务器名称：{{site.ce_name}}
                    <Icon v-if="site.os==='Linux'" type="social-tux" style="float: right" size="20"></Icon>
                    <Icon v-else type="social-windows"  style="float: right"></Icon>
                </p>
                <p>系统版本： {{site.os_type}}</p>
                <p>CPU核数： {{site.cpu_total}} 个</p>
                <p>内存： {{Math.round(site.mem_total/1024)}} G</p>
                <p>IP地址： {{site.ce_ip}}</p>
            </Card>
        </Row>
        <Row style="text-align: center " v-if="data.length>0">
            <!--<Page :total="100" show-sizer  on-change="change"></Page>-->
            <Page placement="top" :total="data.length" show-sizer show-elevator @on-change="pageChange"
                  @on-page-size-change="PageSizeChange" show-total></Page>
        </Row>
        <Row style="margin-top:20px" v-if="data.length===0">
            <Card :bordered="false">
                暂无主机设备请添加
            </Card>
        </Row>

    </div>
</template>

<script>
    import util from '@/libs/util.js'

    export default {
        name: "device",
        data() {
            return {
                name: "",
                formValidate: {
                    device_name: ''
                }, params: {
                    page: 1,
                    limit: 10
                },
                dataresulet: [],
                data: [],

            }
        },
        methods: {
            getOnly(ce_id) {
                this.$router.push(
                    {
                        path: '/updatehost',
                        query: {ce_id: ce_id}
                    }
                )


            },
            getData() {
                let vm = this
                util.axios({
                    method: 'get',
                    url: 'equipmentmodule/api/Device_getAll',
                }).then(res => {
                    console.log(res)
                    if (res.data.error_code === 1) {
                        vm.data = res.data.data
                        this.setTableData()
                    } else if (res.data.error_code === 0) {
                        vm.data = []
                        this.setTableData()
                    }
                }).catch(function (error) {
                });
            },
            setTableData() {
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
            search() {
                console.log(this.device_name)
                let vm = this
                let device_name = this.formValidate.device_name
                util.axios({
                    method: 'get',
                    url: '/equipmentmodule/api/getDeviceByLike',
                    params: {device_name},
                    headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                }).then(res => {
                    console.log(res)
                    if (res.data.error_code === 1) {
                        this.$Message.success('主机搜索成功')
                        vm.data = res.data.data
                        console.log(vm.data)
                        this.setTableData()
                    } else {
                        this.$Message.error('主机搜索失败')
                        this.getData()
                    }
                }).catch(function (error) {
                    console.log(error)
                })
            },
            pageChange(page) {  // 改变页数
                this.params.page = page
                this.setTableData()
            },
            PageSizeChange(limit) {  // 改变每页显示条数
                this.params.limit = limit
                this.setTableData()
            },
        }
        ,
        mounted() {
            this.getData();
        }
    }
</script>


<style lang="less">
    @import "host.less";
</style>