/**
 * 游戏控制类
 * 管理棋盘状态、回合流程、棋子移动和渲染
 * 坐标系：grid[x][y]，x=0-8(左→右)，y=0-9(上→下)
 * 
 * 后端坐标系：左下角a0，x=a-i(0-8)，y=0-9(从下到上)
 * 游戏坐标系：左上角(0,0)，x=0-8(从左到右)，y=0-9(从上到下)
 */
import { GameConfig } from '../config.js';
import { King } from './king.js';
import { Advisor } from './advisor.js';
import { Bishop } from './bishop.js';
import { Knight } from './knight.js';
import { Rook } from './rook.js';
import { Cannon } from './cannon.js';
import { Pawn } from './pawn.js';

const PIECE_CLASSES = { King, Advisor, Bishop, Knight, Rook, Cannon, Pawn };

export class Game {
    /**
     * 构造函数
     * @param {HTMLCanvasElement} canvas - canvas画布元素
     * @param {CanvasRenderingContext2D} ctx - 画笔
     * @param {string} playerCamp - 玩家阵营（'红方' 或 '黑方'）
     * @param {string} fen - 初始FEN字符串，默认使用GameConfig.INIT_FEN
     */
    constructor(canvas, ctx, playerCamp, fen = GameConfig.INIT_FEN) {
        // 画布相关
        this.canvas = canvas;
        this.ctx = ctx;
        
        // 游戏状态
        this.playerStartCamp = playerCamp;  // 玩家阵营
        this.isPlay = false;                // 是否在进行
        this.currentCamp = '红方';         // 当前回合
        this.selectedPiece = null;          // 选中的棋子
        
        // 历史记录
        this.fenHistory = [GameConfig.INIT_FEN];  // FEN历史
        this.noCaptureMoveCount = 0;       // 未吃子步数
        this.fullmoveNumber = 1;           // 完整回合数
        
        // 棋盘数据
        this.grid = [];                    // 棋子网格
        this.imageCache = {};              // 图片缓存
        
        // 敌方等待相关
        this.isWaitingForEnemy = false;   // 是否正在等待敌方
        this.waitingIntervalId = null;    // 等待循环的interval ID
        
        // 初始化棋盘
        const result = Game.fromFen(fen, this);
        this.grid = result.grid;
        this.currentCamp = result.currentCamp;
        this.noCaptureMoveCount = result.halfmoveClock;
        this.fullmoveNumber = result.fullmoveNumber;
    }

    // ==================== 静态方法 ====================

    /** 从FEN字符串创建棋盘
     * @param {string} fen - FEN格式字符串
     * @param {Game} game - Game实例
     * @returns {{grid, currentCamp, halfmoveClock, fullmoveNumber}}
     */
    static fromFen(fen, game) {
        const grid = Array.from({ length: 9 }, () => new Array(10).fill(null));
        const parts = fen.split(' ');
        const rows = parts[0].split('/');
        const sideToMove = parts[1] || 'w';
        const halfmoveClock = parseInt(parts[4]) || 0;
        const fullmoveNumber = parseInt(parts[5]) || 1;

        GameConfig.PIECE_CLASSES = PIECE_CLASSES;

        rows.forEach((row, y) => {
            let x = 0;
            for (const c of row) {
                if (/\d/.test(c)) { x += +c; continue; }
                const pieceInfo = GameConfig.FEN_PIECE_MAP[c];
                if (pieceInfo && GameConfig.PIECE_CLASSES[pieceInfo.className]) {
                    const PieceClass = GameConfig.PIECE_CLASSES[pieceInfo.className];
                    const piece = new PieceClass(x, y, pieceInfo.camp, game.imageCache);
                    if (piece) { piece.x = x; piece.y = y; }
                    grid[x][y] = piece;
                }
                x++;
            }
        });
        return { 
            grid, 
            currentCamp: sideToMove === 'w' ? '红方' : '黑方',
            halfmoveClock,
            fullmoveNumber
        };
    }

    // ==================== 棋盘操作 ====================

    /** 坐标是否有效，棋盘范围：x=0-8, y=0-9 */
    isValidPos(x, y) { 
        return x >= 0 && x <= 8 && y >= 0 && y <= 9; 
    }

    /** 获取指定位置的棋子 */
    getPieceAt(x, y) { 
        return this.isValidPos(x, y) ? this.grid[x][y] : null; 
    }

    /** 检查移动是否合法 */
    isLegalMove(piece, toX, toY) {
        const moves = piece.getLegalMoves(this.grid, this);
        return moves.some(m => m[0] === toX && m[1] === toY);
    }

    /** 获取棋子的合法移动 */
    getLegalMoves(piece) { return piece.getLegalMoves(this.grid, this); }

    /** 获取某阵营的所有棋子 */
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

    /** 移动棋子（不更新状态）
     * @returns {{captured: Piece|null, piece: Piece}} 或 null
     */
    movePiece(piece, toX, toY) {
        if (!this.isLegalMove(piece, toX, toY)) return null;
        const fromX = piece.x, fromY = piece.y;
        const toPiece = this.grid[toX][toY];
        this.grid[toX][toY] = piece;
        piece.x = toX; piece.y = toY;
        this.grid[fromX][fromY] = null;
        return { captured: toPiece, piece };
    }

    // ==================== 坐标转换 ====================

    /** 像素坐标转棋盘坐标
     * @param {number} px - 像素x
     * @param {number} py - 像素y
     * @param {HTMLCanvasElement} canvas - 画布
     * @returns {{x:number, y:number}}
     */
    getBoardPos(px, py, canvas) {
        const offsetX = (canvas.width - GameConfig.CHESSBOARD_SIZE.WIDTH) / 2;
        const offsetY = (canvas.height - GameConfig.CHESSBOARD_SIZE.HEIGHT) / 2;
        return { 
            x: Math.round((px - offsetX - GameConfig.START_X) / GameConfig.GRID_SIZE.WIDTH), 
            y: Math.round((py - offsetY - GameConfig.START_Y) / GameConfig.GRID_SIZE.HEIGHT) 
        };
    }

    // ==================== 渲染 ====================

    /** 绘制棋盘（玩家为黑方时翻转） */
    drawBoard(ctx, canvas) {
        const img = this.imageCache[GameConfig.IMAGES.BASE_PATH + 'chessboard.png'];
        if (!img) return;
        const offsetX = (canvas.width - GameConfig.CHESSBOARD_SIZE.WIDTH) / 2;
        const offsetY = (canvas.height - GameConfig.CHESSBOARD_SIZE.HEIGHT) / 2;
        
        if (this.playerStartCamp === '黑方') {
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(Math.PI);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            ctx.drawImage(img, offsetX, offsetY, GameConfig.CHESSBOARD_SIZE.WIDTH, GameConfig.CHESSBOARD_SIZE.HEIGHT);
            ctx.restore();
        } else {
            ctx.drawImage(img, offsetX, offsetY, GameConfig.CHESSBOARD_SIZE.WIDTH, GameConfig.CHESSBOARD_SIZE.HEIGHT);
        }
    }

    /** 绘制所有棋子 */
    drawPieces(ctx, canvas) {
        const offsetX = (canvas.width - GameConfig.CHESSBOARD_SIZE.WIDTH) / 2;
        const offsetY = (canvas.height - GameConfig.CHESSBOARD_SIZE.HEIGHT) / 2;
        
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 10; y++) {
                const p = this.grid[x][y];
                if (p) {
                    p.draw(ctx, 
                        offsetX + GameConfig.START_X + p.x * GameConfig.GRID_SIZE.WIDTH,
                        offsetY + GameConfig.START_Y + p.y * GameConfig.GRID_SIZE.HEIGHT
                    );
                }
            }
        }
    }

    /** 预加载所有图片资源 */
    async preloadImages() {
        await this.loadImage(GameConfig.IMAGES.BASE_PATH + 'chessboard.png');
        await Promise.all(GameConfig.IMAGES.PIECE_LIST.map(
            name => this.loadImage(GameConfig.IMAGES.BASE_PATH + name)
        ));
    }

    /** 加载单张图片 */
    loadImage(path) {
        if (this.imageCache[path]) return Promise.resolve(this.imageCache[path]);
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => { this.imageCache[path] = img; resolve(img); };
            img.onerror = () => reject(new Error(`图片加载失败: ${path}`));
            img.src = path;
        });
    }

    /** 初始化画布（设置尺寸、加载图片） */
    async initCanvas() {
        await this.preloadImages();
        if (this.canvas) {
            this.canvas.width = GameConfig.CANVAS_SIZE.WIDTH;
            this.canvas.height = GameConfig.CANVAS_SIZE.HEIGHT;
            for (let x = 0; x < 9; x++) {
                for (let y = 0; y < 10; y++) {
                    const p = this.grid[x][y];
                    if (p) p.imageCache = this.imageCache;
                }
            }
        }
        this.render();
    }

    /** 渲染整个画面 */
    render() {
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawBoard(this.ctx, this.canvas);
            this.drawPieces(this.ctx, this.canvas);
        }
    }

    // ==================== 棋子选择 ====================

    /** 选中棋子 */
    selectPiece(piece) { 
        this.clearAllSelections(); 
        this.selectedPiece = piece; 
        piece.select(); 
        this.render(); 
    }

    /** 取消选中 */
    deselectPiece() { 
        this.clearAllSelections(); 
        this.selectedPiece = null; 
        this.render(); 
    }

    /** 清除所有选中状态 */
    clearAllSelections() { 
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 10; y++) {
                const p = this.grid[x][y];
                if (p && p.isSelected) p.deselect();
            }
        }
    }

    // ==================== 游戏逻辑 ====================

    /** 处理棋盘点击事件
     * @param {number} gridX - 棋盘x坐标
     * @param {number} gridY - 棋盘y坐标
     * @param {string} playerCamp - 玩家阵营
     * @returns {{action:string, ...}} 结果对象
     */
    handleClick(gridX, gridY, playerCamp) {
        if (!this.isPlay) return { action: 'none' };
        
        // 检查回合
        if (this.currentCamp !== playerCamp) {
            return { action: 'not_your_turn', reason: `现在轮到${this.currentCamp}移动，请等待` };
        }
        
        const clickedPiece = this.getPieceAt(gridX, gridY);

        // 有选中棋子时
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

        // 无选中棋子时
        if (clickedPiece?.camp === playerCamp) {
            this.selectPiece(clickedPiece);
            return { action: 'select', piece: clickedPiece };
        }
        if (clickedPiece && clickedPiece.camp !== playerCamp) {
            return { action: 'illegal', reason: '这是敌方的棋子，你只能操作己方棋子' };
        }
        return { action: 'none' };
    }

    /** 执行移动（更新完整状态）
     * @returns {{action:'move', fromX, fromY, toX, toY, captured, gameResult}}
     */
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

    /** 切换回合 */
    switchTurn() { 
        this.currentCamp = this.currentCamp === '红方' ? '黑方' : '红方'; 
    }

    /** 检查游戏是否结束
     * @returns {{winner, reason}|null}
     */
    checkGameEnd() {
        const enemy = this.currentCamp === '红方' ? '黑方' : '红方';
        const kingAlive = this.getPiecesByCamp(enemy).some(p => p instanceof King);
        return !kingAlive ? { winner: this.currentCamp, reason: '吃将/帅' } : null;
    }

    /** 悔棋 */
    regret() {
        if (this.fenHistory.length < 2) return false;
        
        // 停止敌方等待状态
        this.stopWaitingForEnemy();
        
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
        this.updateTurnStatus();  // 更新回合状态显示
        return true;
    }

    /** 重新开始 - 重置到初始状态
     * 清空FEN历史，重建棋盘，恢复所有状态
     */
    restart() {
        // 停止敌方等待状态
        this.stopWaitingForEnemy();
        
        // 重置FEN历史，只保留初始状态
        this.fenHistory = [GameConfig.INIT_FEN];
        
        // 从初始FEN重建棋盘
        const result = Game.fromFen(this.fenHistory[0], this);
        this.grid = result.grid;
        this.currentCamp = result.currentCamp;
        this.noCaptureMoveCount = result.halfmoveClock;
        this.fullmoveNumber = result.fullmoveNumber;
        
        // 重置选中状态
        this.selectedPiece = null;
        this.deselectPiece();
        
        // 更新界面显示
        this.render();
        this.updateMoveDisplay();
        this.updateTurnStatus();
        
        this.isPlay = true;
        
        // 玩家选择黑方时，敌方（红方）先移动
        if (this.playerStartCamp === '黑方') {
            this.startWaitingForEnemy();
        }
    }

    // ==================== FEN格式 ====================

    /** 转为FEN格式字符串 */
    toFen(full = true) {
        const boardFen = [];
        for (let y = 0; y < 10; y++) {
            let s = '', empty = 0;
            for (let x = 0; x < 9; x++) {
                const p = this.grid[x][y];
                if (p) {
                    if (empty) { s += empty; empty = 0; }
                    // 使用GameConfig.PIECE_MAP获取FEN字符
                    let fenChar = GameConfig.PIECE_MAP[p.constructor.name]?.fen || '';
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

    /** 获取完整FEN */
    getFullFen() { return this.toFen(); }

    // ==================== 界面更新 ====================

    /** 更新步数显示 */
    updateMoveDisplay() {
        const moveCountEl = document.getElementById('moveCount');
        const noCaptureCountEl = document.getElementById('noCaptureCount');
        if (moveCountEl) moveCountEl.textContent = `当前步数：${this.fenHistory.length - 1}`;
        if (noCaptureCountEl) noCaptureCountEl.textContent = `未吃子步数：${this.noCaptureMoveCount}`;
    }

    /** 获取游戏状态 */
    getStatus() {
        return { isPlay: this.isPlay, currentCamp: this.currentCamp, moveCount: this.fenHistory.length - 1 };
    }

    /**
     * 更新回合状态显示
     * 根据当前回合和等待状态显示相应的提示
     */
    updateTurnStatus() {
        const turnCampEl = document.getElementById('turnCamp');
        const turnIndicatorEl = document.getElementById('turnIndicator');
        
        if (!turnCampEl || !turnIndicatorEl) return;
        
        // 更新当前回合显示
        turnCampEl.textContent = this.currentCamp;
        
        // 清除所有状态类
        turnIndicatorEl.classList.remove('waiting-player', 'waiting-ai');
        
        if (this.isWaitingForEnemy) {
            // 正在等待AI/敌方操作
            turnIndicatorEl.classList.add('waiting-ai');
            turnIndicatorEl.querySelector('.turn-indicator__text').textContent = '等待AI操作...';
        } else if (this.currentCamp === this.playerStartCamp) {
            // 玩家回合，等待玩家操作
            turnIndicatorEl.classList.add('waiting-player');
            turnIndicatorEl.querySelector('.turn-indicator__text').textContent = '等待玩家操作';
        } else {
            // 敌方回合，等待敌方操作
            turnIndicatorEl.classList.add('waiting-ai');
            turnIndicatorEl.querySelector('.turn-indicator__text').textContent = '等待敌方操作';
        }
    }

    // ==================== 敌方操作 ====================

    /** 开始游戏 */
    async startGame() {
        this.isPlay = true;
        this.render();
        this.updateTurnStatus();  // 更新回合状态显示
        // 玩家选择黑方时，敌方（红方）先移动，使用阻塞等待机制
        if (this.playerStartCamp === '黑方') {
            this.startWaitingForEnemy();
        }
    }

    // ==================== 敌方等待机制 ====================

    /**
     * 开始阻塞等待敌方移动
     * 每隔一段时间轮询后端获取FEN串和移动指令
     * @param {number} interval - 轮询间隔（毫秒），默认1000ms
     */
    startWaitingForEnemy(interval = 1000) {
        if (this.isWaitingForEnemy) return;
        
        this.isWaitingForEnemy = true;
        this.updateWaitingStatus(true, '等待敌方移动...');
        this.updateTurnStatus();  // 更新回合状态显示
        
        // 立即执行一次轮询
        this.pollForEnemyMove();
        
        // 设置定时器定期轮询
        this.waitingIntervalId = setInterval(() => {
            if (this.isWaitingForEnemy) {
                this.pollForEnemyMove();
            }
        }, interval);
        
        console.log('[Game] 开始等待敌方移动，轮询间隔:', interval, 'ms');
    }

    /**
     * 停止阻塞等待敌方移动
     */
    stopWaitingForEnemy() {
        if (!this.isWaitingForEnemy) return;
        
        this.isWaitingForEnemy = false;
        if (this.waitingIntervalId) {
            clearInterval(this.waitingIntervalId);
            this.waitingIntervalId = null;
        }
        this.updateWaitingStatus(false, '');
        this.updateTurnStatus();  // 更新回合状态显示
        
        console.log('[Game] 停止等待敌方移动');
    }

    /**
     * 轮询后端获取敌方移动
     * 上传当前FEN串，解析后端返回的move指令并执行
     */
    async pollForEnemyMove() {
        if (!this.isPlay || !this.isWaitingForEnemy) return;
        
        try {
            // 上传当前FEN串到后端
            const currentFen = this.getFullFen();
            
            const response = await fetch('/api/enemy/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fen: currentFen })
            });
            
            if (!response.ok) {
                console.error('[Game] 轮询失败:', response.status);
                return;
            }
            
            const data = await response.json();
            console.log('[Game] 轮询结果:', data);
            
            // 处理后端返回的数据
            if (data.action === 'move_ready' && data.move) {
                // 解析移动指令（格式："a0c1"，4字符字符串）
                // 后端坐标：x=a-i(0-8)，y=0-9(从下到上)
                // 游戏坐标：x=0-8(从左到右)，y=0-9(从上到下)
                const moveStr = data.move;
                if (typeof moveStr === 'string' && moveStr.length === 4) {
                    // 解析起始位置
                    const fromBackendX = moveStr[0].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
                    const fromBackendY = parseInt(moveStr[1]);
                    // 解析目标位置
                    const toBackendX = moveStr[2].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
                    const toBackendY = parseInt(moveStr[3]);
                    
                    // 转换为游戏坐标（y轴反转）
                    const fromX = fromBackendX;
                    const fromY = 9 - fromBackendY;
                    const toX = toBackendX;
                    const toY = 9 - toBackendY;
                    
                    console.log('[Game] 解析移动: 后端', moveStr, '-> 游戏坐标', fromX, fromY, '->', toX, toY);
                    
                    // 执行移动
                    const piece = this.getPieceAt(fromX, fromY);
                    if (piece) {
                        const result = this.movePiece(piece, toX, toY);
                        if (result) {
                            // 移动成功，更新状态
                            this.fenHistory.push(this.getFullFen());
                            this.noCaptureMoveCount = result.captured ? 0 : this.noCaptureMoveCount + 1;
                            if (this.currentCamp === '黑方') this.fullmoveNumber++;
                            this.deselectPiece();
                            this.render();
                            this.updateMoveDisplay();
                            this.switchTurn();
                            
                            // 停止等待，切换到玩家回合
                            this.stopWaitingForEnemy();
                            
                            // 检查游戏是否结束
                            const gameResult = this.checkGameEnd();
                            if (gameResult) {
                                // 停止游戏
                                this.isPlay = false;
                                this.stopWaitingForEnemy();
                                // 显示获胜界面（需要在 window 上定义或通过事件触发）
                                window.showGameOver?.(gameResult.winner);
                            }
                            
                            console.log('[Game] 敌方移动完成:', fromX, fromY, '->', toX, toY);
                            return;
                        } else {
                            console.log('[Game] 移动不合法');
                        }
                    } else {
                        console.log('[Game] 起始位置没有棋子:', fromX, fromY);
                    }
                } else {
                    console.log('[Game] 无效的移动格式:', moveStr);
                }
            } else if (data.action === 'waiting') {
                // 后端暂无指令，继续等待
                console.log('[Game] 后端暂无指令，继续等待...');
            } else {
                console.log('[Game] 未知响应:', data);
            }
        } catch (error) {
            console.error('[Game] 轮询出错:', error);
        }
    }

    /**
     * 更新等待状态显示
     * @param {boolean} isWaiting - 是否正在等待
     * @param {string} message - 状态消息（已废弃，不再使用）
     */
    updateWaitingStatus(isWaiting, message) {
        // 禁用玩家的操作
        const canvasEl = document.getElementById('chessCanvas');
        if (canvasEl) {
            canvasEl.classList.toggle('is-waiting', isWaiting);
        }
    }

    /** 处理游戏结果 */
    async handleGameResult(result) {
        if (!result) return;
        switch (result.action) {
            case 'move':
                if (result.gameResult) {
                    // 停止游戏
                    this.isPlay = false;
                    this.stopWaitingForEnemy();
                    // 显示获胜界面
                    window.showGameOver?.(result.gameResult.winner);
                    return;
                }
                // 玩家移动成功后，使用阻塞等待机制等待敌方移动
                this.startWaitingForEnemy();
                break;
            case 'select': case 'deselect': case 'illegal': break;
        }
    }

    /** 处理画布点击事件 */
    async onCanvasClick(event) {
        if (!this.isPlay || !this.canvas || this.isWaitingForEnemy) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const boardPos = this.getBoardPos(
            (event.clientX - rect.left) * scaleX,
            (event.clientY - rect.top) * scaleY,
            this.canvas
        );
        if (!this.isValidPos(boardPos.x, boardPos.y)) return;
        const result = this.handleClick(boardPos.x, boardPos.y, this.playerStartCamp);
        await this.handleGameResult(result);
    }
}
