// 相/象 - 田字移动，塞象眼限制，不过河
import { Piece } from './piece.js';
import { Config } from '../config.js';

export class Bishop extends Piece {
    constructor(x, y, camp, imageCache = {}) {
        const { BASE_PATH } = Config.IMAGES;
        const prefix = camp === '红方' ? 'red_bishop' : 'black_bishop';
        const imagePath = BASE_PATH + prefix + '.png';
        const FENCode = camp === '红方' ? 'B' : 'b';
        super(x, y, camp, camp === '红方' ? '相' : '象', FENCode, imagePath, imageCache);
    }

    getLegalMoves(map, board) {
        const moves = [];
        const positions = this.camp === '红方'
            ? [[6, 7], [6, 5], [0, 7], [0, 5], [8, 7], [8, 5], [2, 9], [2, 5]]  // 红相
            : [[6, 2], [6, 4], [0, 2], [0, 4], [8, 2], [8, 4], [2, 0], [2, 4]]; // 黑象
        for (const [nx, ny] of positions) {
            if (this.canGo(nx, ny, map, board)) moves.push([nx, ny]);
        }
        return moves;
    }

    // 检查塞象眼
    canGo(x, y, map, board) {
        const midX = (this.x + x) / 2;
        const midY = (this.y + y) / 2;
        if (board.getPieceAt(midX, midY)) return false;
        const piece = board.getPieceAt(x, y);
        return !piece || piece.camp !== this.camp;
    }
}
