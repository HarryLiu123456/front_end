/** 棋盘类 - 管理棋盘状态和棋子 */
import { Config } from '../config.js';
import { Piece } from './piece.js';
import { King } from './king.js';
import { Advisor } from './advisor.js';
import { Bishop } from './bishop.js';
import { Knight } from './knight.js';
import { Rook } from './rook.js';
import { Cannon } from './cannon.js';
import { Pawn } from './pawn.js';

export class ChessBoard {
    constructor(imageCache) {
        this.grid = [];       // 10×9 二维数组存储棋子
        this.ctx = null;
        this.canvas = null;
        this.imageCache = imageCache || {};  // 从Game接收的图片缓存
    }

    // 创建空棋盘
    createEmptyGrid() {
        this.grid = Array.from({ length: 10 }, () => new Array(9).fill(null));
    }

    // 从FEN创建棋盘
    static fromFen(fen, config = {}) {
        const imageCache = config.imageCache || {};
        const board = new ChessBoard(imageCache);
        board.createEmptyGrid();
        const rows = fen.split(' ')[0].split('/');
        // FEN码到棋子信息的映射
        const PIECE_NAMES = {
            'K': { className: 'King', camp: '红方' },
            'A': { className: 'Advisor', camp: '红方' },
            'B': { className: 'Bishop', camp: '红方' },
            'N': { className: 'Knight', camp: '红方' },
            'R': { className: 'Rook', camp: '红方' },
            'C': { className: 'Cannon', camp: '红方' },
            'P': { className: 'Pawn', camp: '红方' },
            'k': { className: 'King', camp: '黑方' },
            'a': { className: 'Advisor', camp: '黑方' },
            'b': { className: 'Bishop', camp: '黑方' },
            'n': { className: 'Knight', camp: '黑方' },
            'r': { className: 'Rook', camp: '黑方' },
            'c': { className: 'Cannon', camp: '黑方' },
            'p': { className: 'Pawn', camp: '黑方' }
        };
        const pieceClasses = { King, Advisor, Bishop, Knight, Rook, Cannon, Pawn };

        rows.forEach((row, y) => {
            let x = 0;
            for (const c of row) {
                if (/\d/.test(c)) { x += +c; continue; }
                const info = PIECE_NAMES[c];
                if (info) {
                    const PieceClass = pieceClasses[info.className];
                    if (PieceClass) {
                        const piece = new PieceClass(x, y, info.camp, imageCache);
                        board.placePiece(x, y, piece);
                    }
                }
                x++;
            }
        });
        return board;
    }

    // 转为FEN格式
    toFen() {
        return this.grid.map(row => {
            let s = '', empty = 0;
            row.forEach(p => {
                if (p) { if (empty) { s += empty; empty = 0; } s += p.FENCode; }
                else empty++;
            });
            return empty ? s + empty : s;
        }).join('/');
    }

    // 放置棋子
    placePiece(x, y, piece) {
        if (piece) { piece.x = x; piece.y = y; }
        this.grid[y][x] = piece;
    }

    // 移除棋子
    removePiece(x, y) {
        const piece = this.grid[y][x];
        this.grid[y][x] = null;
        if (piece) piece.isAlive = false;
        return piece;
    }

    // 移动棋子
    movePiece(fx, fy, tx, ty) {
        const captured = this.removePiece(tx, ty);
        const piece = this.grid[fy][fx];
        this.grid[fy][fx] = null;
        this.grid[ty][tx] = piece;
        if (piece) { piece.x = tx; piece.y = ty; }
        return { captured, piece };
    }

    // 获取棋子
    getPieceAt(x, y) {
        return this.isValidPos(x, y) ? this.grid[y][x] : null;
    }

    // 坐标是否有效
    isValidPos(x, y) { return x >= 0 && x <= 8 && y >= 0 && y <= 9; }

    // 获取阵营棋子
    getPiecesByCamp(camp) {
        return this.grid.flat().filter(p => p && p.camp === camp && p.isAlive);
    }

    // 获取敌方棋子
    getEnemyPieces(camp) {
        const enemy = camp === '红方' ? '黑方' : '红方';
        return this.getPiecesByCamp(enemy);
    }

    // 绘制棋盘（按CHESSBOARD_SIZE绘制，居中于Canvas）
    drawBoard() {
        if (!this.ctx || !this.canvas) return;
        const boardImage = Config.IMAGES.BASE_PATH + 'chessboard.png';
        const img = this.imageCache[boardImage];
        if (!img) return;
        
        // 计算棋盘在Canvas中的居中偏移
        const offsetX = (this.canvas.width - Config.CHESSBOARD_SIZE.WIDTH) / 2;
        const offsetY = (this.canvas.height - Config.CHESSBOARD_SIZE.HEIGHT) / 2;
        
        this.ctx.drawImage(img, offsetX, offsetY, Config.CHESSBOARD_SIZE.WIDTH, Config.CHESSBOARD_SIZE.HEIGHT);
    }

    // 绘制棋子（按CHESSBOARD_SIZE绘制，居中于Canvas）
    drawPieces() {
        // 计算棋盘在Canvas中的居中偏移
        const offsetX = (this.canvas.width - Config.CHESSBOARD_SIZE.WIDTH) / 2;
        const offsetY = (this.canvas.height - Config.CHESSBOARD_SIZE.HEIGHT) / 2;
        
        this.grid.flat().filter(p => p && p.isAlive).forEach(p => {
            // 棋子相对于Canvas的坐标需要加上偏移
            const ctx = this.ctx;
            const pieceX = offsetX + Config.START_X + p.x * Config.GRID_SIZE.WIDTH;
            const pieceY = offsetY + Config.START_Y + p.y * Config.GRID_SIZE.HEIGHT;
            
            const img = this.imageCache[p.getImagePath()];
            if (!img) return;
            
            const { WIDTH: pw, HEIGHT: ph } = Config.PIECE_SIZE;
            const dx = pieceX - pw / 2;
            const dy = pieceY - ph / 2;
            
            ctx.drawImage(img, dx, dy, pw, ph);
            
            if (p.isSelected) {
                this.drawSelectionBorder(ctx, dx, dy, pw, ph);
            }
        });
    }

    // 完整渲染
    render() {
        this.clearCanvas();
        this.drawBoard();
        this.drawPieces();
    }

    // 像素坐标→棋盘坐标（考虑Canvas居中偏移）
    getBoardPos(px, py) {
        const offsetX = (this.canvas.width - Config.CHESSBOARD_SIZE.WIDTH) / 2;
        const offsetY = (this.canvas.height - Config.CHESSBOARD_SIZE.HEIGHT) / 2;
        return { 
            x: Math.round((px - offsetX - Config.START_X) / Config.GRID_SIZE.WIDTH), 
            y: Math.round((py - offsetY - Config.START_Y) / Config.GRID_SIZE.HEIGHT) 
        };
    }

    // 棋盘坐标→像素坐标（考虑Canvas居中偏移）
    getPixelPos(x, y) {
        const offsetX = (this.canvas.width - Config.CHESSBOARD_SIZE.WIDTH) / 2;
        const offsetY = (this.canvas.height - Config.CHESSBOARD_SIZE.HEIGHT) / 2;
        return { 
            x: offsetX + Config.START_X + x * Config.GRID_SIZE.WIDTH, 
            y: offsetY + Config.START_Y + y * Config.GRID_SIZE.HEIGHT 
        };
    }

    // 绘制选中边框
    drawSelectionBorder(ctx, dx, dy, dw, dh) {
        const cornerLen = Math.min(dw, dh) * 0.3;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(dx - 2, dy - 2 + cornerLen);
        ctx.lineTo(dx - 2, dy - 2);
        ctx.lineTo(dx - 2 + cornerLen, dy - 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(dx + dw + 2 - cornerLen, dy - 2);
        ctx.lineTo(dx + dw + 2, dy - 2);
        ctx.lineTo(dx + dw + 2, dy - 2 + cornerLen);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(dx - 2, dy + dh + 2 - cornerLen);
        ctx.lineTo(dx - 2, dy + dh + 2);
        ctx.lineTo(dx - 2 + cornerLen, dy + dh + 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(dx + dw + 2 - cornerLen, dy + dh + 2);
        ctx.lineTo(dx + dw + 2, dy + dh + 2);
        ctx.lineTo(dx + dw + 2, dy + dh + 2 - cornerLen);
        ctx.stroke();
    }

    // 清空画布
    clearCanvas() {
        if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 是否被将军
    isInCheck(camp) {
        const king = this.getPiecesByCamp(camp).find(p => p instanceof King);
        if (!king) return true;
        const enemy = camp === '红方' ? '黑方' : '红方';
        return this.getPiecesByCamp(enemy).some(p => 
            p.getLegalMoves(this.grid, this).some(m => m[0] === king.x && m[1] === king.y)
        );
    }

    // 是否将死
    isCheckmate(camp) {
        if (!this.isInCheck(camp)) return false;
        return !this.getPiecesByCamp(camp).some(p => 
            p.getLegalMoves(this.grid, this).some(m => {
                const b = this.clone();
                b.movePiece(p.x, p.y, m[0], m[1]);
                return !b.isInCheck(camp);
            })
        );
    }

    // 克隆棋盘
    clone() {
        const b = new ChessBoard(this.imageCache);
        b.grid = this.grid.map(row => row.map(p => p ? Object.assign(Object.create(Object.getPrototypeOf(p)), p) : null));
        return b;
    }

    // 清空棋盘
    clear() { this.createEmptyGrid(); }
}