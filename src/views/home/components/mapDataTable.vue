<template>
    <div :style="styleObj">
        <Table :height="height" :columns="columns" :data="cityData"></Table>
    </div>
</template>

<script>
export default {
    name: 'mapDataTable',
    data () {
        return {
            columns: [
                {
                    title: '主机名',
                    key: 'ce_name'
                },
                {
                    title: 'ip',
                    key: 'ce_ip'
                },
                {
                    title: '城市',
                    key: 'name'
                }
            ]
        };
    },
    props: {
        cityData: Array,
        styleObj: Object,
        height: String
    }
};
</script>
