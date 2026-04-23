/** 游戏控制类 - 管理游戏流程、回合、棋盘状态和棋子
 * 坐标系统：grid[x][y]，x 0-8从左到右，y 0-9从上到下
 */
import { Config } from '../config.js';
import { Utils } from '../utils.js';
import { King } from './king.js';
import { Advisor } from './advisor.js';
import { Bishop } from './bishop.js';
import { Knight } from './knight.js';
import { Rook } from './rook.js';
import { Cannon } from './cannon.js';
import { Pawn } from './pawn.js';

const PIECE_CLASSES = { King, Advisor, Bishop, Knight, Rook, Cannon, Pawn };

export class Game {
    constructor(fen = Config.INIT_FEN, playerStartCamp = '红方') {
        this.isPlay = false;
        this.selectedPiece = null;
        this.fenHistory = [];
        this.imageCache = {};
        this.ctx = null;
        this.canvas = null;
        this.playerStartCamp = playerStartCamp;
        this.grid = [];
        
        const result = Game.fromFen(fen, this);
        this.grid = result.grid;
        this.currentCamp = result.currentCamp;
        this.noCaptureMoveCount = result.halfmoveClock;
        this.fullmoveNumber = result.fullmoveNumber;
        this.fenHistory.push(Config.INIT_FEN);
    }

    /** 从FEN创建棋盘 */
    static fromFen(fen, game) {
        const grid = Array.from({ length: 9 }, () => new Array(10).fill(null));
        const parts = fen.split(' ');
        const rows = parts[0].split('/');
        const sideToMove = parts[1] || 'w';
        const halfmoveClock = parseInt(parts[4]) || 0;
        const fullmoveNumber = parseInt(parts[5]) || 1;

        Config.PIECE_CLASSES = PIECE_CLASSES;

        rows.forEach((row, y) => {
            let x = 0;
            for (const c of row) {
                if (/\d/.test(c)) { x += +c; continue; }
                const className = Config.FEN_PIECE_MAP[c];
                if (className && Config.PIECE_CLASSES[className]) {
                    const PieceClass = Config.PIECE_CLASSES[className];
                    const camp = Utils.fenToCamp(c);
                    const piece = new PieceClass(x, y, camp, game.imageCache);
                    if (piece) { piece.x = x; piece.y = y; }
                    grid[x][y] = piece;
                }
                x++;
            }
        });
        return { grid, sideToMove, halfmoveClock, fullmoveNumber, currentCamp: sideToMove === 'w' ? '红方' : '黑方' };
    }

    /** 转为FEN格式 */
    toFen(full = true) {
        const boardFen = [];
        for (let y = 0; y < 10; y++) {
            let s = '', empty = 0;
            for (let x = 0; x < 9; x++) {
                const p = this.grid[x][y];
                if (p) {
                    if (empty) { s += empty; empty = 0; }
                    let fenChar = Utils.classNameToFen(p.constructor.name);
                    if (p.camp === '黑方') fenChar = fenChar.toLowerCase();
                    s += fenChar;
                } else { empty++; }
            }
            if (empty) s += empty;
            boardFen.push(s);
        }
        
        if (full) {
            return `${boardFen.join('/')} ${this.currentCamp === '红方' ? 'w' : 'b'} - - ${this.noCaptureMoveCount} ${this.fullmoveNumber}`;
        }
        return boardFen.join('/');
    }

    placePiece(x, y, piece) { if (piece) { piece.x = x; piece.y = y; } this.grid[x][y] = piece; }
    getPieceAt(x, y) { return Utils.isValidPosition(x, y) ? this.grid[x][y] : null; }
    isValidPos(x, y) { return Utils.isValidPosition(x, y); }

    isLegalMove(piece, toX, toY) {
        const moves = piece.getLegalMoves(this.grid, this);
        return moves.some(m => m[0] === toX && m[1] === toY);
    }

    getLegalMoves(piece) { return piece.getLegalMoves(this.grid, this); }
    getPiecesByCamp(camp) { 
        const pieces = [];
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 10; y++) {
                const p = this.grid[x][y];
                if (p && p.camp === camp) pieces.push(p);
            }
        }
        return pieces;
    }

    movePiece(piece, toX, toY) {
        if (!this.isLegalMove(piece, toX, toY)) return null;
        const fromX = piece.x, fromY = piece.y;
        const toPiece = this.grid[toX][toY];
        this.grid[toX][toY] = piece;
        piece.x = toX; piece.y = toY;
        this.grid[fromX][fromY] = null;
        return { captured: toPiece, piece };
    }

    getBoardPos(px, py, canvas) {
        const offsetX = (canvas.width - Config.CHESSBOARD_SIZE.WIDTH) / 2;
        const offsetY = (canvas.height - Config.CHESSBOARD_SIZE.HEIGHT) / 2;
        return { 
            x: Math.round((px - offsetX - Config.START_X) / Config.GRID_SIZE.WIDTH), 
            y: Math.round((py - offsetY - Config.START_Y) / Config.GRID_SIZE.HEIGHT) 
        };
    }

    /** 绘制棋盘，根据玩家阵营决定是否翻转 */
    drawBoard(ctx, canvas) {
        const boardImage = Config.IMAGES.BASE_PATH + 'chessboard.png';
        const img = this.imageCache[boardImage];
        if (!img) return;
        const offsetX = (canvas.width - Config.CHESSBOARD_SIZE.WIDTH) / 2;
        const offsetY = (canvas.height - Config.CHESSBOARD_SIZE.HEIGHT) / 2;
        
        // 当玩家为黑方时翻转棋盘
        if (this.playerStartCamp === '黑方') {
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(Math.PI);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            ctx.drawImage(img, offsetX, offsetY, Config.CHESSBOARD_SIZE.WIDTH, Config.CHESSBOARD_SIZE.HEIGHT);
            ctx.restore();
        } else {
            ctx.drawImage(img, offsetX, offsetY, Config.CHESSBOARD_SIZE.WIDTH, Config.CHESSBOARD_SIZE.HEIGHT);
        }
    }

    drawPieces(ctx, canvas) {
        const offsetX = (canvas.width - Config.CHESSBOARD_SIZE.WIDTH) / 2;
        const offsetY = (canvas.height - Config.CHESSBOARD_SIZE.HEIGHT) / 2;
        
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 10; y++) {
                const p = this.grid[x][y];
                if (p) {
                    const pieceX = offsetX + Config.START_X + p.x * Config.GRID_SIZE.WIDTH;
                    const pieceY = offsetY + Config.START_Y + p.y * Config.GRID_SIZE.HEIGHT;
                    p.draw(ctx, pieceX, pieceY);
                }
            }
        }
    }

    async preloadImages() {
        const boardImage = Config.IMAGES.BASE_PATH + 'chessboard.png';
        await this.loadImage(boardImage);
        await Promise.all(Config.IMAGES.PIECE_LIST.map(name => this.loadImage(Config.IMAGES.BASE_PATH + name)));
    }

    loadImage(path) {
        if (this.imageCache[path]) return Promise.resolve(this.imageCache[path]);
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => { this.imageCache[path] = img; resolve(img); };
            img.onerror = () => reject(new Error(`图片加载失败: ${path}`));
            img.src = path;
        });
    }

    async initCanvas(canvasId) {
        await this.preloadImages();
        this.canvas = document.getElementById(canvasId);
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = Config.CANVAS_SIZE.WIDTH;
            this.canvas.height = Config.CANVAS_SIZE.HEIGHT;
            for (let x = 0; x < 9; x++) {
                for (let y = 0; y < 10; y++) {
                    const p = this.grid[x][y];
                    if (p) p.imageCache = this.imageCache;
                }
            }
        }
        this.render();
    }

    render() {
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawBoard(this.ctx, this.canvas);
            this.drawPieces(this.ctx, this.canvas);
        }
    }

    handleClick(gridX, gridY, playerCamp = '红方') {
        if (!this.isPlay) return { action: 'none' };
        const clickedPiece = this.getPieceAt(gridX, gridY);

        if (this.selectedPiece) {
            const result = this.executeMove(this.selectedPiece, gridX, gridY);
            if (result.action === 'move') return result;
            if (clickedPiece?.camp === playerCamp) {
                this.selectPiece(clickedPiece);
                return { action: 'select', piece: clickedPiece };
            }
            this.deselectPiece();
            return { action: 'deselect' };
        }

        if (clickedPiece?.camp === playerCamp) {
            this.selectPiece(clickedPiece);
            return { action: 'select', piece: clickedPiece };
        }
        if (clickedPiece && clickedPiece.camp !== playerCamp) {
            return { action: 'illegal', reason: '这是敌方的棋子，你只能操作己方棋子' };
        }
        return { action: 'none' };
    }

    selectPiece(piece) { this.clearAllSelections(); this.selectedPiece = piece; piece.select(); this.render(); }
    deselectPiece() { this.clearAllSelections(); this.selectedPiece = null; this.render(); }
    clearAllSelections() { 
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 10; y++) {
                const p = this.grid[x][y];
                if (p && p.isSelected) p.deselect();
            }
        }
    }

    executeMove(piece, toX, toY) {
        const fromX = piece.x, fromY = piece.y;
        const result = this.movePiece(piece, toX, toY);
        if (!result) return { action: 'none' };
        
        this.noCaptureMoveCount = result.captured ? 0 : this.noCaptureMoveCount + 1;
        if (this.currentCamp === '黑方') this.fullmoveNumber++;
        
        this.fenHistory.push(this.toFen());
        this.deselectPiece();
        this.render();
        this.updateMoveDisplay();
        const gameResult = this.checkGameEnd();
        this.switchTurn();
        
        return { action: 'move', fromX, fromY, toX, toY, captured: result.captured, gameResult };
    }

    switchTurn() { this.currentCamp = this.currentCamp === '红方' ? '黑方' : '红方'; }

    checkGameEnd() {
        const enemy = this.currentCamp === '红方' ? '黑方' : '红方';
        const enemyPieces = this.getPiecesByCamp(enemy);
        const kingAlive = enemyPieces.some(p => p instanceof King);
        return !kingAlive ? { winner: this.currentCamp, reason: '吃将/帅' } : null;
    }

    regret() {
        if (this.fenHistory.length < 2) return false;
        this.fenHistory.pop();
        const targetFen = this.fenHistory[this.fenHistory.length - 1];
        const result = Game.fromFen(targetFen, this);
        this.grid = result.grid;
        this.currentCamp = result.currentCamp;
        this.noCaptureMoveCount = result.halfmoveClock;
        this.fullmoveNumber = result.fullmoveNumber;
        this.deselectPiece();
        this.render();
        this.updateMoveDisplay();
        return true;
    }

    restart() {
        this.isPlay = true;
        this.noCaptureMoveCount = 0;
        this.fullmoveNumber = 1;
        this.deselectPiece();
        while (this.fenHistory.length > 1) this.fenHistory.pop();
        
        const result = Game.fromFen(this.fenHistory[0], this);
        this.grid = result.grid;
        this.currentCamp = result.currentCamp;
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 10; y++) {
                const p = this.grid[x][y];
                if (p) p.imageCache = this.imageCache;
            }
        }
        this.render();
        this.updateMoveDisplay();
    }

    getFullFen() { return this.toFen(); }

    updateMoveDisplay() {
        const moveCountEl = document.getElementById('moveCount');
        const noCaptureCountEl = document.getElementById('noCaptureCount');
        if (moveCountEl) moveCountEl.textContent = `当前步数：${this.fenHistory.length - 1}`;
        if (noCaptureCountEl) noCaptureCountEl.textContent = `未吃子步数：${this.noCaptureMoveCount}`;
    }

    getStatus() {
        return { isPlay: this.isPlay, currentCamp: this.currentCamp, moveCount: this.fenHistory.length - 1 };
    }
}