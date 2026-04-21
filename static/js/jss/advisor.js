/** 士 - 斜线一步，限九宫内 */
class Advisor extends Piece {
    constructor(x, y, camp) {
        super(x, y, "士", camp);
        this.imageRed = Piece.IMAGE_PATH + 'a.png';
        this.imageBlack = Piece.IMAGE_PATH + 'ab.png';
    }

    getImagePath() { return this.camp === 1 ? this.imageRed : this.imageBlack; }

    getLegalMoves(map, mans) {
        const moves = [];
        const my = this.camp;
        const offsets = [[1, 1], [-1, 1], [1, -1], [-1, -1]];

        for (const [dx, dy] of offsets) {
            const nx = this.x + dx, ny = this.y + dy;
            if (this.isInPalace(nx, ny, my) && this.canGo(nx, ny, map, mans)) {
                moves.push([nx, ny]);
            }
        }
        return moves;
    }

    isInPalace(x, y, camp) {
        if (camp === 1) return x >= 3 && x <= 5 && y >= 7 && y <= 9;
        return x >= 3 && x <= 5 && y >= 0 && y <= 2;
    }

    canGo(x, y, map, mans) {
        return !map[y] || !map[y][x] || mans[map[y][x]].camp !== this.camp;
    }
}
