/** 棋盘类 - 管理棋盘状态和棋子 */
class Board {
    static imageCache = {};  // 图片缓存

    constructor() {
        this.grid = [];      // 二维数组，存储棋子key
        this.pieces = {};    // key->piece映射
        this.ctx = null;
        this.canvas = null;
    }

    // 图片加载
    static loadBoardImage() {
        if (Board.imageCache['chessboard.png']) return;
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => { Board.imageCache['chessboard.png'] = img; resolve(); };
            img.onerror = () => reject(new Error('Failed to load chessboard'));
            img.src = 'static/imgs/chessboard.png';
        });
    }

    static async preloadImages() {
        await Board.loadBoardImage();
        await Piece.preloadAllImages();
    }

    // 初始化
    initCanvas(id) {
        this.canvas = document.getElementById(id);
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = GameConfig.IMAGES.BOARD_SIZE.WIDTH;
            this.canvas.height = GameConfig.IMAGES.BOARD_SIZE.HEIGHT;
        }
    }

    createEmptyGrid() {
        this.grid = Array.from({ length: 10 }, () => new Array(9).fill(null));
    }

    /** 初始化棋盘(FEN格式) */
    initBoard(fen) {
        this.createEmptyGrid();
        this.pieces = {};
        const rows = fen.split(' ')[0].split('/');
        const pieceMap = { k: King, a: Advisor, b: Bishop, n: Knight, r: Rook, c: Cannon, p: Pawn };
        const counts = {};  // 统计每种棋子数量

        for (let y = 0; y < rows.length; y++) {
            let x = 0;
            for (const c of rows[y]) {
                if (/\d/.test(c)) { x += +c; continue; }
                const camp = c === c.toLowerCase() ? -1 : 1;
                const PieceClass = pieceMap[c.toLowerCase()];
                if (PieceClass) {
                    const key = c + (counts[c] || 0);
                    counts[c] = (counts[c] || 0) + 1;
                    this.placePiece(x, y, key, new PieceClass(x, y, camp));
                }
                x++;
            }
        }
    }

    // 棋子操作
    placePiece(x, y, key, piece) {
        this.grid[y][x] = key;
        if (piece) { piece.x = x; piece.y = y; this.pieces[key] = piece; }
    }

    removePiece(x, y) {
        const key = this.grid[y][x];
        const piece = this.pieces[key];
        this.grid[y][x] = null;
        if (piece) { piece.isAlive = false; delete this.pieces[key]; }
        return { key, piece };
    }

    movePiece(fx, fy, tx, ty) {
        const captured = this.removePiece(tx, ty);
        const key = this.grid[fy][fx];
        const piece = this.pieces[key];
        this.grid[fy][fx] = null;
        this.grid[ty][tx] = key;
        if (piece) { piece.x = tx; piece.y = ty; }
        return { captured, piece };
    }

    // 查询
    getPieceAt(x, y) {
        if (!this.isValidPos(x, y)) return null;
        const key = this.grid[y][x];
        return key ? this.pieces[key] : null;
    }

    getKeyAt(x, y) {
        if (!this.isValidPos(x, y)) return null;
        return this.grid[y][x];
    }

    isValidPos(x, y) { return x >= 0 && x <= 8 && y >= 0 && y <= 9; }

    getPiecesByCamp(camp) {
        return Object.values(this.pieces).filter(p => p && p.camp === camp && p.isAlive);
    }

    // 绘制
    drawBoard() {
        if (!this.ctx) return;
        const img = Board.imageCache['chessboard.png'];
        if (img) this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    }

    drawPieces() {
        for (const p of Object.values(this.pieces)) {
            if (p && p.isAlive) p.draw(this.ctx);
        }
    }

    clearCanvas() {
        if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 游戏逻辑
    isInCheck(camp) {
        const kingKey = camp === 1 ? 'k0' : 'K0';
        const king = this.pieces[kingKey];
        if (!king || !king.isAlive) return true;
        for (const p of this.getPiecesByCamp(-camp)) {
            if (p.getLegalMoves(this.grid, this.pieces).some(m => m[0] === king.x && m[1] === king.y)) return true;
        }
        return false;
    }

    isCheckmate(camp) {
        if (!this.isInCheck(camp)) return false;
        for (const p of this.getPiecesByCamp(camp)) {
            for (const m of p.getLegalMoves(this.grid, this.pieces)) {
                const b = this.clone();
                b.movePiece(p.x, p.y, m[0], m[1]);
                if (!b.isInCheck(camp)) return false;
            }
        }
        return true;
    }

    clone() {
        const b = new Board();
        b.grid = this.grid.map(r => [...r]);
        for (const k in this.pieces) {
            const p = this.pieces[k];
            if (p) b.pieces[k] = Object.assign(Object.create(Object.getPrototypeOf(p)), p);
        }
        return b;
    }

    clear() { this.createEmptyGrid(); this.pieces = {}; }

    toString() {
        return this.grid.map(r => r.map(k => k || '.').join(' ')).join('\n');
    }
}
