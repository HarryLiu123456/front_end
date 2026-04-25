/**
 * 兵/卒类
 * 移动规则：未过河只能前进，过河后可左右移动
 * 红方在上方（y小），黑方在下方（y大）
 */
import { Piece } from './piece.js';

export class Pawn extends Piece {
    constructor(x, y, camp, imageCache = {}) {
        super(x, y, camp, imageCache);
        this.setImagePath(camp === '红方' ? 'red_pawn' : 'black_pawn');
    }

    /** 获取合法移动位置 */
    getLegalMoves(map, board) {
        const moves = [];
        const isRed = this.camp === '红方';
        // 过河：红方y<=4，黑方y>=5
        const crossed = isRed ? this.y <= 4 : this.y >= 5;

        // 前进：红方向上(y-)，黑方向下(y+)
        const ny = this.y + (isRed ? -1 : 1);
        if (ny >= 0 && ny <= 9 && this.canGoTo(this.x, ny, board)) {
            moves.push([this.x, ny]);
        }

        // 过河后可左右移动
        if (crossed) {
            if (this.x > 0 && this.canGoTo(this.x - 1, this.y, board)) moves.push([this.x - 1, this.y]);
            if (this.x < 8 && this.canGoTo(this.x + 1, this.y, board)) moves.push([this.x + 1, this.y]);
        }
        return moves;
    }
}