/**
 * 车类
 * 沿横竖方向直线移动，不能越子
 * 遇到己方棋子停止，遇到敌方棋子可吃
 */
import { Piece } from './piece.js';
import { Config } from '../config.js';

export class Rook extends Piece {
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
        const prefix = camp === '红方' ? 'red_rook' : 'black_rook';
        this.imagePath = BASE_PATH + prefix + '.png';
    }

    /**
     * 获取车的所有合法移动位置
     * 车沿4个方向（上下左右）直线移动，遇子停止
     * @param {Array} map - 棋盘二维数组
     * @param {ChessBoard} board - 棋盘对象
     * @returns {Array} 可移动位置数组 [[x1,y1], [x2,y2], ...]
     */
    getLegalMoves(map, board) {
        const moves = [];
        // 四个方向：上、下、左、右
        const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];

        for (const [dx, dy] of directions) {
            // 沿当前方向逐步搜索
            for (let i = 1; i <= 9; i++) {
                const nx = this.x + dx * i;
                const ny = this.y + dy * i;

                // 检查是否超出棋盘边界
                if (nx < 0 || nx > 8 || ny < 0 || ny > 9) break;

                const piece = board.getPieceAt(nx, ny);

                if (piece) {
                    // 遇到棋子
                    if (piece.camp !== this.camp) {
                        // 敌方棋子可吃
                        moves.push([nx, ny]);
                    }
                    // 遇子停止搜索
                    break;
                } else {
                    // 空位可走
                    moves.push([nx, ny]);
                }
            }
        }
        return moves;
    }
}