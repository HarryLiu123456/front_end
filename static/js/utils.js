/**
 * 工具函数
 */
const Utils = {
    // 深度克隆数组
    deepCloneArray: function(arr) {
        if (!Array.isArray(arr)) return arr;
        return arr.map((v, i) => Array.isArray(v) ? this.deepCloneArray(v) : v);
    },

    // 坐标是否有效
    isValidPosition: function(x, y) {
        return x >= 0 && x <= 8 && y >= 0 && y <= 9;
    },

    // 获取棋子类型(小写)
    getPieceType: function(key) {
        return key ? key.charAt(0).toLowerCase() : '';
    },

    // 获取棋子阵营
    getPieceCamp: function(key) {
        if (!key) return 0;
        const c = key.charAt(0);
        return c === c.toLowerCase() ? 1 : -1;
    },

    // 网格转像素
    gridToPixel: function(gridX, gridY, config) {
        return {
            pixelX: config.SPACE_X * gridX + config.POINT_START_X,
            pixelY: config.SPACE_Y * gridY + config.POINT_START_Y
        };
    },

    // 像素转网格
    pixelToGrid: function(pixelX, pixelY, config) {
        return {
            gridX: Math.round((pixelX - config.POINT_START_X) / config.SPACE_X),
            gridY: Math.round((pixelY - config.POINT_START_Y) / config.SPACE_Y)
        };
    },

    // 曼哈顿距离
    getManhattanDistance: function(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    },

    // 是否相邻
    isAdjacent: function(x1, y1, x2, y2) {
        return (Math.abs(x2 - x1) === 1 && y2 === y1) || (Math.abs(y2 - y1) === 1 && x2 === x1);
    },

    generateId: function() {
        return 'piece_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
