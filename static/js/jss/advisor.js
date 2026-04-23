/** 士类 - 斜线移动，限九宫内
 * 坐标：x 0-8从左到右，y 0-9从上到下
 * 红士在下方(y 7-9)，黑士在上方(y 0-2)
 */
import { Piece } from './piece.js';

export class Advisor extends Piece {
    constructor(x, y, camp, imageCache = {}) {
        super(x, y, camp, imageCache);
        this.setImagePath(camp === '红方' ? 'red_advisor' : 'black_advisor');
    }

    /** 获取合法移动位置 - 返回[x, y] */
    getLegalMoves(map, board) {
        const moves = [];
        const isRed = this.camp === '红方';
        const minY = isRed ? 7 : 0;  // 红方在下方，黑方在上方
        const maxY = isRed ? 9 : 2;

        // 4个斜线方向
        const dirs = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
        for (const [dx, dy] of dirs) {
            const nx = this.x + dx;
            const ny = this.y + dy;
            if (ny >= minY && ny <= maxY && nx >= 3 && nx <= 5 && this.canGoTo(nx, ny, board)) {
                moves.push([nx, ny]);
            }
        }
        return moves;
    }
}