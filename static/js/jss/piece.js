/**
 * 棋子基类
 * 所有棋子类型的父类
 * 坐标系：x=0-8(左→右), y=0-9(上→下)，存储于grid[x][y]
 */
import { GameConfig } from '../config.js';

export class Piece {
    /**
     * 构造函数
     * @param {number} x - 棋盘x坐标 (0-8)
     * @param {number} y - 棋盘y坐标 (0-9)
     * @param {string} camp - 阵营（'红方' 或 '黑方'）
     * @param {Object} imageCache - 图片缓存
     */
    constructor(x, y, camp, imageCache = {}) {
        this.x = x;                      // 棋盘x坐标
        this.y = y;                      // 棋盘y坐标
        this.camp = camp;                // 阵营
        this.imagePath = null;           // 图片路径
        this.imageCache = imageCache;    // 图片缓存
        this.isSelected = false;         // 是否被选中
    }

    /** 棋子显示名称（根据阵营） */
    get name() {
        const info = GameConfig.PIECE_MAP[this.constructor.name];
        return this.camp === '红方' ? info.redName : info.blackName;
    }

    /** 设置棋子图片路径
     * @param {string} prefix - 图片文件名前缀
     */
    setImagePath(prefix) {
        this.imagePath = GameConfig.IMAGES.BASE_PATH + prefix + '.png';
    }

    /** 绘制棋子
     * @param {CanvasRenderingContext2D} ctx - 画笔
     * @param {number} centerX - 中心x坐标
     * @param {number} centerY - 中心y坐标
     */
    draw(ctx, centerX, centerY) {
        const img = this.imageCache[this.imagePath];
        if (!img) return;
        const { WIDTH: pw, HEIGHT: ph } = GameConfig.PIECE_SIZE;
        ctx.drawImage(img, centerX - pw / 2, centerY - ph / 2, pw, ph);
        if (this.isSelected) {
            this.drawSelectionBorder(ctx, centerX - pw / 2, centerY - ph / 2, pw, ph);
        }
    }

    /** 绘制选中边框（四角） */
    drawSelectionBorder(ctx, dx, dy, dw, dh) {
        const cornerLen = Math.min(dw, dh) * 0.3;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        // 左上角
        ctx.beginPath();
        ctx.moveTo(dx - 2, dy - 2 + cornerLen);
        ctx.lineTo(dx - 2, dy - 2);
        ctx.lineTo(dx - 2 + cornerLen, dy - 2);
        ctx.stroke();
        // 右上角
        ctx.beginPath();
        ctx.moveTo(dx + dw + 2 - cornerLen, dy - 2);
        ctx.lineTo(dx + dw + 2, dy - 2);
        ctx.lineTo(dx + dw + 2, dy - 2 + cornerLen);
        ctx.stroke();
        // 左下角
        ctx.beginPath();
        ctx.moveTo(dx - 2, dy + dh + 2 - cornerLen);
        ctx.lineTo(dx - 2, dy + dh + 2);
        ctx.lineTo(dx - 2 + cornerLen, dy + dh + 2);
        ctx.stroke();
        // 右下角
        ctx.beginPath();
        ctx.moveTo(dx + dw + 2 - cornerLen, dy + dh + 2);
        ctx.lineTo(dx + dw + 2, dy + dh + 2);
        ctx.lineTo(dx + dw + 2, dy + dh + 2 - cornerLen);
        ctx.stroke();
    }

    /** 获取合法移动位置（子类重写）
     * @param {Array} map - 棋盘网格
     * @param {Game} board - 游戏实例
     * @returns {Array} 合法移动数组 [[x,y], ...]
     */
    getLegalMoves(map, board) { return []; }

    /** 检查是否可以走到目标位置
     * @param {number} x - 目标x坐标
     * @param {number} y - 目标y坐标
     * @param {Game} board - 游戏实例
     * @returns {boolean}
     */
    canGoTo(x, y, board) {
        if (x < 0 || x > 8 || y < 0 || y > 9) return false;
        const piece = board.getPieceAt(x, y);
        return !piece || piece.camp !== this.camp;
    }

    /** 选中 */
    select() { this.isSelected = true; }
    /** 取消选中 */
    deselect() { this.isSelected = false; }
}