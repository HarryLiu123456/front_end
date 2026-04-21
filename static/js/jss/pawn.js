/** 兵/卒 - 未过河只能前进，过河可左右 */
class Pawn extends Piece {
    constructor(x, y, camp) {
        super(x, y, camp === 1 ? "兵" : "卒", camp);
        this.imageRed = Piece.IMAGE_PATH + 'r.png';
        this.imageBlack = Piece.IMAGE_PATH + 'rb.png';
    }

    getImagePath() { return this.camp === 1 ? this.imageRed : this.imageBlack; }

    getLegalMoves(map, mans) {
        const moves = [];

        if (this.camp === 1) {
            // 红兵前进(向上)
            if (this.y - 1 >= 0 && this.canGo(this.x, this.y - 1, map, mans)) moves.push([this.x, this.y - 1]);
            // 过河后左右
            if (this.isCrossedRiver) {
                if (this.x + 1 <= 8 && this.canGo(this.x + 1, this.y, map, mans)) moves.push([this.x + 1, this.y]);
                if (this.x - 1 >= 0 && this.canGo(this.x - 1, this.y, map, mans)) moves.push([this.x - 1, this.y]);
            }
        } else {
            // 黑卒前进(向下)
            if (this.y + 1 <= 9 && this.canGo(this.x, this.y + 1, map, mans)) moves.push([this.x, this.y + 1]);
            // 过河后左右
            if (this.isCrossedRiver) {
                if (this.x + 1 <= 8 && this.canGo(this.x + 1, this.y, map, mans)) moves.push([this.x + 1, this.y]);
                if (this.x - 1 >= 0 && this.canGo(this.x - 1, this.y, map, mans)) moves.push([this.x - 1, this.y]);
            }
        }
        return moves;
    }

    canGo(x, y, map, mans) {
        return !map[y] || !map[y][x] || mans[map[y][x]].camp !== this.camp;
    }
}
