/**
 * 兵/卒类
 * 未过河时只能前进，过河后可左右移动
 * 红兵：y <= 4 为过河
 * 黑卒：y >= 5 为过河
 */
import { Piece } from './piece.js';
import { Config } from '../config.js';

export class Pawn extends Piece {
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
        const prefix = camp === '红方' ? 'red_pawn' : 'black_pawn';
        this.imagePath = BASE_PATH + prefix + '.png';
    }

    /**
     * 获取兵/卒的合法移动位置
     * 红兵向上(y减小)，黑卒向下(y增大)
     * 未过河只能前进，过河后可左右移动
     * @param {Array} map - 棋盘二维数组
     * @param {ChessBoard} board - 棋盘对象
     * @returns {Array} 可移动位置数组
     */
    getLegalMoves(map, board) {
        const moves = [];

        if (this.camp === '红方') {
            // 红兵：向上走（y减小）

            // 前进（向上）
            if (this.y - 1 >= 0 && this.canGoTo(this.x, this.y - 1, board)) {
                moves.push([this.x, this.y - 1]);
            }

            // 过河后（y <= 4）可左右移动
            if (this.y <= 4) {
                // 向右
                if (this.x + 1 <= 8 && this.canGoTo(this.x + 1, this.y, board)) {
                    moves.push([this.x + 1, this.y]);
                }
                // 向左
                if (this.x - 1 >= 0 && this.canGoTo(this.x - 1, this.y, board)) {
                    moves.push([this.x - 1, this.y]);
                }
            }
        } else {
            // 黑卒：向下走（y增大）

            // 前进（向下）
            if (this.y + 1 <= 9 && this.canGoTo(this.x, this.y + 1, board)) {
                moves.push([this.x, this.y + 1]);
            }

            // 过河后（y >= 5）可左右移动
            if (this.y >= 5) {
                // 向右
                if (this.x + 1 <= 8 && this.canGoTo(this.x + 1, this.y, board)) {
                    moves.push([this.x + 1, this.y]);
                }
                // 向左
                if (this.x - 1 >= 0 && this.canGoTo(this.x - 1, this.y, board)) {
                    moves.push([this.x - 1, this.y]);
                }
            }
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
        const piece = board.getPieceAt(x, y);
        return !piece || piece.camp !== this.camp;
    }
}