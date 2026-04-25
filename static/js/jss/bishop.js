/**
 * 相/象类
 * 移动规则：田字对角移动，塞象眼，不过河
 */
import { Piece } from './piece.js';

export class Bishop extends Piece {
    constructor(x, y, camp, imageCache = {}) {
        super(x, y, camp, imageCache);
        this.setImagePath(camp === '红方' ? 'red_bishop' : 'black_bishop');
    }

    /** 获取合法移动位置 */
    getLegalMoves(map, board) {
        const moves = [];
        const isRed = this.camp === '红方';
        const minY = isRed ? 5 : 0;
        const maxY = isRed ? 9 : 4;

        // 4个田字方向：[目标偏移, 象眼偏移]
        const dirs = [
            [[2, 2], [1, 1]], [[-2, 2], [-1, 1]],
            [[2, -2], [1, -1]], [[-2, -2], [-1, -1]]
        ];
        
        for (const [[dx, dy], [ex, ey]] of dirs) {
            const nx = this.x + dx;
            const ny = this.y + dy;
            const ex2 = this.x + ex;
            const ey2 = this.y + ey;
            // 塞象眼检查 + 边界 + 过河限制
            if (ny >= minY && ny <= maxY && nx >= 0 && nx <= 8 &&
                !board.getPieceAt(ex2, ey2) && this.canGoTo(nx, ny, board)) {
                moves.push([nx, ny]);
            }
        }
        return moves;
    }
}