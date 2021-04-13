window.CESIUM_BASE_URL = '/';

require('../style/common.css');
require('../style/LMSstyle.css');
window.$ = window.jQuery = require('jquery');
require('bootstrap');
require('../js/bootstrap-treeview');
require('../style/bootstrap-treeview.css');

require('../js/jquery-animate-css-rotate-scale');

global.Cesium = require('cesium');
require('cesium/Build/Cesium/Widgets/widgets.css');

const marker = require('../img/marker-icon.png');

class App
{
    constructor()
    {
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMmVhZjM4OS00OTU1LTRiZjMtOWMzOC05MGQzZGIzZGNlYWUiLCJpZCI6MzgwNDgsImlhdCI6MTYwNTgzNTQ3NX0.xTI-lu_FpZwTSMQ4lv4d8BWJn_jdFjJBFUDKu1ebgNg';
        this.viewOption = {
            shadows: true,
            terrainShadows: Cesium.ShadowMode.ENABLED,
            baseLayerPicker: true,
            geocoder: false,
            infoBox: false, //객체 선택 시 상세정보 표시 기능 활성화
            selectionIndicator: true,
            homeButton: false,
            navigationInstructionsInitiallyVisible: false,
            terrainExaggeration: 1.0, //고도 기복 비율 조정
            requestRenderMode: false, //throttled이 false이면 매번 화면 갱신으로 FPS 값이 표시됨 f
            maximumRenderTimeChange: Infinity,
            navigationHelpButton: false,
            timeline: false,
            fps: true,
            animation: false,
            navigation: true,
            fullscreenButton: false,
            creditsDisplay: false,
            distanceDisplayCondition: false,
            terrainProvider: Cesium.createWorldTerrain(),
            imageryProvider : Cesium.createWorldImagery({
                style : Cesium.IonWorldImageryStyle.AERIAL_WITH_LABELS
            })
        };
        this.viewer = new Cesium.Viewer('cesiumContainer', this.viewOption);

        this.buildingTileset = this.viewer.scene.primitives.add(Cesium.createOsmBuildings());

        this.viewer.camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(127.03024297021332, 37.52410408047953,20000000),
        });
        this.viewer.camera.changed.addEventListener(this.update, this);
        this.viewer.screenSpaceEventHandler.setInputAction((e)=>{
            //console.log(e); e contains position in window
            let o = this.viewer.scene.pick(e.position);
            if(o){
                $('#LMSInfoBox').modal({
                    show:true,
                    backdrop:false,
                });
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    update(){
        let h = app.viewer.camera._positionCartographic.height;
        h /= 10000;
        h = Math.round(h);
        let zoom = h;
        let distance = zoom * 10000;
        distance /= 2;
        
        $.ajax({
            context: this,
            dataType: 'json',
            url: "http://localhost:8082/api/getList/0/0/"+distance,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Access-Control-Allow-Origin","*");
                xhr.setRequestHeader("Referrer-Policy","no-referrer");
            },
            success: function(json){
                this.viewer.entities.removeAll();
                let list = json["list"];
                for(let i = 0; i < list.length; i++){
                    let position = list[i]["latlng"];
                    let lat = position.split(",");
                    let lng = parseFloat(lat[1]);
                    lat = parseFloat(lat[0]);
                    let clusterid = list[i]["clusterid"];
                    let count = list[i]["count"];
                    //let carto = new Cesium.Cartographic(lng, lat, 0);
                    if(clusterid){
                        let e = this.viewer.entities.add({
                            position: new Cesium.Cartesian3.fromDegrees(lat, lng, 100),
                            label: {
                                text: "" + count,
                                scale: 0.7,
                                pixelOffset: new Cesium.Cartesian2(0, -35)
                            },
                            billboard: {
                                image: marker.default,
                                heightReference: Cesium.HeightReference.CLAMP_TO_RELATIVE,
                            }
                        });
                    }
                }
            },
            error: function(){
                console.log("error");
            }
        });

    }
}

global.App = App;