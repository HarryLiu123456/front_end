// 士 - 斜线一步移动，限九宫内
import { Piece } from './piece.js';
import { Config } from '../config.js';

export class Advisor extends Piece {
    constructor(x, y, camp, imageCache = {}) {
        const { BASE_PATH } = Config.IMAGES;
        const prefix = camp === '红方' ? 'red_advisor' : 'black_advisor';
        const imagePath = BASE_PATH + prefix + '.png';
        const FENCode = camp === '红方' ? 'A' : 'a';
        super(x, y, camp, camp === '红方' ? '仕' : '士', FENCode, imagePath, imageCache);
    }

    getLegalMoves(map, board) {
        const moves = [];
        const positions = this.camp === '红方'
            ? [[4, 8], [4, 6], [2, 7], [2, 9], [6, 7], [6, 9]]  // 红仕
            : [[4, 1], [4, 3], [2, 0], [2, 2], [6, 0], [6, 2]];   // 黑士
        for (const [nx, ny] of positions) {
            if (this.canGo(nx, ny, map, board)) moves.push([nx, ny]);
        }
        return moves;
    }

    canGo(x, y, map, board) {
        const piece = board.getPieceAt(x, y);
        return !piece || piece.camp !== this.camp;
    }
}
