var deviceWidth;
(function () {
    function getScale() {

        //设置压缩比
        deviceWidth = document.documentElement.clientWidth > 360 ? 360 : document.documentElement.clientWidth;
        document.documentElement.style.fontSize = (deviceWidth / 7.5) + 'px';

    }

    //这是页面加载的时候第一次获取压缩比重绘
    getScale();

    //窗口变化的时候重置压缩比，比如自动横屏的时候
    $(window).on("resize", function () {

        getScale();
        getImgSize();

    });

})();
//扩展Jquery长按事件
$.fn.longPress = function (fn) {

    var timeout = undefined;
    var $this = this;

    for (var i = 0; i < $this.length; i++) {
        $this[i].addEventListener('touchstart', function (e) {

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

$(".scroll-img-td").longPress(function (e) {

    var x = scrollImgBox.scrollLeft + e.targetTouches[0].pageX;

    if (x > marquePic1.offsetWidth) {

        x = x - marquePic1.offsetWidth;

    }

});

var bigPic = $(".scroll-img-td img"), isPlay = true, isTurn = true, isShowMagBox = false, startX = 0, startY = 0,
    mStartX = 0, mStartY = 0,
    distance = {}, imgScale = 1, origin, mLeft, scrollImgBox = document.getElementById("scrollImgBox"),
    imgPageX, imgPageY,
    modalImg = document.getElementById("modalImg"), imgLeft = 0, imgTop,
    magnifierBox = document.getElementById("magnifier_box"),
    circleProgressWrapper = document.getElementById("circleProgress_wrapper"),
    imgHeight, imgBoxH, imgBoxW, lineProgressW = 0,
    littleImgH,                  //放大镜框出现的时候重置的底图的高
    progressBoxH, progressBar,  //直进度的外框长度
    prop,                         //通过真实图片获得宽高比
    timer,                        //用于定时器
    dirRight = true,             //控制放大镜自动滚动的时候的方向
    totalLen = 0, userInfoHeight, wrapHeight,
    comment = [
        {"x": 120, "y": 50, "text": "太美了", "userIcon": "./img/user.jpg"}, {
            "x": 700,
            "y": 90,
            "text": "这是哪儿",
            "userIcon": "./img/user.jpg"
        },
        {"x": 2300, "y": 450, "text": "真的好漂亮啊！！", "userIcon": "./img/user.jpg"}, {
            "x": 2830,
            "y": 150,
            "text": "一起去玩吧！",
            "userIcon": ""
        },
        {"x": 150, "y": 250, "text": "风景不错", "userIcon": "./img/user.jpg"}, {
            "x": 280,
            "y": 550,
            "text": "拍的真好啊",
            "userIcon": "./img/user.jpg"
        }
    ],                             //储存弹幕内容
    showBarrage = false;           //是否显示弹幕

//复制大图，用于无缝拼接
function getImgSize() {
    /*
     * 如果要获取图片的真实的宽度和高度有三点必须注意
     * 1、需要创建一个image对象：如这里的$("<img/>")
     * 2、指定图片的src路径
     * 3、一定要在图片加载完成后执行如.load()函数里执行
     * */
    $("#main_img_work").each(function (i) {
        //这里做下说明，$("<img/>")这里是创建一个临时的img标签，类似js创建一个new Image()对象！
        $("<img/>").attr("src", $(bigPic).attr("src")).load(function () {

            var realWidth = this.width;
            var realHeight = this.height;
            prop = (realWidth / realHeight);
            imgHeight = Math.round(parseInt($("#wrap").css("height")) / 2);
            progressBar = parseInt($(".progress_bar").css("width"));

            userInfoHeight = parseInt($(".user_info").css("height"));                                           //用户信息框的高
            wrapHeight = Math.round(parseInt($("#wrap").css("height")));
            imgBoxH = wrapHeight - (userInfoHeight * (0.05 / 1.1)) * 2;          //放大镜框的直径
            progressBoxH = wrapHeight;                                           //进度条框的直径(需要大于放大镜框的直径)
            imgBoxW = (wrapHeight - (userInfoHeight * (0.03 / 1.1)) * 2) * prop; //框内图片的实际宽度
            littleImgH = Math.round(parseInt($("#wrap").css("width")) / prop);    //放大镜框出现的时候重置的底图的高

            lineProgressSet();
            /*
             * 设置底图相关值
             * */
            $("#main_img_work").css("width", Math.round(imgHeight * prop));
            $("#marquePic2").css("left", Math.round(imgHeight * prop));
            marquePic2.innerHTML = marquePic1.innerHTML;

            /*
             * 设置放大镜框相关值
             * */
            $(".circleProgress_wrapper").css({"width": progressBoxH, "height": progressBoxH});//进度条框
            $(".circleProgress").css({"width": progressBoxH, "height": progressBoxH});        //进度条内圆框
            $("#magnifier_box").css({"width": imgBoxH, "height": imgBoxH});                   //设置放大镜框

            /*
             * 生成弹幕
             * */
            $(".littleComment").remove();
            if (comment && comment.length > 0) {

                for (var i = 0; i < comment.length; i++) {

                    if (comment[i].userIcon == '' || comment[i].userIcon == null || comment[i].userIcon == undefined) {

                        comment[i].userIcon = "./img/default_head.png";

                    }
                    var posX = parseInt((comment[i].x / realWidth) * Math.round(imgHeight * prop));
                    var posY = parseInt((comment[i].y / realHeight) * Math.round(imgHeight));

                    var str = "<div class='littleComment' style='left:" + posX + "px;top:" + posY + "px ' >";
                    str += "<img src=" + comment[i].userIcon + " alt='comment'/>";
                    str += "<span class='littleComment_span'>" + comment[i].text + "</span>";
                    str += "</div>";

                    $(".scroll-img-td").append(str);

                }

            }

            showBarrage ? ($(".littleComment").show(), $("#comment").attr("src", "img/comment_y.png"))
                : ($(".littleComment").hide(), $("#comment").attr("src", "img/comment_w.png"));

        });
    });
}

getImgSize();

/*
 * 返回滑动滚动底图
 * */
function resizeBack() {

    isShowMagBox = false;
    $(".progress_bar").show();
    $(".scroll-img-td").show();//换图，隐藏
    $("#scroll-img").removeAttr("style");
    $("#scrollImgBox").removeAttr("style");
    lineProgressSet();
    totalLen = 0;
    $(".user_info").css("top", 0);
    $(".scroll-img").css("top", 0);
    $(".describe").css("top", 0);
    $(".icon_box").css("top", 0);
}

/*
 * 圆形进度条设置，用于滑动过程中传入角度值
 * */
function setRotateDeg(leftNum, rightNum) {

    $(".leftCircle").css({
        "-webkit-transform": "rotate(" + leftNum + "deg)",
        "transform": "rotate(" + leftNum + "deg)"
    });
    $(".rightCircle").css({
        "-webkit-transform": "rotate(" + rightNum + "deg)",
        "transform": "rotate(" + rightNum + "deg)"
    });

}

/*
 * 播放按钮点击事件
 * */
$("#switch_div").on("click", function () {

    isPlay ? startRolling() : stopRolling();

});

/*
 * 弹幕点击事件
 * */
$("#comment_div").on("click", function () {

    showBarrage = !showBarrage;
    showBarrage ? ($(".littleComment").show(), $("#comment").attr("src", "img/comment_y.png"))
        : ($(".littleComment").hide(), $("#comment").attr("src", "img/comment_w.png"));

});

/*
 * 大放大镜点击
 * */
$(".big_magnifier").on("click", function () {

    // 停止自动播放
    stopRolling();

    var bgSrc = $(bigPic).attr("src");
    magnifierImg.style.left = parseInt(progressBoxH) / 2 + "px";
    $(".scroll-img-td").hide();                    //隐藏底图
    $("#scroll-img").css("height", littleImgH);                    //全景图高度设置，以宽度为100%做调整
    $("#scrollImgBox").css({"background": "url(" + bgSrc + ") no-repeat", "background-size": "auto 100%"});//将全景图作为背景图展现出来

    //设置横屏后的整体居中
    if ((window.orientation == 90 || window.orientation == -90) || !isTurn) {

        var topVal = (wrapHeight / 2) - ((userInfoHeight * 2 + littleImgH) / 2);
        $(".user_info").css("top", topVal + "px");
        $(".scroll-img").css("top", topVal + "px");
        $(".describe").css("top", topVal + "px");
        $(".icon_box").css("top", topVal + "px");

    }

    isShowMagBox = true;                   //显示放大镜框
    mLeft = -(parseInt(progressBoxH) / 2);
    circleProgressWrapper.style.left = -(parseInt(progressBoxH) / 2) + "px";    //重置位置，每次打开框都复位于最左边
    $(".big_magnifier").hide();           //放大镜大图标消失
    $("#magnifier_div").show();          //放大镜小图标出现
    $(".progress_bar").hide();            //直进度条消失
    $(".circleProgress_wrapper").show(); //放大镜框出现

    setRotateDeg(-135, -135);                             //进度条值恢复为初始状态,各自处于-135deg
    totalLen = 0;

});

/*
 * 小放大镜点击
 * */
$("#magnifier_div").on("click", function () {

    stopRolling();

    if (isShowMagBox) {

        //如果放大镜框已经打开，再次点击小放大镜则关闭它
        $(".circleProgress_wrapper").hide();
        $("#magnifier_div").show(); //放大镜小图标显示
        $(".big_magnifier").hide();  //放大镜大图标消失

        resizeBack();

    } else {

        $(".big_magnifier").show(); //放大镜大图标出现
        $("#magnifier_div").hide();  //放大镜小图标消失

    }


});

/*
 * transform 强制横屏
 * @param {String} className 用于获取旋转的包裹框的类名
 * @param {String} type      用于区分横屏和返回竖屏
 * */
function turnScreen(className, type) {

    stopRolling();
    var conW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var conH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    if (type == "turn") {

        $("#turn_div").find('img').attr("src", "img/toCross.png");//图标变化
        $(".big_magnifier").show();               //放大镜大图标显示，每次横屏都显示
        $("#magnifier_div").hide();                //放大镜小图标需要大图标消失后才存在

        document.documentElement.style.fontSize = ( 360 / 7.5) + 'px';
        getImgSize();                                             //重排img使拼接无缝

        //强制横屏（旋转90度，重新调整宽度）
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

        lineProgressSet()


    } else if (type == "back") {

        resizeBack();

        //返回竖屏（恢复）
        $(className).removeAttr("style");                            //去除强制横屏时候的样式设置，都是内联的，所以直接去掉
        $("#turn_div").find('img').attr("src", "img/toVertical.png");//图标变化
        $(".big_magnifier").hide();                   //竖屏不显示大放大镜图标
        $("#magnifier_div").hide();                   //竖屏不显示小放大镜图标
        $(".circleProgress_wrapper").hide();          //竖屏统一关闭放大框

        document.documentElement.style.fontSize = ( 360 / 7.5) + 'px';
        getImgSize();                                                //重排img使拼接无缝
        lineProgressSet();
        isTurn = true;                                               //重新恢复可横屏状态

    }

}

/*
 * 横竖屏点击事件
 * */
$("#turn_div").on("click", function () {

    var screenW = window.screen.width;              //屏宽
    var screenH = window.screen.height;             //屏高

    if (parseInt(screenH) > parseInt(screenW)) {      //竖屏：=>转横

        if (window.orientation == 0 || window.orientation == 180) {

            //只有屏高大于屏宽的竖屏状态下，才可以强制横屏
            if (isTurn) {

                isTurn = false;
                turnScreen(".wrap", "turn");       //接着是旋转

            } else {

                isTurn = true;
                turnScreen(".wrap", "back");       //如果竖屏锁定没开（即可自动横屏），那么需要把我们设置的强制横屏转回来

            }

        }

    }

});

//监听横竖屏状态，当用户竖屏锁定关闭的时候有效（就是说可以自动横屏，即orientation状态会发生变化的情况）
$(window).bind("orientationchange", function () {

    if (window.orientation == 90 || window.orientation == -90) {

        //用户将手机横屏的时候，如果机子本身开着横屏的话，需要马上转回去。
        turnScreen(".wrap", "back");

        $(".big_magnifier").show();       //横屏了，放大镜大图标显示
        $("#magnifier_div").hide();        //小放大镜图标需要大放大镜图标消失后显示

    } else {

        //这时候屏幕会自动旋转的，所以转成竖屏的时候去除强制横屏的状态
        resizeBack();

        $(".big_magnifier").hide();         //竖屏了，放大镜大图标消失
        $("#magnifier_div").hide();         //竖屏了，放大镜小图标消失
        $(".circleProgress_wrapper").hide();//竖屏了，放大镜框统一不显示

    }

});

//横屏刷新，如果自动横屏开着，则放大镜大图标显示
if (window.orientation == 90 || window.orientation == -90) {

    $(".big_magnifier").show();

}

/*
 * 停止滚动
 * */
function stopRolling() {

    isPlay = true;
    $("#switch_div").find('img').attr("src", "img/play.png");
    clearInterval(timer);

}

/*
 * 继续滚动
 * */
function startRolling() {

    isPlay = false;
    $("#switch_div").find('img').attr("src", "img/pause.png");
    (!isShowMagBox) ? timer = setInterval(function () {

        var offsetLen;
        if (parseInt($("#scrollImgBox").width()) > marquePic1.offsetWidth) {

            offsetLen = parseInt($("#scrollImgBox").width()) - marquePic1.offsetWidth;

        } else {

            offsetLen = 0;

        }

        lineProgressSet(); //设置进度条
        (marquePic1.offsetWidth <= scrollImgBox.scrollLeft + offsetLen) ? scrollImgBox.scrollLeft = 0
            : scrollImgBox.scrollLeft = scrollImgBox.scrollLeft + 5;
    }, 100) : timer = setInterval(function () {

        var halfWidth = parseInt(progressBoxH) / 2;                      //放大框宽的一半
        var mBox = Math.round(imgBoxW);                                  //放大框内的背景图的宽，需要用到
        var mMax = parseInt($("#scrollImgBox").css("width")) - halfWidth;//放大镜框left最大值（全景图宽-放大框宽的一半）
        if (dirRight) {

            mLeft = mLeft + 4;
            totalLen = totalLen + Math.round(imgBoxW) * (4 / parseInt($("#scrollImgBox").css("width")));

        } else {

            mLeft = mLeft - 4;
            totalLen = totalLen - Math.round(imgBoxW) * (4 / parseInt($("#scrollImgBox").css("width")));

        }

        //限制框的left值范围（自动滚动的情况下重置到最左）
        (mLeft >= mMax) ? dirRight = false : (mLeft <= -halfWidth) ? (mLeft = -halfWidth, dirRight = true) : void 0;//框滑动范围限制
        var totalPosition = Math.round(imgBoxW); //背景图可移动最大范围
        var totalSlide = halfWidth - totalLen;
        //背景图的background-position-x值设置范围
        (totalSlide > halfWidth) ? totalSlide = halfWidth
            : (totalSlide <= (-totalPosition) + halfWidth) ? totalSlide = (-totalPosition) + halfWidth : void 0;


        magnifierImg.style.left = totalSlide + "px";
        //进度条设置
        if (((totalLen / mBox) >= 0) && (totalLen / mBox) <= 0.5) {

            //滑动50%以内的时候，改变 rightCircle（0-50%）的进度条框
            var rightDeg = -135 + parseInt(360 * (totalLen / mBox));
            setRotateDeg(-135, rightDeg);                                            //leftCircle的角度不变，一直是-135deg（还没开始走）

        } else if (((totalLen / mBox) > 0.5) && (totalLen / mBox) <= 1) {

            //滑动50%以上内的时候，改变 leftCircle（50%-100%）的进度条框
            var leftDeg = -135 + parseInt(360 * (totalLen / mBox) - 180);
            setRotateDeg(leftDeg, 45);                                              //rightCircle的角度不变，一直是45deg（走到50%的状态）

        }

        circleProgressWrapper.style.left = mLeft + "px";                           //整个框移动

    }, 200);

}

/*
 * 直进度条设置
 * */

function lineProgressSet() {

    var offsetLen;
    if (parseInt($("#scrollImgBox").width()) > marquePic1.offsetWidth) {

        offsetLen = parseInt($("#scrollImgBox").width()) - marquePic1.offsetWidth;

    } else {

        offsetLen = 0;

    }

    lineProgressW = progressBar * scrollImgBox.scrollLeft / (marquePic1.offsetWidth - offsetLen);
    $(".auto_progress").css("width", lineProgressW);
    (lineProgressW >= progressBar) ? lineProgressW = 0 : void 0;

}

/*
 * 实现图片循环滚动的方法
 * @param {Number} mLen 每次方法滚动的距离
 * */
function Marquee(mLen) {

    var offsetLen;
    if (parseInt($("#scrollImgBox").width()) > marquePic1.offsetWidth) {

        offsetLen = parseInt($("#scrollImgBox").width()) - marquePic1.offsetWidth;

    } else {

        offsetLen = 0;

    }

    lineProgressSet(); //设置进度条
    (marquePic1.offsetWidth <= scrollImgBox.scrollLeft + offsetLen) ? scrollImgBox.scrollLeft = 0
        : scrollImgBox.scrollLeft = scrollImgBox.scrollLeft + mLen;

}

/*
 * 全局放大镜框移动以及框内背景图设置处理函数
 * @param {Number} mLen 每次方法滑动/滚动的距离
 * @param {String} type 动画方式，区分滑动和滚动两种情况
 * */
function magnifierMove(mLen, type) {

    var halfWidth = parseInt(progressBoxH) / 2;                      //放大框宽的一半
    var mBox = Math.round(imgBoxW);                                  //放大框内的背景图的宽，需要用到
    var mMax = parseInt($("#scrollImgBox").css("width")) - halfWidth;//放大镜框left最大值（全景图宽-放大框宽的一半）

    //slide表示是手动滑动，scroll表示自动滚动的状态
    if (type == "slide") {

        //限制框的left值范围（手滑的情况下只能到最左/最右边）
        mLeft = mLeft + mLen;
        dirRight = true;
        (mLeft >= mMax) ? mLeft = mMax : (mLeft <= -halfWidth) ? mLeft = -halfWidth : void 0;   //框滑动范围限制
        totalLen = totalLen + Math.round(imgBoxW) * (mLen / parseInt($("#scrollImgBox").css("width")));
        (totalLen <= 0) ? totalLen = 0 : (totalLen > mBox) ? totalLen = mBox : void 0;

    } else if (type == "scroll") {

        if (dirRight) {

            mLeft = mLeft + mLen;
            totalLen = totalLen + Math.round(imgBoxW) * (mLen / parseInt($("#scrollImgBox").css("width")));

        } else {

            mLeft = mLeft - mLen;
            totalLen = totalLen - Math.round(imgBoxW) * (mLen / parseInt($("#scrollImgBox").css("width")));

        }

        //限制框的left值范围（自动滚动的情况下重置到最左）
        (mLeft >= mMax) ? dirRight = false : (mLeft <= -halfWidth) ? (mLeft = -halfWidth, dirRight = true) : void 0;//框滑动范围限制

    }

    var totalPosition = Math.round(imgBoxW); //背景图可移动最大范围
    var totalSlide = halfWidth - totalLen;
    //背景图的background-position-x值设置范围
    (totalSlide > halfWidth) ? totalSlide = halfWidth
        : (totalSlide <= (-totalPosition) + halfWidth) ? totalSlide = (-totalPosition) + halfWidth : void 0;


    magnifierImg.style.left = totalSlide + "px";
    //进度条设置
    if (((totalLen / mBox) >= 0) && (totalLen / mBox) <= 0.5) {

        //滑动50%以内的时候，改变 rightCircle（0-50%）的进度条框
        var rightDeg = -135 + parseInt(360 * (totalLen / mBox));
        setRotateDeg(-135, rightDeg);                                            //leftCircle的角度不变，一直是-135deg（还没开始走）

    } else if (((totalLen / mBox) > 0.5) && (totalLen / mBox) <= 1) {

        //滑动50%以上内的时候，改变 leftCircle（50%-100%）的进度条框
        var leftDeg = -135 + parseInt(360 * (totalLen / mBox) - 180);
        setRotateDeg(leftDeg, 45);                                              //rightCircle的角度不变，一直是45deg（走到50%的状态）

    }

    circleProgressWrapper.style.left = mLeft + "px";                           //整个框移动

}

/*
 * 全局滑动处理函数
 * @param {Number} mLen 每次方法滑动的距离
 * */
function slideProcessing(len) {

    lineProgressSet(); //进度条设置

    var offsetLen;
    if (parseInt($("#scrollImgBox").width()) > marquePic1.offsetWidth) {

        offsetLen = parseInt($("#scrollImgBox").width()) - marquePic1.offsetWidth;

    } else {

        offsetLen = 0;

    }

    if (marquePic1.offsetWidth <= scrollImgBox.scrollLeft + offsetLen) {

        scrollImgBox.scrollLeft = 0;

    } else {

        scrollImgBox.scrollLeft = scrollImgBox.scrollLeft + len;
        // 如果最近一次的向右滑动，图片滑动到了左边的边缘，重置一下
        if (scrollImgBox.scrollLeft <= 0) {

            scrollImgBox.scrollLeft = marquePic1.offsetWidth - (offsetLen + 2); // 目的是为了能继续向右滑动
            console.log(scrollImgBox.scrollLeft)

        }

        // 如果最近一次的向左滑动，图片滑动到了右边的边缘，重置一下
        if (scrollImgBox.scrollLeft >= (marquePic1.offsetWidth - offsetLen)) {

            scrollImgBox.scrollLeft = 0;                        // 目的是为了能继续向左滑动

        }
    }
}

/*
 * 放大镜开始拖动
 * */
var magnifierStartHandler = function (event) {

    // 停止自动播放
    stopRolling();
    mStartX = event.touches[0].pageX;
    mStartY = event.touches[0].pageY;

};

/*
 * 放大镜拖动过程
 * */
var magnifierMoveHandler = function (event) {

    event.preventDefault();

    var mTouch = event.touches[0];
    var mMoveX = mTouch.pageX;
    var mMoveY = mTouch.pageY;
    var mDy = mMoveY - mStartY;
    var mLen = mMoveX - mStartX;

    !isTurn ? mLen = mDy : void 0;    //如果已经强制横屏，则滑动判断量改为Y方向
    mLen = mLen / 50;                 //每次滑动的距离，/50为了减速

    magnifierMove(mLen, "slide");   //滑动方式

};

function getDistance(start, stop) {

    return Math.sqrt(Math.pow((stop.x - start.x), 2) + Math.pow((stop.y - start.y), 2));

}

function getOrigin(first, second) {
    return {
        x: (first.x + second.x) / 2,
        y: (first.y + second.y) / 2
    };
}

//双指缩放处理
function setScaleAnimation(element, scale) {

    //矩阵缩放
    element.style["transform"] = 'matrix(' + scale + ', 0, 0, ' + scale + ',  0 , 0)';
    var rLeft = (imgScale - 1) * (imgHeight * prop / 2);//右划的时候最小left
    var lLeft = (parseInt($("#wrap").css("width")) + rLeft) - (imgHeight * prop * imgScale);

    if (parseInt($("#targetImg").css("left")) >= rLeft) {

        imgLeft = rLeft;
        $("#targetImg").css({"left": imgLeft});

    }

    if (parseInt($("#targetImg").css("left")) <= lLeft) {

        imgLeft = lLeft;
        $("#targetImg").css({"left": imgLeft});

    }

}

function modalImgShow(event) {

    imgLeft = 0;
    imgTop = parseInt(document.documentElement.style.fontSize) * 1.1;

    if (scrollImgBox.scrollLeft + parseInt($("#wrap").css("width")) > marquePic1.offsetWidth) {

        imgLeft = -((marquePic1.offsetWidth - parseInt($("#wrap").css("width"))) / marquePic1.offsetWidth) * (imgHeight * prop);

    } else {

        imgLeft = -(scrollImgBox.scrollLeft / marquePic1.offsetWidth) * (imgHeight * prop);

    }

    $("#targetImg").css({"left": imgLeft + "px", "top": imgTop + "px"});

    $(".modalImg").show();

    distance.start = getDistance({
        x: event.touches[0].pageX,
        y: event.touches[0].pageY
    }, {
        x: event.touches[1].pageX,
        y: event.touches[1].pageY
    });

}

function moveImg(ev) {

    var imgTouch = ev.touches[0];
    var imgMoveX = imgTouch.pageX;
    var imgMoveY = imgTouch.pageY;
    var imgLenX, imgLenY;
    var downTop = userInfoHeight - ((imgHeight / 2 + userInfoHeight) - (imgHeight * imgScale / 2));//下划的时候最大top
    var upTop = downTop - ((imgHeight * imgScale) - (imgHeight * 2));//上划的时候最小top
    var rLeft = (imgScale - 1) * (imgHeight * prop / 2);//右划的时候最小left
    var lLeft = (parseInt($("#wrap").css("width")) + rLeft) - (imgHeight * prop * imgScale);

    if (!isTurn) {

        imgLenX = (imgMoveY - imgPageY) / 10;
        imgLenY = (imgMoveX - imgPageX) / 10;
        imgLeft = imgLeft + imgLenX;
        imgTop = imgTop - imgLenY;
        //设置top边界
        if (imgLenY <= 0) {

            //向下滑动图片
            if (imgTop >= downTop) {

                imgTop = downTop;

            }

        }
        else {

            //向上滑动图片
            if (imgHeight * imgScale >= imgHeight * 2) {

                //图片超出屏幕，可上划部分
                if (imgTop <= upTop) {

                    imgTop = upTop;

                }


            } else {

                //图片还未超出屏幕，不做上划处理
                imgTop = downTop;

            }

        }
    } else {

        imgLenX = (imgMoveX - imgPageX) / 10;
        imgLenY = (imgMoveY - imgPageY) / 10;
        imgLeft = imgLeft + imgLenX;
        imgTop = imgTop + imgLenY;

        //设置top边界
        if (imgLenY >= 0) {

            //向下滑动图片
            if (imgTop >= downTop) {

                imgTop = downTop;

            }

        }
        else {

            //向上滑动图片
            if (imgHeight * imgScale >= imgHeight * 2) {

                //图片超出屏幕，可上划部分
                if (imgTop <= upTop) {

                    imgTop = upTop;

                }


            } else {

                //图片还未超出屏幕，不做上划处理
                imgTop = downTop;

            }

        }
    }

    //设置left边界
    if (imgLenX >= 0) {

        //已经到了左边沿，不能继续右拖
        if (imgLeft >= rLeft) {

            imgLeft = rLeft;

        }

    }
    else {

        if (imgLeft <= lLeft) {

            imgLeft = lLeft;

        }
    }

    $("#targetImg").css({"left": imgLeft, "top": imgTop});

}
/*
 * 滑动开始事件处理
 * */
var startHandler = function (event) {

    event.preventDefault();
    // 停止自动播放
    stopRolling();
    startX = event.touches[0].pageX;
    startY = event.touches[0].pageY;

    if (window.orientation == 90 || window.orientation == -90) {

        $("#magnifier_div").show();   //横屏开着，则小放大镜图标显示

    } else {

        !isTurn ? $("#magnifier_div").show() : $("#magnifier_div").hide();  //如果处于强制横屏，则显示小放大镜图标

    }

    $(".big_magnifier").hide();  //滑动开始，大放大镜图标必须消失

    if (event.touches.length === 2) {

        //先设置触点范围
        var theMinX = wrapHeight - (imgHeight + userInfoHeight);
        var theMaxX = theMinX + imgHeight;

        //强制横屏的情况
        if (!isTurn) {

            if ((event.touches[0].pageX > theMinX) && (event.touches[1].pageX > theMinX)
                && (event.touches[0].pageX < theMaxX) && (event.touches[1].pageX < theMaxX)) {

                modalImgShow(event);

            }
        }

        //自动横屏或者竖屏的情况
        if ((window.orientation == 90 || window.orientation == -90) || isTurn) {

            if ((event.touches[0].pageY > userInfoHeight) && (event.touches[1].pageY > userInfoHeight)
                && (event.touches[0].pageY < (imgHeight + userInfoHeight)) && (event.touches[1].pageY < (imgHeight + userInfoHeight))) {

                modalImgShow(event);

            }

        }

    }

};

function imgStartHandler(event) {

    event.preventDefault();

    if (event.touches.length === 2) {

        distance.start = getDistance({
            x: event.touches[0].pageX,
            y: event.touches[0].pageY
        }, {
            x: event.touches[1].pageX,
            y: event.touches[1].pageY
        });

    } else if (event.touches.length === 1) {

        imgPageX = event.touches[0].pageX;
        imgPageY = event.touches[0].pageY;

    }

}

/*
 * 滑动过程中事件处理
 * */
var moveHandler = function (event) {

    event.preventDefault();

    var touch = event.touches[0];
    var moveX = touch.pageX;
    var moveY = touch.pageY;
    var dY = moveY - startY;
    var len = moveX - startX;

    !isTurn ? len = dY : void 0;   //如果已经强制横屏，则滑动判断量改为Y方向

    len = len * -1;   // 为了矫正方向
    len = len / 10;   // 为了减速

    if (event.touches.length === 2) {

        distance.stop = getDistance({
            x: event.touches[0].pageX,
            y: event.touches[0].pageY
        }, {
            x: event.touches[1].pageX,
            y: event.touches[1].pageY
        });

        var sc = distance.stop / distance.start;

        //控制每次缩放的比例一致
        if (sc > 1) {

            imgScale = imgScale + 0.05;

        } else if (sc < 1) {

            imgScale = imgScale - 0.08;

        }

        //缩放值位于0.8到2之间的时候才改变缩放中心，相当于超出这个范围，不再进行缩放
        if (imgScale <= 10 && imgScale >= 1) {

            origin = getOrigin({
                x: event.touches[0].pageX,
                y: event.touches[0].pageY
            }, {
                x: event.touches[1].pageX,
                y: event.touches[1].pageY
            });

        }

        (imgScale >= 10) ? imgScale = 10 : void 0;
        (imgScale <= 1) ? imgScale = 1 : void 0;

        setScaleAnimation(targetImg, imgScale);

    } else {

        slideProcessing(len);

    }

};

var imgMoveHandler = function (event) {

    event.preventDefault();

    if (event.touches.length === 2) {

        distance.stop = getDistance({
            x: event.touches[0].pageX,
            y: event.touches[0].pageY
        }, {
            x: event.touches[1].pageX,
            y: event.touches[1].pageY
        });

        var sc = distance.stop / distance.start;

        //控制每次缩放的比例一致
        if (sc > 1) {

            imgScale = imgScale + 0.05;

        } else if (sc < 1) {

            imgScale = imgScale - 0.08;
            if (imgScale <= 1) {
                $(".modalImg").hide();
            }

        }

        //缩放值位于0.8到2之间的时候才改变缩放中心，相当于超出这个范围，不再进行缩放
        if (imgScale <= 10 && imgScale >= 1) {

            origin = getOrigin({
                x: event.touches[0].pageX,
                y: event.touches[0].pageY
            }, {
                x: event.touches[1].pageX,
                y: event.touches[1].pageY
            });

        }

        (imgScale >= 10) ? imgScale = 10 : void 0;
        (imgScale <= 1) ? imgScale = 1 : void 0;

        setScaleAnimation(targetImg, imgScale);


    } else if (event.touches.length === 1) {

        moveImg(event);

    }

};
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

scrollImgBox.addEventListener("touchstart", startHandler, false);
scrollImgBox.addEventListener("touchmove", moveHandler, false);
modalImg.addEventListener("touchstart", imgStartHandler, false);
modalImg.addEventListener("touchmove", imgMoveHandler, false);
magnifierBox.addEventListener("touchstart", magnifierStartHandler, false);
magnifierBox.addEventListener("touchmove", magnifierMoveHandler, false);



