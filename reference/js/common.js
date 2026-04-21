/* =============================================
   中国象棋游戏 - 公共模块
   作者: 一叶孤舟 | qq:28701884 | 欢迎指教
   ============================================= */

/* 创建com命名空间，避免全局变量污染 */
var com = com || {};

/* =============================================
   初始化函数
   加载游戏配置、初始化画布、加载图片资源
   ============================================= */
com.init = function(stype) {
    // 获取皮肤配置，优先使用传入的参数，其次从Cookie读取，最后使用默认皮肤stype2
    com.nowStype = stype || com.getCookie("stype") || "stype2";
    var stype = com.stype[com.nowStype];
    
    // 设置画布相关参数
    com.width = stype.width;        // 画布宽度
    com.height = stype.height;       // 画布高度
    com.spaceX = stype.spaceX;      // 棋盘点X轴间距
    com.spaceY = stype.spaceY;      // 棋盘点Y轴间距
    com.pointStartX = stype.pointStartX;  // 棋盘起始点X坐标
    com.pointStartY = stype.pointStartY;  // 棋盘起始点Y坐标
    com.page = stype.page;          // 图片资源目录

    // 获取Canvas画布元素并设置尺寸
    com.canvas = document.getElementById("chess");
    com.ct = com.canvas.getContext("2d");  // 获取2D绘图上下文
    com.canvas.width = com.width;
    com.canvas.height = com.height;

    // 初始化显示元素列表
    com.childList = com.childList || [];

    // 加载图片资源
    com.loadImages(com.page);
}

/* =============================================
   皮肤配置
   定义三种不同的棋盘皮肤及其尺寸参数
   ============================================= */
com.stype = {
    // 皮肤1：小尺寸版本
    stype1: {
        width: 325,      // 画布宽度
        height: 402,     // 画布高度
        spaceX: 35,      // X轴间距
        spaceY: 36,      // Y轴间距
        pointStartX: 5,   // 起始点X坐标
        pointStartY: 19,  // 起始点Y坐标
        page: "stype_1"  // 图片目录
    },
    
    // 皮肤2：中尺寸版本（默认）
    stype2: {
        width: 523,      // 画布宽度
        height: 580,     // 画布高度
        spaceX: 57,      // X轴间距
        spaceY: 57,      // Y轴间距
        pointStartX: 3,  // 起始点X坐标
        pointStartY: 5,  // 起始点Y坐标
        page: "stype_2"  // 图片目录
    },
    
    // 皮肤3：大尺寸版本
    stype3: {
        width: 530,      // 画布宽度
        height: 567,     // 画布高度
        spaceX: 57,      // X轴间距
        spaceY: 57,      // Y轴间距
        pointStartX: -2,  // 起始点X坐标
        pointStartY: 0,  // 起始点Y坐标
        page: "stype_3"  // 图片目录
    }
};

/* =============================================
   工具函数
   ============================================= */

/**
 * 根据ID获取DOM元素
 * @param {string} id - 元素ID
 * @returns {HTMLElement} DOM元素
 */
com.get = function(id) {
    return document.getElementById(id);
}

/* =============================================
   页面加载完成后初始化
   绑定各种事件监听器
   ============================================= */
window.onload = function() {
    // 创建背景、提示点、选中框等显示对象
    com.bg = new com.class.Bg();
    com.dot = new com.class.Dot();
    com.pane = new com.class.Pane();
    com.pane.isShow = false;

    // 将显示对象加入列表，用于统一管理绘制
    com.childList = [com.bg, com.dot, com.pane];
    com.mans = {};  // 棋子集合

    // 开始对弈按钮点击事件
    com.get("playBtn").addEventListener("click", function(e) {
        play.isPlay = true;
        // 获取选择的AI难度（搜索深度）
        var depth = parseInt(getRadioValue("depth"), 10) || 3;
        play.init(depth);  // 初始化游戏
        com.get("chessBox").style.display = "block";  // 显示棋盘
        com.get("menuBox").style.display = "none";    // 隐藏菜单
    });

    // 开始挑战按钮点击事件
    com.get("clasliBtn").addEventListener("click", function(e) {
        play.isPlay = true;
        // 获取选择的挑战棋局
        var clasli = parseInt(getRadioValue("clasli"), 10) || 0;
        // 使用4层搜索深度初始化特殊棋局
        play.init(4, com.clasli[clasli].map);
        com.get("chessBox").style.display = "block";
        com.get("menuBox").style.display = "none";
    });

    // 悔棋按钮点击事件
    com.get("regretBtn").addEventListener("click", function(e) {
        play.regret();  // 执行悔棋操作
    });

    // 返回首页按钮点击事件
    com.get("gohomeBtn").addEventListener("click", function(e) {
        com.get("chessBox").style.display = "none";
        com.get("menuBox").style.display = "block";
        com.get("indexBox").style.display = "block";
        com.get("menuQj").style.display = "none";
        com.get("menuDy").style.display = "none";
    });

    // 菜单返回按钮点击事件
    com.get("menuFh").addEventListener("click", function(e) {
        com.get("indexBox").style.display = "block";
        com.get("menuQj").style.display = "none";
        com.get("menuDy").style.display = "none";
    });

    // 关闭按钮点击事件
    com.get("menuGb").addEventListener("click", function(e) {
        com.get("indexBox").style.display = "block";
        com.get("menuQj").style.display = "none";
        com.get("menuDy").style.display = "none";
    });

    // 重新开始按钮点击事件
    com.get("restartBtn").addEventListener("click", function(e) {
        if (confirm("是否确定要重新开始？")) {
            play.isPlay = true;
            // 使用当前难度和棋局重新初始化
            play.init(play.depth, play.nowMap);
        }
    });

    // 人机对弈菜单入口点击事件
    com.get("indexDy").addEventListener("click", function(e) {
        com.get("indexBox").style.display = "none";
        com.get("menuQj").style.display = "none";
        com.get("menuDy").style.display = "block";  // 显示难度选择菜单
    });

    // 挑战棋局菜单入口点击事件
    com.get("indexQj").addEventListener("click", function(e) {
        com.get("indexBox").style.display = "none";
        com.get("menuQj").style.display = "block";   // 显示棋局选择菜单
        com.get("menuDy").style.display = "none";
    });

    // 换肤按钮点击事件
    com.get("stypeBtn").addEventListener("click", function(e) {
        var stype = com.nowStype;
        // 循环切换三种皮肤：stype3 -> stype2 -> stype1 -> stype3
        if (stype == "stype3") stype = "stype2";
        else if (stype == "stype2") stype = "stype1";
        else if (stype == "stype1") stype = "stype3";

        com.init(stype);  // 重新初始化
        com.show();       // 重新绘制
        // 保存皮肤选择到Cookie
        document.cookie = "stype=" + stype;

        // 定时器：快速刷新显示5次，解决图片切换闪烁问题
        clearInterval(timer);
        var i = 0;
        var timer = setInterval(function() {
            com.show();
            if (i++ >= 5) clearInterval(timer);
        }, 2000);
    });

    /**
     * 获取单选框的选中值
     * @param {string} name - 单选框的name属性
     * @returns {string} 选中的value值
     */
    function getRadioValue(name) {
        var obj = document.getElementsByName(name);
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].checked) {
                return obj[i].value;
            }
        }
    }

    // 异步加载完整棋谱库
    com.getData("js/gambit.all.js", function(data) {
        com.gambit = data.split(" ");  // 按空格分割成数组
        AI.historyBill = com.gambit;   // 传给AI使用
    });
}

/* =============================================
   图片加载函数
   根据皮肤配置加载棋盘、棋子等图片资源
   ============================================= */
com.loadImages = function(stype) {
    // 加载棋盘背景图片
    com.bgImg = new Image();
    com.bgImg.src = "img/" + stype + "/bg.png";

    // 加载提示点图片
    com.dotImg = new Image();
    com.dotImg.src = "img/" + stype + "/dot.png";

    // 加载所有棋子图片
    for (var i in com.args) {
        com[i] = {};
        com[i].img = new Image();
        com[i].img.src = "img/" + stype + "/" + com.args[i].img + ".png";
    }

    // 加载棋子选中框图片
    com.paneImg = new Image();
    com.paneImg.src = "img/" + stype + "/r_box.png";

    // 设置页面背景图片
    document.getElementsByTagName("body")[0].style.background = "url(img/" + stype + "/bg.jpg)";
}

/* =============================================
   绘制相关函数
   ============================================= */

/**
 * 统一绘制函数
 * 依次调用所有显示对象的show方法
 */
com.show = function() {
    // 清空画布
    com.ct.clearRect(0, 0, com.width, com.height);
    // 遍历绘制所有显示元素
    for (var i = 0; i < com.childList.length; i++) {
        com.childList[i].show();
    }
}

/**
 * 显示移动轨迹（选中框）
 * @param {number} x - 起始X坐标
 * @param {number} y - 起始Y坐标
 * @param {number} newX - 目标X坐标
 * @param {number} newY - 目标Y坐标
 */
com.showPane = function(x, y, newX, newY) {
    com.pane.isShow = true;
    com.pane.x = x;
    com.pane.y = y;
    com.pane.newX = newX;
    com.pane.newY = newY;
}

/**
 * 根据棋盘map创建棋子对象
 * @param {Array} map - 棋盘二维数组
 */
com.createMans = function(map) {
    for (var i = 0; i < map.length; i++) {
        for (var n = 0; n < map[i].length; n++) {
            var key = map[i][n];
            if (key) {
                // 创建棋子对象并设置位置
                com.mans[key] = new com.class.Man(key);
                com.mans[key].x = n;
                com.mans[key].y = i;
                com.childList.push(com.mans[key]);  // 加入显示列表
            }
        }
    }
}

/* =============================================
   调试函数
   ============================================= */

/**
 * 调试输出函数
 * @param {*} obj - 要输出的对象
 * @param {string} f - 字段名（可选）
 * @param {string} n - 分隔符（可选）
 */
com.alert = function(obj, f, n) {
    if (typeof obj !== "object") {
        try { console.log(obj); } catch (e) { }
    }
    var arr = [];
    for (var i in obj) arr.push(i + " = " + obj[i]);
    try { console.log(arr.join(n || "\n")); } catch (e) { }
};

// 简化调用：z 和 l 分别是 com.alert 和 console.log 的快捷方式
var z = com.alert;
var l = console.log;

/* =============================================
   DOM操作工具函数
   ============================================= */

/**
 * 获取元素相对于页面的绝对坐标
 * @param {HTMLElement} dom - DOM元素
 * @returns {Object} 包含x,y坐标的对象
 */
com.getDomXY = function(dom) {
    var left = dom.offsetLeft;
    var top = dom.offsetTop;
    var current = dom.offsetParent;
    // 向上遍历所有父元素累加偏移量
    while (current !== null) {
        left += current.offsetLeft;
        top += current.offsetTop;
        current = current.offsetParent;
    }
    return { x: left, y: top };
}

/**
 * 获取Cookie值
 * @param {string} name - Cookie名称
 * @returns {string|boolean} Cookie值，不存在返回false
 */
com.getCookie = function(name) {
    if (document.cookie.length > 0) {
        start = document.cookie.indexOf(name + "=");
        if (start != -1) {
            start = start + name.length + 1;
            end = document.cookie.indexOf(";", start);
            if (end == -1) end = document.cookie.length;
            return unescape(document.cookie.substring(start, end));
        }
    }
    return false;
}

/* =============================================
   数据处理函数
   ============================================= */

/**
 * 二维数组深拷贝
 * @param {Array} arr - 原数组
 * @returns {Array} 拷贝后的新数组
 */
com.arr2Clone = function(arr) {
    var newArr = [];
    for (var i = 0; i < arr.length; i++) {
        newArr[i] = arr[i].slice();  // slice()实现一维数组拷贝
    }
    return newArr;
}

/**
 * AJAX异步加载数据
 * @param {string} url - 请求URL
 * @param {Function} fun - 加载成功后的回调函数
 */
com.getData = function(url, fun) {
    var XMLHttpRequestObject = false;
    // 兼容IE6及以下浏览器
    if (window.XMLHttpRequest) {
        XMLHttpRequestObject = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        XMLHttpRequestObject = new ActiveXObject("Microsoft.XMLHTTP");
    }

    if (XMLHttpRequestObject) {
        XMLHttpRequestObject.open("GET", url);  // 发送GET请求
        XMLHttpRequestObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        XMLHttpRequestObject.onreadystatechange = function() {
            // readyState=4表示请求完成，status=200表示成功
            if (XMLHttpRequestObject.readyState == 4 && XMLHttpRequestObject.status == 200) {
                fun(XMLHttpRequestObject.responseText);
            }
        };
        XMLHttpRequestObject.send(null);  // 发送请求
    }
}

/* =============================================
   棋谱生成函数
   将棋子移动坐标转换为中文棋谱描述
   ============================================= */

/**
 * 将坐标转换为象棋术语着法
 * @param {Array} map - 棋盘数组
 * @param {number} x - 起始X坐标
 * @param {number} y - 起始Y坐标
 * @param {number} newX - 目标X坐标
 * @param {number} newY - 目标Y坐标
 * @returns {string} 中文着法描述
 */
com.createMove = function(map, x, y, newX, newY) {
    var h = "";
    var man = com.mans[map[y][x]];
    h += man.text;  // 添加棋子名称

    // 更新棋盘状态
    map[newY][newX] = map[y][x];
    delete map[y][x];

    // 红方着法表示法
    if (man.my === 1) {
        var mumTo = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
        newX = 8 - newX;  // 转换X坐标（红方从右往左数）
        h += mumTo[8 - x];  // 添加起始位置
        if (newY > y) {
            h += "退";  // 向低行移动为"退"
            // 马、象、仕需要特殊处理
            if (man.pater == "m" || man.pater == "s" || man.pater == "x") {
                h += mumTo[newX];
            } else {
                h += mumTo[newY - y - 1];
            }
        } else if (newY < y) {
            h += "进";  // 向高行移动为"进"
            if (man.pater == "m" || man.pater == "s" || man.pater == "x") {
                h += mumTo[newX];
            } else {
                h += mumTo[y - newY - 1];
            }
        } else {
            h += "平";  // 横向移动为"平"
            h += mumTo[newX];
        }
    } else {
        // 黑方着法表示法
        var mumTo = ["１", "２", "３", "４", "５", "６", "７", "８", "９", "10"];
        h += mumTo[x];
        if (newY > y) {
            h += "进";
            if (man.pater == "M" || man.pater == "S" || man.pater == "X") {
                h += mumTo[newX];
            } else {
                h += mumTo[newY - y - 1];
            }
        } else if (newY < y) {
            h += "退";
            if (man.pater == "M" || man.pater == "S" || man.pater == "X") {
                h += mumTo[newX];
            } else {
                h += mumTo[y - newY - 1];
            }
        } else {
            h += "平";
            h += mumTo[newX];
        }
    }
    return h;
}

/* =============================================
   初始棋盘布局
   标准中国象棋开局布局
   ============================================= */

/**
 * 初始棋盘状态
 * 0-4行：黑方（上方，大写字母）
 * 5-9行：红方（下方，小写字母）
 * 列：0-8从左到右
 */
com.initMap = [
    // 第0行：黑方底线 - 车马象士将士象马车
    ['C0', 'M0', 'X0', 'S0', 'J0', 'S1', 'X1', 'M1', 'C1'],
    // 第1行：黑方炮位（空）
    [, , , , , , , ,],
    // 第2行：黑方兵位
    [, 'P0', , , , , , 'P1',],
    // 第3行：黑方5个卒
    ['Z0', , 'Z1', , 'Z2', , 'Z3', , 'Z4'],
    // 第4-5行：楚河汉界（空格）
    [, , , , , , , ,],
    [, , , , , , , ,],
    // 第6行：红方5个兵
    ['z0', , 'z1', , 'z2', , 'z3', , 'z4'],
    // 第7行：红方炮位
    [, 'p0', , , , , , 'p1',],
    // 第8行：红方兵/炮位（空）
    [, , , , , , , ,],
    // 第9行：红方底线 - 车马相仕帅仕相马车
    ['c0', 'm0', 'x0', 's0', 'j0', 's1', 'x1', 'm1', 'c1']
];

/* =============================================
   棋子标识映射
   将完整棋子标识映射到基础类型
   ============================================= */
com.keys = {
    // 黑方棋子标识（小写字母 + 序号）
    "c0": "c", "c1": "c",  // 车
    "m0": "m", "m1": "m",  // 马
    "x0": "x", "x1": "x",  // 象
    "s0": "s", "s1": "s",  // 士
    "j0": "j",             // 将
    "p0": "p", "p1": "p",  // 炮
    "z0": "z", "z1": "z", "z2": "z", "z3": "z", "z4": "z", "z5": "z",  // 卒

    // 红方棋子标识（大写字母 + 序号）
    "C0": "c", "C1": "C",  // 车
    "M0": "M", "M1": "M",  // 马
    "X0": "X", "X1": "X",  // 相
    "S0": "S", "S1": "S",  // 仕
    "J0": "J",             // 帅
    "P0": "P", "P1": "P",  // 炮
    "Z0": "Z", "Z1": "Z", "Z2": "Z", "Z3": "Z", "Z4": "Z", "Z5": "Z"   // 兵
};

/* =============================================
   棋子移动规则
   定义每种棋子的合法移动方式
   ============================================= */
com.bylaw = {};

/**
 * 车(车)的移动规则
 * 沿横竖方向直线移动，不能越子
 * @param {number} x - 当前位置X
 * @param {number} y - 当前位置Y
 * @param {Array} map - 棋盘
 * @param {number} my - 我的阵营(1红/-1黑)
 * @returns {Array} 可移动位置数组
 */
com.bylaw.c = function(x, y, map, my) {
    var d = [];

    // 左侧检索
    for (var i = x - 1; i >= 0; i--) {
        if (map[y][i]) {
            // 遇到己方棋子停止，遇到敌方可吃
            if (com.mans[map[y][i]].my != my) d.push([i, y]);
            break;
        } else {
            d.push([i, y]);  // 空格可走
        }
    }

    // 右侧检索
    for (var i = x + 1; i <= 8; i++) {
        if (map[y][i]) {
            if (com.mans[map[y][i]].my != my) d.push([i, y]);
            break;
        } else {
            d.push([i, y]);
        }
    }

    // 上检索
    for (var i = y - 1; i >= 0; i--) {
        if (map[i][x]) {
            if (com.mans[map[i][x]].my != my) d.push([x, i]);
            break;
        } else {
            d.push([x, i]);
        }
    }

    // 下检索
    for (var i = y + 1; i <= 9; i++) {
        if (map[i][x]) {
            if (com.mans[map[i][x]].my != my) d.push([x, i]);
            break;
        } else {
            d.push([x, i]);
        }
    }
    return d;
};

/**
 * 马(马)的移动规则
 * 日字移动，有蹩马腿限制
 */
com.bylaw.m = function(x, y, map, my) {
    var d = [];

    // 1点方向（左上）
    if (y - 2 >= 0 && x + 1 <= 8 && !play.map[y - 1][x] &&
        (!com.mans[map[y - 2][x + 1]] || com.mans[map[y - 2][x + 1]].my != my))
        d.push([x + 1, y - 2]);

    // 2点方向（右上）
    if (y - 1 >= 0 && x + 2 <= 8 && !play.map[y][x + 1] &&
        (!com.mans[map[y - 1][x + 2]] || com.mans[map[y - 1][x + 2]].my != my))
        d.push([x + 2, y - 1]);

    // 4点方向（右）
    if (y + 1 <= 9 && x + 2 <= 8 && !play.map[y][x + 1] &&
        (!com.mans[map[y + 1][x + 2]] || com.mans[map[y + 1][x + 2]].my != my))
        d.push([x + 2, y + 1]);

    // 5点方向（右下）
    if (y + 2 <= 9 && x + 1 <= 8 && !play.map[y + 1][x] &&
        (!com.mans[map[y + 2][x + 1]] || com.mans[map[y + 2][x + 1]].my != my))
        d.push([x + 1, y + 2]);

    // 7点方向（左下）
    if (y + 2 <= 9 && x - 1 >= 0 && !play.map[y + 1][x] &&
        (!com.mans[map[y + 2][x - 1]] || com.mans[map[y + 2][x - 1]].my != my))
        d.push([x - 1, y + 2]);

    // 8点方向（左）
    if (y + 1 <= 9 && x - 2 >= 0 && !play.map[y][x - 1] &&
        (!com.mans[map[y + 1][x - 2]] || com.mans[map[y + 1][x - 2]].my != my))
        d.push([x - 2, y + 1]);

    // 10点方向（左上）
    if (y - 1 >= 0 && x - 2 >= 0 && !play.map[y][x - 1] &&
        (!com.mans[map[y - 1][x - 2]] || com.mans[map[y - 1][x - 2]].my != my))
        d.push([x - 2, y - 1]);

    // 11点方向（正上）
    if (y - 2 >= 0 && x - 1 >= 0 && !play.map[y - 1][x] &&
        (!com.mans[map[y - 2][x - 1]] || com.mans[map[y - 2][x - 1]].my != my))
        d.push([x - 1, y - 2]);

    return d;
};

/**
 * 相(象)的移动规则
 * 田字移动，有塞象眼限制，红相不过河，黑象不过河
 */
com.bylaw.x = function(x, y, map, my) {
    var d = [];

    if (my === 1) {
        // 红方相只能在上半场(0-4行)

        // 4点半方向
        if (y + 2 <= 9 && x + 2 <= 8 && !play.map[y + 1][x + 1] &&
            (!com.mans[map[y + 2][x + 2]] || com.mans[map[y + 2][x + 2]].my != my))
            d.push([x + 2, y + 2]);

        // 7点半方向
        if (y + 2 <= 9 && x - 2 >= 0 && !play.map[y + 1][x - 1] &&
            (!com.mans[map[y + 2][x - 2]] || com.mans[map[y + 2][x - 2]].my != my))
            d.push([x - 2, y + 2]);

        // 1点半方向
        if (y - 2 >= 5 && x + 2 <= 8 && !play.map[y - 1][x + 1] &&
            (!com.mans[map[y - 2][x + 2]] || com.mans[map[y - 2][x + 2]].my != my))
            d.push([x + 2, y - 2]);

        // 10点半方向
        if (y - 2 >= 5 && x - 2 >= 0 && !play.map[y - 1][x - 1] &&
            (!com.mans[map[y - 2][x - 2]] || com.mans[map[y - 2][x - 2]].my != my))
            d.push([x - 2, y - 2]);
    } else {
        // 黑方象只能在下半场(5-9行)

        // 4点半方向
        if (y + 2 <= 4 && x + 2 <= 8 && !play.map[y + 1][x + 1] &&
            (!com.mans[map[y + 2][x + 2]] || com.mans[map[y + 2][x + 2]].my != my))
            d.push([x + 2, y + 2]);

        // 7点半方向
        if (y + 2 <= 4 && x - 2 >= 0 && !play.map[y + 1][x - 1] &&
            (!com.mans[map[y + 2][x - 2]] || com.mans[map[y + 2][x - 2]].my != my))
            d.push([x - 2, y + 2]);

        // 1点半方向
        if (y - 2 >= 0 && x + 2 <= 8 && !play.map[y - 1][x + 1] &&
            (!com.mans[map[y - 2][x + 2]] || com.mans[map[y - 2][x + 2]].my != my))
            d.push([x + 2, y - 2]);

        // 10点半方向
        if (y - 2 >= 0 && x - 2 >= 0 && !play.map[y - 1][x - 1] &&
            (!com.mans[map[y - 2][x - 2]] || com.mans[map[y - 2][x - 2]].my != my))
            d.push([x - 2, y - 2]);
    }
    return d;
};

/**
 * 士的移动规则
 * 斜线移动，限九宫内
 */
com.bylaw.s = function(x, y, map, my) {
    var d = [];

    if (my === 1) {
        // 红方仕只能在上半九宫(7-9行,3-5列)

        // 4点半
        if (y + 1 <= 9 && x + 1 <= 5 &&
            (!com.mans[map[y + 1][x + 1]] || com.mans[map[y + 1][x + 1]].my != my))
            d.push([x + 1, y + 1]);

        // 7点半
        if (y + 1 <= 9 && x - 1 >= 3 &&
            (!com.mans[map[y + 1][x - 1]] || com.mans[map[y + 1][x - 1]].my != my))
            d.push([x - 1, y + 1]);

        // 1点半
        if (y - 1 >= 7 && x + 1 <= 5 &&
            (!com.mans[map[y - 1][x + 1]] || com.mans[map[y - 1][x + 1]].my != my))
            d.push([x + 1, y - 1]);

        // 10点半
        if (y - 1 >= 7 && x - 1 >= 3 &&
            (!com.mans[map[y - 1][x - 1]] || com.mans[map[y - 1][x - 1]].my != my))
            d.push([x - 1, y - 1]);
    } else {
        // 黑方仕只能在下半九宫(0-2行,3-5列)

        // 4点半
        if (y + 1 <= 2 && x + 1 <= 5 &&
            (!com.mans[map[y + 1][x + 1]] || com.mans[map[y + 1][x + 1]].my != my))
            d.push([x + 1, y + 1]);

        // 7点半
        if (y + 1 <= 2 && x - 1 >= 3 &&
            (!com.mans[map[y + 1][x - 1]] || com.mans[map[y + 1][x - 1]].my != my))
            d.push([x - 1, y + 1]);

        // 1点半
        if (y - 1 >= 0 && x + 1 <= 5 &&
            (!com.mans[map[y - 1][x + 1]] || com.mans[map[y - 1][x + 1]].my != my))
            d.push([x + 1, y - 1]);

        // 10点半
        if (y - 1 >= 0 && x - 1 >= 3 &&
            (!com.mans[map[y - 1][x - 1]] || com.mans[map[y - 1][x - 1]].my != my))
            d.push([x - 1, y - 1]);
    }
    return d;
};

/**
 * 将/帅的移动规则
 * 一步横竖移动，限九宫内，可"将帅对面"
 */
com.bylaw.j = function(x, y, map, my) {
    var d = [];

    // 检查将帅之间是否有其他棋子（用于"将帅对面"规则）
    var isNull = (function(y1, y2) {
        var y1 = com.mans["j0"].y;
        var x1 = com.mans["J0"].x;
        var y2 = com.mans["J0"].y;
        // 从j0向J0检查中间是否有棋子
        for (var i = y1 - 1; i > y2; i--) {
            if (map[i][x1]) return false;
        }
        return true;
    })();

    if (my === 1) {
        // 红方帅只能在上半九宫(7-9行,3-5列)

        // 下
        if (y + 1 <= 9 && (!com.mans[map[y + 1][x]] || com.mans[map[y + 1][x]].my != my))
            d.push([x, y + 1]);

        // 上
        if (y - 1 >= 7 && (!com.mans[map[y - 1][x]] || com.mans[map[y - 1][x]].my != my))
            d.push([x, y - 1]);

        // 将帅对面
        if (com.mans["j0"].x == com.mans["J0"].x && isNull)
            d.push([com.mans["J0"].x, com.mans["J0"].y]);
    } else {
        // 黑方将只能在下半九宫(0-2行,3-5列)

        // 下
        if (y + 1 <= 2 && (!com.mans[map[y + 1][x]] || com.mans[map[y + 1][x]].my != my))
            d.push([x, y + 1]);

        // 上
        if (y - 1 >= 0 && (!com.mans[map[y - 1][x]] || com.mans[map[y - 1][x]].my != my))
            d.push([x, y - 1]);

        // 将帅对面
        if (com.mans["j0"].x == com.mans["J0"].x && isNull)
            d.push([com.mans["j0"].x, com.mans["j0"].y]);
    }

    // 右
    if (x + 1 <= 5 && (!com.mans[map[y][x + 1]] || com.mans[map[y][x + 1]].my != my))
        d.push([x + 1, y]);

    // 左
    if (x - 1 >= 3 && (!com.mans[map[y][x - 1]] || com.mans[map[y][x - 1]].my != my))
        d.push([x - 1, y]);

    return d;
};

/**
 * 炮的移动规则
 * 直线移动，吃子需隔一子（炮架）
 */
com.bylaw.p = function(x, y, map, my) {
    var d = [];

    // 左侧检索
    var n = 0;  // 记录遇到的棋子数
    for (var i = x - 1; i >= 0; i--) {
        if (map[y][i]) {
            if (n == 0) {
                n++;  // 第一个棋子作为炮架，跳过
                continue;
            } else {
                // 第二个棋子可吃
                if (com.mans[map[y][i]].my != my) d.push([i, y]);
                break;
            }
        } else {
            if (n == 0) d.push([i, y]);  // 未遇棋子时可走
        }
    }

    // 右侧检索
    var n = 0;
    for (var i = x + 1; i <= 8; i++) {
        if (map[y][i]) {
            if (n == 0) {
                n++;
                continue;
            } else {
                if (com.mans[map[y][i]].my != my) d.push([i, y]);
                break;
            }
        } else {
            if (n == 0) d.push([i, y]);
        }
    }

    // 上检索
    var n = 0;
    for (var i = y - 1; i >= 0; i--) {
        if (map[i][x]) {
            if (n == 0) {
                n++;
                continue;
            } else {
                if (com.mans[map[i][x]].my != my) d.push([x, i]);
                break;
            }
        } else {
            if (n == 0) d.push([x, i]);
        }
    }

    // 下检索
    var n = 0;
    for (var i = y + 1; i <= 9; i++) {
        if (map[i][x]) {
            if (n == 0) {
                n++;
                continue;
            } else {
                if (com.mans[map[i][x]].my != my) d.push([x, i]);
                break;
            }
        } else {
            if (n == 0) d.push([x, i]);
        }
    }
    return d;
};

/**
 * 兵/卒的移动规则
 * 红兵过河前只能前进，过河后可左右移动
 * 黑卒过河前只能后退，过河后可左右移动
 */
com.bylaw.z = function(x, y, map, my) {
    var d = [];

    if (my === 1) {
        // 红方兵

        // 上（前进）
        if (y - 1 >= 0 && (!com.mans[map[y - 1][x]] || com.mans[map[y - 1][x]].my != my))
            d.push([x, y - 1]);

        // 过河后可左右移动（右）
        if (x + 1 <= 8 && y <= 4 &&
            (!com.mans[map[y][x + 1]] || com.mans[map[y][x + 1]].my != my))
            d.push([x + 1, y]);

        // 过河后可左右移动（左）
        if (x - 1 >= 0 && y <= 4 &&
            (!com.mans[map[y][x - 1]] || com.mans[map[y][x - 1]].my != my))
            d.push([x - 1, y]);
    } else {
        // 黑方卒

        // 下（前进）
        if (y + 1 <= 9 && (!com.mans[map[y + 1][x]] || com.mans[map[y + 1][x]].my != my))
            d.push([x, y + 1]);

        // 过河后可左右移动（右）
        if (x + 1 <= 8 && y >= 6 &&
            (!com.mans[map[y][x + 1]] || com.mans[map[y][x + 1]].my != my))
            d.push([x + 1, y]);

        // 过河后可左右移动（左）
        if (x - 1 >= 0 && y >= 6 &&
            (!com.mans[map[y][x - 1]] || com.mans[map[y][x - 1]].my != my))
            d.push([x - 1, y]);
    }
    return d;
};

/* =============================================
   棋子价值表
   用于AI评估局面，每个棋子在不同位置有不同的价值
   ============================================= */
com.value = {
    // 车价值表 - 10x9的矩阵表示车在每个位置的相对价值
    c: [
        [206, 208, 207, 213, 214, 213, 207, 208, 206],
        [206, 212, 209, 216, 233, 216, 209, 212, 206],
        [206, 208, 207, 214, 216, 214, 207, 208, 206],
        [206, 213, 213, 216, 216, 216, 213, 213, 206],
        [208, 211, 211, 214, 215, 214, 211, 211, 208],
        [208, 212, 212, 214, 215, 214, 212, 212, 208],
        [204, 209, 204, 212, 214, 212, 204, 209, 204],
        [198, 208, 204, 212, 212, 212, 204, 208, 198],
        [200, 208, 206, 212, 200, 212, 206, 208, 200],
        [194, 206, 204, 212, 200, 212, 204, 206, 194]
    ],

    // 马价值表
    m: [
        [90, 90, 90, 96, 90, 96, 90, 90, 90],
        [90, 96, 103, 97, 94, 97, 103, 96, 90],
        [92, 98, 99, 103, 99, 103, 99, 98, 92],
        [93, 108, 100, 107, 100, 107, 100, 108, 93],
        [90, 100, 99, 103, 104, 103, 99, 100, 90],
        [90, 98, 101, 102, 103, 102, 101, 98, 90],
        [92, 94, 98, 95, 98, 95, 98, 94, 92],
        [93, 92, 94, 95, 92, 95, 94, 92, 93],
        [85, 90, 92, 93, 78, 93, 92, 90, 85],
        [88, 85, 90, 88, 90, 88, 90, 85, 88]
    ],

    // 相/象价值表
    x: [
        [0, 0, 20, 0, 0, 0, 20, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 23, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 20, 0, 0, 0, 20, 0, 0],
        [0, 0, 20, 0, 0, 0, 20, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [18, 0, 0, 0, 23, 0, 0, 0, 18],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 20, 0, 0, 0, 20, 0, 0]
    ],

    // 士价值表
    s: [
        [0, 0, 0, 20, 0, 20, 0, 0, 0],
        [0, 0, 0, 0, 23, 0, 0, 0, 0],
        [0, 0, 0, 20, 0, 20, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 20, 0, 20, 0, 0, 0],
        [0, 0, 0, 0, 23, 0, 0, 0, 0],
        [0, 0, 0, 20, 0, 20, 0, 0, 0]
    ],

    // 将/帅价值表 - 8888表示九宫内的高价值
    j: [
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0]
    ],

    // 炮价值表
    p: [
        [100, 100, 96, 91, 90, 91, 96, 100, 100],
        [98, 98, 96, 92, 89, 92, 96, 98, 98],
        [97, 97, 96, 91, 92, 91, 96, 97, 97],
        [96, 99, 99, 98, 100, 98, 99, 99, 96],
        [96, 96, 96, 96, 100, 96, 96, 96, 96],
        [95, 96, 99, 96, 100, 96, 99, 96, 95],
        [96, 96, 96, 96, 96, 96, 96, 96, 96],
        [97, 96, 100, 99, 101, 99, 100, 96, 97],
        [96, 97, 98, 98, 98, 98, 98, 97, 96],
        [96, 96, 97, 99, 99, 99, 97, 96, 96]
    ],

    // 兵/卒价值表
    z: [
        [9, 9, 9, 11, 13, 11, 9, 9, 9],
        [19, 24, 34, 42, 44, 42, 34, 24, 19],
        [19, 23, 27, 29, 30, 29, 27, 23, 19],
        [14, 18, 20, 27, 29, 27, 20, 18, 14],
        [7, 0, 13, 0, 16, 0, 13, 0, 7],
        [7, 0, 7, 0, 15, 0, 7, 0, 7],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
};

// 黑方棋子价值 = 红方对应棋子的镜像（上下翻转）
com.value.C = com.arr2Clone(com.value.c).reverse();
com.value.M = com.arr2Clone(com.value.m).reverse();
com.value.X = com.value.x;     // 相/象位置对称
com.value.S = com.value.s;     // 士位置对称
com.value.J = com.value.j;     // 将/帅位置对称
com.value.P = com.arr2Clone(com.value.p).reverse();
com.value.Z = com.arr2Clone(com.value.z).reverse();

/* =============================================
   棋子配置
   定义每种棋子的属性：中文名称、图片、阵营、移动规则、价值表
   ============================================= */
com.args = {
    // 红方棋子
    'c': { text: "车", img: 'r_c', my: 1, bl: "c", value: com.value.c },  // 车
    'm': { text: "马", img: 'r_m', my: 1, bl: "m", value: com.value.m },  // 马
    'x': { text: "相", img: 'r_x', my: 1, bl: "x", value: com.value.x },  // 相
    's': { text: "仕", img: 'r_s', my: 1, bl: "s", value: com.value.s },  // 仕
    'j': { text: "将", img: 'r_j', my: 1, bl: "j", value: com.value.j },  // 将
    'p': { text: "炮", img: 'r_p', my: 1, bl: "p", value: com.value.p },  // 炮
    'z': { text: "兵", img: 'r_z', my: 1, bl: "z", value: com.value.z },  // 兵

    // 黑方棋子
    'C': { text: "车", img: 'b_c', my: -1, bl: "c", value: com.value.C },  // 车
    'M': { text: "马", img: 'b_m', my: -1, bl: "m", value: com.value.M },  // 马
    'X': { text: "象", img: 'b_x', my: -1, bl: "x", value: com.value.X },  // 象
    'S': { text: "士", img: 'b_s', my: -1, bl: "s", value: com.value.S },  // 士
    'J': { text: "帅", img: 'b_j', my: -1, bl: "j", value: com.value.J },  // 帅
    'P': { text: "炮", img: 'b_p', my: -1, bl: "p", value: com.value.P },  // 炮
    'Z': { text: "卒", img: 'b_z', my: -1, bl: "z", value: com.value.Z }   // 卒
};

/* =============================================
   显示元素类定义
   ============================================= */

// 初始化类命名空间
com.class = com.class || {};

/**
 * 棋子类
 * @param {string} key - 棋子标识
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
com.class.Man = function(key, x, y) {
    this.pater = key.slice(0, 1);  // 提取棋子类型（如'c','m'等）
    var o = com.args[this.pater];  // 获取棋子配置

    this.x = x || 0;              // X坐标
    this.y = y || 0;              // Y坐标
    this.key = key;               // 完整标识
    this.my = o.my;               // 阵营（1红/-1黑）
    this.text = o.text;           // 显示文字
    this.value = o.value;         // 价值表
    this.isShow = true;           // 是否显示
    this.alpha = 1;               // 透明度
    this.ps = [];                 // 可移动位置列表

    /**
     * 绘制棋子
     */
    this.show = function() {
        if (this.isShow) {
            com.ct.save();  // 保存画布状态
            com.ct.globalAlpha = this.alpha;  // 设置透明度
            // 绘制棋子图片，位置由坐标和间距计算
            com.ct.drawImage(
                com[this.pater].img,
                com.spaceX * this.x + com.pointStartX,
                com.spaceY * this.y + com.pointStartY
            );
            com.ct.restore();  // 恢复画布状态
        }
    };

    /**
     * 获取该棋子的可移动位置
     * @param {Array} map - 棋盘
     * @returns {Array} 可移动位置数组
     */
    this.bl = function(map) {
        var map = map || play.map;
        return com.bylaw[o.bl](this.x, this.y, map, this.my);
    };
};

/**
 * 棋盘背景类
 */
com.class.Bg = function(img, x, y) {
    this.x = x || 0;
    this.y = y || 0;
    this.isShow = true;

    this.show = function() {
        if (this.isShow)
            com.ct.drawImage(com.bgImg, com.spaceX * this.x, com.spaceY * this.y);
    };
};

/**
 * 棋子选中框类
 */
com.class.Pane = function(img, x, y) {
    this.x = x || 0;
    this.y = y || 0;
    this.newX = x || 0;
    this.newY = y || 0;
    this.isShow = true;

    this.show = function() {
        if (this.isShow) {
            // 绘制起点和终点选中框
            com.ct.drawImage(
                com.paneImg,
                com.spaceX * this.x + com.pointStartX,
                com.spaceY * this.y + com.pointStartY
            );
            com.ct.drawImage(
                com.paneImg,
                com.spaceX * this.newX + com.pointStartX,
                com.spaceY * this.newY + com.pointStartY
            );
        }
    };
};

/**
 * 可移动提示点类
 */
com.class.Dot = function(img, x, y) {
    this.x = x || 0;
    this.y = y || 0;
    this.isShow = true;
    this.dots = [];  // 提示点位置列表

    this.show = function() {
        // 遍历绘制所有提示点
        for (var i = 0; i < this.dots.length; i++) {
            if (this.isShow)
                com.ct.drawImage(
                    com.dotImg,
                    com.spaceX * this.dots[i][0] + 10 + com.pointStartX,
                    com.spaceY * this.dots[i][1] + 10 + com.pointStartY
                );
        }
    };
};

// 页面加载时执行初始化
com.init();
