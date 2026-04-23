/** 兵/卒类 - 未过河只能前进，过河后可左右移动
 * 坐标：x 0-8从左到右，y 0-9从上到下
 * 红方在棋盘下方（y 7-9），黑方在上方（y 0-4）
 * 红兵向上走(y-)，黑卒向下走(y+)
 */
import { Piece } from './piece.js';

export class Pawn extends Piece {
    constructor(x, y, camp, imageCache = {}) {
        super(x, y, camp, imageCache);
        this.setImagePath(camp === '红方' ? 'red_pawn' : 'black_pawn');
    }

    /** 获取合法移动位置 - 返回[x, y] */
    getLegalMoves(map, board) {
        const moves = [];
        const isRed = this.camp === '红方';
        // 红方过河：y <= 4（已越过楚河），黑方过河：y >= 5
        const crossed = isRed ? this.y <= 4 : this.y >= 5;

        // 前进方向：红方向上(y-)，黑方向下(y+)
        const forward = isRed ? -1 : 1;
        const ny = this.y + forward;
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