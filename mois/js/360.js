
var fov = 70, scene, camera, renderer, effect, element, mesh;
var alpha, onPointerDownPointerX, onPointerDownPointerY, onPointerDownLon, onPointerDownLat,
    lon = 0, phi = 0, theta = 0, lat = 0, distance = {}, isPlay = false, isGyro = false, timer, isVRTime = false,
    isTurn = false;

var container = document.getElementById('container');
var isIos = false;
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
            QQ: u.match(/\sQQ/i) == " QQ" //是否QQ
        };
    }(),
    language: (navigator.browserLanguage || navigator.language).toLowerCase()
};

if (browser.versions.mobile || browser.versions.android || browser.versions.ios) {

    if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {

        isIos = true;

    } else if (/(Android)/i.test(navigator.userAgent)) {
    }

}
init();

//播放开关
$("#switch_div").on("click", function () {

    pic_scroll();

});

//退出cardboard
$("#exit").on("click", function () {

    isVRTime = false;
    $("#showInfo").show();
    $("#vrIcon").show();
    $("#exit").hide();
    turnScreen(".wrap", "back");

});

//cardboard切换
$("#vrIcon").on("click", function (event) {

    event.stopPropagation();
    isVRTime = !isVRTime;

    if (isVRTime) {

        (browser.versions.android && browser.versions.QQ) ? $(document).fullScreen(true) : void 0;
        $("#showInfo").hide();
        $("#exit").show();

        setTimeout(function () {

            if (window.orientation == 0 || window.orientation == 180) {

                $(".wrap").removeAttr("style");
                turnScreen(".wrap", "turn");

            }

        }, 300);

        isGyro = true;
        deviceOrientation();

    }

});

//陀螺仪开关
$("#gyro").on("click", function () {

    isGyro = !isGyro;
    deviceOrientation();

});

document.addEventListener('touchstart', onTouchStart, false);
document.addEventListener('touchmove', onTouchMove, false);

//构建模型
function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 1000);
    camera.target = new THREE.Vector3(0, 0, 0);
    camera.position.set(0, 0, 0);
    scene.add(camera);

    mesh = new THREE.Mesh(new THREE.CylinderGeometry(150, 150, 210, 100, 100, true),
        new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('img/28.jpg'),
            transparent: true,
            side: THREE.DoubleSide
        }));
    mesh.scale.x = -1;
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    element = renderer.domElement;
    container.appendChild(renderer.domElement);

    effect = new THREE.StereoEffect(renderer);
    animate();
    window.addEventListener('resize', onWindowResize, false);

}

//渲染动画
function animate() {

    requestAnimationFrame(animate);
    var width = window.innerWidth;
    var height = window.innerHeight;

    camera.fov = fov;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    lat = Math.max(-90, Math.min(90, lat));
    phi = THREE.Math.degToRad(90 - lat);
    theta = THREE.Math.degToRad(lon);

    camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
    camera.target.y = 500 * Math.cos(phi);
    camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(camera.target);

    if (isVRTime) {

        $("#vrIcon").hide();
        if (isTurn) {

            //画布大小设置
            renderer.setSize(parseInt($("#wrap").css("width")), parseInt($("#wrap").css("height")));
            effect.setSize(parseInt($("#wrap").css("width")), parseInt($("#wrap").css("height")));
            camera.aspect = parseInt($("#wrap").css("width")) / parseInt($("#wrap").css("height"));

        } else {

            renderer.setSize(width, height);
            effect.setSize(width, height);
            camera.aspect = width / height;

        }

        camera.updateProjectionMatrix();
        effect.render(scene, camera);

    } else {

        $("#vrIcon").show();
        $(".turnIcon").hide();
        renderer.setSize(width, height);
        effect.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);

    }

}

//窗口变化监听
function onWindowResize() {

    getScale();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    function turnSet() {

        if (window.orientation == 90 || window.orientation == -90) {

            turnScreen(".wrap", "back");

        } else {

            if (isVRTime) {

                $(".wrap").removeAttr("style");
                turnScreen(".wrap", "turn");

            }

        }

    }

    //开启横屏的情况下回转
    if (isIos) {

        setTimeout(function () {

            turnSet();

        }, 300);

    } else {

        turnSet();

    }

}

//强制横屏
function turnScreen(className, type) {

    var conW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var conH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    if (type == "turn") {

        isTurn = true;
        //旋转90度，宽高置换
        $(className).width(conH);
        $(className).height(conW);
        $(className).css({
            "transform-origin": "50% 50%",
            "-webkit-transform-origin": "50% 50%",
            "transform": "rotate(90deg) translate(" + ((conH - conW) / 2) + "px," + ((conH - conW) / 2) + "px)",
            "-webkit-transform": "rotate(90deg) translate(" + ((conH - conW) / 2) + "px," + ((conH - conW) / 2) + "px)",
            "-moz-transform": "rotate(90deg) translate(" + ((conH - conW) / 2) + "px," + ((conH - conW) / 2) + "px)",
            "-ms-transform": "rotate(90deg) translate(" + ((conH - conW) / 2) + "px," + ((conH - conW) / 2) + "px)"
        });

    } else if (type == "back") {

        isTurn = false;
        //返回竖屏,去除强制横屏时候的样式设置，都是内联的，所以直接去掉
        $(className).removeAttr("style");

    }

}

//陀螺仪设置
function deviceOrientation() {

    if (isGyro) {

        stopRolling();
        $("#gyro").attr("class", "gyro_icon open");
        window.addEventListener('deviceorientation', deviceEvent, false);

    } else {

        $("#gyro").attr("class", "gyro_icon close");
        window.removeEventListener('deviceorientation', deviceEvent, false);

    }

}

function pic_scroll() {

    if (!isPlay) {

        startRolling();

    } else {

        stopRolling();

    }

}

function startRolling() {

    isPlay = true;
    isGyro = false;
    deviceOrientation();
    $("#switch_div").attr("class", "switch_div pause");
    timer = setInterval(function () {

        lon += 0.2;

        if (Math.abs(lon) > 360) {

            lon = 0;

        }

    }, 20);

}

function stopRolling() {

    isPlay = false;
    $("#switch_div").attr("class", "switch_div play");
    clearInterval(timer);

}

//陀螺仪设置
function deviceEvent(event) {

    if (alpha) {

        if (alpha - event.alpha >= 0) {

            if (alpha - event.alpha >= 0.3) {

                lon += 1.2;

            }

        } else if (alpha - event.alpha <= 0) {

            if (alpha - event.alpha <= -0.3) {

                lon -= 1.2;

            }

        }
    }

    alpha = event.alpha;

}

function getDistance(start, stop) {

    return Math.sqrt(Math.pow((stop.x - start.x), 2) + Math.pow((stop.y - start.y), 2));

}

function onTouchStart(event) {

    event.target.id != "switch_div" ? stopRolling() : void 0;

    onPointerDownPointerX = event['touches'][0].clientX;
    onPointerDownPointerY = event['touches'][0].clientY;

    onPointerDownLon = lon;
    onPointerDownLat = lat;

    if (event.touches.length === 2) {

        distance.start = getDistance({
            x: event.touches[0].pageX,
            y: event.touches[0].pageY
        }, {
            x: event.touches[1].pageX,
            y: event.touches[1].pageY
        });

    }

}

function onTouchMove(event) {

    event.preventDefault();

    if (event.touches.length < 2) {

        //设定常量效果比较平滑
        if (isTurn) {

            (onPointerDownPointerY - event['touches'][0].clientY) > 0 ? lon += 2 : lon -= 2;

        } else {

            (onPointerDownPointerX - event['touches'][0].clientX) > 0 ? lon += 2 : lon -= 2;

        }

        //lon += ( onPointerDownPointerX - event['touches'][0].clientX ) * 0.01;
        //lat = ( event['touches'][0].clientY - onPointerDownPointerY ) * 0.3 + onPointerDownLat;

        if (Math.abs(lon) > 360) {

            lon = 0;

        }

    } else if (event.touches.length === 2) {

        distance.stop = getDistance({
            x: event.touches[0].pageX,
            y: event.touches[0].pageY
        }, {
            x: event.touches[1].pageX,
            y: event.touches[1].pageY
        });

        var scaleNum = distance.stop / distance.start;

        scaleNum > 1 ? fov -= 0.3 : fov += 0.3;
        fov <= 30 ? fov = 30 : fov >= 70 ? fov = 70 : void 0;

    }


}

