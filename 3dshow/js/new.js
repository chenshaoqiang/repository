$(document).ready(function () {

    var TRANSFORM = 'transform',limitFlag = false,curImgIndex = 0,imgArray,descList = [],timer = null,secondTimer = null,playStatus = true
        ,distance = {},imgScale = 1,origin,doubleTouch = false,maxTouchHeight = parseInt($("#product1").css("width")),allImg = [],
        iLoaded = 0,iNow = 0,iCount = 0,lastImg = null,num = iNow,speed = 0,startX, lastX,mStartX , mStartY, currentLeft = 0,currentTop = 0
        ,musicPlay = false,defaultDate = new Date().getTime(),ifAutoPlayFlag = true,ifOpenBarrageFlag = false;
    var hintLayer = document.querySelector('.swx-hint-layer');
    var hintCon = document.querySelector('.hint-img-box');
    var hintImg = document.querySelector('.hint-change-icon');
    var hintTxt = document.querySelector('.swx-hint-txt');
    var picAuthoPlay = document.querySelector('.swx-pic-play');
    var myAuto = document.getElementById('audio');
    var winW = document.documentElement.clientWidth;
    var winH = document.documentElement.clientHeight;
    var oLis = $("li.section");

    (typeof document.body.style.webkitTransform !== undefined) ? TRANSFORM = 'webkitTransform' :void 0;
    picAuthoPlay.addEventListener("touchstart", picTouchPlay, false);//点击全景图播放暂停
    $(".swx-music").bind( "click", tapMusicIcon);//点击切换音乐播放和暂停效果
    $(".swx-barrage").bind( "click", tapBarrageIcon);//点击弹幕
    var playIconTop = parseInt($(".swx-pic-play").css("top"));

    //非空判断
    function isEmpty(obj){

        for(var name in obj) {

            if(obj.hasOwnProperty(name)) {

                return false;

            }

        }

        return true;

    }

    //获取放大中心
    function getOrigin(first, second) {
        return {
            x: (first.x + second.x) / 2,
            y: (first.y + second.y) / 2
        };
    }

    //计算两点的中心
    function getDistance(start, stop) {

        return Math.sqrt(Math.pow((stop.x - start.x), 2) + Math.pow((stop.y - start.y), 2));

    }

    //套图切换
    function chooseProd(){

        limitFlag ? (
            $('.product1').hide(),
                $('.img_desc1').hide(),
                $('.product2').show(),
                $('.img_desc2').show())
            : ($('.product1').show(),
            $('.img_desc1').show(),
            $('.img_desc2').hide(),
            $('.product2').hide());

    }

    //点击全景图播放暂停
    function picTouchPlay(){

        ifAutoPlayFlag = !ifAutoPlayFlag;
        checkStatus();

    }

    //播放按钮切换处理
    function checkStatus(){

        if(!limitFlag){

            if(ifAutoPlayFlag){

                $('.swx-pic-play').attr('class','swx-pic-play play');
                startMove();

            }else{

                $('.swx-pic-play').attr('class','swx-pic-play pause');
                stopMove();

            }

        }else{

            if(ifAutoPlayFlag){

                $('.swx-pic-play').attr('class','swx-pic-play play');
                limitFlagPlay();

            }else{

                $('.swx-pic-play').attr('class','swx-pic-play pause');
                limitFlagStop();

            }

        }


    }

    //双指缩放处理
    function setScaleAnimation(element,scale) {

        var centerX = parseInt($("#product1").css("width")) / 2;
        var centerY = parseInt($("#product1").css("width")) / 2;
        var disX = (centerX - origin.x) / parseInt($("#product1").css("width")) * (parseInt($("#product1").css("width")) * scale) - (centerX - origin.x);
        var disY = (centerY - origin.y) / parseInt($("#product1").css("width")) * (parseInt($("#product1").css("width")) * scale) - (centerY - origin.y);

        //矩阵缩放
        element.style[TRANSFORM] = 'matrix(' + scale + ', 0, 0, ' + scale + ',  0 , 0)';
        $(element).css({"left":disX + currentLeft,"top":disY + currentTop});

        if($(element).attr("class") == "previous-image"){

            // 整体套图缩放和位移
            $(".previous-image").css({

                "webkit-transform":"scale(" + scale + ")",
                "transform":"scale(" + scale + ")",
                "left":disX + currentLeft,
                "top":disY + currentTop
            });

        }

    }

    //图片切换过程元素处理
    function showOneHideAll(elements,nowIndex,className){

        if(elements){

            [].forEach.call(elements,function(){

                //除了自己其他所有的隐藏(通过索引来判断当前这张是不是自己)
                if(nowIndex != arguments[1]){

                    arguments[0].style.display = "none";

                }

                arguments[0].className = className;

            });

        }

    }

    //第一套图自动播放事件
    function startMove() {

        playStatus = false;

        timer = setInterval(function (){

            num = parseInt(num) + 1;

            (num > imgArray.length - 1) ? num = 0 : void 0;
            !!(lastImg) ? lastImg.style.display = 'none' : void 0;
            !!(allImg[parseInt(num)]) ? allImg[parseInt(num)].style.display = 'block' : void 0;

            if(descList.length > 0){

                if(img_desc1.innerHTML != descList[parseInt(num)]){

                    img_desc1.innerHTML = descList[parseInt(num)];

                }

            }

            var descH = parseInt($("#img_desc1").css("height"));
            $(".swx-pic-play").css("top",(playIconTop + descH) + "px");
            lastImg = allImg[parseInt(num)];
            //console.log(new Date().getTime() - defaultDate);
            defaultDate = new Date().getTime();

        }, 800);

    }

    //第一套图停止播放事件
    function stopMove() {

        clearInterval(timer);
        timer = null;
        playStatus = true;

    }

    //自动切换热点图
    function limitFlagPlay(){

        secondTimer = setInterval(function(){

            var oDiv = $("div.slideImgDiv");

            curImgIndex = curImgIndex + 1;
            showOneHideAll(oDiv,curImgIndex,"slideImgDiv");

            if(curImgIndex == imgArray.length){

                curImgIndex = 0;

            }

            oDiv[curImgIndex].style.webkitTransform = "translateX(0,0)";
            oDiv[curImgIndex].className = "slideImgDiv zIndex";
            oDiv[curImgIndex].style.display = "block";
            $(".img_desc2").html(descList[curImgIndex]);

        },1500);

    }

    //停止切换热点图
    function limitFlagStop(){

        clearInterval(secondTimer);
        secondTimer = null;

    }

    //操作全景图提示
    function loadToDoHint(){
        setTimeout(function(){

            hintCon.style.marginBottom = '5px';
            hintTxt.innerHTML = '可手动放大缩小';
            $(hintImg).attr('class','hint-change-icon magnify');

        },2000);
        setTimeout(function(){

            hintLayer.remove();

        },4000);
    }

    //图片缩放后的拖动事件
    function moveImg(ev){

        var maxPosition = (parseInt($("#product1").css("width")) * imgScale) / 2 - (parseInt($("#product1").css("width")) / 2);//缩放后的图宽
        var mTouch = ev.touches[0];
        var mMoveX = mTouch.pageX;
        var mMoveY = mTouch.pageY;
        var mLenX = (mMoveX - mStartX) / 20; //X轴位移
        var mLenY = (mMoveY - mStartY) / 20; //Y轴位移

        currentLeft = currentLeft + mLenX;
        currentTop = currentTop + mLenY;

        if(imgScale <= 1){

            (currentLeft <= maxPosition) ? currentLeft = maxPosition
                : (currentLeft > -maxPosition) ? currentLeft = -maxPosition : void 0;

            (currentTop <= maxPosition) ? currentTop = maxPosition
                : (currentTop > -maxPosition) ? currentTop = -maxPosition : void 0;

        }else{

            if(mLenX >= 0){

                if(currentLeft >= maxPosition){

                    currentLeft = maxPosition;

                }

            }else{

                if(currentLeft <= -maxPosition){

                    currentLeft = -maxPosition;

                }

            }

            if(mLenY >= 0){

                if(currentTop >= maxPosition){

                    currentTop = maxPosition;

                }

            }else{

                if(currentTop <= -maxPosition){

                    currentTop = -maxPosition;

                }

            }

        }

        $(ev.target).css({

            "left":currentLeft,
            "top":currentTop

        });

        if($(ev.target).attr("class") == "previous-image"){

            // 整体套图缩放和位移
            $(".previous-image").css({
                "left":currentLeft,
                "top":currentTop

            });

        }
    }

    //音乐播放事件处理
    function tapMusicIcon(){

        musicPlay = !musicPlay;

        if(musicPlay){

            $('.swx-music').attr('class','swx-music play');
            myAuto.play();

        }else{

            $('.swx-music').attr('class','swx-music pause');
            myAuto.pause();
        }

    }

    //弹幕点击事件处理
    function tapBarrageIcon(){

        ifOpenBarrageFlag = !ifOpenBarrageFlag;
        if(ifOpenBarrageFlag){

            $('.zpg-barrage-container').show();
            $('.swx-barrage').attr('class','swx-barrage open');

        }else{
            $('.zpg-barrage-container').hide();
            $('.swx-barrage').attr('class','swx-barrage close');

        }
    }

    loadToDoHint();
    chooseProd();
    showImagesFromLocalJson('data/example.json');
    //showImagesWithId(getWorkId());
    //获取?后面的workId
    function getWorkId() {

        var url = location.search;

        if(url.charAt(0) == "?") {

            url = url.substring(1);

        }

        return url;

    }

    //从本地获取
    function showImagesFromLocalJson(jsonFile){

        $.getJSON(jsonFile, function(data){

            if (data.code != 0) {

                console.log("code: "+data.code);

            } else {

                processJsonData(data.data);

            }

        });
    }

    //从后台获取
    function showImagesWithId(workId){

        var url = '/api/work/id/' + workId;
        $.get(url, function(data){

            if (data.code!=0){

                console.log("code="+data.code);
                alert("作品不存在");

            } else {

                var jsonData = data.data;
                processJsonData(jsonData);
            }

        });
    }

    //后台数据处理函数
    function processJsonData(jsonData){
        document.title = jsonData.title;
        jsonData.title != null ? $(".goods_name").text(jsonData.title) : void 0;
        jsonData.desc != null ? $(".goods_item_desc").text(jsonData.desc) : void 0;
        jsonData.price != null ? $("#goods_buy_price").text("价格：￥"+ jsonData.price.toFixed(2)) : void 0;
        jsonData.saleCount != null ? $("#goods_buy_count").text("月销量: "+jsonData.saleCount) : void 0;
        jsonData.likeCount != null ? $(".item_like").text(jsonData.likeCount) : void 0;
        jsonData.userName != null ? $(".user_name").text(jsonData.userName) : void 0;
        if(/^http/.test(jsonData.link)){
            $(".goods_buy_left_1").attr("href",jsonData.link);
        }else{
            $(".goods_buy_left_1").attr("href","http://" + jsonData.link);
        }

        //pic list
        if (jsonData.picUrls != null){

            imgArray = [];

            for (var i = 0; i < jsonData.picUrls.length; i++) {

                //imgArray.push('http://123.57.3.33:9000/pic/work/'+jsonData.picUrls[i]);
                //imgArray.push('/pic/work/'+jsonData.picUrls[i]);
                imgArray.push(jsonData.picUrls[i]);

            }
            var iImgCount = imgArray.length;//IMG总张数

            //旋转图片跟随简介
            function imgFollowDisc(data,className){

                descList = [];

                if(data.length == 0){

                    $("." + className).hide();

                }else {

                    var index = new Array;

                    for(var key in data){

                        if(data[key] != ""){

                            index[index.length] = key;

                        }

                    }
                    if(index.length == 1){

                        descList.push(data[index[0]]);

                    }else{

                        for(var i = 1;i < index.length;i++){

                            for(var j = 0;j < parseInt(index[i] - index[i - 1]);j++){

                                descList.push(data[index[i - 1]]);

                            }
                        }
                        if(index[index.length - 1] <= imgArray.length){

                            for(var i = 0;i <= imgArray.length - (index[index.length - 1]);i++){

                                descList.push(data[index[index.length - 1]]);

                            }

                        }
                    }
                }

            }

            if (!isEmpty(jsonData.picTags)){

                imgFollowDisc(jsonData.picTags,"img_desc1"); //旋转图片跟随简介-非热点

            }

            //非热点就加载360度全套图
            var product1 = document.getElementById('product1');
            var img_desc1 = document.getElementById('img_desc1');

            timer = null;

            //加载所有图片资源
            for(iCount = 0;iCount < iImgCount;iCount++) {

                (function (iCount){

                    var oNewImg = new Image();
                    oNewImg.src = imgArray[iCount];
                    oNewImg.onload = function () {
                        oNewImg.onload = null;

                        var oImg = document.createElement('img');
                        oImg.src = this.src;
                        oImg.className = "previous-image";
                        (iCount == 0) ? oImg.style.display = 'block' : oImg.style.display = 'none';

                        product1.appendChild(oImg);
                        allImg[iCount] = oImg;

                        if(++iLoaded == iImgCount){
                            onLoadAll();
                        }

                    };

                })(iCount);

            }

            function onLoadAll() {

                //此方法执行表示资源已经加载完毕
                startMove();

                for(i = 0;i < iImgCount;i++){

                    if(!allImg[i]){

                        alert('资源加载失败');
                        console.log('资源加载失败');

                    }

                }

                if(descList[0]){

                    img_desc1.innerHTML = descList[0];

                }else{

                    $("#img_desc1").hide();

                }

                lastImg = allImg[0];
                product1.addEventListener("touchstart", imgTouchStart, false);
                product1.addEventListener("touchmove", imgTouchMove, false);
                product1.addEventListener("touchend", imgTouchEnd, false);

                function imgTouchStart(ev) {

                    //评论栏的高度
                    var descH = parseInt($("#img_desc1").css("height"));

                    if(ifAutoPlayFlag){

                        if(ev.touches.length >= 2){

                            //任何一个触点超过图片的范围都不进行缩放
                            if((ev.touches[0].pageY > (maxTouchHeight + descH))
                                || (ev.touches[1].pageY > (maxTouchHeight + descH))
                                || (ev.touches[1].pageY < descH)
                                || (ev.touches[1].pageY < descH)){

                                doubleTouch = false;

                            }else{

                                doubleTouch = true;
                                ifAutoPlayFlag = false;
                                checkStatus("imgTouchStart");

                            }

                        }

                    }

                    ev.preventDefault();
                    stopMove();
                    startX = ev.changedTouches[0].clientX;
                    lastX = startX;
                    mStartX = ev.touches[0].pageX;
                    mStartY = ev.touches[0].pageY;

                    return false;

                }

                function imgTouchMove(ev) {

                    ev.preventDefault();

                    if(iLoaded == iImgCount && !doubleTouch && ev.touches.length == 1 && ifAutoPlayFlag){

                        var i = -(ev.changedTouches[0].clientX - startX) / 10;

                        num = (iNow + i + Math.abs(Math.floor(i / iImgCount)) * iImgCount) % iImgCount;

                        if(lastImg != allImg[parseInt(num)]){

                            lastImg.style.display = 'none';
                            allImg[parseInt(num)].style.display = 'block';
                            if(descList.length > 0){
                                img_desc1.innerHTML = descList[parseInt(num)];
                            }
                            lastImg = allImg[parseInt(num)];

                        }

                        speed = -(ev.changedTouches[0].clientX - lastX) / 10;
                        lastX = ev.changedTouches[0].clientX;

                        return false;

                    }else{

                        if(!ifAutoPlayFlag && ev.touches.length == 1 && ($(ev.target).attr("class") == "previous-image")){

                            moveImg(ev);

                        }

                    }

                }

                function imgTouchEnd(ev) {

                    ev.stopPropagation();
                    iNow = num;
                    if(playStatus && (iLoaded == iImgCount) && ifAutoPlayFlag){startMove();}
                    doubleTouch = false;

                }

            }

            //模拟弹幕
            var barrageBox = $("#J_barrage_stage");
            var barrageArr = [{"text": "我就是路过看看。。"}, {"text": "good"},{"text": "赞赞赞"},
                {"text": "还想再入一件"}, {"text": "强烈推荐，美。。"}, {"text": "666"},
                {"text": "惊呆了"}, {"text": "这是啥"}, {"text": "喜欢"}
            ];

            for(var i = 0; i < barrageArr.length; i++){

                var creSpan = '<div class="mb5 barrage-inner">' +
                    '<span class="barrage-txt mr16">'+ barrageArr[i].text +'</span>' +
                    '</div>';

                barrageBox.prepend(creSpan);

            }

            var aniVal = 'barrage linear 8s infinite';
            $('.zpg-barrage-content').css('animation',aniVal);

            //点击热点
            $(".swx-hot-spots").bind( "click", tapHotSpotsIcon);

            function tapHotSpotsIcon(){

                imgScale = 1;
                stopMove();
                limitFlagStop();
                $(".previous-image").css({

                    "webkit-transform":"scale( 1 )",
                    "transform":"scale(1)",
                    "left":0,"top":0

                });
                limitFlag = !limitFlag;
                ifAutoPlayFlag = true;
                checkStatus();
                imgArray = [];
                chooseProd();

                if(limitFlag){

                    stopMove();

                    for (var i = 0; i < jsonData.hotPicUrls.length; i++) {

                        //imgArray.push('http://123.57.3.33:9000/pic/work/'+jsonData.picUrls[i]);
                        imgArray.push(jsonData.hotPicUrls[i]);

                    }

                    $('.swx-hot-spots').attr('class','swx-hot-spots on');

                    //旋转图片跟随简介-热点
                    if (!isEmpty(jsonData.hotPicTags)){

                        imgFollowDisc(jsonData.hotPicTags,"img_desc2"); //旋转图片跟随简介-热点

                    }

                    var imgHtml = "";
                    var product2 = document.getElementById("product2");

                    for(var i = 0;i < imgArray.length;i++){

                        if(i == 0){

                            imgHtml += "<div class='slideImgDiv zIndex'>";

                        }else{

                            imgHtml += "<div class='slideImgDiv'>";

                        }

                        imgHtml += "<img class='product2_img' src="+" ' " + imgArray[i] +" ' curImgIndex=" + i + "> ";
                        imgHtml += "</div>";

                    }

                    product2.innerHTML = imgHtml;
                    $(".img_desc2").html(descList[curImgIndex]);
                    limitFlagStop();
                    limitFlagPlay();

                }else{

                    for (var i = 0; i < jsonData.picUrls.length; i++) {

                        //imgArray.push('http://123.57.3.33:9000/pic/work/'+jsonData.picUrls[i]);
                        imgArray.push(jsonData.picUrls[i]);

                    }

                    imgFollowDisc(jsonData.picTags,"img_desc1");
                    $('.swx-hot-spots').attr('class','swx-hot-spots off');
                }

            }

            if (jsonData.link != null){

                $(".goods_buy_btn").click(function(){

                    window.location.href = jsonData.link;

                });

            }
        }

    }

    //滑动
    [].forEach.call(oLis, function () {

        var oLi = arguments[0];
        oLi.index = arguments[1];

        oLi.addEventListener("touchstart", oLisTouchStart, false);
        oLi.addEventListener("touchmove", oLisTouchMove, false);
        oLi.addEventListener("touchend", oLisTouchEnd, false);

    });

    function oLisTouchStart(ev) {

        var descH = parseInt($("#img_desc1").css("height"));
        if(ev.touches.length >= 2){

            //任何一个触点超过图片的范围都不进行缩放
            if((ev.touches[0].pageY > (maxTouchHeight + descH))
                || (ev.touches[1].pageY > (maxTouchHeight + descH))
                || (ev.touches[1].pageY < descH)
                || (ev.touches[1].pageY < descH)){

                doubleTouch = false;

            }else{

                doubleTouch = true;
                ifAutoPlayFlag = false;
                checkStatus();

            }

        }

        this.startX = ev.changedTouches[0].pageX;
        this.startY = ev.changedTouches[0].pageY;
        mStartX = ev.touches[0].pageX;
        mStartY = ev.touches[0].pageY;

        if(ev.target.nodeName == "IMG"){

            if($(ev.target).attr("curImgIndex")){

                curImgIndex = parseInt($(ev.target).attr("curImgIndex"));

                limitFlagStop();

            }

            if (ev.touches.length === 2) {

                distance.start = getDistance({
                    x: ev.touches[0].screenX,
                    y: ev.touches[0].screenY
                }, {
                    x: ev.touches[1].screenX,
                    y: ev.touches[1].screenY
                });
            }

        }
    }

    function oLisTouchMove(ev) {

        ev.preventDefault();
        var touchY = ev.changedTouches[0].pageY;
        var touchX = ev.changedTouches[0].pageX;
        var changeY = touchY - this.startY;
        var changeX = touchX - this.startX;
        var nowIndex = this.index;
        var step = 1 / 5;

        if(ev.target.nodeName != "IMG"){

            //表示滑动而不是点击
            this.flag = true;

            //记录下移动的时候的触摸点的坐标
            if(Math.abs(changeX) > Math.abs(changeY)){

                this.flag = false;  //横滑不改变
                return;

            }

            showOneHideAll(oLis,nowIndex,"section");

            //小于0说明是向上移动
            if (changeY < 0) {

                this.nextIndex = nowIndex == oLis.length - 1 ? 0 : nowIndex + 1;
                var duration = winH + changeY;

                if(this.nextIndex == 5){

                    oLis[this.nextIndex].style.webkitTransform = "translate(0," + duration + "px)";
                    oLis[this.nextIndex].className = "section zIndex";
                    oLis[this.nextIndex].style.display = "block";
                    this.style.webkitTransform = "scale(" + (1 - Math.abs(changeY / winH)* step ) + ") translate(0," + changeY + "px)";

                }

            } else if((changeY > 0)){

                var duration = -winH  + changeY;
                this.nextIndex = nowIndex == 0 ? oLis.length - 1 : nowIndex - 1;

                if(this.nextIndex == 0){

                    oLis[this.nextIndex].style.webkitTransform = "translate(0," + duration + "px)";
                    oLis[this.nextIndex].className = "section zIndex";
                    oLis[this.nextIndex].style.display = "block";
                    this.style.webkitTransform = "scale(" + (1 - Math.abs(changeY / winH) * step ) + ") translate(0," + changeY + "px)";

                }
            }

        }else{

            if($(ev.target).attr("curImgIndex")){

                if(!doubleTouch && ev.touches.length == 1 && ifAutoPlayFlag){

                    var oDiv = $("div.slideImgDiv");
                    curImgIndex = parseInt($(ev.target).attr("curImgIndex"));//当前图的索引

                    if(Math.abs(changeX) > Math.abs(changeY)){

                        this.flag = false;

                        if(ev.touches.length < 2){

                            //小于0说明是向左滑，图片递增
                            if(changeX < 0){

                                curImgIndex = curImgIndex + 1;
                                showOneHideAll(oDiv,curImgIndex,"slideImgDiv");

                                if(curImgIndex == imgArray.length){

                                    curImgIndex = 0;

                                }

                                var duration = winW + changeX;
                                oDiv[curImgIndex].style.webkitTransform = "translateX(0," + duration + "px)";
                                oDiv[curImgIndex].className = "slideImgDiv zIndex";
                                oDiv[curImgIndex].style.display = "block";
                                this.style.webkitTransform = "scale(" + (1 - Math.abs(changeX / winW) * step ) + ") translateX(0," + changeX + "px)";
                                $(".img_desc2").html(descList[curImgIndex]);

                            }else if(changeX > 0){

                                curImgIndex = curImgIndex - 1;
                                showOneHideAll(oDiv,curImgIndex,"slideImgDiv");

                                if(curImgIndex == -1){

                                    curImgIndex = 2;

                                }

                                var duration = -winW + changeX;
                                oDiv[curImgIndex].style.webkitTransform = "translateX(0," + duration + "px)";
                                oDiv[curImgIndex].className = "slideImgDiv zIndex";
                                oDiv[curImgIndex].style.display = "block";
                                this.style.webkitTransform = "scale(" + (1 - Math.abs(changeX / winW) * step ) + ") translateX(0," + changeX + "px)";
                                $(".img_desc2").html(descList[curImgIndex]);

                            }

                        }

                    }

                }else{

                    if(!ifAutoPlayFlag && ev.touches.length == 1){

                        moveImg(ev);

                    }

                }

            }


            if (ev.touches.length === 2 && doubleTouch) {

                distance.stop = getDistance({
                    x: ev.touches[0].screenX,
                    y: ev.touches[0].screenY
                }, {
                    x: ev.touches[1].screenX,
                    y: ev.touches[1].screenY
                });

                var sc = distance.stop / distance.start;

                //控制每次缩放的比例一致
                if(sc > 1){

                    imgScale = imgScale + 0.03;

                }else if(sc < 1){

                    imgScale = imgScale - 0.03;

                }

                //缩放值位于0.8到2之间的时候才改变缩放中心，相当于超出这个范围，不再进行缩放
                if(imgScale <= 2 && imgScale >= 1){

                    origin = getOrigin({
                        x: event.touches[0].pageX,
                        y: event.touches[0].pageY
                    }, {
                        x: event.touches[1].pageX,
                        y: event.touches[1].pageY
                    });

                }

                (imgScale >= 2) ? imgScale = 2 : void 0;
                (imgScale <= 1) ? imgScale = 1 : void 0;

                setScaleAnimation(ev.target,imgScale);

            }
        }

    }

    function oLisTouchEnd(ev) {

        if(ev.target.nodeName != "IMG"){

            if(this.flag){

                //让上一张或者下一张都回到0,0的位置
                oLis[this.index].style.webkitTransform = "scale(1) translate(0,0)";
                oLis[this.nextIndex].style.webkitTransform = "translate(0,0)";
                oLis[this.nextIndex].addEventListener("webkitTransitionEnd",function(){
                    this.style.webkitTransition = "";
                    //增加执行动画的id名
                    //this.firstElementChild.id = "a"+this.index;

                },false);

                this.flag = false;

            }
        }else{

            doubleTouch = false;

        }

        if($(ev.target).attr("curImgIndex")){

            if(ifAutoPlayFlag){limitFlagPlay();}

        }


    }

});