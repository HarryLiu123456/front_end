/**
 * 将/帅类
 * 移动规则：直线移动一格，限制在九宫内
 * 特殊规则：可将帅对面（中间无子时可直接吃）
 */
import { Piece } from './piece.js';

export class King extends Piece {
    /**
     * 构造函数
     * @param {number} x - 棋盘x坐标
     * @param {number} y - 棋盘y坐标
     * @param {string} camp - 阵营
     * @param {Object} imageCache - 图片缓存
     */
    constructor(x, y, camp, imageCache = {}) {
        super(x, y, camp, imageCache);
        this.setImagePath(camp === '红方' ? 'red_king' : 'black_king');
    }

    /**
     * 获取合法移动位置
     * @param {Array} map - 棋盘网格
     * @param {Game} board - 游戏实例
     * @returns {Array} 合法移动 [[x,y], ...]
     */
    getLegalMoves(map, board) {
        const moves = [];
        const isRed = this.camp === '红方';
        const minY = isRed ? 7 : 0;  // 红方在下方，黑方在上方
        const maxY = isRed ? 9 : 2;

        // 4个直线方向：左右上下
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nx = this.x + dx;
            const ny = this.y + dy;
            if (ny >= minY && ny <= maxY && nx >= 3 && nx <= 5 && this.canGoTo(nx, ny, board)) {
                moves.push([nx, ny]);
            }
        }

        // 将帅对面：同列且中间无子时可吃
        const enemy = isRed ? '黑方' : '红方';
        const enemyKing = board.getPiecesByCamp(enemy).find(p => p instanceof King);
        if (enemyKing && enemyKing.x === this.x) {
            let blocked = false;
            const [startY, endY] = [Math.min(this.y, enemyKing.y) + 1, Math.max(this.y, enemyKing.y)];
            for (let y = startY; y < endY; y++) {
                if (map[this.x]?.[y]) { blocked = true; break; }
            }
            if (!blocked) moves.push([enemyKing.x, enemyKing.y]);
        }
        return moves;
    }
}