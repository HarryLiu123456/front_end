/** 棋子基类 - 所有棋子类型的父类
 * 坐标说明：
 * - x: 棋盘x坐标 0-8，从左到右
 * - y: 棋盘y坐标 0-9，从上到下
 * - 存储：grid[x][y]
 */
import { Config } from '../config.js';

export class Piece {
    constructor(x, y, camp, imageCache = {}) {
        this.x = x;                      // 棋盘x坐标 (0-8，从左到右)
        this.y = y;                      // 棋盘y坐标 (0-9，从上到下)
        this.camp = camp;
        this.imagePath = null;
        this.imageCache = imageCache;
        this.isSelected = false;
    }

    /** 获取棋子名称 */
    get name() {
        const info = Config.PIECE_MAP[this.constructor.name];
        return this.camp === '红方' ? info.redName : info.blackName;
    }

    /** 设置棋子图片路径 */
    setImagePath(prefix) {
        this.imagePath = Config.IMAGES.BASE_PATH + prefix + '.png';
    }

    /** 绘制棋子 */
    draw(ctx, centerX, centerY) {
        const img = this.imageCache[this.imagePath];
        if (!img) return;
        const { WIDTH: pw, HEIGHT: ph } = Config.PIECE_SIZE;
        ctx.drawImage(img, centerX - pw / 2, centerY - ph / 2, pw, ph);
        if (this.isSelected) {
            this.drawSelectionBorder(ctx, centerX - pw / 2, centerY - ph / 2, pw, ph);
        }
    }

    /** 绘制选中边框 */
    drawSelectionBorder(ctx, dx, dy, dw, dh) {
        const cornerLen = Math.min(dw, dh) * 0.3;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        // 四角边框
        ctx.beginPath();
        ctx.moveTo(dx - 2, dy - 2 + cornerLen);
        ctx.lineTo(dx - 2, dy - 2);
        ctx.lineTo(dx - 2 + cornerLen, dy - 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(dx + dw + 2 - cornerLen, dy - 2);
        ctx.lineTo(dx + dw + 2, dy - 2);
        ctx.lineTo(dx + dw + 2, dy - 2 + cornerLen);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(dx - 2, dy + dh + 2 - cornerLen);
        ctx.lineTo(dx - 2, dy + dh + 2);
        ctx.lineTo(dx - 2 + cornerLen, dy + dh + 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(dx + dw + 2 - cornerLen, dy + dh + 2);
        ctx.lineTo(dx + dw + 2, dy + dh + 2);
        ctx.lineTo(dx + dw + 2, dy + dh + 2 - cornerLen);
        ctx.stroke();
    }

    /** 获取合法移动位置（子类重写）返回[x, y] */
    getLegalMoves(map, board) { return []; }

    /** 检查是否可以走到目标位置 */
    canGoTo(x, y, board) {
        if (x < 0 || x > 8 || y < 0 || y > 9) return false;
        const piece = board.getPieceAt(x, y);
        return !piece || piece.camp !== this.camp;
    }

    select() { this.isSelected = true; }
    deselect() { this.isSelected = false; }
}