/** 马 - 日字移动，有蹩马腿限制 */
class Knight extends Piece {
    constructor(x, y, camp) {
        super(x, y, "马", camp);
        this.imageRed = Piece.IMAGE_PATH + 'n.png';
        this.imageBlack = Piece.IMAGE_PATH + 'nb.png';
    }

    getImagePath() { return this.camp === 1 ? this.imageRed : this.imageBlack; }

    getLegalMoves(map, mans) {
        const moves = [];
        // [legX, legY, targetX, targetY]
        const knightMoves = [
            [1, 0, 2, -1], [1, 0, 2, 1], [-1, 0, -2, -1], [-1, 0, -2, 1],
            [0, -1, 1, -2], [0, -1, -1, -2], [0, 1, 1, 2], [0, 1, -1, 2]
        ];

        for (const [lx, ly, tx, ty] of knightMoves) {
            const nx = this.x + tx, ny = this.y + ty;
            const lx2 = this.x + lx, ly2 = this.y + ly;
            if (this.isInBoard(nx, ny) && !this.isBlocked(lx2, ly2, map) && this.canGo(nx, ny, map, mans)) {
                moves.push([nx, ny]);
            }
        }
        return moves;
    }

    isInBoard(x, y) { return x >= 0 && x <= 8 && y >= 0 && y <= 9; }
    isBlocked(x, y, map) { return map[y] && map[y][x]; }
    canGo(x, y, map, mans) {
        return !map[y] || !map[y][x] || mans[map[y][x]].camp !== this.camp;
    }
}
