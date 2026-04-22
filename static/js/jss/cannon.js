// 炮 - 横竖移动，吃子需隔一子
import { Piece } from './piece.js';
import { Config } from '../config.js';

export class Cannon extends Piece {
    constructor(x, y, camp, imageCache = {}) {
        const { BASE_PATH } = Config.IMAGES;
        const prefix = camp === '红方' ? 'red_cannon' : 'black_cannon';
        const imagePath = BASE_PATH + prefix + '.png';
        const FENCode = camp === '红方' ? 'C' : 'c';
        super(x, y, camp, '炮', FENCode, imagePath, imageCache);
    }

    getLegalMoves(map, board) {
        const moves = [];
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const [dx, dy] of dirs) {
            let n = 0;
            for (let i = 1; i <= 9; i++) {
                const nx = this.x + dx * i, ny = this.y + dy * i;
                if (nx < 0 || nx > 8 || ny < 0 || ny > 9) break;
                const piece = board.getPieceAt(nx, ny);
                if (piece) {
                    if (n === 0) { n++; continue; }
                    if (piece.camp !== this.camp) moves.push([nx, ny]);
                    break;
                } else if (n === 0) {
                    moves.push([nx, ny]);
                }
            }
        }
        return moves;
    }
}