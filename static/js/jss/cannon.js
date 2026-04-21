/** 炮 - 横竖移动，吃子需隔一子 */
class Cannon extends Piece {
    constructor(x, y, camp) {
        super(x, y, "炮", camp);
        this.imageRed = Piece.IMAGE_PATH + 'p.png';
        this.imageBlack = Piece.IMAGE_PATH + 'pb.png';
    }

    getImagePath() { return this.camp === 1 ? this.imageRed : this.imageBlack; }

    getLegalMoves(map, mans) {
        const moves = [];
        const my = this.camp;
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // 左右上下

        for (const [dx, dy] of dirs) {
            let n = 0;
            for (let i = 1; i <= 9; i++) {
                const nx = this.x + dx * i, ny = this.y + dy * i;
                if (nx < 0 || nx > 8 || ny < 0 || ny > 9) break;
                if (map[ny][nx]) {
                    if (n === 0) { n++; continue; }
                    if (mans[map[ny][nx]].camp !== my) moves.push([nx, ny]);
                    break;
                } else if (n === 0) {
                    moves.push([nx, ny]);
                }
            }
        }
        return moves;
    }
}
