/**
 * 车类
 * 移动规则：横竖直线移动，不能越子，吃敌方棋子停止
 */
import { Piece } from './piece.js';

export class Rook extends Piece {
    constructor(x, y, camp, imageCache = {}) {
        super(x, y, camp, imageCache);
        this.setImagePath(camp === '红方' ? 'red_rook' : 'black_rook');
    }

    /** 获取合法移动位置 */
    getLegalMoves(map, board) {
        const moves = [];
        // 4个方向：左右上下
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            for (let i = 1; i <= 9; i++) {
                const nx = this.x + dx * i;
                const ny = this.y + dy * i;
                if (nx < 0 || nx > 8 || ny < 0 || ny > 9) break;

                const piece = board.getPieceAt(nx, ny);
                if (piece) {
                    if (piece.camp !== this.camp) moves.push([nx, ny]);
                    break;
                }
                moves.push([nx, ny]);
            }
        }
        return moves;
    }
}