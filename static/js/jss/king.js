/** 将/帅 - 直线一步，限九宫内 */
class King extends Piece {
    constructor(x, y, camp) {
        super(x, y, camp === 1 ? "帅" : "将", camp);
        this.imageRed = Piece.IMAGE_PATH + 'k.png';
        this.imageBlack = Piece.IMAGE_PATH + 'kb.png';
    }

    getImagePath() { return this.camp === 1 ? this.imageRed : this.imageBlack; }

    getLegalMoves(map, mans) {
        const moves = [];
        const my = this.camp;

        if (my === 1) {
            // 红帅 - 九宫(3-5列, 7-9行)
            if (this.y + 1 <= 9 && this.canGo(this.x, this.y + 1, map, mans)) moves.push([this.x, this.y + 1]);
            if (this.y - 1 >= 7 && this.canGo(this.x, this.y - 1, map, mans)) moves.push([this.x, this.y - 1]);
            if (this.x + 1 <= 5 && this.canGo(this.x + 1, this.y, map, mans)) moves.push([this.x + 1, this.y]);
            if (this.x - 1 >= 3 && this.canGo(this.x - 1, this.y, map, mans)) moves.push([this.x - 1, this.y]);
            // 将帅对面
            const enemy = mans['K0'];
            if (enemy && enemy.isAlive && this.x === enemy.x) {
                let blocked = false;
                for (let y = this.y + 1; y < enemy.y; y++) {
                    if (map[y] && map[y][this.x]) { blocked = true; break; }
                }
                if (!blocked) moves.push([enemy.x, enemy.y]);
            }
        } else {
            // 黑将 - 九宫(3-5列, 0-2行)
            if (this.y + 1 <= 2 && this.canGo(this.x, this.y + 1, map, mans)) moves.push([this.x, this.y + 1]);
            if (this.y - 1 >= 0 && this.canGo(this.x, this.y - 1, map, mans)) moves.push([this.x, this.y - 1]);
            if (this.x + 1 <= 5 && this.canGo(this.x + 1, this.y, map, mans)) moves.push([this.x + 1, this.y]);
            if (this.x - 1 >= 3 && this.canGo(this.x - 1, this.y, map, mans)) moves.push([this.x - 1, this.y]);
            // 将帅对面
            const enemy = mans['k0'];
            if (enemy && enemy.isAlive && this.x === enemy.x) {
                let blocked = false;
                for (let y = enemy.y + 1; y < this.y; y++) {
                    if (map[y] && map[y][this.x]) { blocked = true; break; }
                }
                if (!blocked) moves.push([enemy.x, enemy.y]);
            }
        }
        return moves;
    }

    canGo(x, y, map, mans) {
        return !map[y] || !map[y][x] || mans[map[y][x]].camp !== this.camp;
    }
}
