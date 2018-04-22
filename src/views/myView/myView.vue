<template>
<div>
      <Row v-for="(item,i) in myRow" :key="'row' + i" style="margin-top:10px">
        <Col :span="parseInt(items.col)" v-for="(items,j) in item.col" :key="'col' + j">
          <Card style="width:100%">
            <iframe style="border: 0px" width="100%" :height="parseInt(items.height) + 'px'" :src="items.path"></iframe>
          </Card>
        </Col>
      </Row>
    </div>
</template>

<script>
	import util from '@/libs/util';
	export default {
    name: 'systemParams',
    data () {
      return {
        data: '',
        myRow: [],
        viewlist: [],
      }
    },
    created () {
    	let vm = this
      this.data = this.$route.meta.routerpath
      if (vm.$store.state.app.viewList !== undefined) {
        this.viewlist = vm.$store.state.app.viewList
      }
      this.showview()
    },
    watch: {
      $route(){
        this.data = this.$route.meta.routerpath
        this.showview()
      }
    },
    methods: {
    	showview () {
    		let url = '/jhipsteruaa/api/attributevalues_getByKey?'
    		url += 'key=routerpath&value=' + this.data + '&resource_name=viewinfo'
    		util.axios({
            method: 'get',
            url: url,
        }).then(res => {
        	// 获取视图
        	this.myRow = JSON.parse(res.data.data[0].view_code)
        }).catch(function (error) {
            vm.loading = false
        });
    	}
    }
  }
</script>

<style>
</style>