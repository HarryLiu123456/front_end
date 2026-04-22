/**
 * 工具函数
 */

/**
 * 工具类
 */
export const Utils = {
    /**
     * 深度克隆数组
     * @param {Array} arr - 要克隆的数组
     * @returns {Array} 克隆后的新数组
     */
    deepCloneArray: function(arr) {
        if (!Array.isArray(arr)) return arr;
        return arr.map((v, i) => Array.isArray(v) ? this.deepCloneArray(v) : v);
    },

    /**
     * 坐标是否有效
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {boolean} 是否有效
     */
    isValidPosition: function(x, y) {
        return x >= 0 && x <= 8 && y >= 0 && y <= 9;
    },

    /**
     * 获取棋子类型(小写)
     * @param {string} key - 棋子标识
     * @returns {string} 棋子类型
     */
    getPieceType: function(key) {
        return key ? key.charAt(0).toLowerCase() : '';
    },

    /**
     * 获取棋子阵营
     * @param {string} key - 棋子标识
     * @returns {number} 阵营：1红方/-1黑方
     */
    getPieceCamp: function(key) {
        if (!key) return 0;
        const c = key.charAt(0);
        return c === c.toLowerCase() ? 1 : -1;
    },

    /**
     * 网格转像素坐标
     * @param {number} gridX - 网格X坐标
     * @param {number} gridY - 网格Y坐标
     * @param {Object} config - 棋盘配置
     * @returns {Object} 像素坐标 {pixelX, pixelY}
     */
    gridToPixel: function(gridX, gridY, config) {
        return {
            pixelX: config.SPACE_X * gridX + config.POINT_START_X,
            pixelY: config.SPACE_Y * gridY + config.POINT_START_Y
        };
    },

    /**
     * 像素转网格坐标
     * @param {number} pixelX - 像素X坐标
     * @param {number} pixelY - 像素Y坐标
     * @param {Object} config - 棋盘配置
     * @returns {Object} 网格坐标 {gridX, gridY}
     */
    pixelToGrid: function(pixelX, pixelY, config) {
        return {
            gridX: Math.round((pixelX - config.POINT_START_X) / config.SPACE_X),
            gridY: Math.round((pixelY - config.POINT_START_Y) / config.SPACE_Y)
        };
    },

    /**
     * 曼哈顿距离
     * @param {number} x1 - 起点X
     * @param {number} y1 - 起点Y
     * @param {number} x2 - 终点X
     * @param {number} y2 - 终点Y
     * @returns {number} 曼哈顿距离
     */
    getManhattanDistance: function(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    },

    /**
     * 是否相邻
     * @param {number} x1 - X1
     * @param {number} y1 - Y1
     * @param {number} x2 - X2
     * @param {number} y2 - Y2
     * @returns {boolean} 是否相邻
     */
    isAdjacent: function(x1, y1, x2, y2) {
        return (Math.abs(x2 - x1) === 1 && y2 === y1) || (Math.abs(y2 - y1) === 1 && x2 === x1);
    },

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId: function() {
        return 'piece_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
};
