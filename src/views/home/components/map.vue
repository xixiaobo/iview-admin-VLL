<template>
    <div style="width:calc(100% - 10px);height:305px;" id="home_page_map"></div>
</template>

<script>
import echarts from 'echarts';
import geoData from '../map-data/get-geography-value.js';
export default {
    name: 'homeMap',
    props: {
        cityData: Array
        },
    mounted () {
        var map = echarts.init(document.getElementById('home_page_map'));
        const chinaJson = require('../map-data/china.json');
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
    }
};
</script>


