// 兵/卒 - 未过河只能前进，过河可左右
import { Piece } from './piece.js';
import { Config } from '../config.js';

export class Pawn extends Piece {
    constructor(x, y, camp, imageCache = {}) {
        const { BASE_PATH } = Config.IMAGES;
        const prefix = camp === '红方' ? 'red_pawn' : 'black_pawn';
        const imagePath = BASE_PATH + prefix + '.png';
        const FENCode = camp === '红方' ? 'P' : 'p';
        super(x, y, camp, camp === '红方' ? '兵' : '卒', FENCode, imagePath, imageCache);
    }

    getLegalMoves(map, board) {
        const moves = [];

        if (this.camp === '红方') {
            // 红兵前进(向上)
            if (this.y - 1 >= 0 && this.canGo(this.x, this.y - 1, map, board)) moves.push([this.x, this.y - 1]);
            if (this.isCrossedRiver) {
                if (this.x + 1 <= 8 && this.canGo(this.x + 1, this.y, map, board)) moves.push([this.x + 1, this.y]);
                if (this.x - 1 >= 0 && this.canGo(this.x - 1, this.y, map, board)) moves.push([this.x - 1, this.y]);
            }
        } else {
            // 黑卒前进(向下)
            if (this.y + 1 <= 9 && this.canGo(this.x, this.y + 1, map, board)) moves.push([this.x, this.y + 1]);
            if (this.isCrossedRiver) {
                if (this.x + 1 <= 8 && this.canGo(this.x + 1, this.y, map, board)) moves.push([this.x + 1, this.y]);
                if (this.x - 1 >= 0 && this.canGo(this.x - 1, this.y, map, board)) moves.push([this.x - 1, this.y]);
            }
        }
        return moves;
    }

    canGo(x, y, map, board) {
        const piece = board.getPieceAt(x, y);
        return !piece || piece.camp !== this.camp;
    }
}
