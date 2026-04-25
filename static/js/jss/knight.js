/**
 * 马类
 * 移动规则：日字移动，蹩马腿
 */
import { Piece } from './piece.js';

export class Knight extends Piece {
    constructor(x, y, camp, imageCache = {}) {
        super(x, y, camp, imageCache);
        this.setImagePath(camp === '红方' ? 'red_knight' : 'black_knight');
    }

    /** 获取合法移动位置 */
    getLegalMoves(map, board) {
        const moves = [];
        // 8个日字方向：[蹩腿偏移, 目标偏移]
        const dirs = [
            [[-1, 0], [-2, 1]], [[0, -1], [-1, -2]], [[0, -1], [1, -2]], [[1, 0], [2, -1]],
            [[1, 0], [2, 1]], [[0, 1], [1, 2]], [[0, 1], [-1, 2]], [[-1, 0], [-2, -1]]
        ];
        
        for (const [[bx, by], [dx, dy]] of dirs) {
            const blockX = this.x + bx;
            const blockY = this.y + by;
            const nx = this.x + dx;
            const ny = this.y + dy;
            // 蹩马腿检查 + 边界检查
            if (nx >= 0 && nx <= 8 && ny >= 0 && ny <= 9 &&
                !board.getPieceAt(blockX, blockY) && this.canGoTo(nx, ny, board)) {
                moves.push([nx, ny]);
            }
        }
        return moves;
    }
}