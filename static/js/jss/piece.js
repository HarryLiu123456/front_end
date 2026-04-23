/**
 * 棋子基类
 * 所有棋子类型的父类，定义通用属性和方法
 */
import { Config } from '../config.js';

export class Piece {
    /**
     * 构造函数
     * @param {number} x - 棋盘X坐标 (0-8)
     * @param {number} y - 棋盘Y坐标 (0-9)
     * @param {string} camp - 阵营: "红方" / "黑方"
     * @param {Object} imageCache - 图片缓存对象
     */
    constructor(x, y, camp, imageCache = {}) {
        this.x = x;                      // 棋盘X坐标 (0-8)
        this.y = y;                      // 棋盘Y坐标 (0-9)
        this.camp = camp;                // 阵营: "红方" / "黑方"
        this.imagePath = null;            // 图片路径（子类设置）
        this.imageCache = imageCache;   // 图片缓存
        this.isSelected = false;          // 是否被选中
    }

    /**
     * 获取棋子名称
     */
    get name() {
        const info = Config.PIECE_INFO[this.constructor.name];
        return this.camp === '红方' ? info.redName : info.blackName;
    }

    /**
     * 获取棋子图片路径
     * @returns {string|null} 图片路径
     */
    getImagePath() {
        return this.imagePath;
    }

    /**
     * 绘制棋子
     * @param {CanvasRenderingContext2D} ctx - Canvas绘图上下文
     * @param {number} centerX - 棋子中心X坐标
     * @param {number} centerY - 棋子中心Y坐标
     */
    draw(ctx, centerX, centerY) {
        // 获取棋子图片
        const img = this.imageCache[this.imagePath];
        if (!img) return;

        // 计算棋子绘制位置（以左上角为基准）
        const { WIDTH: pw, HEIGHT: ph } = Config.PIECE_SIZE;
        const dx = centerX - pw / 2;  // X居中偏移
        const dy = centerY - ph / 2;  // Y居中偏移

        // 绘制棋子图片
        ctx.drawImage(img, dx, dy, pw, ph);

        // 如果被选中，绘制选中边框
        if (this.isSelected) {
            this.drawSelectionBorder(ctx, dx, dy, pw, ph);
        }
    }

    /**
     * 绘制选中边框（红色角标）
     * @param {CanvasRenderingContext2D} ctx - Canvas绘图上下文
     * @param {number} dx - X坐标
     * @param {number} dy - Y坐标
     * @param {number} dw - 宽度
     * @param {number} dh - 高度
     */
    drawSelectionBorder(ctx, dx, dy, dw, dh) {
        const cornerLen = Math.min(dw, dh) * 0.3;  // 角标长度为短边的30%
        ctx.strokeStyle = '#ff0000';  // 红色
        ctx.lineWidth = 3;            // 线宽
        ctx.lineCap = 'round';        // 圆角线帽

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

    /**
     * 获取合法移动位置（子类必须重写）
     * @param {Array} map - 棋盘二维数组
     * @param {ChessBoard} board - 棋盘对象
     * @returns {Array} 可移动位置数组 [[x1,y1], [x2,y2], ...]
     */
    getLegalMoves(map, board) {
        return [];
    }

    /**
     * 选中棋子
     */
    select() {
        this.isSelected = true;
    }

    /**
     * 取消选中棋子
     */
    deselect() {
        this.isSelected = false;
    }
}
