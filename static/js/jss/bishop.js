/**
 * 相/象类
 * 田字形移动，有塞象眼限制，不过河
 * 红相只能在上半区(0-4行)，黑象只能在下半区(5-9行)
 */
import { Piece } from './piece.js';
import { Config } from '../config.js';

export class Bishop extends Piece {
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
        const prefix = camp === '红方' ? 'red_bishop' : 'black_bishop';
        this.imagePath = BASE_PATH + prefix + '.png';
    }

    /**
     * 获取相/象的合法移动位置
     * 田字形4方向移动，塞象眼检查，限制过河
     * @param {Array} map - 棋盘二维数组
     * @param {ChessBoard} board - 棋盘对象
     * @returns {Array} 可移动位置数组
     */
    getLegalMoves(map, board) {
        const moves = [];

        if (this.camp === '红方') {
            // 红相只能在上半区(0-4行)

            // 4点半方向（右上）：象眼为(x+1, y+1)
            if (this.y + 2 <= 9 && this.x + 2 <= 8 &&
                !board.getPieceAt(this.x + 1, this.y + 1) &&  // 塞象眼检查
                this.canGoTo(this.x + 2, this.y + 2, board)) {
                moves.push([this.x + 2, this.y + 2]);
            }

            // 7点半方向（左上）：象眼为(x-1, y+1)
            if (this.y + 2 <= 9 && this.x - 2 >= 0 &&
                !board.getPieceAt(this.x - 1, this.y + 1) &&
                this.canGoTo(this.x - 2, this.y + 2, board)) {
                moves.push([this.x - 2, this.y + 2]);
            }

            // 1点半方向（右下）：象眼为(x+1, y-1)
            if (this.y - 2 >= 0 && this.x + 2 <= 8 &&
                !board.getPieceAt(this.x + 1, this.y - 1) &&
                this.canGoTo(this.x + 2, this.y - 2, board)) {
                moves.push([this.x + 2, this.y - 2]);
            }

            // 10点半方向（左下）：象眼为(x-1, y-1)
            if (this.y - 2 >= 0 && this.x - 2 >= 0 &&
                !board.getPieceAt(this.x - 1, this.y - 1) &&
                this.canGoTo(this.x - 2, this.y - 2, board)) {
                moves.push([this.x - 2, this.y - 2]);
            }
        } else {
            // 黑象只能在下半区(5-9行)

            // 4点半方向（右上）
            if (this.y + 2 <= 9 && this.x + 2 <= 8 &&
                !board.getPieceAt(this.x + 1, this.y + 1) &&
                this.canGoTo(this.x + 2, this.y + 2, board)) {
                moves.push([this.x + 2, this.y + 2]);
            }

            // 7点半方向（左上）
            if (this.y + 2 <= 9 && this.x - 2 >= 0 &&
                !board.getPieceAt(this.x - 1, this.y + 1) &&
                this.canGoTo(this.x - 2, this.y + 2, board)) {
                moves.push([this.x - 2, this.y + 2]);
            }

            // 1点半方向（右下）
            if (this.y - 2 >= 0 && this.x + 2 <= 8 &&
                !board.getPieceAt(this.x + 1, this.y - 1) &&
                this.canGoTo(this.x + 2, this.y - 2, board)) {
                moves.push([this.x + 2, this.y - 2]);
            }

            // 10点半方向（左下）
            if (this.y - 2 >= 0 && this.x - 2 >= 0 &&
                !board.getPieceAt(this.x - 1, this.y - 1) &&
                this.canGoTo(this.x - 2, this.y - 2, board)) {
                moves.push([this.x - 2, this.y - 2]);
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