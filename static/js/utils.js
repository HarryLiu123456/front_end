/**
 * 工具函数模块
 * 提供棋子映射转换、坐标系统转换等功能
 */
import { GameConfig } from './config.js';

export const Utils = {
    // ==================== 通用工具 ====================

    /** 深度克隆数组（递归） */
    deepCloneArray: function(arr) {
        if (!Array.isArray(arr)) return arr;
        return arr.map(v => Array.isArray(v) ? this.deepCloneArray(v) : v);
    },

    /** 坐标是否有效，棋盘范围：x=0-8, y=0-9 */
    isValidPosition: function(x, y) {
        return x >= 0 && x <= 8 && y >= 0 && y <= 9;
    },

    // ==================== 棋子映射转换 ====================

    /** 类名转FEN字符，如 "King" -> "k" */
    classNameToFen: function(className) {
        const info = GameConfig.PIECE_MAP[className];
        return info ? info.fen : '';
    },

    /** FEN字符转类名，如 "k" -> "King" */
    fenToClassName: function(fen) {
        const info = GameConfig.FEN_PIECE_MAP[fen];
        return info ? info.className : '';
    },

    /** FEN字符转阵营，如 "k" -> "黑方" */
    fenToCamp: function(fen) {
        const info = GameConfig.FEN_PIECE_MAP[fen];
        return info ? info.camp : '';
    },

    /** 类名转红方名称 */
    classNameToRedName: function(className) {
        const info = GameConfig.PIECE_MAP[className];
        return info ? info.redName : '';
    },

    /** 类名转黑方名称 */
    classNameToBlackName: function(className) {
        const info = GameConfig.PIECE_MAP[className];
        return info ? info.blackName : '';
    },

    /** 获取类名的完整信息 */
    getPieceInfo: function(className) {
        return GameConfig.PIECE_MAP[className] || null;
    },

    /** 获取所有棋子类名列表 */
    getClassList: function() {
        return GameConfig.CLASS_LIST;
    },

    // ==================== 坐标系统转换 ====================
    // 后端坐标系：左下角a0，x=a-i(从左到右)，y=0-9(从下到上)
    // 游戏坐标系：左上角(0,0)，x=0-8(从左到右)，y=0-9(从上到下)

    /** 棋盘x坐标转字母，如 0->'a', 2->'c' */
    xToLetter: function(x) {
        return String.fromCharCode('a'.charCodeAt(0) + x);
    },

    /** 字母转棋盘x坐标，如 'a'->0, 'c'->2 */
    letterToX: function(letter) {
        return letter.charCodeAt(0) - 'a'.charCodeAt(0);
    },

    /**
     * 后端位置字符串转游戏坐标
     * @param {string} posStr 后端位置，如 "c2"
     * @returns {{x:number, y:number}|null} 游戏坐标
     * @example backendPosToGame('c2') -> {x:2, y:7}
     */
    backendPosToGame: function(posStr) {
        if (!posStr || posStr.length < 2) return null;
        const x = posStr[0].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
        const y = 9 - parseInt(posStr[1]);
        if (x < 0 || x > 8 || isNaN(y)) return null;
        return { x, y };
    },

    /**
     * 解析后端移动字符串
     * @param {string} moveStr 移动字符串，如 "c2b7"（从c2到b7）
     * @returns {{from:{x,y}, to:{x,y}}|null} 游戏坐标格式
     * @example parseBackendMoveString('c2b7') -> {from:{x:2,y:7}, to:{x:1,y:2}}
     */
    parseBackendMoveString: function(moveStr) {
        if (!moveStr || moveStr.length < 4) return null;
        const from = this.backendPosToGame(moveStr.substring(0, 2));
        const to = this.backendPosToGame(moveStr.substring(2, 4));
        return (from && to) ? { from, to } : null;
    }
};