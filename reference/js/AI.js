/* =============================================
   中国象棋游戏 - AI人工智能模块
   作者: 一叶孤舟 | qq:28701884 | 欢迎指教
   包含Alpha-Beta搜索算法、局面评估、着法生成等
   ============================================= */

/* 创建AI命名空间 */
var AI = AI || {};

/* 历史表，用于缓存已评估的局面，提高搜索效率 */
AI.historyTable = {};

/* =============================================
   AI初始化
   首先尝试从棋谱库匹配，如果匹配不到则使用搜索算法
   @param {Array} pace - 当前的着法记录
   @returns {Array|boolean} 着法 [原X, 原Y, 新X, 新Y] 或 false
   ============================================= */
AI.init = function(pace) {
    var bill = AI.historyBill || com.gambit; // 获取开局库/棋谱库

    // 如果棋谱库存在
    if (bill.length) {
        var len = pace.length;
        var arr = [];

        // 遍历棋谱库，查找匹配的着法序列
        for (var i = 0; i < bill.length; i++) {
            // 检查当前着法序列是否匹配棋谱前缀
            if (bill[i].slice(0, len) == pace) {
                arr.push(bill[i]);
            }
        }

        // 找到匹配的棋谱
        if (arr.length) {
            // 随机选择一个匹配的棋谱
            var inx = Math.floor(Math.random() * arr.length);
            AI.historyBill = arr;
            // 返回棋谱中的下一步着法
            return arr[inx].slice(len, len + 4).split("");
        } else {
            // 无匹配棋谱，清空历史库
            AI.historyBill = [];
        }
    }

    // 如果棋谱库中没有，启用人工智能搜索
    var initTime = new Date().getTime();

    // 设置搜索深度
    AI.treeDepth = play.depth;

    // 初始化搜索计数器
    AI.number = 0;
    AI.setHistoryTable.lenght = 0;

    // 调用Alpha-Beta搜索获取最佳着法
    var val = AI.getAlphaBeta(-99999, 99999, AI.treeDepth, com.arr2Clone(play.map), play.my);

    // 如果搜索失败，降低深度重试
    if (!val || val.value == -8888) {
        AI.treeDepth = 2;
        val = AI.getAlphaBeta(-99999, 99999, AI.treeDepth, com.arr2Clone(play.map), play.my);
    }

    // 找到有效着法
    if (val && val.value != -8888) {
        var man = play.mans[val.key];
        var nowTime = new Date().getTime();

        // 输出调试信息
        console.log('最佳着法：' +
            com.createMove(com.arr2Clone(play.map), man.x, man.y, val.x, val.y) +
            ' 搜索深度：' + AI.treeDepth + ' 搜索分支：' +
            AI.number + '个  最佳着法评估：' +
            val.value + '分' +
            ' 搜索用时：' +
            (nowTime - initTime) + '毫秒');

        // 返回着法坐标
        return [man.x, man.y, val.x, val.y];
    } else {
        // AI无法找到有效着法，返回false
        return false;
    }
}

/* =============================================
   迭代加深搜索
   逐步增加搜索深度，直到时间耗尽
   @param {Array} map - 棋盘状态
   @param {number} my - 当前选手
   @returns {Object|boolean} 最佳着法或false
   ============================================= */
AI.iterativeSearch = function(map, my) {
    var timeOut = 100;  // 超时时间（毫秒）
    var initDepth = 1;  // 初始搜索深度
    var maxDepth = 8;   // 最大搜索深度
    AI.treeDepth = 0;
    var initTime = new Date().getTime();
    var val = {};

    // 迭代加深
    for (var i = initDepth; i <= maxDepth; i++) {
        var nowTime = new Date().getTime();
        AI.treeDepth = i;
        AI.aotuDepth = i;

        // 执行Alpha-Beta搜索
        var val = AI.getAlphaBeta(-99999, 99999, AI.treeDepth, map, my);

        // 检查是否超时
        if (nowTime - initTime > timeOut) {
            return val;
        }
    }
    return false;
}

/* =============================================
   获取棋盘上所有己方棋子
   @param {Array} map - 棋盘状态
   @param {number} my - 阵营
   @returns {Array} 己方棋子数组
   ============================================= */
AI.getMapAllMan = function(map, my) {
    var mans = [];

    // 遍历整个棋盘
    for (var i = 0; i < map.length; i++) {
        for (var n = 0; n < map[i].length; n++) {
            var key = map[i][n];
            // 检查是否是己方棋子
            if (key && play.mans[key].my == my) {
                play.mans[key].x = n;
                play.mans[key].y = i;
                mans.push(play.mans[key]);
            }
        }
    }
    return mans;
}

/* =============================================
   获取所有可能的着法
   @param {Array} map - 棋盘状态
   @param {number} my - 阵营
   @returns {Array} 着法数组，每项为 [原X, 原Y, 新X, 新Y, 棋子Key]
   ============================================= */
AI.getMoves = function(map, my) {
    var manArr = AI.getMapAllMan(map, my);
    var moves = [];
    var foul = play.isFoul;  // 获取犯规着法（长将）

    // 遍历所有己方棋子
    for (var i = 0; i < manArr.length; i++) {
        var man = manArr[i];
        // 获取该棋子的所有可能着点
        var val = man.bl(map);

        // 遍历所有着点
        for (var n = 0; n < val.length; n++) {
            var x = man.x;
            var y = man.y;
            var newX = val[n][0];
            var newY = val[n][1];

            // 排除长将着法（违规）
            if (foul[0] != x || foul[1] != y || foul[2] != newX || foul[3] != newY) {
                moves.push([x, y, newX, newY, man.key]);
            }
        }
    }
    return moves;
}

/* =============================================
   Alpha-Beta搜索算法
   核心博弈树搜索算法，使用Alpha-Beta剪枝优化
   @param {number} A - Alpha值（己方最佳值）
   @param {number} B - Beta值（对方最佳值）
   @param {number} depth - 搜索深度
   @param {Array} map - 棋盘状态
   @param {number} my - 当前阵营
   @returns {Object} 最佳着法
   ============================================= */
AI.getAlphaBeta = function(A, B, depth, map, my) {
    // 到达搜索深度限制，返回局面评估
    if (depth == 0) {
        return { "value": AI.evaluate(map, my) };
    }

    // 生成所有可能的着法
    var moves = AI.getMoves(map, my);

    // 遍历所有着法
    for (var i = 0; i < moves.length; i++) {
        // 执行着法
        var move = moves[i];
        var key = move[4];
        var oldX = move[0];
        var oldY = move[1];
        var newX = move[2];
        var newY = move[3];
        var clearKey = map[newY][newX] || "";  // 记录被吃的棋子

        // 更新棋盘
        map[newY][newX] = key;
        delete map[oldY][oldX];
        play.mans[key].x = newX;
        play.mans[key].y = newY;

        // 检查是否吃掉了将/帅（获胜）
        if (clearKey == "j0" || clearKey == "J0") {
            // 撤销着法
            play.mans[key].x = oldX;
            play.mans[key].y = oldY;
            map[oldY][oldX] = key;
            delete map[newY][newX];
            if (clearKey) {
                map[newY][newX] = clearKey;
            }

            // 返回获胜着法
            return { "key": key, "x": newX, "y": newY, "value": 8888 };
        } else {
            // 递归搜索（交换阵营）
            var val = -AI.getAlphaBeta(-B, -A, depth - 1, map, -my).value;

            // 撤销着法
            play.mans[key].x = oldX;
            play.mans[key].y = oldY;
            map[oldY][oldX] = key;
            delete map[newY][newX];
            if (clearKey) {
                map[newY][newX] = clearKey;
            }

            // Beta剪枝
            if (val >= B) {
                return { "key": key, "x": newX, "y": newY, "value": B };
            }

            // 更新Alpha值和最佳着法
            if (val > A) {
                A = val;
                // 记录根节点的最佳着法
                if (AI.treeDepth == depth) var rootKey = { "key": key, "x": newX, "y": newY, "value": A };
            }
        }
    }

    // 如果是根节点递归返回
    if (AI.treeDepth == depth) {
        if (!rootKey) {
            // AI没有最佳着法，说明被将死了
            return false;
        } else {
            return rootKey;
        }
    }

    return { "key": key, "x": newX, "y": newY, "value": A };
}

/* =============================================
   将着法记录到历史表
   用于置换表优化（但本代码中未完全启用）
   ============================================= */
AI.setHistoryTable = function(txtMap, depth, value, my) {
    AI.setHistoryTable.lenght++;
    AI.historyTable[txtMap] = { depth: depth, value: value };
}

/* =============================================
   局面评估函数
   计算当前局面的总价值差
   @param {Array} map - 棋盘状态
   @param {number} my - 当前阵营
   @returns {number} 局面评估值
   ============================================= */
AI.evaluate = function(map, my) {
    var val = 0;

    // 遍历整个棋盘
    for (var i = 0; i < map.length; i++) {
        for (var n = 0; n < map[i].length; n++) {
            var key = map[i][n];
            if (key) {
                // 累加棋子价值（考虑位置）
                // 己方棋子乘以my（1或-1）得到正价值，对方棋子得到负价值
                val += play.mans[key].value[i][n] * play.mans[key].my;
            }
        }
    }

    // 计数器，记录评估次数
    AI.number++;

    // 返回评估值，乘以my确保视角正确
    return val * my;
}
