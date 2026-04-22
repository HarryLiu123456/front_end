// 将/帅 - 直线一步移动，限九宫内
import { Piece } from './piece.js';
import { Config } from '../config.js';

export class King extends Piece {
    constructor(x, y, camp, imageCache = {}) {
        const { BASE_PATH } = Config.IMAGES;
        const prefix = camp === '红方' ? 'red_king' : 'black_king';
        const imagePath = BASE_PATH + prefix + '.png';
        const FENCode = camp === '红方' ? 'K' : 'k';
        super(x, y, camp, camp === '红方' ? '帅' : '将', FENCode, imagePath, imageCache);
    }

    getLegalMoves(map, board) {
        const moves = [];
        const [yMin, yMax] = this.camp === '红方' ? [7, 9] : [0, 2]; // 九宫边界

        // 上下左右移动
        if (this.y + 1 <= yMax && this.canGo(this.x, this.y + 1, map, board)) moves.push([this.x, this.y + 1]);
        if (this.y - 1 >= yMin && this.canGo(this.x, this.y - 1, map, board)) moves.push([this.x, this.y - 1]);
        if (this.x + 1 <= 5 && this.canGo(this.x + 1, this.y, map, board)) moves.push([this.x + 1, this.y]);
        if (this.x - 1 >= 3 && this.canGo(this.x - 1, this.y, map, board)) moves.push([this.x - 1, this.y]);

        // 将帅对面
        const enemy = this.camp === '红方' ? '黑方' : '红方';
        for (const p of board.getPiecesByCamp(enemy)) {
            if (p instanceof King && p.isAlive && this.x === p.x) {
                let blocked = false;
                const [startY, endY] = this.camp === '红方' ? [this.y + 1, p.y] : [p.y + 1, this.y];
                for (let y = startY; y < endY; y++) {
                    if (map[y] && map[y][this.x]) { blocked = true; break; }
                }
                if (!blocked) moves.push([p.x, p.y]);
                break;
            }
        }
        return moves;
    }

    canGo(x, y, map, board) {
        const piece = board.getPieceAt(x, y);
        return !piece || piece.camp !== this.camp;
    }
}
