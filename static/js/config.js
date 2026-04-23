/** 游戏配置 */
export const Config = {
    CANVAS_SIZE: { WIDTH: 700, HEIGHT: 850 },
    PIECE_SIZE: { WIDTH: 75, HEIGHT: 75 },
    CHESSBOARD_SIZE: { WIDTH: 650, HEIGHT: 700 },
    START_X: 20,
    START_Y: 17,
    GRID_SIZE: { WIDTH: 76, HEIGHT: 73 },
    INIT_FEN: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1',
    IMAGES: {
        BASE_PATH: 'static/imgs/',
        PIECE_SIZE: { WIDTH: 800, HEIGHT: 800 },
        PIECE_LIST: [
            'red_king.png', 'black_king.png', 'red_advisor.png', 'black_advisor.png',
            'red_bishop.png', 'black_bishop.png', 'red_knight.png', 'black_knight.png',
            'red_rook.png', 'black_rook.png', 'red_cannon.png', 'black_cannon.png',
            'red_pawn.png', 'black_pawn.png'
        ],
    },

    // 棋子类列表
    CLASS_LIST: ['King', 'Advisor', 'Bishop', 'Knight', 'Rook', 'Cannon', 'Pawn'],

    // 棋子完整信息映射：类名 -> {name, camp, fen, redName, blackName}
    PIECE_MAP: {
        'King':    { name: 'King',    camp: '红方', fen: 'K', redName: '帅', blackName: '将' },
        'Advisor': { name: 'Advisor', camp: '红方', fen: 'A', redName: '仕', blackName: '士' },
        'Bishop':  { name: 'Bishop',  camp: '红方', fen: 'B', redName: '相', blackName: '象' },
        'Knight':  { name: 'Knight',  camp: '红方', fen: 'N', redName: '马', blackName: '马' },
        'Rook':    { name: 'Rook',    camp: '红方', fen: 'R', redName: '车', blackName: '车' },
        'Cannon':  { name: 'Cannon',  camp: '红方', fen: 'C', redName: '炮', blackName: '炮' },
        'Pawn':    { name: 'Pawn',    camp: '红方', fen: 'P', redName: '兵', blackName: '卒' },
    },

    // FEN字符到棋子信息的映射
    FEN_PIECE_MAP: {
        'K': 'King', 'A': 'Advisor', 'B': 'Bishop', 'N': 'Knight',
        'R': 'Rook', 'C': 'Cannon', 'P': 'Pawn',
        'k': 'King', 'a': 'Advisor', 'b': 'Bishop', 'n': 'Knight',
        'r': 'Rook', 'c': 'Cannon', 'p': 'Pawn'
    },
};