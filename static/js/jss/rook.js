/** 车 - 横竖方向任意步数，不能越子 */
class Rook extends Piece {
    constructor(x, y, camp) {
        super(x, y, "车", camp);
        this.imageRed = Piece.IMAGE_PATH + 'c.png';
        this.imageBlack = Piece.IMAGE_PATH + 'cb.png';
    }

    getImagePath() { return this.camp === 1 ? this.imageRed : this.imageBlack; }

    getLegalMoves(map, mans) {
        const moves = [];
        const my = this.camp;

        // 左
        for (let i = this.x - 1; i >= 0; i--) {
            if (map[this.y][i]) {
                if (mans[map[this.y][i]].camp !== my) moves.push([i, this.y]);
                break;
            }
            moves.push([i, this.y]);
        }
        // 右
        for (let i = this.x + 1; i <= 8; i++) {
            if (map[this.y][i]) {
                if (mans[map[this.y][i]].camp !== my) moves.push([i, this.y]);
                break;
            }
            moves.push([i, this.y]);
        }
        // 上
        for (let i = this.y - 1; i >= 0; i--) {
            if (map[i][this.x]) {
                if (mans[map[i][this.x]].camp !== my) moves.push([this.x, i]);
                break;
            }
            moves.push([this.x, i]);
        }
        // 下
        for (let i = this.y + 1; i <= 9; i++) {
            if (map[i][this.x]) {
                if (mans[map[i][this.x]].camp !== my) moves.push([this.x, i]);
                break;
            }
            moves.push([this.x, i]);
        }
        return moves;
    }
}
