/**
 * 马类
 * 日字形移动，有蹩马腿限制
 * 马走"日"字，即先直走一格，再横走一格
 */
import { Piece } from './piece.js';
import { Config } from '../config.js';

export class Knight extends Piece {
    /**
     * 构造函数
     * @param {number} x - 棋盘X坐标
     * @param {number} y - 棋盘Y坐标
     * @param {string} camp - 阵营
     * @param {Object} imageCache - 图片缓存
     */
    constructor(x, y, camp, imageCache = {}) {
        super(x, y, camp, imageCache);
        const { BASE_PATH } = Config.IMAGES;
        const prefix = camp === '红方' ? 'red_knight' : 'black_knight';
        this.imagePath = BASE_PATH + prefix + '.png';
    }

    /**
     * 获取马的合法移动位置
     * 马有8个方向的日字移动，受蹩马腿限制
     * @param {Array} map - 棋盘二维数组
     * @param {ChessBoard} board - 棋盘对象
     * @returns {Array} 可移动位置数组
     */
    getLegalMoves(map, board) {
        const moves = [];

        // 马的8个方向（时钟12点方向顺时针编号）
        // 1点方向（左上）：蹩腿点为(0,-1)
        if (this.y - 2 >= 0 && this.x + 1 <= 8 &&
            !board.getPieceAt(this.x, this.y - 1) &&  // 检查蹩马腿
            this.canGoTo(this.x + 1, this.y - 2, board)) {
            moves.push([this.x + 1, this.y - 2]);
        }

        // 2点方向（右上）：蹩腿点为(1,0)
        if (this.y - 1 >= 0 && this.x + 2 <= 8 &&
            !board.getPieceAt(this.x + 1, this.y) &&
            this.canGoTo(this.x + 2, this.y - 1, board)) {
            moves.push([this.x + 2, this.y - 1]);
        }

        // 4点方向（右）：蹩腿点为(1,0)
        if (this.y + 1 <= 9 && this.x + 2 <= 8 &&
            !board.getPieceAt(this.x + 1, this.y) &&
            this.canGoTo(this.x + 2, this.y + 1, board)) {
            moves.push([this.x + 2, this.y + 1]);
        }

        // 5点方向（右下）：蹩腿点为(0,1)
        if (this.y + 2 <= 9 && this.x + 1 <= 8 &&
            !board.getPieceAt(this.x, this.y + 1) &&
            this.canGoTo(this.x + 1, this.y + 2, board)) {
            moves.push([this.x + 1, this.y + 2]);
        }

        // 7点方向（左下）：蹩腿点为(0,1)
        if (this.y + 2 <= 9 && this.x - 1 >= 0 &&
            !board.getPieceAt(this.x, this.y + 1) &&
            this.canGoTo(this.x - 1, this.y + 2, board)) {
            moves.push([this.x - 1, this.y + 2]);
        }

        // 8点方向（左）：蹩腿点为(-1,0)
        if (this.y + 1 <= 9 && this.x - 2 >= 0 &&
            !board.getPieceAt(this.x - 1, this.y) &&
            this.canGoTo(this.x - 2, this.y + 1, board)) {
            moves.push([this.x - 2, this.y + 1]);
        }

        // 10点方向（左上）：蹩腿点为(-1,0)
        if (this.y - 1 >= 0 && this.x - 2 >= 0 &&
            !board.getPieceAt(this.x - 1, this.y) &&
            this.canGoTo(this.x - 2, this.y - 1, board)) {
            moves.push([this.x - 2, this.y - 1]);
        }

        // 11点方向（正上）：蹩腿点为(0,-1)
        if (this.y - 2 >= 0 && this.x - 1 >= 0 &&
            !board.getPieceAt(this.x, this.y - 1) &&
            this.canGoTo(this.x - 1, this.y - 2, board)) {
            moves.push([this.x - 1, this.y - 2]);
        }

        return moves;
    }

    /**
     * 检查是否可以走到目标位置
     * @param {number} x - 目标X坐标
     * @param {number} y - 目标Y坐标
     * @param {ChessBoard} board - 棋盘对象
     * @returns {boolean} 是否可走
     */
    canGoTo(x, y, board) {
        if (x < 0 || x > 8 || y < 0 || y > 9) return false;
        const piece = board.getPieceAt(x, y);
        return !piece || piece.camp !== this.camp;
    }
}