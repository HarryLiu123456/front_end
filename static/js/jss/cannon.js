/**
 * 炮类
 * 移动规则：横竖直线移动，空跑不吃子，吃子需隔一子（炮架）
 */
import { Piece } from './piece.js';

export class Cannon extends Piece {
    constructor(x, y, camp, imageCache = {}) {
        super(x, y, camp, imageCache);
        this.setImagePath(camp === '红方' ? 'red_cannon' : 'black_cannon');
    }

    /** 获取合法移动位置 */
    getLegalMoves(map, board) {
        const moves = [];
        // 4个方向
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            let jumpCount = 0;
            for (let i = 1; i <= 9; i++) {
                const nx = this.x + dx * i;
                const ny = this.y + dy * i;
                if (nx < 0 || nx > 8 || ny < 0 || ny > 9) break;

                const piece = board.getPieceAt(nx, ny);
                if (piece) {
                    if (jumpCount === 0) {
                        jumpCount++;
                    } else if (piece.camp !== this.camp) {
                        moves.push([nx, ny]);
                        break;
                    } else {
                        break;
                    }
                } else if (jumpCount === 0) {
                    moves.push([nx, ny]);
                }
            }
        }
        return moves;
    }
}