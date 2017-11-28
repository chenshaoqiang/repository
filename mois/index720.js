
var isIos = false;
var browser = {
    versions : function() {
        var u = navigator.userAgent;
        return {
            trident : u.indexOf('Trident') > -1,//IE内核
            presto  : u.indexOf('Presto') > -1, //opera内核
            webKit  : u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko   : u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,//火狐内核
            mobile  : !!u.match(/AppleWebKit.*Mobile.*/),//是否为移动终端
            ios     : !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),//ios终端
            android : u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
            iPhone  : u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
            iPad    : u.indexOf('iPad') > -1, //是否iPad
            webApp  : u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
            weixin  : u.indexOf('MicroMessenger') > -1,//是否微信 （2015-01-22新增）
            qq      : u.match(/\sQQ/i) == " QQ" //是否QQ
        };
    }(),
    language : (navigator.browserLanguage || navigator.language) .toLowerCase()
};

if (browser.versions.mobile || browser.versions.android || browser.versions.ios) {

    if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {

        isIos = true;

    } else if (/(Android)/i.test(navigator.userAgent)) {}

}

var fov = 70, scene, camera, renderer, effect, element, controls,isGyro = false, isVr = false, isEye = false, isShow = true;

//构建模型
init();
function init() {

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 1000);
    camera.target = new THREE.Vector3(0, 0, 0);
    camera.position.set(0, 0, 0);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer();
    element = renderer.domElement;
    document.body.appendChild(renderer.domElement);

    effect = new THREE.StereoEffect(renderer);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(
        camera.position.x + 0.01,
        camera.position.y,
        camera.position.z
    );
    controls.minDistance = 1; //最大
    controls.maxDistance = 280;//最小

    var mesh = new THREE.Mesh( new THREE.SphereGeometry( 100, 60, 60 ),
        new THREE.MeshBasicMaterial( {map: THREE.ImageUtils.loadTexture('img/720_1.jpg')} ) );
    mesh.scale.x = -1;
    scene.add( mesh );
    animate();

    window.addEventListener('deviceorientation', setDeviceOrientationControls, true);
    window.addEventListener( 'resize', onWindowResize, false );

}

//窗口变化监听
function onWindowResize() {

    getScale();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

function setDeviceOrientationControls(e) {

    controls = new THREE.DeviceOrientationControls(camera, true);
    controls.connect();
    controls.update();
    window.removeEventListener('deviceorientation', setDeviceOrientationControls, true);

}

function animate() {

    requestAnimationFrame(animate);
    var width = window.innerWidth;
    var height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    effect.setSize(width, height);
    isGyro ? controls.update() : void 0;
    //isVr ? effect.render(scene, camera) : renderer.render( scene, camera );

    if(isVr){

        if(window.orientation == 90 || window.orientation == -90){

            effect.render(scene, camera);
            $(".turnIcon").hide();

        }else {

            $(".turnIcon").show();
            renderer.render( scene, camera );

        }


    }else {

        $(".turnIcon").hide();
        renderer.render( scene, camera );

    }

}

function getScale() {

    var deviceWidth;
    //设置压缩比
    deviceWidth = document.documentElement.clientWidth > 360 ? 360 : document.documentElement.clientWidth;
    document.documentElement.style.fontSize = (deviceWidth / 3.6) + 'px';

}

$("#gyro").on("click",function (event) {

    event.stopPropagation();
    isGyro = !isGyro;
    isGyro ? (
        $("#gyro").attr("class", "gyro_icon open"),
            $("#gyFont").attr("class","font_y").text("陀螺仪-开")
    )
        : (
        $("#gyro").attr("class", "gyro_icon close"),
            $("#gyFont").attr("class","font_w").text("陀螺仪-关")
    );

});

$("#eye").on("click",function (event) {

    event.stopPropagation();
    isEye = !isEye;
    isEye ? ($("#eye").attr("class", "eye_icon open"),$("#eyeFont").attr("class","font_y").text("鱼眼-开"))
        : ($("#eye").attr("class", "eye_icon close"),$("#eyeFont").attr("class","font_w").text("鱼眼-关"));

});

$("#vrIcon").on("click",function (event) {

    event.stopPropagation();
    isVr = !isVr;
    if(isVr){
        if (!browser.versions.weixin) {

            $(document).fullScreen(true);

        }
        $(".exitIcon").show();
        $("#info").hide();
        isGyro = true;
        $("#gyro").attr("class", "gyro_icon open").hide();
        $("#gyFont").attr("class", "font_y").text("陀螺仪-开");

    }

});

$(".exitIcon").on("click",function (event) {

    event.stopPropagation();
    isVr = !isVr;
    !isVr ? ($(".exitIcon").hide(),$("#info").show(),$("#gyro").show()) : void 0;

});

$("#down").on("click",function (event) {

    event.stopPropagation();
    if(browser.versions.mobile && browser.versions.android){

        window.location.href = "https://www.baidu.com/";

    }else if(browser.versions.mobile && browser.versions.ios){

        window.location.href = "https://www.baidu.com/";

    }

});

$("#comment").on("click",function (event) {

    event.stopPropagation();

});

$("#praise").on("click",function (event) {

    event.stopPropagation();

});

$("body").on("click",function (event) {

    event.preventDefault();
    isShow = !isShow;
    isVr ? $("#info").hide() : isShow ? $("#info").show() : $("#info").hide();

});
