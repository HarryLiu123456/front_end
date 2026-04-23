/**
 * 游戏控制类 - 管理游戏流程、回合、胜负
 */
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
    /**
     * 构造函数
     * @param {string} fen - FEN格式棋盘字符串
     * @param {string} playerStartCamp - 玩家选择的起始阵营（"红方"或"黑方"）
     */
    constructor(fen = Config.INIT_FEN, playerStartCamp = '红方') {
        this.isPlay = false;           // 是否开始游戏
        this.selectedPiece = null;     // 选中的棋子
        this.fenHistory = [];          // FEN历史序列（每次移动后的局面）
        this.imageCache = {};          // 统一管理图片缓存
        this.ctx = null;              // Canvas绘图上下文
        this.canvas = null;           // Canvas元素
        this.playerStartCamp = playerStartCamp;  // 玩家起始阵营
        // 从FEN创建棋盘实例，并解析FEN参数
        const result = ChessBoard.fromFen(fen, { imageCache: this.imageCache });
        this.board = result.board;     // 棋盘实例
        this.currentCamp = result.currentCamp;  // 当前下棋方
        this.noCaptureMoveCount = result.halfmoveClock;  // 未吃子步数
        this.fullmoveNumber = result.fullmoveNumber;      // 回合数
        // 游戏开始时加入初始FEN
        this.fenHistory.push(Config.INIT_FEN);
        console.log('游戏开始，初始FEN:', this.fenHistory[0]);
    }

    /**
     * 预加载所有图片
     */
    async preloadImages() {
        await this.loadBoardImage();
        await this.loadPieceImages();
    }

    /**
     * 加载棋盘背景图
     */
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

    /**
     * 预加载所有棋子图片
     */
    loadPieceImages() {
        const { BASE_PATH, PIECE_LIST } = Config.IMAGES;
        const promises = PIECE_LIST.map(name => this.loadImage(BASE_PATH + name));
        return Promise.all(promises);
    }

    /**
     * 加载单张图片
     * @param {string} path - 图片路径
     */
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

    /**
     * 初始化画布
     * @param {string} canvasId - Canvas元素ID
     */
    async initCanvas(canvasId) {
        await this.preloadImages();
        this.canvas = document.getElementById(canvasId);
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = Config.CANVAS_SIZE.WIDTH;
            this.canvas.height = Config.CANVAS_SIZE.HEIGHT;
            this.board.imageCache = this.imageCache;
            this.board.grid.flat().forEach(piece => {
                if (piece) piece.imageCache = this.imageCache;
            });
        }
        this.render();
    }

    /**
     * 绘制棋盘
     */
    render() {
        console.log('render调用, selectedPiece:', this.selectedPiece?.name, 'isSelected:', this.selectedPiece?.isSelected);
        this.board.render(this.ctx, this.canvas);
    }

    /**
     * 处理棋盘点击事件
     * @param {number} gridX - 棋盘X坐标
     * @param {number} gridY - 棋盘Y坐标
     * @param {string} playerCamp - 玩家阵营（"红方"或"黑方"）
     * @returns {Object} 操作结果
     */
    handleClick(gridX, gridY, playerCamp = '红方') {
        if (!this.isPlay) return { action: 'none' };
        const clickedPiece = this.board.getPieceAt(gridX, gridY);

        // 有选中棋子时，尝试移动
        if (this.selectedPiece) {
            const result = this.executeMove(this.selectedPiece, gridX, gridY);
            if (result.action === 'move') return result;
            // 选择同阵营的棋子（玩家阵营）
            if (clickedPiece?.camp === playerCamp) {
                this.selectPiece(clickedPiece);
                return { action: 'select', piece: clickedPiece };
            }
            this.deselectPiece();
            return { action: 'deselect' };
        }

        // 选择己方棋子（玩家阵营）
        if (clickedPiece?.camp === playerCamp) {
            this.selectPiece(clickedPiece);
            return { action: 'select', piece: clickedPiece };
        }
        // 如果点击的是敌方棋子，提示不是自己的回合
        if (clickedPiece && clickedPiece.camp !== playerCamp) {
            return { action: 'illegal', reason: '这是敌方的棋子，你只能操作己方棋子' };
        }
        return { action: 'none' };
    }

    /**
     * 选中棋子
     * @param {Piece} piece - 棋子对象
     */
    selectPiece(piece) {
        this.clearAllSelections();
        this.selectedPiece = piece;
        piece.select();
        console.log('选中棋子:', piece.name, 'isSelected:', piece.isSelected);
        this.render();
    }

    /**
     * 取消选中棋子
     */
    deselectPiece() {
        this.clearAllSelections();
        this.selectedPiece = null;
        this.render();
    }

    /**
     * 清除所有棋子的选中状态
     */
    clearAllSelections() {
        this.board.grid.flat().forEach(p => {
            if (p && p.isSelected) {
                p.deselect();
            }
        });
    }

    /**
     * 执行移动
     * @param {Piece} piece - 棋子对象
     * @param {number} toX - 目标X坐标
     * @param {number} toY - 目标Y坐标
     * @returns {Object} 移动结果
     */
    executeMove(piece, toX, toY) {
        const { x: fromX, y: fromY } = piece;
        
        // 调用棋盘的movePiece，会自动检查合法性
        const result = this.board.movePiece(piece, toX, toY);
        
        // 如果移动失败（返回null），不改变状态
        if (!result) {
            return { action: 'none' };
        }
        
        // 更新未吃子步数计数
        if (result.captured) {
            this.noCaptureMoveCount = 0;  // 吃子则重置
        } else {
            this.noCaptureMoveCount++;    // 未吃子则增加
        }
        
        // 更新回合数（红方走完后才增加）
        if (this.currentCamp === '黑方') {
            this.fullmoveNumber++;
        }
        
        // 移动成功后才保存完整FEN（保存移动后的状态，用于悔棋）
        const fullFen = this.getFullFen();
        this.fenHistory.push(fullFen);
        // 只打印末尾FEN
        console.log('加入新FEN，当前末尾FEN:', this.fenHistory[this.fenHistory.length - 1]);
        
        this.deselectPiece();
        this.render();
        
        // 更新显示
        this.updateMoveDisplay();
        
        // 检查游戏是否结束
        const gameResult = this.checkGameEnd();
        
        // 切换回合
        this.switchTurn();
        
        return { 
            action: 'move', 
            fromX, 
            fromY, 
            toX, 
            toY, 
            captured: result.captured, 
            gameResult 
        };
    }

    /**
     * 切换回合
     */
    switchTurn() {
        this.currentCamp = this.currentCamp === '红方' ? '黑方' : '红方';
    }

    /**
     * 检查游戏是否结束
     * @returns {Object|null} 游戏结果
     */
    checkGameEnd() {
        // checkGameEnd在switchTurn之前调用，所以currentCamp是刚走完棋的一方
        // 需要检查另一方（enemy）是否被将死
        const enemy = this.currentCamp === '红方' ? '黑方' : '红方';
        // 如果enemy被将死，则当前方（this.currentCamp）获胜
        return this.board.isCheckmate(enemy) ? { winner: this.currentCamp, reason: '将死' } : null;
    }

    /**
     * 悔棋 - 撤销最近一步，通过FEN恢复棋盘
     * @returns {boolean} 是否悔棋成功
     */
    regret() {
        if (this.fenHistory.length < 2) return false;  // 至少保留初始FEN
        
        // 弹出最后一个FEN（这是当前局面）
        this.fenHistory.pop();
        
        // 用弹出后剩余的最后一个FEN恢复棋盘
        const targetFen = this.fenHistory[this.fenHistory.length - 1];
        console.log('悔棋，当前末尾FEN:', targetFen);
        
        const result = ChessBoard.fromFen(targetFen, { imageCache: this.imageCache });
        this.board = result.board;
        this.currentCamp = result.currentCamp;
        this.noCaptureMoveCount = result.halfmoveClock;
        this.fullmoveNumber = result.fullmoveNumber;
        
        this.deselectPiece();
        this.render();
        this.updateMoveDisplay();
        return true;
    }

    /**
     * 重新开始游戏（相当于一次性悔棋到初始状态）
     */
    restart() {
        this.isPlay = true;
        this.noCaptureMoveCount = 0;  // 重置未吃子步数
        this.fullmoveNumber = 1;      // 重置回合数
        this.deselectPiece();
        
        // 弹出所有FEN，只保留初始FEN
        while (this.fenHistory.length > 1) {
            this.fenHistory.pop();
        }
        console.log('重新开始，保留初始FEN:', this.fenHistory[0]);
        
        const result = ChessBoard.fromFen(this.fenHistory[0], { imageCache: this.imageCache });
        this.board = result.board;
        this.currentCamp = result.currentCamp;
        this.board.grid.flat().forEach(piece => {
            if (piece) piece.imageCache = this.imageCache;
        });
        
        this.render();
        this.updateMoveDisplay();  // 更新显示
    }

    /**
     * 获取完整FEN格式字符串
     * @returns {string} 完整FEN格式
     */
    getFullFen() {
        const sideToMove = this.currentCamp === '红方' ? 'w' : 'b';
        return this.board.toFullFen(sideToMove, this.noCaptureMoveCount, this.fullmoveNumber);
    }

    /**
     * 更新步数显示
     */
    updateMoveDisplay() {
        const moveCountEl = document.getElementById('moveCount');
        const noCaptureCountEl = document.getElementById('noCaptureCount');
        if (moveCountEl) {
            moveCountEl.textContent = `当前步数：${this.fenHistory.length - 1}`;  // 减1因为包含初始FEN
        }
        if (noCaptureCountEl) {
            noCaptureCountEl.textContent = `未吃子步数：${this.noCaptureMoveCount}`;
        }
    }

    /**
     * 获取游戏状态
     * @returns {Object} 游戏状态
     */
    getStatus() {
        return {
            isPlay: this.isPlay,
            currentCamp: this.currentCamp,
            currentCampName: this.currentCamp,
            moveCount: this.fenHistory.length - 1  // 减1因为包含初始FEN
        };
    }
}
