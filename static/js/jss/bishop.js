/** 相/象 - 田字移动，有塞象眼限制 */
class Bishop extends Piece {
    constructor(x, y, camp) {
        super(x, y, camp === 1 ? "相" : "象", camp);
        this.imageRed = Piece.IMAGE_PATH + 'b.png';
        this.imageBlack = Piece.IMAGE_PATH + 'bb.png';
    }

    getImagePath() { return this.camp === 1 ? this.imageRed : this.imageBlack; }

    getLegalMoves(map, mans) {
        const moves = [];
        const offsets = [[2, 2], [-2, 2], [2, -2], [-2, -2]];
        const legOffsets = [[1, 1], [-1, 1], [1, -1], [-1, -1]];

        for (let i = 0; i < 4; i++) {
            const [dx, dy] = offsets[i];
            const [lx, ly] = legOffsets[i];
            const nx = this.x + dx, ny = this.y + dy;
            const lx2 = this.x + lx, ly2 = this.y + ly;

            if (this.isInBounds(nx, ny) && !this.isBlocked(lx2, ly2, map) && this.canGo(nx, ny, map, mans)) {
                moves.push([nx, ny]);
            }
        }
        return moves;
    }

    isInBounds(x, y) {
        if (this.camp === 1) return x >= 0 && x <= 8 && y >= 5 && y <= 9;
        return x >= 0 && x <= 8 && y >= 0 && y <= 4;
    }

    isBlocked(x, y, map) { return map[y] && map[y][x]; }

    canGo(x, y, map, mans) {
        return !map[y] || !map[y][x] || mans[map[y][x]].camp !== this.camp;
    }
}
