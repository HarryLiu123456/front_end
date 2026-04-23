/** 将/帅类 - 直线移动，限九宫，支持将帅对面
 * 坐标：x 0-8从左到右，y 0-9从上到下
 * 红帅在下方(y 7-9)，黑将在上方(y 0-2)
 */
import { Piece } from './piece.js';

export class King extends Piece {
    constructor(x, y, camp, imageCache = {}) {
        super(x, y, camp, imageCache);
        this.setImagePath(camp === '红方' ? 'red_king' : 'black_king');
    }

    /** 获取合法移动位置 - 返回[x, y] */
    getLegalMoves(map, board) {
        const moves = [];
        const isRed = this.camp === '红方';
        const minY = isRed ? 7 : 0;  // 红方在下方，黑方在上方
        const maxY = isRed ? 9 : 2;

        // 4个直线方向
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dx, dy] of dirs) {
            const nx = this.x + dx;
            const ny = this.y + dy;
            if (ny >= minY && ny <= maxY && nx >= 3 && nx <= 5 && this.canGoTo(nx, ny, board)) {
                moves.push([nx, ny]);
            }
        }

        // 将帅对面：检查与敌方将在同一列（x相同）且中间无子
        const enemy = isRed ? '黑方' : '红方';
        const enemyPieces = board.getPiecesByCamp(enemy);
        const enemyKing = enemyPieces.find(p => p instanceof King);
        if (enemyKing && enemyKing.x === this.x) {
            let blocked = false;
            const [startY, endY] = [Math.min(this.y, enemyKing.y) + 1, Math.max(this.y, enemyKing.y)];
            for (let y = startY; y < endY; y++) {
                if (map[this.x] && map[this.x][y]) { blocked = true; break; }
            }
            if (!blocked) moves.push([enemyKing.x, enemyKing.y]);
        }
        return moves;
    }
}