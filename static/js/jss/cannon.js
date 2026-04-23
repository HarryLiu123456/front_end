/**
 * 炮类
 * 横竖方向移动
 * 空位可走，吃子必须隔一子（炮架）
 */
import { Piece } from './piece.js';
import { Config } from '../config.js';

export class Cannon extends Piece {
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
        const prefix = camp === '红方' ? 'red_cannon' : 'black_cannon';
        this.imagePath = BASE_PATH + prefix + '.png';
    }

    /**
     * 获取炮的合法移动位置
     * 横竖方向移动，空位可走，吃子需隔一子（炮架）
     * @param {Array} map - 棋盘二维数组
     * @param {ChessBoard} board - 棋盘对象
     * @returns {Array} 可移动位置数组
     */
    getLegalMoves(map, board) {
        const moves = [];
        // 四个方向：左、右、上、下
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const [dx, dy] of directions) {
            let jumpCount = 0;  // 记录已遇到的棋子数

            for (let i = 1; i <= 9; i++) {
                const nx = this.x + dx * i;
                const ny = this.y + dy * i;

                // 检查是否超出棋盘边界
                if (nx < 0 || nx > 8 || ny < 0 || ny > 9) break;

                const piece = board.getPieceAt(nx, ny);

                if (piece) {
                    // 遇到棋子
                    if (jumpCount === 0) {
                        // 第一个棋子作为"炮架"，继续搜索
                        jumpCount++;
                        continue;
                    } else {
                        // 第二个棋子：敌方可吃
                        if (piece.camp !== this.camp) {
                            moves.push([nx, ny]);
                        }
                        // 遇子停止搜索
                        break;
                    }
                } else {
                    // 空位
                    if (jumpCount === 0) {
                        // 未遇棋子时空位可走
                        moves.push([nx, ny]);
                    }
                    // 遇一子后，空位不可走
                }
            }
        }

        return moves;
    }
}