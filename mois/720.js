
var fov = 70, mesh, scene, camera, renderer, effect, element, controls, isCom = false, isGyro = false, isVr = false, isEye = false,
    isShow = true,tags = [],tagsTwo = [], touchLen = 0, cameraPosY = 0;
var isIos = false;

var vectorArray = [
    {"x": 84.48636678589156, "y": -44.32722918299939, "z": 29.618319423601037, "content": "真好看！"},
    {"x": 92.55871605138113, "y": -34.08448218167772, "z": -15.537561493294982, "content": "这是谁拍的啊，真美！"},
    {"x": 98.2711850057156, "y": 2.036200879772982, "z": 17.569038284042893, "content": "效果不错，我也想试试！"},
    {"x": 28.2711850057156, "y": -34.08448218167772, "z": 37.569038284042893, "content": "蓝天白云，风光无限。"},
    {"x": 48.2711850057156, "y": -44.32722918299939, "z": -17.569038284042893, "content": "碧海涛涛"},
    {"x": 158.2711850057156, "y": 52.036200879772982, "z": 7.569038284042893, "content": "此处适合养老！"}
];

var browser = {
    versions: function () {
        var u = navigator.userAgent;
        return {
            trident: u.indexOf('Trident') > -1,//IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,//火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/),//是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),//ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
            iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
            weixin: u.indexOf('MicroMessenger') > -1,//是否微信 （2015-01-22新增）
            qq: u.match(/\sQQ/i) == " QQ" //是否QQ
        };
    }(),
    language: (navigator.browserLanguage || navigator.language).toLowerCase()
};
//扩展Jquery长按事件
$.fn.longPress = function (fn) {

    var timeout = undefined;
    var $this = this;

    for (var i = 0; i < $this.length; i++) {
        $this[i].addEventListener('touchstart', function (e) {

            touchLen = e.touches.length;
            function _fn(e) {
                return function () {
                    fn(e);
                }
            }

            timeout = setTimeout(_fn(e), 1000);  //长按时间超过1000ms，则执行传入的方法

        }, false);

        $this[i].addEventListener('touchend', function () {

            clearTimeout(timeout);

        }, false);

    }

};

if (browser.versions.mobile || browser.versions.android || browser.versions.ios) {

    if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {

        isIos = true;
        if(browser.versions.qq){
            $("#turnIcon").text("亲，检测到您正使用iphoneQQ，请移驾Safari浏览器中获取cardboard体验！");
        }

    } else if (/(Android)/i.test(navigator.userAgent)) {
        //
    }

}

function getRootPath() {

    //获取当前网址，如： http://localhost:8080/share/index.html
    var curWwwPath = window.document.location.href;
    //获取主机地址之后的目录，如：share/index.html
    var pathName = window.document.location.pathname;
    var pos = curWwwPath.indexOf(pathName);
    //获取主机地址，如： http://localhost:8080
    var localhostPath = curWwwPath.substring(0, pos);
    return localhostPath;

}

/*
 * 时间格式化
 * @param {Number} input 时间戳
 * */
function dateFormat(input) {

    if (input == null || input == "" || typeof(input) == "undefined") {
        return "";
    }

    var _date = new Date(input);
    var year = _date.getFullYear();
    var month = _date.getMonth() + 1 > 9 ? _date.getMonth() + 1 : "0" + (_date.getMonth() + 1);
    var day = _date.getDate() > 9 ? _date.getDate() : "0" + _date.getDate();
    var hour = _date.getHours() + 1 > 9 ? _date.getHours() : "0" + _date.getHours();
    var minutes = _date.getMinutes() + 1 > 9 ? _date.getMinutes() : "0" + _date.getMinutes();
    var seconds = _date.getSeconds() + 1 > 9 ? _date.getSeconds() : "0" + _date.getSeconds();

    return year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds;

}

function getALLInfo() {

    getUserInfo();
    downLoadAddr();
    getComment();

}

//getALLInfo();

function getUserInfo(){

    //请求接口设置模版数据
    $.ajax({
        url: getRootPath() + "/api/work/findWorkbyId",
        type:'POST',
        contentType:"application/json;charset=utf-8",
        data:JSON.stringify({"workId":$("#workId").val()}),
        success:function(res){
            if (res.code == 1) {
                var title = res["data"]["name"];
                if(title == null || title == "" || title == undefined || title == "null"){
                    document.title = "MoisPano";
                }else {
                    document.title = title;
                }
                $("#userName").text(res["data"]["user"]["userName"]);
                $("#lookCount").text(res["data"]["lookCount"]);
                $("#createTime").text(dateFormat(Number(res["data"]["createTime"])));
                imgPath = getRootPath() +  "/" + res["data"]["path"];
                //构建模型
                init();
            }else{
                alert("获取作品失败！");
            }

        }
    });

}

function downLoadAddr() {

    //请求下载地址
    $.ajax({
        url: getRootPath() + "/api/sys/getAppDownloadAddress",
        type:'POST',
        success:function(res){
            if (res.code == 1) {
                iosLink = res["data"]["iosLink"];
                androidLink = res["data"]["androidLink"];
            }

        }
    });

}

function getComment(){

    //请求接口数据
    $.ajax({
        url: getRootPath() + "/api/work/findWorkbyId",
        type:'POST',
        contentType:"application/json;charset=utf-8",
        data:JSON.stringify({"workId":$("#workId").val()}),
        success:function(res){
            if (res.code == 1) {

                vectorArray = res["data"];

            }else{

                alert("获取评论信息失败！");

            }

        }

    });

}

//构建模型
init();
function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);
    camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 1000);
    camera.target = new THREE.Vector3(0, 0, 0);
    camera.position.set(0, 0, 0);
    camera.lookAt(scene.position);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xFFFFFF, 1.0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    element = renderer.domElement;
    document.getElementById("wrap").appendChild(element);
    $(".loading").hide();
    $("#wrap").show();

    effect = new THREE.StereoEffect(renderer);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(
        camera.position.x + 0.01,
        camera.position.y,
        camera.position.z
    );
    controls.pan(20,20);

    controls.minDistance = 1; //最大
    controls.maxDistance = 280;//最小

    mesh = new THREE.Mesh(new THREE.SphereGeometry(100, 60, 60),
        new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('img/720_3.jpg'),
            transparent: true,
            side: THREE.DoubleSide
        }));
    mesh.scale.x = -1;
    scene.add(mesh);

    //添加射线代码
    var raycasterCubeMesh;
    var raycaster = new THREE.Raycaster();
    var mouseVector = new THREE.Vector3();
    var activePoint;
    var longTouchPoint;

    window.addEventListener("deviceorientation", setDeviceOrientationControls, true);
    window.addEventListener("resize", onWindowResize, false);

    $(document).longPress(function (event) {

        longTouchPoint = Math.floor(camera.position.x * 100) / 100;

        setTimeout(function () {

            if(touchLen < 2 && (longTouchPoint == Math.floor(camera.position.x * 100) / 100)){

                startHandler(event);

            }else {

                tagsTwo = [];
                $(".newElem").remove();

            }

        },1500);

    });

    animate();

    function startHandler(event) {

        event.clientX = event.touches[0].clientX;
        event.clientY = event.touches[0].clientY;
        onDocumentDown(event);

    }

    function onDocumentDown(event) {

        //每次只打开一个
        tagsTwo = [];
        $(".newElem").remove();

        mouseVector.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouseVector.y = -( event.clientY / window.innerHeight ) * 2 + 1;
        raycaster.setFromCamera(mouseVector, camera);
        var intersects = raycaster.intersectObjects([mesh]);
        if (raycasterCubeMesh) {
            scene.remove(raycasterCubeMesh);
        }
        activePoint = null;

        if (intersects.length > 0) {

            var points = [];
            points.push(new THREE.Vector3(0, 0, 0));
            points.push(intersects[0].point);
            activePoint = intersects[0].point;

            var tagMesh = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshBasicMaterial({color: 0xff0000}));
            tagMesh.position.copy(activePoint);

            var boxElement = document.createElement("div");
            boxElement.className = "newElem";
            boxElement.style.position = "absolute";
            boxElement.style.fontSize = "0";
            var butElement = document.createElement("button");
            butElement.className = "btnStyle";
            butElement.innerHTML = "ok";
            boxElement.appendChild(butElement);

            var tagElement = document.createElement("input");
            tagElement.className = "divStyle spanFont";
            tagElement.autofocus = "autofocus";
            tagElement.placeholder = "输入评论";
            tagElement.style.position = "absolute";
            tagElement.style.width = "0.5rem";
            boxElement.appendChild(tagElement);

            tagMesh.nodeElem = boxElement;
            tagElement.addEventListener("keydown", function (event) {

                if (event.keyCode == 13) {

                    if(this.value == null || this.value == "" || this.value == undefined){

                        tagsTwo = [];
                        document.body.removeChild(this);
                        console.log("回车:",this.value);

                    }else {

                        console.log("提交");

                    }


                }

            });


            tagMesh.updateTag = function () {

                if (isOffScreen(this, camera)) {

                    if(this.nodeElem.value == "" || this.nodeElem.value == undefined){

                        tagsTwo = [];
                        $(".newElem").remove();

                    }else {

                        this.nodeElem.style.display = "none";

                    }

                } else {

                    this.nodeElem.style.display = "block";
                    var position = toScreenPosition(this, camera);
                    this.nodeElem.style.left = position.x + "px";
                    this.nodeElem.style.top = position.y + "px";

                }

            };

            tagMesh.updateTag();
            document.body.appendChild(boxElement);
            tagsTwo.push(tagMesh);

        }

    }

    function animate() {

        tags.forEach(function (tag) {
            tag.updateTag();
        });

        tagsTwo.forEach(function (tag) {
            tag.updateTag();
        });

        requestAnimationFrame(animate);
        var width = window.innerWidth;
        var height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        renderer.setClearColor(0xFFFFFF);
        effect.setSize(width, height);
        isGyro ? controls.update() : void 0;
        //isVr ? effect.render(scene, camera) : renderer.render( scene, camera );

        if (isVr) {

            if (window.orientation == 90 || window.orientation == -90) {

                effect.render(scene, camera);
                $(".turnIcon").hide();

            } else {

                $(".turnIcon").show();
                renderer.render(scene, camera);

            }


        } else {

            $(".turnIcon").hide();
            renderer.render(scene, camera);

        }

    }

}

function isOffScreen(obj, camera) {

    var frustum = new THREE.Frustum(); //Frustum用来确定相机的可视区域
    var cameraViewProjectionMatrix = new THREE.Matrix4();
    cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); //获取相机的法线
    frustum.setFromMatrix(cameraViewProjectionMatrix); //设置frustum沿着相机法线方向
    return !frustum.intersectsObject(obj);

}

function toScreenPosition(obj, camera) {

    var vector = new THREE.Vector3();
    var widthHalf = 0.5 * window.innerWidth;
    var heightHalf = 0.5 * window.innerHeight;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = (vector.x * widthHalf) + widthHalf;
    vector.y = -(vector.y * heightHalf) + heightHalf;

    return {
        x: vector.x,
        y: vector.y
    };
}

function setCommentPoint(vectorArray) {

    tags = [];
    $("span.divStyle").remove();

    if(vectorArray.length > 0){

        for(var i = 0; i < vectorArray.length; i++){

            var addPoint = {"x":vectorArray[i]["x"] , "y": vectorArray[i]["y"], "z":vectorArray[i]["z"]};
            var points = [];
            points.push(new THREE.Vector3(0, 0, 0));
            points.push(addPoint);

            var tagMesh = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshBasicMaterial({color: 0xff0000}));
            tagMesh.position.copy(addPoint);

            var tagElement = document.createElement("span");
            tagElement.className = "divStyle spanFont";
            tagElement.style.position = "absolute";
            tagElement.innerHTML = vectorArray[i]["content"];


            tagMesh.nodeElem = tagElement;
            tagMesh.updateTag = function () {

                if (isOffScreen(this, camera)) {

                    this.nodeElem.style.display = "none";

                } else {

                    this.nodeElem.style.display = "block";
                    var position = toScreenPosition(this, camera);
                    this.nodeElem.style.left = position.x + "px";
                    this.nodeElem.style.top = position.y + "px";

                }

            };

            tagMesh.updateTag();
            tags.push(tagMesh);
            document.body.appendChild(tagElement);

        }

    }

}

//窗口变化监听
function onWindowResize() {

    getScale();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

function setDeviceOrientationControls(e) {

    controls = new THREE.DeviceOrientationControls(camera, true);
    controls.connect();
    controls.update();
    window.removeEventListener('deviceorientation', setDeviceOrientationControls, true);

}

function getScale() {

    var deviceWidth;
    //设置压缩比
    deviceWidth = document.documentElement.clientWidth > 360 ? 360 : document.documentElement.clientWidth;
    document.documentElement.style.fontSize = (deviceWidth / 3.6) + 'px';

}

$("#gyro").on("click", function (event) {

    event.stopPropagation();
    isGyro = !isGyro;
    isGyro ? (
        $("#gyro").attr("class", "gyro_icon open"),
            $("#gyFont").attr("class", "font_y").text("陀螺仪-开")
    )
        : (
        $("#gyro").attr("class", "gyro_icon close"),
            $("#gyFont").attr("class", "font_w").text("陀螺仪-关")
    );

});

$("#eye").on("click", function (event) {

    event.stopPropagation();
    isEye = !isEye;
    isEye ? ($("#eye").attr("class", "eye_icon open"), $("#eyeFont").attr("class", "font_y").text("鱼眼-开"))
        : ($("#eye").attr("class", "eye_icon close"), $("#eyeFont").attr("class", "font_w").text("鱼眼-关"));

});

$("#vrIcon").on("click", function (event) {

    event.stopPropagation();
    isVr = !isVr;
    if (isVr) {

        isCom = false;
        commentShow();

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

$(".exitIcon").on("click", function (event) {

    event.stopPropagation();
    isVr = !isVr;
    !isVr ? ($(".exitIcon").hide(), $("#info").show(), $("#gyro").show()) : void 0;

});

$("#down").on("click", function (event) {

    event.stopPropagation();
    if (browser.versions.mobile && browser.versions.android) {

        window.location.href = "https://www.baidu.com/";

    } else if (browser.versions.mobile && browser.versions.ios) {

        window.location.href = "https://www.baidu.com/";

    }

});

function commentShow() {

    if (isCom) {

        setCommentPoint(vectorArray);
        $("#comment").attr("class", "icon_bg comment open");
        $("#comment p").attr("class", "font_y");

    }else {

        setCommentPoint([]);
        $("#comment").attr("class", "icon_bg comment close");
        $("#comment p").attr("class", "font_w");

    }

}
$("#comment").on("click", function (event) {

    event.stopPropagation();
    isCom = !isCom;
    commentShow();

});

$("#praise").on("click", function (event) {

    event.stopPropagation();

});

$("body").on("click", function (event) {

    event.preventDefault();
    isShow = !isShow;
    isVr ? $("#info").hide() : isShow ? $("#info").show() : $("#info").hide();

});