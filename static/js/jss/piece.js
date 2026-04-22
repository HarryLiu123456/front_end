// 棋子基类
import { Config } from '../config.js';

export class Piece {
    constructor(x, y, camp, name, FENCode, imagePath, imageCache = {}) {
        this.x = x;  // 棋盘X坐标 (0-8)
        this.y = y;  // 棋盘Y坐标 (0-9)
        this.camp = camp;  // 阵营: "红方"/"黑方"/"空白"
        this.name = name;  // 棋子名称
        this.FENCode = FENCode;
        this.imagePath = imagePath;  // 图片路径
        this.imageCache = imageCache;  // 图片缓存
        this.isAlive = true;
        this.isSelected = false;
    }

    // 是否已过河（红方在y<=4，黑方在y>=5）
    get isCrossedRiver() {
        return this.camp === "红方" ? this.y <= 4 : this.y >= 5;
    }

    // 获取像素中间坐标
    getPixelX() {
        return Config.START_X + this.x * Config.GRID_SIZE.WIDTH;
    }

    getPixelY() {
        return Config.START_Y + this.y * Config.GRID_SIZE.HEIGHT;
    }

    // 绘制棋子
    draw(ctx) {
        if (!this.isAlive) return;
        if (this.camp === "空白") return;  // 空白棋子不绘制

        const img = this.imageCache[this.getImagePath()];
        if (!img) return;

        const { WIDTH: pw, HEIGHT: ph } = Config.PIECE_SIZE;
        // 棋子中心点对齐棋盘网格交叉点
        const dx = this.getPixelX() - pw / 2;
        const dy = this.getPixelY() - ph / 2;

        ctx.drawImage(img, dx, dy, pw, ph);

        if (this.isSelected) {
            this.drawSelectionBorder(ctx, dx, dy, pw, ph);
        }
    }

    // 绘制选中边框
    drawSelectionBorder(ctx, dx, dy, dw, dh) {
        const cornerLen = Math.min(dw, dh) * 0.3;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

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

    // 获取图片路径
    getImagePath() {
        return this.imagePath;
    }

    // 获取合法移动位置（子类需重写）
    getLegalMoves(map, pieces) {
        if (this.camp === "空白") return [];  // 空白棋子不能移动
        return [];
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    select() {
        this.isSelected = true;
    }

    deselect() {
        this.isSelected = false;
    }

    beEaten() {
        this.isAlive = false;
        this.x = -1;
        this.y = -1;
        this.isSelected = false;
    }
}
