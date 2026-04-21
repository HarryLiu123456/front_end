/**
 * 游戏配置
 */
const GameConfig = {
    IMAGES: {
        // 棋盘图片大小：宽度1400，高度1500
        BOARD_SIZE: { WIDTH: 1400, HEIGHT: 1500 },
        // 棋子大小：宽度800，高度800（所有棋子大小相同）
        PIECE_SIZE: { WIDTH: 800, HEIGHT: 800 },
        // 棋盘位置配置：左下角(0,0)位置的像素坐标，以及每格像素大小
        BOARD_POSITION: { START_X: 94, START_Y: 1396, GRID_SIZE: 151 }
    },
    // 初始棋盘FEN格式字符串（中国象棋开局状态）
    // 格式说明：r=红车 n=红马 b=红相 a=红仕 k=帅 c=红炮 p=红兵
    //          R=黑车 N=黑马 B=黑象 A=黑士 K=将 C=黑炮 P=黑卒
    //          数字表示空位数量
    INITIAL_FEN: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1'
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
}
