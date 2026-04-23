/** 车类 - 横竖直线移动，不能越子
 * 坐标：x 0-8从左到右，y 0-9从上到下
 */
import { Piece } from './piece.js';

export class Rook extends Piece {
    constructor(x, y, camp, imageCache = {}) {
        super(x, y, camp, imageCache);
        this.setImagePath(camp === '红方' ? 'red_rook' : 'black_rook');
    }

    /** 获取合法移动位置 - 返回[x, y] */
    getLegalMoves(map, board) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const [dx, dy] of directions) {
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