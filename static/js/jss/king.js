/**
 * 将/帅类
 * 直线一步移动，限制在九宫内
 * 支持"将帅对面"规则（直线相对且中间无子时可吃）
 */
import { Piece } from './piece.js';
import { Config } from '../config.js';

export class King extends Piece {
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
        const prefix = camp === '红方' ? 'red_king' : 'black_king';
        this.imagePath = BASE_PATH + prefix + '.png';
    }

    /**
     * 获取将/帅的合法移动位置
     * 直线4方向一步移动，限九宫内，支持将帅对面
     * @param {Array} map - 棋盘二维数组
     * @param {ChessBoard} board - 棋盘对象
     * @returns {Array} 可移动位置数组
     */
    getLegalMoves(map, board) {
        const moves = [];

        if (this.camp === '红方') {
            // 红帅只能在上半九宫(7-9行, 3-5列)

            // 下
            if (this.y + 1 <= 9 && this.canGoTo(this.x, this.y + 1, board)) {
                moves.push([this.x, this.y + 1]);
            }

            // 上
            if (this.y - 1 >= 7 && this.canGoTo(this.x, this.y - 1, board)) {
                moves.push([this.x, this.y - 1]);
            }

            // 右
            if (this.x + 1 <= 5 && this.canGoTo(this.x + 1, this.y, board)) {
                moves.push([this.x + 1, this.y]);
            }

            // 左
            if (this.x - 1 >= 3 && this.canGoTo(this.x - 1, this.y, board)) {
                moves.push([this.x - 1, this.y]);
            }

            // 将帅对面：检查与黑将是否在同一列且中间无子
            const enemyPieces = board.getPiecesByCamp('黑方');
            const enemyKing = enemyPieces.find(p => p instanceof King);
            if (enemyKing && enemyKing.x === this.x) {
                // 检查中间是否有其他棋子
                let blocked = false;
                const [startY, endY] = [this.y + 1, enemyKing.y];
                for (let y = startY; y < endY; y++) {
                    if (map[y] && map[y][this.x]) {
                        blocked = true;
                        break;
                    }
                }
                // 中间无子时，可走到敌方将的位置（吃将）
                if (!blocked) {
                    moves.push([enemyKing.x, enemyKing.y]);
                }
            }
        } else {
            // 黑将只能在下半九宫(0-2行, 3-5列)

            // 下
            if (this.y + 1 <= 2 && this.canGoTo(this.x, this.y + 1, board)) {
                moves.push([this.x, this.y + 1]);
            }

            // 上
            if (this.y - 1 >= 0 && this.canGoTo(this.x, this.y - 1, board)) {
                moves.push([this.x, this.y - 1]);
            }

            // 右
            if (this.x + 1 <= 5 && this.canGoTo(this.x + 1, this.y, board)) {
                moves.push([this.x + 1, this.y]);
            }

            // 左
            if (this.x - 1 >= 3 && this.canGoTo(this.x - 1, this.y, board)) {
                moves.push([this.x - 1, this.y]);
            }

            // 将帅对面：检查与红帅是否在同一列且中间无子
            const enemyPieces = board.getPiecesByCamp('红方');
            const enemyKing = enemyPieces.find(p => p instanceof King);
            if (enemyKing && enemyKing.x === this.x) {
                let blocked = false;
                const [startY, endY] = [this.y + 1, enemyKing.y];
                for (let y = startY; y < endY; y++) {
                    if (map[y] && map[y][this.x]) {
                        blocked = true;
                        break;
                    }
                }
                if (!blocked) {
                    moves.push([enemyKing.x, enemyKing.y]);
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