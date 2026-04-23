/**
 * 游戏配置
 */
export const Config = {
    CANVAS_SIZE: { WIDTH: 700, HEIGHT: 850 },  // 画布大小
    PIECE_SIZE: { WIDTH: 75, HEIGHT: 75 },      // 棋子显示大小
    CHESSBOARD_SIZE: { WIDTH: 650, HEIGHT: 700 }, // 棋盘图片大小
    START_X: 20,           // 棋盘起始X坐标
    START_Y: 17,           // 棋盘起始Y坐标
    GRID_SIZE: {WIDTH: 76, HEIGHT: 73},        // 网格大小
    INIT_FEN: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1',  // 初始FEN
    IMAGES: {
        BASE_PATH: 'static/imgs/',
        PIECE_SIZE: { WIDTH: 800, HEIGHT: 800 },  // 棋子图片原始大小
        PIECE_LIST: [
            'red_king.png', 'black_king.png',   // 将/帅
            'red_advisor.png', 'black_advisor.png',   // 士
            'red_bishop.png', 'black_bishop.png',   // 相/象
            'red_knight.png', 'black_knight.png',   // 马
            'red_rook.png', 'black_rook.png',   // 车
            'red_cannon.png', 'black_cannon.png',   // 炮
            'red_pawn.png', 'black_pawn.png'    // 兵/卒
        ],
    },

    // FEN码到棋子信息的映射
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
        'p': { className: 'Pawn', camp: '黑方', name: '卒' }
    },

    // 棋子类型信息映射
    PIECE_INFO: {
        'King': { redName: '帅', blackName: '将' },
        'Advisor': { redName: '仕', blackName: '士' },
        'Bishop': { redName: '相', blackName: '象' },
        'Knight': { redName: '马', blackName: '马' },
        'Rook': { redName: '车', blackName: '车' },
        'Cannon': { redName: '炮', blackName: '炮' },
        'Pawn': { redName: '兵', blackName: '卒' }
    },

    // 棋子类映射（运行时由chessboard.js填充）
    PIECE_CLASSES: {}
};
