/**
 * 棋盘类 - 管理棋盘状态和棋子
 */
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
    /**
     * 构造函数
     * @param {Object} imageCache - 图片缓存
     */
    constructor(imageCache) {
        this.grid = [];           // 10×9 二维数组存储棋子
        this.imageCache = imageCache || {};
        this.shouldRotate = false;  // 是否旋转棋盘（玩家选择黑方时为true）
    }

    /**
     * 创建空棋盘
     */
    createEmptyGrid() {
        this.grid = Array.from({ length: 10 }, () => new Array(9).fill(null));
    }

    /**
     * 从FEN格式创建棋盘
     * @param {string} fen - FEN格式字符串
     * @param {Object} config - 配置对象
     * @returns {Object} 包含棋盘实例和FEN参数的 {board, sideToMove, halfmoveClock, fullmoveNumber}
     */
    static fromFen(fen, config = {}) {
        const imageCache = config.imageCache || {};
        const board = new ChessBoard(imageCache);
        board.createEmptyGrid();
        
        const parts = fen.split(' ');
        const rows = parts[0].split('/');
        // 解析FEN参数
        const sideToMove = parts[1] || 'w';  // w=红方, b=黑方
        const halfmoveClock = parseInt(parts[4]) || 0;  // 未吃子步数
        const fullmoveNumber = parseInt(parts[5]) || 1;  // 回合数
        
        // 填充Config.PIECE_CLASSES供其他模块使用
        Config.PIECE_CLASSES = { King, Advisor, Bishop, Knight, Rook, Cannon, Pawn };

        rows.forEach((row, y) => {
            let x = 0;
            for (const c of row) {
                // 数字表示空位
                if (/\d/.test(c)) { x += +c; continue; }
                const info = Config.FEN_PIECE_MAP[c];
                if (info) {
                    const PieceClass = Config.PIECE_CLASSES[info.className];
                    if (PieceClass) {
                        const piece = new PieceClass(x, y, info.camp, imageCache);
                        board.placePiece(x, y, piece);
                    }
                }
                x++;
            }
        });
        return { 
            board, 
            sideToMove, 
            halfmoveClock, 
            fullmoveNumber,
            // 将sideToMove转换为阵营
            currentCamp: sideToMove === 'w' ? '红方' : '黑方'
        };
    }

    /**
     * 转为FEN格式（仅棋盘部分）
     * @returns {string} FEN格式字符串
     */
    toFen() {
        return this.grid.map(row => {
            let s = '', empty = 0;
            row.forEach(p => {
                if (p) {
                    if (empty) { s += empty; empty = 0; }
                    // 使用FEN_PIECE_MAP反向查找FEN字符
                    const fenChar = Object.keys(Config.FEN_PIECE_MAP).find(k => 
                        Config.FEN_PIECE_MAP[k].className === p.constructor.name && 
                        Config.FEN_PIECE_MAP[k].camp === p.camp
                    );
                    s += fenChar || '';
                } else {
                    empty++;
                }
            });
            return empty ? s + empty : s;
        }).join('/');
    }

    /**
     * 转为完整FEN格式（包含回合数和未吃子步数）
     * @param {string} sideToMove - w=红方, b=黑方
     * @param {number} halfmoveClock - 未吃子步数
     * @param {number} fullmoveNumber - 回合数
     * @returns {string} 完整FEN格式字符串
     */
    toFullFen(sideToMove = 'w', halfmoveClock = 0, fullmoveNumber = 1) {
        return `${this.toFen()} ${sideToMove} - - ${halfmoveClock} ${fullmoveNumber}`;
    }

    /**
     * 放置棋子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Piece} piece - 棋子对象
     */
    placePiece(x, y, piece) {
        if (piece) { piece.x = x; piece.y = y; }
        this.grid[y][x] = piece;
    }

    /**
     * 移动棋子（检查合法性后再移动）
     * @param {Piece} piece - 要移动的棋子
     * @param {number} toX - 目标X坐标
     * @param {number} toY - 目标Y坐标
     * @returns {Object|null} 移动结果，包含被吃的棋子；移动失败返回null
     */
    movePiece(piece, toX, toY) {
        // 检查移动是否合法（包括将军约束）
        if (!this.isLegalMove(piece, toX, toY)) {
            return null;  // 移动不合法
        }
        
        const { x: fromX, y: fromY } = piece;
        const toPiece = this.grid[toY][toX];  // 目标位置棋子
        
        // 移动棋子到目标位置
        this.grid[toY][toX] = piece;
        piece.x = toX;
        piece.y = toY;
        
        // 原位置设为null
        this.grid[fromY][fromX] = null;
        
        return { captured: toPiece, piece };
    }

    /**
     * 获取棋子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {Piece|null} 棋子对象
     */
    getPieceAt(x, y) {
        return this.isValidPos(x, y) ? this.grid[y][x] : null;
    }

    /**
     * 坐标是否有效
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {boolean} 是否有效
     */
    isValidPos(x, y) { return x >= 0 && x <= 8 && y >= 0 && y <= 9; }

    /**
     * 检查移动是否合法（包括将军约束）
     * @param {Piece} piece - 要移动的棋子
     * @param {number} toX - 目标X坐标
     * @param {number} toY - 目标Y坐标
     * @returns {boolean} 是否合法
     */
    isLegalMove(piece, toX, toY) {
        // 检查基本移动规则
        const basicMoves = piece.getLegalMoves(this.grid, this);
        const isBasicLegal = basicMoves.some(m => m[0] === toX && m[1] === toY);
        if (!isBasicLegal) return false;
        // 检查移动后是否会导致己方被将军
        return !this.wouldBeInCheck(piece, toX, toY);
    }

    /**
     * 检查移动后是否会己方被将军
     * @param {Piece} piece - 要移动的棋子
     * @param {number} toX - 目标X坐标
     * @param {number} toY - 目标Y坐标
     * @returns {boolean} 是否会导致己方被将军
     */
    wouldBeInCheck(piece, toX, toY) {
        const cloned = this.clone();
        // 直接操作克隆棋盘，不检查合法性
        const fromPiece = cloned.grid[piece.y][piece.x];
        const toPiece = cloned.grid[toY][toX];
        cloned.grid[toY][toX] = fromPiece;
        if (fromPiece) { fromPiece.x = toX; fromPiece.y = toY; }
        cloned.grid[piece.y][piece.x] = null;
        return cloned.isInCheck(piece.camp);
    }

    /**
     * 获取棋子的合法移动位置（考虑将军约束）
     * @param {Piece} piece - 棋子对象
     * @returns {Array} 合法移动位置数组 [[x,y], ...]
     */
    getLegalMoves(piece) {
        const moves = piece.getLegalMoves(this.grid, this);
        // 过滤掉移动后会导致己方被将军的位置
        return moves.filter(([x, y]) => !this.wouldBeInCheck(piece, x, y));
    }

    /**
     * 获取阵营棋子
     * @param {string} camp - 阵营
     * @returns {Array} 棋子数组
     */
    getPiecesByCamp(camp) {
        return this.grid.flat().filter(p => p && p.camp === camp);
    }

    /**
     * 绘制棋盘背景
     * @param {CanvasRenderingContext2D} ctx - Canvas绘图上下文
     * @param {HTMLCanvasElement} canvas - Canvas元素
     */
    drawBoard(ctx, canvas) {
        const boardImage = Config.IMAGES.BASE_PATH + 'chessboard.png';
        const img = this.imageCache[boardImage];
        if (!img) return;
        
        // 计算棋盘在Canvas中的居中偏移
        const offsetX = (canvas.width - Config.CHESSBOARD_SIZE.WIDTH) / 2;
        const offsetY = (canvas.height - Config.CHESSBOARD_SIZE.HEIGHT) / 2;
        
        // 如果需要旋转
        if (this.shouldRotate) {
            ctx.save();
            // 移动到画布中心，旋转180度，再移回来
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(Math.PI);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            ctx.drawImage(img, offsetX, offsetY, Config.CHESSBOARD_SIZE.WIDTH, Config.CHESSBOARD_SIZE.HEIGHT);
            ctx.restore();
        } else {
            ctx.drawImage(img, offsetX, offsetY, Config.CHESSBOARD_SIZE.WIDTH, Config.CHESSBOARD_SIZE.HEIGHT);
        }
    }

    /**
     * 绘制所有棋子
     * @param {CanvasRenderingContext2D} ctx - Canvas绘图上下文
     * @param {HTMLCanvasElement} canvas - Canvas元素
     */
    drawPieces(ctx, canvas) {
        // 计算棋盘在Canvas中的居中偏移
        const offsetX = (canvas.width - Config.CHESSBOARD_SIZE.WIDTH) / 2;
        const offsetY = (canvas.height - Config.CHESSBOARD_SIZE.HEIGHT) / 2;
        
        // 绘制棋盘上的所有棋子
        this.grid.flat().filter(p => p).forEach(p => {
            const pieceX = offsetX + Config.START_X + p.x * Config.GRID_SIZE.WIDTH;
            const pieceY = offsetY + Config.START_Y + p.y * Config.GRID_SIZE.HEIGHT;
            if (p.isSelected) {
                console.log('绘制选中棋子:', p.name, 'at', p.x, p.y, 'isSelected:', p.isSelected);
            }
            p.draw(ctx, pieceX, pieceY);  // 棋子自己负责绘制选中边框
        });
    }

    /**
     * 完整渲染
     * @param {CanvasRenderingContext2D} ctx - Canvas绘图上下文
     * @param {HTMLCanvasElement} canvas - Canvas元素
     */
    render(ctx, canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawBoard(ctx, canvas);
        this.drawPieces(ctx, canvas);
    }

    /**
     * 像素坐标转换为棋盘坐标
     * @param {number} px - 像素X坐标
     * @param {number} py - 像素Y坐标
     * @param {HTMLCanvasElement} canvas - Canvas元素
     * @returns {Object} 棋盘坐标 {x, y}
     */
    getBoardPos(px, py, canvas) {
        const offsetX = (canvas.width - Config.CHESSBOARD_SIZE.WIDTH) / 2;
        const offsetY = (canvas.height - Config.CHESSBOARD_SIZE.HEIGHT) / 2;
        return { 
            x: Math.round((px - offsetX - Config.START_X) / Config.GRID_SIZE.WIDTH), 
            y: Math.round((py - offsetY - Config.START_Y) / Config.GRID_SIZE.HEIGHT) 
        };
    }

    /**
     * 是否被将军
     * @param {string} camp - 阵营
     * @returns {boolean} 是否被将军
     */
    isInCheck(camp) {
        // 找到己方将/帅
        const king = this.getPiecesByCamp(camp).find(p => p instanceof King);
        // 将/帅不存在视为被将军（已被吃掉）
        if (!king) return true;
        
        // 检查敌方每个棋子是否能吃到将/帅
        // 直接遍历敌方棋子，检查其原始移动规则能否到达king的位置
        // 不通过wouldBeInCheck，避免递归
        const enemy = camp === '红方' ? '黑方' : '红方';
        const enemyPieces = this.getPiecesByCamp(enemy);
        
        for (const p of enemyPieces) {
            // 使用原始map直接获取移动位置（不考虑将军约束）
            const rawMoves = this._getRawMoves(p);
            if (rawMoves.some(m => m[0] === king.x && m[1] === king.y)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 获取棋子的原始移动位置（不考虑将军约束）
     * @param {Piece} piece - 棋子对象
     * @returns {Array} 移动位置数组 [[x,y], ...]
     */
    _getRawMoves(piece) {
        const moves = [];
        const directions = this._getMoveDirections(piece);
        
        for (const dir of directions) {
            const [dx, dy, type] = dir;
            
            if (type === 'rook') {
                // 车/兵/将帅的直线移动
                for (let i = 1; i <= 9; i++) {
                    const nx = piece.x + dx * i;
                    const ny = piece.y + dy * i;
                    if (nx < 0 || nx > 8 || ny < 0 || ny > 9) break;
                    const target = this.getPieceAt(nx, ny);
                    if (target) {
                        if (target.camp !== piece.camp) moves.push([nx, ny]);
                        break;
                    } else {
                        moves.push([nx, ny]);
                    }
                }
            } else if (type === 'cannon') {
                // 炮的移动
                let jumpCount = 0;
                for (let i = 1; i <= 9; i++) {
                    const nx = piece.x + dx * i;
                    const ny = piece.y + dy * i;
                    if (nx < 0 || nx > 8 || ny < 0 || ny > 9) break;
                    const target = this.getPieceAt(nx, ny);
                    if (target) {
                        if (jumpCount === 0) {
                            jumpCount++;
                        } else {
                            if (target.camp !== piece.camp) moves.push([nx, ny]);
                            break;
                        }
                    } else if (jumpCount === 0) {
                        moves.push([nx, ny]);
                    }
                }
            } else if (type === 'knight') {
                // 马的移动：先检查蹩马腿
                const legX = piece.x + dx;
                const legY = piece.y + dy;
                // 蹩马腿位置必须有棋子
                if (!this.getPieceAt(legX, legY)) continue;
                // 马腿方向（用于判断是横向还是纵向蹩腿）
                const isHorizontal = Math.abs(dx) > Math.abs(dy);
                const nx = piece.x + (isHorizontal ? dx / 2 : dx);
                const ny = piece.y + (isHorizontal ? dy : dy / 2);
                // 检查目标位置
                const target = this.getPieceAt(nx, ny);
                if (!target || target.camp !== piece.camp) {
                    moves.push([nx, ny]);
                }
            } else if (type === 'bishop') {
                // 相的移动：先检查塞象眼
                const eyeX = piece.x + dx / 2;
                const eyeY = piece.y + dy / 2;
                // 塞象眼位置必须有棋子
                if (this.getPieceAt(eyeX, eyeY)) continue;
                const nx = piece.x + dx;
                const ny = piece.y + dy;
                // 检查是否在合法范围内（红相0-4行，黑象5-9行）
                const validY = piece.camp === '红方' ? ny >= 0 && ny <= 4 : ny >= 5 && ny <= 9;
                if (validY) {
                    const target = this.getPieceAt(nx, ny);
                    if (!target || target.camp !== piece.camp) {
                        moves.push([nx, ny]);
                    }
                }
            }
        }
        return moves;
    }
    
    /**
     * 获取棋子类型的移动方向和类型
     * @param {Piece} piece - 棋子对象
     * @returns {Array} [[dx, dy, type], ...]
     */
    _getMoveDirections(piece) {
        const name = piece.constructor.name;
        
        // 将帅：直线一步
        if (name === 'King') {
            return [[0, -1, 'rook'], [0, 1, 'rook'], [-1, 0, 'rook'], [1, 0, 'rook']];
        }
        
        // 车：四方向直线
        if (name === 'Rook') {
            return [[0, -1, 'rook'], [0, 1, 'rook'], [-1, 0, 'rook'], [1, 0, 'rook']];
        }
        
        // 炮：四方向直线（需要炮架）
        if (name === 'Cannon') {
            return [[0, -1, 'cannon'], [0, 1, 'cannon'], [-1, 0, 'cannon'], [1, 0, 'cannon']];
        }
        
        // 马：日字移动
        if (name === 'Knight') {
            return [
                [-1, -2, 'knight'], [1, -2, 'knight'], 
                [-2, -1, 'knight'], [2, -1, 'knight'],
                [-2, 1, 'knight'], [2, 1, 'knight'],
                [-1, 2, 'knight'], [1, 2, 'knight']
            ];
        }
        
        // 相/象：田字移动
        if (name === 'Bishop') {
            return [
                [-2, -2, 'bishop'], [2, -2, 'bishop'],
                [-2, 2, 'bishop'], [2, 2, 'bishop']
            ];
        }
        
        // 士：斜线一步
        if (name === 'Advisor') {
            return [[-1, -1, 'rook'], [1, -1, 'rook'], [-1, 1, 'rook'], [1, 1, 'rook']];
        }
        
        // 兵：前进一步，过河可左右
        if (name === 'Pawn') {
            if (piece.camp === '红方') {
                const moves = [[0, -1, 'rook']];
                if (piece.y <= 4) moves.push([1, 0, 'rook'], [-1, 0, 'rook']);
                return moves;
            } else {
                const moves = [[0, 1, 'rook']];
                if (piece.y >= 5) moves.push([1, 0, 'rook'], [-1, 0, 'rook']);
                return moves;
            }
        }
        
        return [];
    }

    /**
     * 是否将死（无合法移动）
     * @param {string} camp - 阵营
     * @returns {boolean} 是否将死
     */
    isCheckmate(camp) {
        // 首先必须是被将军状态
        if (!this.isInCheck(camp)) return false;
        
        // 检查己方所有棋子是否有合法移动（使用棋盘类的getLegalMoves考虑将军约束）
        const pieces = this.getPiecesByCamp(camp);
        for (const p of pieces) {
            const moves = this.getLegalMoves(p);  // 使用棋盘类的getLegalMoves
            if (moves.length > 0) return false;  // 有合法移动则不是将死
        }
        return true;
    }

    /**
     * 克隆棋盘（浅拷贝，棋子对象共享）
     * @returns {ChessBoard} 克隆的棋盘
     */
    clone() {
        const b = new ChessBoard(this.imageCache);
        b.grid = this.grid.map(row => row.map(p => p ? Object.assign(Object.create(Object.getPrototypeOf(p)), p) : null));
        return b;
    }
}
