// 马 - 日字移动，蹩马腿限制
import { Piece } from './piece.js';
import { Config } from '../config.js';

export class Knight extends Piece {
    constructor(x, y, camp, imageCache = {}) {
        const { BASE_PATH } = Config.IMAGES;
        const prefix = camp === '红方' ? 'red_knight' : 'black_knight';
        const imagePath = BASE_PATH + prefix + '.png';
        const FENCode = camp === '红方' ? 'N' : 'n';
        super(x, y, camp, '马', FENCode, imagePath, imageCache);
    }

    getLegalMoves(map, board) {
        const moves = [];
        const directions = [[1, -2], [2, -1], [2, 1], [1, 2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];

        for (const [dx, dy] of directions) {
            const nx = this.x + dx;
            const ny = this.y + dy;
            // 蹩马腿检查
            const legX = this.x + (dx > 0 ? 1 : -1) * (Math.abs(dx) === 2 ? 1 : 0);
            const legY = this.y + (dy > 0 ? 1 : -1) * (Math.abs(dy) === 2 ? 1 : 0);
            if (this.isValidPos(nx, ny) && !board.getPieceAt(legX, legY)) {
                if (this.canGo(nx, ny, map, board)) moves.push([nx, ny]);
            }
        }
        return moves;
    }

    canGo(x, y, map, board) {
        if (x < 0 || x > 8 || y < 0 || y > 9) return false;
        const piece = board.getPieceAt(x, y);
        return !piece || piece.camp !== this.camp;
    }

    isValidPos(x, y) {
        return x >= 0 && x <= 8 && y >= 0 && y <= 9;
    }
}
