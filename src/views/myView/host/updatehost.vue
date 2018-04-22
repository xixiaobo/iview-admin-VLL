<template>
    <Row style="margin-top:20px" :gutter="16">
        <Col span="10">
            <Card>
                <table class="layui-table">
                    <colgroup>
                        <col width="120">
                        <col >
                    </colgroup>
                    <thead>
                        <tr>
                            <th colspan="2">
                                基本信息
                                <Dropdown  trigger="click"  @on-click='test' style="margin-left: 20px;float: right">
                                    <Button type="primary" size="small">
                                        更多
                                        <Icon type="arrow-down-b"></Icon>
                                    </Button>
                                    <DropdownMenu slot="list">
                                        <DropdownItem  name='updatepwd'  >修改远程密码</DropdownItem>
                                        <DropdownItem  name='refresh'  >刷新主机配置信息</DropdownItem>
                                        <DropdownItem  name='deletehost'>删除主机</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                ID：
                            </td>
                            <td>{{device.ce_id}}</td>
                        </tr>
                        <tr>
                            <td>
                                名称：
                            </td>
                            <td>
                                {{device.ce_name}}
                                <Button icon="compose" @click="modal = true" size="small"  style="float: right; "></Button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                CPU：
                            </td>
                            <td>{{device.cpu_total}}个</td>
                        </tr>
                        <tr>
                            <td>
                                内存：
                            </td>
                            <td>{{Math.round(device.mem_total/1024)}} G</td>
                        </tr>
                        <tr>
                            <td>
                                操作系统：
                            </td>
                            <td>{{device.os}}</td>
                        </tr>
                        <tr>
                            <td>
                                操作系统类型版本：
                            </td>
                            <td>{{device.os_type}}</td>
                        </tr>
                        <tr>
                            <td>
                                公网IP：
                            </td>
                            <td>{{device.ce_ip}}</td>
                        </tr>
                        <tr>
                            <td>
                                私有IP：
                            </td>
                            <td>{{device.ipv4}}</td>
                        </tr>
                        <tr>
                            <td>
                                系统内核型号;
                            </td>
                            <td>{{device.os_kernel}}</td>
                        </tr>
                        <tr>
                            <td>
                                虚拟内容容量;
                            </td>
                            <td>{{device.swap_total}}</td>
                        </tr>
                        <tr>
                            <td>
                                服务器型号;
                            </td>
                            <td>{{device.server_type}}</td>
                        </tr>
                        <tr>
                            <td>
                                硬盘总容量;
                            </td>
                            <td>{{device.disk_total}}</td>
                        </tr>
                        <tr>
                            <td>
                                服务器主机名;
                            </td>
                            <td>{{device.host_name}}</td>
                        </tr>
                        <tr>
                            <td>
                                CPU型号;
                            </td>
                            <td>{{device.cpu_type}}</td>
                        </tr>
                    </tbody>
                </table>
                <Modal
                        v-model="modal"
                        title="修改主机别名"
                        :loading="loading"
                        @on-ok="asyncOK">
                    <Form ref="updatename" :model="updatename" :rules="ruleValidate1" :label-width="80">
                        <FormItem label="主机名" prop="name">
                            <Input v-model="updatename.name"></Input>
                        </FormItem>
                    </Form>
                </Modal>
                <Modal
                        v-model="modal2"
                        title="修改密码"
                        :loading="loading"
                        @on-ok="updatepasswoedOK">
                    <Form ref="updatepassword" :model="updatepassword" :rules="ruleValidate2" :label-width="80">
                    <FormItem label="密码" prop="ssh_password">
                        <Input tySpe="password" v-model="updatepassword.ssh_password"></Input>
                    </FormItem>
                    </Form>
                </Modal>
                <Modal
                        v-model="modal3"
                        title="提示"
                        :loading="loading"
                        @on-ok="deleteOK">
                    <p>是否确定删除主机，删除后数据无法恢复请注意.</p>
                </Modal>
            </Card>
        </Col>
        <Col span="13">
            <Card style="height:60px">
                <Button type="primary" shape="circle" icon="loop" v-on:click="getPerformanceData()" style="float: right;margin: 0 0 10px 20px"></Button>
                <DatePicker type="datetimerange" format="yyyy-MM-dd HH:mm:SS"
                        placeholder="选择查询时间" v-model="selectdate" placement="left-start" @on-ok="changeDate()" :options="options" style="width: 280px;float: right"></DatePicker>
            </Card>
            <Card>
                <div id="cpu" style="width:550px;height: 300px"></div>
            </Card>

            <Card>
                <div id="memory" style="width:550px;height: 300px"></div>
            </Card>
            <Card>
                <div id="network" style="width:550px;height: 300px"></div>
            </Card>
        </Col>
    </Row>
</template>

<script>
    import util from '@/libs/util.js';
    import {formatDate} from "../../../libs/date";

    let echarts = require('echarts/lib/echarts')
    // 引入柱状图组件
    require('echarts/lib/chart/line')
    // 引入提示框和title组件
    require('echarts/lib/component/tooltip')
    require('echarts/lib/component/title')
    require("echarts/lib/component/legendScroll")
    require("echarts/lib/component/dataZoom")
    require('echarts/lib/component/toolbox')
    export default {
        name: "updatehost",
        data() {
            return {
                device: {
                    ce_name: '',
                    ce_ip: '',
                    ce_port: '',
                    ssh_username: '',
                    ssh_password: '',
                    os: '???',
                    os_kernel: '',
                    cpu_total: '',
                    disk_mount: '',
                    swap_total: '',
                    server_type: '',
                    disk_total: '',
                    mem_total: '',
                    os_type: '',
                    ipv4: '',
                    host_name: '',
                    cpu_type: ''
                },
                ce_id:'',
                echartsdate:[],
                cpu_user:[],
                cpu_nice:[],
                cpu_system:[],
                cpu_steal:[],
                cpu_idle:[],
                rxbyt:[],
                txbyt:[],
                kbmemfree:[],
                kbmemused:[],
                memused:[],
                selectdate:'',
                options: {
                    disabledDate(date) {
                        var maxdate=new Date()
                        maxdate.setDate(maxdate.getDate()-15)
                        return date>new Date()||date<maxdate;
                    }
                },
                modal: false,
                modal2: false,
                modal3: false,
                loading: true,
                updatename:{
                    name:''
                },
                updatepassword:{
                    ssh_password:''
                },
                ruleValidate1:{
                        name: [
                            {required: true, message: '主机名不能为空', trigger: 'blur'}
                        ]
                },
                ruleValidate2:{
                    ssh_password:[
                        {required: true, message: '密码不能为空', trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            asyncOK () {
                let vm = this
                vm.$refs['updatename'].validate((valid) => {
                    if (valid) {
                        var name=this.updatename.name
                        util.axios({
                            method: 'get',
                            url: '/h2-console/csrf',
                        }).then(res => {
                            console.log(res)
                            window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                            util.axios({
                                method: 'put',
                                url: '/equipmentmodule/api/Device_putCEName', // 放方法
                                data: {ce_id: this.ce_id, ce_name: name},
                                headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                            }).then(ress => {
                                if (ress.data.error_code === 1) {
                                    this.moda3 = false;
                                    vm.$Message.success('主机别名修改成功!')
                                    this.$refs['updatename'].resetFields();
                                    this.modal = false;
                                    this.updatename.name=''
                                    this.getData(this.ce_id)
                                } else {
                                    this.updatename.name=''
                                    this.$refs['updatename'].resetFields();
                                    this.modal = false;
                                    vm.$Message.error(ress.data.msg)
                                }
                            })
                        })

                    }else{
                        // vm.loading=true
                        setTimeout(function () {
                            vm.loading = false
                            vm.$nextTick(() => {vm.loading = true;});
                        }, 1000)
                    }
                })
            },
            updatepasswoedOK () {
                let vm = this
                vm.$refs['updatepassword'].validate((valid) => {
                        if (valid) {
                            var password=this.updatepassword.ssh_password
                            util.axios({
                                method: 'get',
                                url: '/h2-console/csrf',
                            }).then(res => {
                                console.log(res)
                                window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                                util.axios({
                                    method: 'put',
                                    url: '/equipmentmodule/api/Device_putSSHPass', // 放方法
                                    data: {ce_id: this.ce_id, ssh_password: password},
                                    headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                                }).then(ress => {
                                    if (ress.data.error_code === 1) {
                                        this.moda3 = false;
                                        vm.$Message.success('密码修改成功!')
                                        this.$refs['updatepassword'].resetFields();
                                        this.modal2 = false;
                                        this.updatepassword.ssh_password=''
                                        this.getData(this.ce_id)
                                    } else {
                                        this.updatepassword.ssh_password=''
                                        this.$refs['updatepassword'].resetFields();
                                        this.modal2 = false;
                                        vm.$Message.error(ress.data.msg)
                                    }
                                })
                            })
                        }else{
                            // vm.loading=true
                            setTimeout(function () {
                                vm.loading = false
                                vm.$nextTick(() => {vm.loading = true;});
                            }, 1000)
                        }
                })
            },
            deleteOK() {
                util.axios({
                    method: 'get',
                    url: '/h2-console/csrf',
                }).then(res => {
                        console.log(res)
                        window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                        util.axios({
                            method: 'delete',
                            url: '/equipmentmodule/api/Device_delete/'+this.ce_id, // 放方法
                            headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                        }).then(ress => {
                            if(ress.data.error_code===1){
                                this.modal3 = false;
                                this.$Message.success('删除成功!')
                                this.$store.commit('clearThisTags', this);
                                this.$router.push('/hostList/index') //跳转页面
                            }else{
                                this.modal3 = false;
                                this.$Message.error(ress.data.msg)
                            }
                        })
                })
            },
            test(name){
                if(name==='updatepwd'){
                    this.modal2 = true
                }else if(name==='deletehost'){
                    this.modal3 = true
                }else if(name==='refresh'){
                    this.refresh()
                }
            },
            changeDate() {
                var beginTime=formatDate(this.selectdate[0],"yyyy-MM-dd hh:mm:ss")
                var endTime=formatDate(this.selectdate[1],"yyyy-MM-dd hh:mm:ss")
                this.getPerformanceDataByTime(beginTime,endTime)
            },
            refresh(){
                let vm = this
                util.axios({
                    method: 'get',
                    url: '/h2-console/csrf',
                }).then(res => {
                    window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                    util.axios({
                        method: 'get',
                        url: '/equipmentmodule/api/refreshDeviceByID',
                        params:{device_id:vm.ce_id},
                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN}
                    }).then(ress => {
                        if(ress.data.error_code===1){
                            vm.$Message.success('刷新成功!')
                            vm.getData(vm.ce_id)
                        }else{
                            vm.$Message.error(ress.data.msg)
                        }
                    }).catch(function (error) {
                        vm.$Message.error('信息查询失败')
                        vm.loading = false
                    });
                })
            },
            getData(ce_id) {
                let vm = this
                util.axios({
                    method: 'get',
                    url: '/h2-console/csrf',
                }).then(res => {
                    window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                    util.axios({
                        method: 'get',
                        url: '/equipmentmodule/api/Device_get/' + ce_id,
                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN}
                    }).then(ress => {
                        console.log(ress.data)
                        vm.device = ress.data.data
                        vm.ce_id=ress.data.data.ce_id
                        vm.getPerformanceData()
                        // this.formValidate.status = JSON.stringify(ress.data.status)
                    }).catch(function (error) {
                        vm.$Message.error('信息查询失败')
                        vm.loading = false
                    });
                })
            },
            getPerformanceData() {
                let vm = this
                util.axios({
                    method: 'get',
                    url: '/h2-console/csrf',
                }).then(res => {
                        window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                    util.axios({
                        method: 'post',
                        url: '/equipmentmodule/api/Performance_get',
                        data: {"ce_id":this.ce_id},
                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN}
                    }).then(ress => {
                        console.log(ress.data)
                         var arr=ress.data.data
                        this.cpu_user=[]
                        this.cpu_system=[]
                        this.cpu_idle=[]
                        this.rxbyt=[]
                        this.txbyt=[]
                        this.kbmemfree=[]
                        this.kbmemused=[]
                        this.memused=[]
                        this.echartsdate=[]
                        for(var i = 0,len = arr.length; i < len; i++){
                            this.cpu_user.push(arr[i]['cpu_user'])
                            this.cpu_system.push(arr[i]['cpu_system'])
                            this.cpu_idle.push(arr[i]['cpu_idle'])
                            this.rxbyt.push(arr[i]['rxbyt'])
                            this.txbyt.push(arr[i]['txbyt'])
                            this.kbmemfree.push(arr[i]['kbmemfree'])
                            this.kbmemused.push(arr[i]['kbmemused'])
                            this.memused.push(arr[i]['memused'])
                            this.echartsdate.push(arr[i]['test_time'])
                        }
                        if(arr=null){
                            var $li="";
                            $li = "<div><span class='b threefont' style='letter-spacing:-2px;position: absolute;margin-left: 40%;top: 40%;color:#ddd'>暂无数据</span></div>";
                            $('#cpu').append($li);
                            $('#memory').append($li);
                            $('#network').append($li);
                        }else{
                            this.drawLine()
                        }
                        // this.formValidate.status = JSON.stringify(ress.data.status)
                    }).catch(function (error) {
                        vm.$Message.error('主机性能信息查询失败')
                        vm.loading = false
                    });

                })
            },
            getPerformanceDataByTime(beginTime,endTime) {
                let vm = this
                util.axios({
                    method: 'get',
                    url: '/h2-console/csrf',
                }).then(res => {
                    window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                    util.axios({
                        method: 'post',
                        url: '/equipmentmodule/api/Performance_get',
                        data: {"ce_id":this.ce_id,"beginTime":beginTime,"endTime":endTime},
                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN}
                    }).then(ress => {
                        console.log(ress.data)
                        var arr=ress.data.data
                        this.cpu_user=[]
                        this.cpu_system=[]
                        this.cpu_idle=[]
                        this.rxbyt=[]
                        this.txbyt=[]
                        this.kbmemfree=[]
                        this.kbmemused=[]
                        this.memused=[]
                        this.echartsdate=[]
                        for(var i = 0,len = arr.length; i < len; i++){
                            this.cpu_user.push(arr[i]['cpu_user'])
                            this.cpu_system.push(arr[i]['cpu_system'])
                            this.cpu_idle.push(arr[i]['cpu_idle'])
                            this.rxbyt.push(arr[i]['rxbyt'])
                            this.txbyt.push(arr[i]['txbyt'])
                            this.kbmemfree.push(arr[i]['kbmemfree'])
                            this.kbmemused.push(arr[i]['kbmemused'])
                            this.memused.push(arr[i]['memused'])
                            this.echartsdate.push(arr[i]['test_time'])
                        }
                        this.drawLine()
                        // this.formValidate.status = JSON.stringify(ress.data.status)
                    }).catch(function (error) {
                        vm.$Message.error('主机性能信息查询失败')
                        vm.loading = false
                    });

                })
            },
            drawLine() {
                // 基于准备好的dom，初始化echarts实例
                // console.log("46454")
                let cpu = echarts.init(document.getElementById('cpu'))
                // 绘制图表
                cpu.setOption(
                    {
                        title: {
                            text: 'CPU使用率'
                        },
                        tooltip: {
                            trigger: 'axis',
                            position: function (pt) {
                                return [pt[0], '10%'];
                            },
                            formatter:function(params)
                            {
                                var relVal = params[0].name;
                                for (var i = 0, l = params.length; i < l; i++) {
                                    relVal += '<br/>' + params[i].seriesName + ' : ' + params[i].value+"%";
                                }
                                return relVal;
                            }
                        },
                        legend: {
                            data:['用户cpu使用率','系统cpu使用率'],

                        },
                        toolbox: {
                            feature: {
                                dataZoom: {
                                    yAxisIndex: 'none'
                                },
                                restore: {},
                                saveAsImage: {}
                            }
                        },
                        xAxis: {
                            type: 'category',
                            name:'日期',
                            boundaryGap: false,
                            data: this.echartsdate
                        },
                        yAxis: {
                            type: 'value',
                            name: '百分比',
                            boundaryGap: ['20%', '20%']
                        },
                        dataZoom: [
                            {
                            type: 'inside',
                            start: 90,
                            end: 100
                        },
                            {
                            start: 0,
                            end: 10,
                            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                            handleSize: '80%',
                            handleStyle: {
                                color: '#fff',
                                shadowBlur: 3,
                                shadowColor: 'rgba(0, 0, 0, 0.6)',
                                shadowOffsetX: 2,
                                shadowOffsetY: 2
                            }
                        }
                        ],
                        series: [
                            {
                                name:'用户cpu使用率',
                                type:'line',
                                data:this.cpu_user
                            },
                            {
                                name:'系统cpu使用率',
                                type:'line',
                                data:this.cpu_system
                            }
                        ]
                    }
                );

                let memory = echarts.init(document.getElementById('memory'))
                // 绘制图表
                memory.setOption(
                    {
                        title: {
                            text: '内存使用率'
                        },
                        tooltip: {
                            trigger: 'axis',
                            position: function (pt) {
                                return [pt[0], '10%'];
                            },
                            formatter:function(params)
                            {
                                var relVal = params[0].name;
                                for (var i = 0, l = params.length; i < l; i++) {
                                    relVal += '<br/>' + params[i].seriesName + ' : ' + params[i].value+"%";
                                }
                                return relVal;
                            }
                        },
                        legend: {
                            data:['已使用内存的百分数'],

                        },
                        toolbox: {
                            feature: {
                                dataZoom: {
                                    yAxisIndex: 'none'
                                },
                                restore: {},
                                saveAsImage: {}
                            }
                        },
                        xAxis: {
                            type: 'category',
                            name:'日期',
                            boundaryGap: false,
                            data: this.echartsdate
                        },
                        yAxis: {
                            type: 'value',
                            name: '百分比',
                            boundaryGap: ['20%', '20%']
                        },
                        dataZoom: [
                            {
                                type: 'inside',
                                start: 90,
                                end: 100
                            },
                            {
                                start: 0,
                                end: 10,
                                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                                handleSize: '80%',
                                handleStyle: {
                                    color: '#fff',
                                    shadowBlur: 3,
                                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                                    shadowOffsetX: 2,
                                    shadowOffsetY: 2
                                }
                            }
                        ],
                        series: [
                            {
                                name:'已使用内存',
                                type:'line',
                                data:this.memused
                            }
                        ]
                    }
                );

                let network = echarts.init(document.getElementById('network'))
                // 绘制图表
                network.setOption(
                    {
                        title: {
                            text: '网络吞吐量'
                        },
                        tooltip: {
                            trigger: 'axis',
                            position: function (pt) {
                                return [pt[0], '10%'];
                            },
                            formatter:function(params)
                            {
                                var relVal = params[0].name;
                                for (var i = 0, l = params.length; i < l; i++) {
                                    relVal += '<br/>' + params[i].seriesName + ' : ' + params[i].value+"byte/s";
                                }
                                return relVal;
                            }
                        },
                        legend: {
                            data:['每秒接收的字节','每秒传输的字节'],

                        },
                        toolbox: {
                            feature: {
                                dataZoom: {
                                    yAxisIndex: 'none'
                                },
                                restore: {},
                                saveAsImage: {},
                            }
                        },
                        xAxis: {
                            type: 'category',
                            name:'日期',
                            boundaryGap: false,
                            data: this.echartsdate
                        },
                        yAxis: {
                            type: 'value',
                            name: '字节每秒',
                            boundaryGap: ['20%', '20%']
                        },
                        dataZoom: [
                            {
                                type: 'inside',
                                start: 90,
                                end: 100
                            },
                            {
                                start: 0,
                                end: 10,
                                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                                handleSize: '80%',
                                handleStyle: {
                                    color: '#fff',
                                    shadowBlur: 3,
                                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                                    shadowOffsetX: 2,
                                    shadowOffsetY: 2
                                }
                            }
                        ],
                        series: [
                            {
                                name:'每秒接收的字节',
                                type:'line',
                                data:this.rxbyt
                            },
                            {
                                name:'每秒传输的字节',
                                type:'line',
                                data:this.txbyt
                            }
                        ]
                    }
                );
            },
        },
        //调用
        mounted() {
            this.ce_id=this.$route.query.ce_id
            this.getData(this.ce_id)
        }
    }
</script>


<style scoped>
    @import "../../../styles/layui/css/layui.css";
</style>