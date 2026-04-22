// 车 - 横竖直线移动，不能越子
import { Piece } from './piece.js';
import { Config } from '../config.js';

export class Rook extends Piece {
    constructor(x, y, camp, imageCache = {}) {
        const { BASE_PATH } = Config.IMAGES;
        const prefix = camp === '红方' ? 'red_rook' : 'black_rook';
        const imagePath = BASE_PATH + prefix + '.png';
        const FENCode = camp === '红方' ? 'R' : 'r';
        super(x, y, camp, '车', FENCode, imagePath, imageCache);
    }

    getLegalMoves(map, board) {
        const moves = [];
        const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];

        for (const [dx, dy] of directions) {
            for (let i = 1; i < 10; i++) {
                const nx = this.x + dx * i;
                const ny = this.y + dy * i;
                if (!this.isValidPos(nx, ny)) break;
                const piece = board.getPieceAt(nx, ny);
                if (this.canGo(nx, ny, map, board)) {
                    moves.push([nx, ny]);
                    if (piece) break; // 遇子停止
                } else {
                    break;
                }
            }
        }
        return moves;
    }

    canGo(x, y, map, board) {
        const piece = board.getPieceAt(x, y);
        return !piece || piece.camp !== this.camp;
    }

    isValidPos(x, y) {
        return x >= 0 && x <= 8 && y >= 0 && y <= 9;
    }
}
