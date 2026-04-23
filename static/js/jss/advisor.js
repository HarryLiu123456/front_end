/**
 * 士类
 * 斜线一步移动，限制在九宫内
 * 红仕：7-9行，3-5列
 * 黑士：0-2行，3-5列
 */
import { Piece } from './piece.js';
import { Config } from '../config.js';

export class Advisor extends Piece {
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
        const prefix = camp === '红方' ? 'red_advisor' : 'black_advisor';
        this.imagePath = BASE_PATH + prefix + '.png';
    }

    /**
     * 获取士的合法移动位置
     * 斜线4方向一步移动，限九宫内
     * @param {Array} map - 棋盘二维数组
     * @param {ChessBoard} board - 棋盘对象
     * @returns {Array} 可移动位置数组
     */
    getLegalMoves(map, board) {
        const moves = [];

        if (this.camp === '红方') {
            // 红仕只能在上半九宫(7-9行, 3-5列)

            // 4点半方向（右上）
            if (this.y + 1 <= 9 && this.x + 1 <= 5 &&
                this.canGoTo(this.x + 1, this.y + 1, board)) {
                moves.push([this.x + 1, this.y + 1]);
            }

            // 7点半方向（左上）
            if (this.y + 1 <= 9 && this.x - 1 >= 3 &&
                this.canGoTo(this.x - 1, this.y + 1, board)) {
                moves.push([this.x - 1, this.y + 1]);
            }

            // 1点半方向（右下）
            if (this.y - 1 >= 7 && this.x + 1 <= 5 &&
                this.canGoTo(this.x + 1, this.y - 1, board)) {
                moves.push([this.x + 1, this.y - 1]);
            }

            // 10点半方向（左下）
            if (this.y - 1 >= 7 && this.x - 1 >= 3 &&
                this.canGoTo(this.x - 1, this.y - 1, board)) {
                moves.push([this.x - 1, this.y - 1]);
            }
        } else {
            // 黑士只能在下半九宫(0-2行, 3-5列)

            // 4点半方向（右上）
            if (this.y + 1 <= 2 && this.x + 1 <= 5 &&
                this.canGoTo(this.x + 1, this.y + 1, board)) {
                moves.push([this.x + 1, this.y + 1]);
            }

            // 7点半方向（左上）
            if (this.y + 1 <= 2 && this.x - 1 >= 3 &&
                this.canGoTo(this.x - 1, this.y + 1, board)) {
                moves.push([this.x - 1, this.y + 1]);
            }

            // 1点半方向（右下）
            if (this.y - 1 >= 0 && this.x + 1 <= 5 &&
                this.canGoTo(this.x + 1, this.y - 1, board)) {
                moves.push([this.x + 1, this.y - 1]);
            }

            // 10点半方向（左下）
            if (this.y - 1 >= 0 && this.x - 1 >= 3 &&
                this.canGoTo(this.x - 1, this.y - 1, board)) {
                moves.push([this.x - 1, this.y - 1]);
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