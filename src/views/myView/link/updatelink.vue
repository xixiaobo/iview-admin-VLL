<template>
    <div>
        <Row style="margin-top:20px" :gutter="16">
            <Col>
                <Card>
                    <table class="layui-table">

                        <thead>
                        <tr>
                            <th>
                                链路名称
                            </th>
                            <th>
                                原设备名称
                            </th>
                            <th>
                                原设备ip
                            </th>
                            <th>
                                目的端名称
                            </th>
                            <th>
                                目的端地址
                            </th>
                            <th>
                                链路状态
                            </th>
                            <th>
                                最后检测时间
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>
                                {{link.vll_link_name}}&nbsp;
                                <Button icon="compose" @click="modal = true" size="small"
                                        style="float: right; "></Button>
                            </td>
                            <td>{{link.ce_name}}</td>
                            <td>{{link.ce_ip}}</td>
                            <td>{{link.dst_device}}</td>
                            <td>{{link.dst_port_ip}}</td>
                            <td>{{link.link_status}}</td>
                            <td>{{link.last_test_time}}</td>
                        </tr>
                        </tbody>
                    </table>
                    <Modal
                            v-model="modal"
                            title="修改链路名"
                            :loading="loading"
                            @on-ok="asyncOK">
                        <Form ref="updatelinkname" :model="updatelinkname" :rules="ruleValidate1" :label-width="80">
                            <FormItem label="链路名" prop="linkname">
                                <Input v-model="updatelinkname.linkname"></Input>
                            </FormItem>
                        </Form>
                    </Modal>
                </Card>
            </Col>
        </Row>
        <Row :gutter="16">

            <Col span="13" push="5">
                <Card style="height:60px">
                    <Button type="primary" shape="circle" icon="loop" v-on:click="getPerformanceData()"
                            style="float: right;margin: 0 0 10px 20px"></Button>
                    <DatePicker type="datetimerange" format="yyyy-MM-dd HH:mm:SS"
                                placeholder="选择查询时间" v-model="selectdate" @on-ok="changeDate()"
                                :options="options" style="width: 280px;float: right"></DatePicker>
                </Card>
                <Card>
                    <div id="delay" style="width:98%;height: 300px"></div>
                </Card>
            </Col>
        </Row>
    </div>
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
                link: {
                    ce_name: '',
                    ce_ip: '',
                    vll_link_id: '',
                    vll_link_name: '',
                    src_device_id: '',
                    dst_device: '',
                    dst_port_ip: '',
                    link_status: '',
                    delay_average: '',
                    delay_maxnum: '',
                    delay_minnum: '',
                    packet_loss: '',
                    last_test_time: ''
                },
                vll_link_id: '',
                echartsdate: [],
                mindata: [],
                modal: false,
                loading: true,
                updatelinkname: {
                    linkname: ''
                },
                ruleValidate1: {
                    name: [
                        {required: true, message: '链路名不能为空', trigger: 'blur'}
                    ]
                },
                maxdata: [],
                avgdata: [],
                options: {
                    disabledDate(date) {
                        var maxdate = new Date()
                        maxdate.setDate(maxdate.getDate() - 15)
                        return date > new Date() || date < maxdate;
                    }
                },
                selectdate: '',
            }
        },
        methods: {
            asyncOK () {
                let vm = this
                vm.$refs['updatelinkname'].validate((valid) => {
                    if (valid) {
                        var name=this.updatelinkname.linkname
                        util.axios({
                            method: 'get',
                            url: '/h2-console/csrf',
                        }).then(res => {
                            console.log(res)
                            window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                            util.axios({
                                method: 'put',
                                url: '/equipmentmodule/api/Link_putLinkName', // 放方法
                                data: {vll_link_id: this.vll_link_id, vll_link_name: name},
                                headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                            }).then(ress => {
                                if (ress.data.error_code === 1) {
                                    vm.$Message.success('链路名修改成功!')
                                    this.$refs['updatelinkname'].resetFields();
                                    this.modal = false;
                                    this.updatelinkname.linkname=''
                                    this.getData(this.vll_link_id)
                                } else {
                                    this.updatelinkname.linkname=''
                                    this.$refs['updatelinkname'].resetFields();
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
            changeDate() {
                var beginTime = formatDate(this.selectdate[0], "yyyy-MM-dd hh:mm:ss")
                var endTime = formatDate(this.selectdate[1], "yyyy-MM-dd hh:mm:ss")
                this.getPerformanceDataByTime(beginTime, endTime)
            },
            getData(vll_link_id) {
                let vm = this
                util.axios({
                    method: 'get',
                    url: '/h2-console/csrf',
                }).then(res => {
                    window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                    util.axios({
                        method: 'get',
                        url: '/equipmentmodule/api/Link_get/' + vll_link_id,
                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN}
                    }).then(ress => {
                        console.log(ress.data)
                        this.link = ress.data.data
                        this.vll_link_id = ress.data.data.vll_link_id
                        this.getPerformanceData()
                        // this.formValidate.status = JSON.stringify(ress.data.status)
                    }).catch(function (error) {
                        vm.$Message.error('信息查询失败')
                        this.loading = false
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
                        url: '/equipmentmodule/api/Delay_get',
                        data: {"vll_link_id": this.vll_link_id},
                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN}
                    }).then(ress => {
                        console.log(ress.data)
                        var arr = ress.data.data
                        this.mindata = []
                        this.maxdata = []
                        this.avgdata = []
                        this.echartsdate = []
                        for (var i = 0, len = arr.length; i < len; i++) {
                            this.mindata.push(arr[i]['delay_minnum'])
                            this.maxdata.push(arr[i]['delay_maxnum'])
                            this.avgdata.push(arr[i]['delay_average'])
                            this.echartsdate.push(arr[i]['test_time'])
                        }

                        if (arr === null) {
                            var $li = "";
                            $li = "<div><span class='b threefont' style='letter-spacing:-2px;position: absolute;margin-left: 40%;top: 40%;color:#ddd'>暂无数据</span></div>";
                            $('#delay').append($li);
                        } else {
                            this.drawLine()
                        }
                        // this.formValidate.status = JSON.stringify(ress.data.status)
                    }).catch(function (error) {
                        vm.$Message.error('时延查询失败')
                        vm.loading = false
                    });

                })
            },
            getPerformanceDataByTime(beginTime, endTime) {
                let vm = this
                util.axios({
                    method: 'get',
                    url: '/h2-console/csrf',
                }).then(res => {
                    window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                    util.axios({
                        method: 'post',
                        url: '/equipmentmodule/api/Delay_get',
                        data: {"vll_link_id": this.vll_link_id, "beginTime": beginTime, "endTime": endTime},
                        headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN}
                    }).then(ress => {
                        console.log(ress.data)
                        var arr = ress.data.data
                        this.mindata = [],
                            this.maxdata = [],
                            this.avgdata = [],
                            this.echartsdate = []
                        for (var i = 0, len = arr.length; i < len; i++) {
                            this.mindata.push(arr[i]['delay_minnum'])
                            this.maxdata.push(arr[i]['delay_maxnum'])
                            this.avgdata.push(arr[i]['delay_average'])
                            this.echartsdate.push(arr[i]['test_time'])
                        }
                        if (arr === null) {
                            var $li = "";
                            $li = "<div><span class='b threefont' style='letter-spacing:-2px;position: absolute;margin-left: 40%;top: 40%;color:#ddd'>暂无数据</span></div>";
                            $('#delay').append($li);
                        } else {
                            this.drawLine()
                        }
                        // this.formValidate.status = JSON.stringify(ress.data.status)
                    }).catch(function (error) {
                        vm.$Message.error('时延查询失败')
                        vm.loading = false
                    });

                })
            },
            drawLine() {
                // 基于准备好的dom，初始化echarts实例
                // console.log("46454")
                let delay = echarts.init(document.getElementById('delay'))
                // 绘制图表
                delay.setOption(
                    {
                        title: {
                            text: this.link.vll_link_name + '时延图'
                        },
                        tooltip: {
                            trigger: 'axis',
                            position: function (pt) {
                                return [pt[0], '10%'];
                            },
                            formatter: function (params) {
                                var relVal = params[0].name;
                                for (var i = 0, l = params.length; i < l; i++) {
                                    relVal += '<br/>' + params[i].seriesName + ' : ' + params[i].value + "ms";
                                }
                                return relVal;
                            }
                        },
                        legend: {
                            data: ['最大时延', '最小时延', '平均时延'],

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
                            name: '日期',
                            boundaryGap: false,
                            data: this.echartsdate
                        },
                        yAxis: {
                            type: 'value',
                            name: '网络延时',
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
                                name: '最大时延',
                                type: 'line',
                                data: this.maxdata
                            },
                            {
                                name: '最小时延',
                                type: 'line',
                                data: this.mindata
                            },
                            {
                                name: '平均时延',
                                type: 'line',
                                data: this.avgdata
                            }
                        ]
                    }
                );

            },
        },
        //调用
        mounted() {
            this.vll_link_id = this.$route.query.vll_link_id
            this.getData(this.vll_link_id)
        }
    }
</script>

<style>
    /*@import "../../../styles/layui/css/layui.css";*/
</style>