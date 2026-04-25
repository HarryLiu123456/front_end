/**
 * 士类
 * 移动规则：斜线移动一格，限制在九宫内
 */
import { Piece } from './piece.js';

export class Advisor extends Piece {
    constructor(x, y, camp, imageCache = {}) {
        super(x, y, camp, imageCache);
        this.setImagePath(camp === '红方' ? 'red_advisor' : 'black_advisor');
    }

    /** 获取合法移动位置 */
    getLegalMoves(map, board) {
        const moves = [];
        const isRed = this.camp === '红方';
        const minY = isRed ? 7 : 0;
        const maxY = isRed ? 9 : 2;

        // 4个斜线方向
        for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
            const nx = this.x + dx;
            const ny = this.y + dy;
            if (ny >= minY && ny <= maxY && nx >= 3 && nx <= 5 && this.canGoTo(nx, ny, board)) {
                moves.push([nx, ny]);
            }
        }
        return moves;
    }
}