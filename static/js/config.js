/**
 * 游戏配置模块
 * 定义画布、棋盘、棋子等常量配置
 */

// ==================== 游戏配置 ====================
export const GameConfig = {
    // ==================== 画布尺寸 ====================
    CANVAS_SIZE: { WIDTH: 700, HEIGHT: 750 },      // 画布总尺寸
    PIECE_SIZE: { WIDTH: 75, HEIGHT: 75 },          // 棋子显示尺寸
    CHESSBOARD_SIZE: { WIDTH: 650, HEIGHT: 700 },   // 棋盘显示尺寸

    // ==================== 棋盘定位 ====================
    START_X: 20,       // 棋盘左上角x偏移
    START_Y: 17,       // 棋盘左上角y偏移
    GRID_SIZE: { WIDTH: 76, HEIGHT: 73 },  // 网格间距（宽高）

    // ==================== 初始棋盘状态 ====================
    // FEN格式：红方在下方（y=7-9），黑方在上方（y=0-2）
    INIT_FEN: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1',

    // ==================== 图片资源 ====================
    IMAGES: {
        BASE_PATH: 'static/imgs/',   // 图片基础路径
        PIECE_SIZE: { WIDTH: 800, HEIGHT: 800 },  // 棋子源图尺寸
        CHESSBOARD_SIZE: { WIDTH: 1300, HEIGHT: 1400 }, // 棋盘源图尺寸
        PIECE_LIST: [  // 所有棋子图片列表
            'red_king.png', 'black_king.png',      // 将帅
            'red_advisor.png', 'black_advisor.png', // 仕士
            'red_bishop.png', 'black_bishop.png',  // 相象
            'red_knight.png', 'black_knight.png',  // 马
            'red_rook.png', 'black_rook.png',      // 车
            'red_cannon.png', 'black_cannon.png',  // 炮
            'red_pawn.png', 'black_pawn.png'       // 兵卒
        ],
    },

    // ==================== 棋子映射 ====================
    // 棋子类列表（用于遍历）
    CLASS_LIST: ['King', 'Advisor', 'Bishop', 'Knight', 'Rook', 'Cannon', 'Pawn'],

    // 类名 -> 棋子信息：name=类名, camp=默认阵营, fen=FEN字符, redName=红方名称, blackName=黑方名称
    PIECE_MAP: {
        'King':    { name: 'King',    camp: '红方', fen: 'K', redName: '帅', blackName: '将' },
        'Advisor': { name: 'Advisor', camp: '红方', fen: 'A', redName: '仕', blackName: '士' },
        'Bishop':  { name: 'Bishop',  camp: '红方', fen: 'B', redName: '相', blackName: '象' },
        'Knight':  { name: 'Knight',  camp: '红方', fen: 'N', redName: '马', blackName: '马' },
        'Rook':    { name: 'Rook',    camp: '红方', fen: 'R', redName: '车', blackName: '车' },
        'Cannon':  { name: 'Cannon',  camp: '红方', fen: 'C', redName: '炮', blackName: '炮' },
        'Pawn':    { name: 'Pawn',    camp: '红方', fen: 'P', redName: '兵', blackName: '卒' },
    },

    // FEN字符 -> 棋子完整信息（大写=红方，小写=黑方）
    FEN_PIECE_MAP: {
        'K': { className: 'King', camp: '红方', name: '帅' },
        'A': { className: 'Advisor', camp: '红方', name: '仕' },
        'B': { className: 'Bishop', camp: '红方', name: '相' },
        'N': { className: 'Knight', camp: '红方', name: '马' },
        'R': { className: 'Rook', camp: '红方', name: '车' },
        'C': { className: 'Cannon', camp: '红方', name: '炮' },
        'P': { className: 'Pawn', camp: '红方', name: '兵' },
        'k': { className: 'King', camp: '黑方', name: '将' },
        'a': { className: 'Advisor', camp: '黑方', name: '士' },
        'b': { className: 'Bishop', camp: '黑方', name: '象' },
        'n': { className: 'Knight', camp: '黑方', name: '马' },
        'r': { className: 'Rook', camp: '黑方', name: '车' },
        'c': { className: 'Cannon', camp: '黑方', name: '炮' },
        'p': { className: 'Pawn', camp: '黑方', name: '卒' },
    },
}