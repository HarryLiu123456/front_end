/* =============================================
   中国象棋游戏 - 游戏控制模块
   作者: 一叶孤舟 | qq:28701884 | 欢迎指教
   处理用户交互、游戏状态管理、悔棋等功能
   ============================================= */

/* 创建play命名空间 */
var play = play || {};

/* =============================================
   游戏初始化函数
   @param {number} depth - AI搜索深度
   @param {Array} map - 自定义棋盘布局（可选）
   ============================================= */
play.init = function(depth, map) {
    // 使用默认开局或自定义棋盘
    var map = map || com.initMap;
    // 默认搜索深度为3
    var depth = depth || 3;

    // 玩家方为红方（1表示红方，-1表示黑方/AI）
    play.my = 1;
    // 当前棋盘状态
    play.nowMap = map;
    // 克隆棋盘用于游戏
    play.map = com.arr2Clone(map);
    // 当前选中的棋子（false表示未选中）
    play.nowManKey = false;
    // 记录每一步着法
    play.pace = [];
    // 游戏是否可进行（false时禁止操作）
    play.isPlay = true;

    // 绑定游戏方法
    play.bylaw = com.bylaw;
    play.show = com.show;
    play.showPane = com.showPane;
    // 玩家先手
    play.isOffensive = true;
    // AI搜索深度
    play.depth = depth;
    // 犯规长将检测
    play.isFoul = false;
    // 隐藏选中框
    com.pane.isShow = false;

    // 清除所有棋子
    play.mans = com.mans = {};

    // 创建棋子对象
    com.createMans(map);
    com.bg.show();

    // 初始化每个棋子的位置和显示状态
    for (var i = 0; i < play.map.length; i++) {
        for (var n = 0; n < play.map[i].length; n++) {
            var key = play.map[i][n];
            if (key) {
                com.mans[key].x = n;
                com.mans[key].y = i;
                com.mans[key].isShow = true;
            }
        }
    }
    // 绘制初始棋盘
    play.show();

    // 绑定Canvas点击事件
    com.canvas.addEventListener("click", play.clickCanvas);
}

/* =============================================
   悔棋功能
   撤销最后一步走棋
   ============================================= */
play.regret = function() {
    // 获取初始棋盘
    var map = com.arr2Clone(com.initMap);

    // 重置所有棋子位置
    for (var i = 0; i < map.length; i++) {
        for (var n = 0; n < map[i].length; n++) {
            var key = map[i][n];
            if (key) {
                com.mans[key].x = n;
                com.mans[key].y = i;
                com.mans[key].isShow = true;
            }
        }
    }

    // 移除最后两步着法（玩家一步 + AI一步）
    var pace = play.pace;
    pace.pop();
    pace.pop();

    // 重演剩余着法
    for (var i = 0; i < pace.length; i++) {
        var p = pace[i].split("");
        var x = parseInt(p[0], 10);
        var y = parseInt(p[1], 10);
        var newX = parseInt(p[2], 10);
        var newY = parseInt(p[3], 10);
        var key = map[y][x];

        var cMan = map[newY][newX];
        // 如果目标位置有棋子，隐藏它
        if (cMan) com.mans[map[newY][newX]].isShow = false;

        // 移动棋子
        com.mans[key].x = newX;
        com.mans[key].y = newY;
        map[newY][newX] = key;
        delete map[y][x];

        // 显示最后一步的移动轨迹
        if (i == pace.length - 1) {
            com.showPane(newX, newY, x, y);
        }
    }

    // 更新游戏状态
    play.map = map;
    play.my = 1;
    play.isPlay = true;
    com.show();
}

/* =============================================
   Canvas点击事件处理
   ============================================= */
play.clickCanvas = function(e) {
    // 游戏暂停时忽略点击
    if (!play.isPlay) return false;

    // 获取点击位置对应的棋子和坐标
    var key = play.getClickMan(e);
    var point = play.getClickPoint(e);

    var x = point.x;
    var y = point.y;

    // 点击了棋子
    if (key) {
        play.clickMan(key, x, y);
    } else {
        // 点击了空位置
        play.clickPoint(x, y);
    }

    // 检测是否长将（违规）
    play.isFoul = play.checkFoul();
}

/* =============================================
   点击棋子处理
   选中棋子或吃子
   ============================================= */
play.clickMan = function(key, x, y) {
    var man = com.mans[key];

    // 吃子逻辑：有选中棋子时点击敌方棋子
    if (play.nowManKey && play.nowManKey != key && man.my != com.mans[play.nowManKey].my) {
        // 检查目标位置是否在可走范围内
        if (play.indexOfPs(com.mans[play.nowManKey].ps, [x, y])) {
            man.isShow = false;  // 隐藏被吃的棋子

            // 记录着法
            var pace = com.mans[play.nowManKey].x + "" + com.mans[play.nowManKey].y;

            // 更新棋盘
            delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
            play.map[y][x] = play.nowManKey;

            // 显示移动轨迹
            com.showPane(com.mans[play.nowManKey].x, com.mans[play.nowManKey].y, x, y);

            // 更新棋子位置
            com.mans[play.nowManKey].x = x;
            com.mans[play.nowManKey].y = y;
            com.mans[play.nowManKey].alpha = 1;

            // 记录着法
            play.pace.push(pace + x + y);
            play.nowManKey = false;
            com.pane.isShow = false;
            com.dot.dots = [];
            com.show();

            // 播放音效
            com.get("clickAudio").play();

            // AI思考（延迟500ms）
            setTimeout(play.AIPlay, 500);

            // 检测胜负
            if (key == "j0") play.showWin(-1);  // AI输了
            if (key == "J0") play.showWin(1);  // AI赢了
        }
    } else {
        // 选中棋子逻辑
        // 只能选中己方棋子
        if (man.my === 1) {
            // 取消之前选中棋子的高亮
            if (com.mans[play.nowManKey]) com.mans[play.nowManKey].alpha = 1;
            // 高亮当前选中棋子
            man.alpha = 0.8;
            com.pane.isShow = false;
            play.nowManKey = key;

            // 计算可走位置并显示
            com.mans[key].ps = com.mans[key].bl();
            com.dot.dots = com.mans[key].ps;
            com.show();

            // 播放选中音效
            com.get("selectAudio").play();
        }
    }
}

/* =============================================
   点击空位置处理
   移动已选中的棋子
   ============================================= */
play.clickPoint = function(x, y) {
    var key = play.nowManKey;
    var man = com.mans[key];

    if (play.nowManKey) {
        // 检查目标位置是否在可走范围内
        if (play.indexOfPs(com.mans[key].ps, [x, y])) {
            var pace = man.x + "" + man.y;

            // 更新棋盘
            delete play.map[man.y][man.x];
            play.map[y][x] = key;

            // 显示移动轨迹
            com.showPane(man.x, man.y, x, y);

            // 更新棋子位置
            man.x = x;
            man.y = y;
            man.alpha = 1;

            // 记录着法
            play.pace.push(pace + x + y);
            play.nowManKey = false;
            com.dot.dots = [];
            com.show();

            // 播放音效
            com.get("clickAudio").play();

            // AI思考
            setTimeout(play.AIPlay, 500);
        }
    }
}

/* =============================================
   AI自动走棋
   ============================================= */
play.AIPlay = function() {
    // 设置为AI回合
    play.my = -1;

    // 从棋谱库或AI算法获取着法
    var pace = AI.init(play.pace.join(""));

    // AI无着法可选，表示AI输了
    if (!pace) {
        play.showWin(1);  // 玩家赢了
        return;
    }

    // 记录AI着法
    play.pace.push(pace.join(""));

    // 获取被移动的棋子
    var key = play.map[pace[1]][pace[0]];
    play.nowManKey = key;

    // 获取目标位置的棋子
    var key = play.map[pace[3]][pace[2]];

    // 执行AI移动
    if (key) {
        play.AIclickMan(key, pace[2], pace[3]);
    } else {
        play.AIclickPoint(pace[2], pace[3]);
    }

    // 播放音效
    com.get("clickAudio").play();
}

/* =============================================
   检测长将违规
   中国象棋规则：连续三次相同位置将军为长将违规
   ============================================= */
play.checkFoul = function() {
    var p = play.pace;
    var len = parseInt(p.length, 10);

    // 检查最后9步是否有重复的将军着法
    if (len > 11 && p[len - 1] == p[len - 5] && p[len - 5] == p[len - 9]) {
        return p[len - 4].split("");
    }
    return false;
}

/* =============================================
   AI吃子处理
   ============================================= */
play.AIclickMan = function(key, x, y) {
    var man = com.mans[key];

    // 隐藏被吃棋子
    man.isShow = false;

    // 更新棋盘
    delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
    play.map[y][x] = play.nowManKey;

    // 显示移动轨迹
    play.showPane(com.mans[play.nowManKey].x, com.mans[play.nowManKey].y, x, y);

    // 更新棋子位置
    com.mans[play.nowManKey].x = x;
    com.mans[play.nowManKey].y = y;
    play.nowManKey = false;

    // 重绘
    com.show();

    // 检测胜负
    if (key == "j0") play.showWin(-1);  // AI输了
    if (key == "J0") play.showWin(1);  // AI赢了
}

/* =============================================
   AI移动到空位置处理
   ============================================= */
play.AIclickPoint = function(x, y) {
    var key = play.nowManKey;
    var man = com.mans[key];

    if (play.nowManKey) {
        // 更新棋盘
        delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
        play.map[y][x] = key;

        // 显示移动轨迹
        com.showPane(man.x, man.y, x, y);

        // 更新棋子位置
        man.x = x;
        man.y = y;
        play.nowManKey = false;
    }

    // 重绘
    com.show();
}

/* =============================================
   工具函数
   ============================================= */

/**
 * 检查坐标是否在位置列表中
 * @param {Array} ps - 位置列表
 * @param {Array} xy - 目标坐标
 * @returns {boolean} 是否存在
 */
play.indexOfPs = function(ps, xy) {
    for (var i = 0; i < ps.length; i++) {
        if (ps[i][0] == xy[0] && ps[i][1] == xy[1]) return true;
    }
    return false;
}

/**
 * 获取Canvas点击位置对应的棋盘坐标
 * @param {Event} e - 点击事件
 * @returns {Object} 包含x,y坐标的对象
 */
play.getClickPoint = function(e) {
    var domXY = com.getDomXY(com.canvas);
    // 计算相对于棋盘的位置
    var x = Math.round((e.pageX - domXY.x - com.pointStartX - 20) / com.spaceX);
    var y = Math.round((e.pageY - domXY.y - com.pointStartY - 20) / com.spaceY);
    return { "x": x, "y": y };
}

/**
 * 获取点击位置对应的棋子
 * @param {Event} e - 点击事件
 * @returns {string|boolean} 棋子标识，无棋子返回false
 */
play.getClickMan = function(e) {
    var clickXY = play.getClickPoint(e);
    var x = clickXY.x;
    var y = clickXY.y;
    // 检查坐标是否在棋盘范围内
    if (x < 0 || x > 8 || y < 0 || y > 9) return false;
    // 返回棋子标识
    return (play.map[y][x] && play.map[y][x] != "0") ? play.map[y][x] : false;
}

/**
 * 显示游戏结果
 * @param {number} my - 获胜方（1=玩家，-1=AI）
 */
play.showWin = function(my) {
    play.isPlay = false;
    if (my === 1) {
        alert("恭喜你，你赢了！");
    } else {
        alert("很遗憾，你输了！");
    }
}
