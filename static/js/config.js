/**
 * 游戏配置
 */
export const Config = {
    CANVAS_SIZE: { WIDTH: 1000, HEIGHT: 1000 },  // 画布大小
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
    }
};
