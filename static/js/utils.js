/** 工具函数 - 基于Config中的映射进行转换 */
import { Config } from './config.js';

export const Utils = {
    /** 深度克隆数组 */
    deepCloneArray: function(arr) {
        if (!Array.isArray(arr)) return arr;
        return arr.map(v => Array.isArray(v) ? this.deepCloneArray(v) : v);
    },

    /** 坐标是否有效 (x: 0-8, y: 0-9) */
    isValidPosition: function(x, y) {
        return x >= 0 && x <= 8 && y >= 0 && y <= 9;
    },

    /** 生成唯一ID */
    generateId: function() {
        return 'piece_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // ==================== 棋子映射转换 ====================

    /** 类名转FEN字符 */
    classNameToFen: function(className) {
        const info = Config.PIECE_MAP[className];
        return info ? info.fen : '';
    },

    /** FEN字符转类名 */
    fenToClassName: function(fen) {
        return Config.FEN_PIECE_MAP[fen] || '';
    },

    /** FEN字符转阵营 */
    fenToCamp: function(fen) {
        return fen === fen.toLowerCase() ? '黑方' : '红方';
    },

    /** 类名转红方名称 */
    classNameToRedName: function(className) {
        const info = Config.PIECE_MAP[className];
        return info ? info.redName : '';
    },

    /** 类名转黑方名称 */
    classNameToBlackName: function(className) {
        const info = Config.PIECE_MAP[className];
        return info ? info.blackName : '';
    },

    /** 获取类名的完整信息 */
    getPieceInfo: function(className) {
        return Config.PIECE_MAP[className] || null;
    },

    /** 获取所有棋子类名列表 */
    getClassList: function() {
        return Config.CLASS_LIST;
    },

    /** 棋盘x坐标转字母(a-i) */
    xToLetter: function(x) {
        return String.fromCharCode('a'.charCodeAt(0) + x);
    },

    /** 字母(a-i)转棋盘x坐标 */
    letterToX: function(letter) {
        return letter.charCodeAt(0) - 'a'.charCodeAt(0);
    }
};