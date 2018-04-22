<style lang="less">
    @import "./home.less";
    @import "../../styles/common.less";
</style>
<template>
    <div class="home-main">
        <Row :gutter="10">
            <Col :md="24" :lg="8">
                <Row class-name="home-page-row1" :gutter="10">
                    <Col :md="12" :lg="24" :style="{marginBottom: '10px'}">
                        <Card>
                            <Row type="flex" class="user-infor">
                                <Col span="8">
                                    <Row class-name="made-child-con-middle" type="flex" align="middle">
                                        <img class="avator-img" :src="avatorPath"/>
                                    </Row>
                                </Col>
                                <Col span="16" style="padding-left:6px;">
                                    <Row class-name="made-child-con-middle" type="flex" align="middle">
                                        <div>
                                            <b>{{username}}</b><br/>
                                            <p>{{authorities}}</p>
                                        </div>
                                    </Row>
                                </Col>
                            </Row>
                            <div class="line-gray"></div>
                            <Row class="margin-top-8">
                                <Col span="8"><p class="notwrap">本次登录地点:</p></Col>
                                <Col span="16" class="padding-left-8">{{address_detail}}</Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col :md="12" :lg="24" :style="{marginBottom: '10px'}">
                        <Card>
                            <p slot="title" class="card-title">
                                <Icon type="android-checkbox-outline"></Icon>
                                待办事项
                            </p>
                            <a type="text" slot="extra" @click.prevent="addNewToDoItem">
                                <Icon type="plus-round"></Icon>
                            </a>
                            <Modal
                                    v-model="showAddNewTodo"
                                    title="添加新的待办事项"
                                    @on-ok="addNew"
                                    @on-cancel="cancelAdd">
                                <Row type="flex" justify="center">
                                    <Input v-model="newToDoItemValue" icon="compose" placeholder="请输入..."
                                           style="width: 300px"/>
                                </Row>
                                <Row slot="footer">
                                    <Button type="text"  @click="cancelAdd">取消</Button>
                                    <Button type="primary" :loading="loading" @click="addNew">确定</Button>
                                </Row>
                            </Modal>
                            <div class="to-do-list-con">
                                <div v-for="(item, index) in toDoList" :key="index" class="to-do-item">
                                    <to-do-list-item :content="item" v-on:refreshbizlines="getBacklogData"></to-do-list-item>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Col>
            <Col :md="24" :lg="16">
                <Row :gutter="5">
                    <Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
                        <infor-card
                                id-name="user_created_count"
                                :end-val="count.createUser"
                                iconType="android-person"
                                color="#2d8cf0"
                                intro-text="用户数量"
                        ></infor-card>
                    </Col>
                    <Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
                        <infor-card
                                id-name="visit_count"
                                :end-val="count.visit"
                                iconType="android-cloud"
                                color="#ffd572"
                                :iconSize="50"
                                intro-text="主机总数"
                        ></infor-card>
                    </Col>
                    <Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
                        <infor-card
                                id-name="collection_count"
                                :end-val="count.collection"
                                iconType="ios-loop-strong"
                                color="#64d572"
                                intro-text="正在运行主机数"
                        ></infor-card>
                    </Col>
                    <Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
                        <infor-card
                                id-name="transfer_count"
                                :end-val="count.transfer"
                                iconType="android-cancel"
                                color="#f25e43"
                                intro-text="停止运行主机数"
                        ></infor-card>
                    </Col>
                </Row>
                <Row>
                    <Card :padding="0">
                        <p slot="title" class="card-title">
                            <Icon type="map"></Icon>
                            主机地理分布
                        </p>
                        <div class="map-con">
                            <Col span="10">
                                <map-data-table :cityData="tableData" height="281"
                                                :style-obj="{margin: '12px 0 0 11px'}"></map-data-table>
                            </Col>
                            <Col span="14" class="map-incon">
                                <Row type="flex" justify="center" align="middle">
                                    <!--<home-map :city-data="cityData"></home-map>-->
                                    <div style="width:calc(100% - 10px);height:305px;" id="home_page_map"></div>
                                </Row>
                            </Col>
                        </div>
                    </Card>
                </Row>
            </Col>
        </Row>
    </div>
</template>

<script>
    import dataSourcePie from './components/dataSourcePie.vue';
    import visiteVolume from './components/visiteVolume.vue';
    import serviceRequests from './components/serviceRequests.vue';
    import userFlow from './components/userFlow.vue';
    import countUp from './components/countUp.vue';
    import inforCard from './components/inforCard.vue';
    import mapDataTable from './components/mapDataTable.vue';
    import toDoListItem from './components/toDoListItem.vue';
    import util from '@/libs/util.js';
    import echarts from 'echarts';
    import Cookies from 'js-cookie';
    export default {
        name: 'home',
        components: {
            dataSourcePie,
            visiteVolume,
            serviceRequests,
            userFlow,
            countUp,
            inforCard,
            mapDataTable,
            toDoListItem
        },
        data() {
            return {
                toDoList: [],
                count: {
                    createUser: 0,
                    visit: 0,
                    collection: 0,
                    transfer: 0
                },
                cityData: [],
                tableData:[],
                showAddNewTodo: false,
                newToDoItemValue: '',
                address_detail:'',
                userid:'',
                username:'',
                authorities:'',
                loading:false
            };
        },
        computed: {
            avatorPath() {
                return localStorage.avatorImgPath;
            }
        },
        methods: {
            addNewToDoItem() {
                this.showAddNewTodo = true;
            },
            addNew() {
                let vm=this
                if (this.newToDoItemValue.length !== 0) {
                    this.loading=true
                    let formData={}
                    formData.uuid=this.userid
                    formData.title=this.newToDoItemValue
                    formData.checkbox=0
                    console.log(formData)
                    util.axios({
                        method: 'get',
                        url: '/h2-console/csrf',
                    }).then(res => {
                        console.log(res)
                        window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                        util.axios({
                            method: 'post',
                            url: '/newsmodule/api/Backlog',
                            data: formData,
                            headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                        }).then(res => {
                            vm.loading = false
                            vm.$Message.success('添加成功!')
                            console.log(res)
                            vm.getBacklogData()
                            vm.newToDoItemValue = '';
                            vm.showAddNewTodo = false;
                        }).catch(function (error) {
                            console.log(error)
                            vm.$Message.error('添加失败')
                            vm.newToDoItemValue = '';
                            vm.showAddNewTodo = false;
                            vm.loading = false
                        });
                    }).catch(function (error) {
                    });
                } else {
                    this.$Message.error('请输入待办事项内容');
                }
            },
            cancelAdd() {
                this.showAddNewTodo = false;
                this.newToDoItemValue = '';
            },
            getUserData(){
                util.axios({
                    method: 'get',
                    url: '/jhipsteruaa/api/account',
                    headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN}
                }).then(res2 => {
                    this.userid=res2.data.id
                    this.username=res2.data.username
                    this.authorities=res2.data.authorities.toString()
                    this.getBacklogData()
                })
            },
            getUserCountDate() {
                let vm=this
                util.axios({
                    method: 'get',
                    url: 'jhipsteruaa/api/getUserCount',
                }).then(res => {
                    console.log(res)
                    if (res.data.error_code === 1) {
                        vm.count.createUser = res.data.usercount
                    } else if (res.data.error_code === 0) {
                        vm.count.createUser = 0
                    }
                }).catch(function (error) {
                });
            },
            getDeviceCountData(){
                let vm =this
                util.axios({
                    method: 'get',
                    url: 'equipmentmodule/api/getDeviceCount',
                }).then(res => {
                    console.log(res)
                    if (res.data.error_code === 1) {
                        vm.count.visit = res.data.data.allnum
                        vm.count.collection = res.data.data.runnum
                        vm.count.transfer = res.data.data.stopnum
                    } else if (res.data.error_code === 0) {
                        vm.count.visit = 0
                        vm.count.collection = 0
                        vm.count.transfer = 0
                    }
                }).catch(function (error) {
                });
            },
            getaddressDate(){
                let vm=this
                util.axios({
                    method: 'get',
                    url: 'http://freegeoip.net/json/', // 接口地址
                }).then(res => {
                    console.log(res.data.ip)
                    var ip=res.data.ip
                    util.axios({
                        method: 'get',
                        url: 'equipmentmodule/api/getDeviceAddress', // 接口地址
                        params:{type:"client",ip:ip},
                    }).then(res => {
                        console.log(res.data)
                        vm.address_detail=res.data.address

                    }).catch(function (error) {
                        console.log(error)
                    });

                }).catch(function (error) {
                    console.log(error)
                });
            },
            gethostaddressDate() {
                let vm = this
                util.axios({
                    method: 'get',
                    url: 'equipmentmodule/api/getDeviceAddress', // 接口地址
                    params: {type: "host"},
                }).then(res => {
                    console.log(res.data)
                    var arr = res.data.data
                    for (var i = 0, len = arr.length; i < len; i++) {
                        var other = {name: "", value: []}
                        other.name = arr[i].name
                        other.value = arr[i].value
                        console.info(other)
                        this.cityData.push(other)
                        var other2 = {ce_name: "", ce_ip: "", name: ""}
                        other2.ce_name = arr[i].ce_name
                        other2.ce_ip = arr[i].ce_ip
                        other2.name = arr[i].name
                        this.tableData.push(other2)
                    }
                    console.info(this.cityData)
                    this.map()
                }).catch(function (error) {
                    console.log(error)
                });
            },
            map(){
                var map = echarts.init(document.getElementById('home_page_map'));
                const chinaJson = require('./map-data/china.json');
                echarts.registerMap('china', chinaJson);
                map.setOption({
                    backgroundColor: '#FFF',
                    geo: {
                        map: 'china',
                        roam: true,
                        label: {
                            emphasis: {
                                show: false
                            }
                        },
                        itemStyle: {
                            normal: {
                                areaColor: '#EFEFEF',
                                borderColor: '#CCC'
                            },
                            emphasis: {
                                areaColor: '#E5E5E5'
                            }
                        }
                    },
                    grid: {
                        top: 0,
                        left: '2%',
                        right: '2%',
                        bottom: '0',
                        containLabel: true
                    },
                    series: [{
                        type: 'scatter',
                        coordinateSystem: 'geo',
                        // data: this.cityData2,
                        // data: convertData(this.cityData),
                        data: this.cityData,
                        label: {
                            normal: {
                                formatter: '{b}',
                                position: 'right',
                                show: false
                            },
                            emphasis: {
                                show: true
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: '#F06C00'
                            }
                        }
                    }
                    ]

                });
                window.addEventListener('resize', function () {
                    map.resize();
                });
            },
            getBacklogData(){
                let vm=this
                util.axios({
                    method: 'get',
                    url: 'newsmodule/api/Backlog_get',
                    params:{uuid:vm.userid}
                }).then(res => {
                    console.log(res)
                    if (res.data.error_code === 1) {
                        vm.toDoList= []
                        var listdata=res.data.data
                        for (var i = 0, len = listdata.length; i < len; i++) {
                            var check=false
                            if(listdata[i].checkbox==0){
                                check=false
                            }else{
                                check=true
                            }
                            vm.toDoList.unshift({
                                id:listdata[i].id,
                                title: listdata[i].title,
                                checkbox:check
                            });
                        }
                    } else if (res.data.error_code === 0) {
                        vm.toDoList= []
                    }
                }).catch(function (error) {
                });
            }
        },
        created() {
            this.getUserData()
            this.getaddressDate()
            this.gethostaddressDate()
            this.getUserCountDate();
            this.getDeviceCountData();
        }
    };
</script>
