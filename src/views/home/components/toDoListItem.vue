<style lang="less">
    @import './styles/to-do-list-item.less';
</style>

<template>
    <Row class="to-do-list-item">
        <Col span="2" class="height-100">
            <Row type="flex" justify="center" align="middle" class="height-100">
                <Checkbox v-model="content.checkbox" @on-change="checkboxChange"></Checkbox>
            </Row>
        </Col>
        <Col span="16" class="height-100">
            <Row type="flex" justify="start" align="middle" class="height-100">
                <p class="to-do-list-item-text" @click="handleHasDid" :class="{hasDid: content.checkbox}">{{ content.title }}</p>
            </Row>
        </Col>
        <Col span="3" class="height-100">
            <Row type="flex" justify="center" align="middle" class="infor-icon-row height-100">
                <Button type="info" size="small" icon="eye"   @click="modal = true"></Button>
                <Modal
                        v-model="modal"
                        title="详情"
                        :loading="loading"
                        @on-ok="asyncOK">
                    <p>{{ content.title }}</p>
                </Modal>
            </Row>
        </Col>
        <Col span="3" class="height-100">
            <Row type="flex" justify="center" align="middle" class="infor-icon-row height-100">
                <Button type="error" size="small" icon="ios-trash" :loading="delLoading"  @click="delOk"></Button>
            </Row>
        </Col>
    </Row>

</template>

<script>
    import util from '@/libs/util.js';
export default {
    name: 'toDoListItem',
    data () {
        return {
            todoitem: false,
            modal:false,
            loading: true,
            delLoading:false
        };
    },
    props: {
        content: {}
    },
    methods: {
        asyncOK () {
                this.modal = false;
        },
        delOk(){
            let vm=this
            util.axios({
                method: 'get',
                url: '/h2-console/csrf',
            }).then(res => {
                console.log(res)
                window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                util.axios({
                    method: 'delete',
                    url: '/newsmodule/api/Backlog_delete',
                    params:{id:this.content.id},
                    headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                }).then(res => {
                    vm.loading = false
                    vm.$Message.success('删除成功!')
                    // vm.$emit('getBacklogData');
                    vm.$emit('refreshbizlines');
                    // vm.$parent.getBacklogData()
                }).catch(function (error) {
                    console.log(error)
                    vm.$Message.error('删除失败')
                });
            }).catch(function (error) {
            });
        },
        handleHasDid () {
            this.content.checkbox = !this.content.checkbox;
            this.checkboxChange()
        },
        checkboxChange(){
            let check=this.content.checkbox
            var checkbox=0
            if(check===false){
                checkbox=0
            }else{
                checkbox=1
            }
            let vm=this
            util.axios({
                method: 'get',
                url: '/h2-console/csrf',
            }).then(res => {
                console.log(res)
                window.localStorage.XSRF_TOKEN = res.data.CsrfToken.token
                util.axios({
                    method: 'put',
                    url: '/newsmodule/api/Backlog_put',
                    data:{id:this.content.id,checkbox:checkbox},
                    headers: {'X-XSRF-TOKEN': window.localStorage.XSRF_TOKEN},
                }).then(res => {

                }).catch(function (error) {
                    console.log(error)
                    vm.$Message.error('修改状态失败')
                    vm.content.checkbox = !vm.content.checkbox;
                });
            }).catch(function (error) {
            });

        }
    },
    created() {
    }
};
</script>