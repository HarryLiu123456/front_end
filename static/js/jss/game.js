/** 游戏控制类 - 管理游戏流程、回合、胜负 */
import { Config } from '../config.js';  // 导入游戏配置
import { ChessBoard } from './chessboard.js';  // 导入棋盘类
import { King } from './king.js';  // 导入将帅类
import { Advisor } from './advisor.js';  // 导入士类
import { Bishop } from './bishop.js';  // 导入象类
import { Knight } from './knight.js';  // 导入马类
import { Rook } from './rook.js';  // 导入车类
import { Cannon } from './cannon.js';  // 导入炮类
import { Pawn } from './pawn.js';  // 导入兵类

export class Game {
    constructor(fen = Config.INIT_FEN) {
        this.isPlay = false;       // 是否开始游戏
        this.currentCamp = '红方';      // 当前阵营 "红方"/"黑方"
        this.selectedPiece = null;  // 选中的棋子
        this.legalMoves = [];       // 合法移动列表
        this.moveHistory = [];      // 移动历史
        this.imageCache = {};       // 统一管理图片缓存
        this.board = ChessBoard.fromFen(fen, { imageCache: this.imageCache });  // 从FEN创建棋盘实例
    }

    // 预加载所有图片
    async preloadImages() {
        // 加载棋盘图片
        await this.loadBoardImage();
        // 加载所有棋子图片
        await this.loadPieceImages();
    }

    // 加载棋盘背景图
    loadBoardImage() {
        const boardImage = Config.IMAGES.BASE_PATH + 'chessboard.png';
        if (this.imageCache[boardImage]) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.imageCache[boardImage] = img;
                resolve();
            };
            img.onerror = () => reject(new Error('Failed to load chessboard'));
            img.src = boardImage;
        });
    }

    // 预加载所有棋子图片
    loadPieceImages() {
        const { BASE_PATH, PIECE_LIST } = Config.IMAGES;
        const promises = PIECE_LIST.map(name => this.loadImage(BASE_PATH + name));
        return Promise.all(promises);
    }

    // 加载单张图片
    loadImage(path) {
        if (this.imageCache[path]) return Promise.resolve(this.imageCache[path]);
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.imageCache[path] = img;
                resolve(img);
            };
            img.onerror = () => reject(new Error(`图片加载失败: ${path}`));
            img.src = path;
        });
    }

    // 初始化画布
    async initCanvas(canvasId) {
        // 预加载所有图片
        await this.preloadImages();
        // 获取canvas元素
        this.canvas = document.getElementById(canvasId);
        if (this.canvas) {
            // 获取绘图上下文
            this.board.ctx = this.canvas.getContext('2d');
            // 设置canvas大小
            this.canvas.width = Config.CANVAS_SIZE.WIDTH;
            this.canvas.height = Config.CANVAS_SIZE.HEIGHT;
            // 将canvas引用传递给chessboard
            this.board.canvas = this.canvas;
            // 传入图片缓存给棋盘
            this.board.imageCache = this.imageCache;
            // 更新所有棋子的imageCache引用
            this.board.grid.flat().forEach(piece => {
                if (piece) piece.imageCache = this.imageCache;
            });
        }
        this.render();
    }

    // 绘制棋盘
    render() {
        this.board.render();
    }

    // 初始化棋盘 - 使用FEN格式重新开始
    initBoard(fen = Config.INIT_FEN) {
        this.board = ChessBoard.fromFen(fen, { imageCache: this.imageCache });
        // 更新所有棋子的imageCache引用
        this.board.grid.flat().forEach(piece => {
            if (piece) piece.imageCache = this.imageCache;
        });
    }

    // 处理棋盘点击事件
    handleClick(gridX, gridY) {
        if (!this.isPlay) return { action: 'none' };
        const clickedPiece = this.board.getPieceAt(gridX, gridY);

        // 有选中棋子时
        if (this.selectedPiece) {
            // 检查是否为合法移动
            if (this.legalMoves.some(m => m[0] === gridX && m[1] === gridY)) {
                return this.executeMove(this.selectedPiece, gridX, gridY);
            }
            // 选择同阵营的棋子
            if (clickedPiece?.camp === this.currentCamp) {
                this.selectPiece(clickedPiece);
                return { action: 'select', piece: clickedPiece };
            }
            this.deselectPiece();
            return { action: 'deselect' };
        }

        // 选择己方棋子
        if (clickedPiece?.camp === this.currentCamp) {
            this.selectPiece(clickedPiece);
            return { action: 'select', piece: clickedPiece };
        }
        return { action: 'none' };
    }

    // 选中棋子 - 先清除其他棋子的选中状态
    selectPiece(piece) {
        // 清除所有棋子的选中状态
        this.clearAllSelections();
        // 选中当前棋子
        this.selectedPiece = piece;
        piece.select();
        this.legalMoves = piece.getLegalMoves(this.board.grid, this.board);
        this.render();  // 选中后重绘
    }

    // 取消选中棋子
    deselectPiece() {
        this.clearAllSelections();
        this.selectedPiece = null;
        this.legalMoves = [];
        this.render();  // 取消选中后重绘
    }

    // 清除所有棋子的选中状态
    clearAllSelections() {
        this.board.grid.flat().forEach(p => {
            if (p && p.isSelected) {
                p.deselect();
            }
        });
    }

    // 执行移动
    executeMove(piece, toX, toY) {
        const { x: fromX, y: fromY } = piece;
        const result = this.board.movePiece(fromX, fromY, toX, toY);
        this.moveHistory.push({ piece, fromX, fromY, toX, toY, captured: result.captured });
        this.deselectPiece();
        this.render();  // 移动后重绘
        const gameResult = this.checkGameEnd();
        this.switchTurn();
        return { action: 'move', fromX, fromY, toX, toY, captured: result.captured, gameResult };
    }

    // 切换回合
    switchTurn() { this.currentCamp = this.currentCamp === '红方' ? '黑方' : '红方'; }

    // 检查游戏是否结束
    checkGameEnd() {
        const enemy = this.currentCamp === '红方' ? '黑方' : '红方';
        return this.board.isCheckmate(enemy) ? { winner: this.currentCamp, reason: '将死' } : null;
    }

    // 悔棋 - 撤销最近两步
    regret() {
        if (this.moveHistory.length < 2) return false;
        for (let i = 0; i < 2; i++) {
            const m = this.moveHistory.pop();
            if (m) {
                this.board.movePiece(m.toX, m.toY, m.fromX, m.fromY);
                if (m.captured.key) this.board.placePiece(m.toX, m.toY, m.captured.key, m.captured.piece);
            }
        }
        this.currentCamp = '红方';
        this.deselectPiece();
        return true;
    }

    // 重新开始游戏
    restart() {
        this.isPlay = true;
        this.currentCamp = '红方';
        this.moveHistory = [];
        this.deselectPiece();
        this.initBoard();
        // 重新初始化canvas（因为board是新实例）
        if (this.canvas) {
            this.board.ctx = this.canvas.getContext('2d');
            this.board.canvas = this.canvas;
            // 更新所有棋子的imageCache引用
            this.board.grid.flat().forEach(piece => {
                if (piece) piece.imageCache = this.imageCache;
            });
        }
        this.render();  // 重开游戏后重绘
    }

    // 获取游戏状态
    getStatus() {
        return {
            isPlay: this.isPlay,
            currentCamp: this.currentCamp,
            currentCampName: this.currentCamp,
            moveCount: this.moveHistory.length
        };
    }

    // 获取当前阵营所有合法移动
    getAllLegalMoves() {
        return this.board.getPiecesByCamp(this.currentCamp).flatMap(p =>
            p.getLegalMoves(this.board.grid, this.board).map(m => [p.x, p.y, m[0], m[1]])
        );
    }
}