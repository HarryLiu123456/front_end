/**
 * 棋子基类
 * 所有棋子类型的父类，定义公共属性和方法
 */
class Piece {
    // ==================== 静态属性 ====================
    static IMAGE_PATH = 'static/imgs/';       // 棋子图片路径
    static imageCache = {};                  // 图片缓存

    // ==================== 构造函数 ====================
    /**
     * @param {number} x - 棋盘X坐标(0-8)
     * @param {number} y - 棋盘Y坐标(0-9)
     * @param {string} name - 棋子名称
     * @param {number} camp - 阵营：1=红方，-1=黑方
     */
    constructor(x, y, name, camp) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.camp = camp;
        this.isAlive = true;
        this.isSelected = false;
    }

    // 过河判断 - 红方过河：y <= 4，黑方过河：y >= 5
    get isCrossedRiver() {
        return this.camp === 1 ? this.y <= 4 : this.y >= 5;
    }

    // ==================== 图片加载 ====================
    /**
     * 加载单张图片（带缓存）
     * @param {string} path 图片路径
     * @returns {Promise<HTMLImageElement>}
     */
    static loadImage(path) {
        if (Piece.imageCache[path]) {
            return Promise.resolve(Piece.imageCache[path]);
        }
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                Piece.imageCache[path] = img;
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
            img.src = path;
        });
    }

    /**
     * 预加载所有棋子图片
     * @returns {Promise<void>}
     */
    static async preloadAllImages() {
        const imagePaths = [
            'k.png', 'kb.png',   // 将/帅
            'a.png', 'ab.png',   // 士
            'b.png', 'bb.png',   // 相/象
            'n.png', 'nb.png',   // 马
            'c.png', 'cb.png',   // 车
            'p.png', 'pb.png',   // 炮
            'r.png', 'rb.png'    // 兵/卒
        ];
        const fullPaths = imagePaths.map(name => Piece.IMAGE_PATH + name);
        await Promise.all(fullPaths.map(path => Piece.loadImage(path)));
    }

    // ==================== 坐标计算 ====================
    /** 获取像素X坐标 */
    getPixelX() {
        const { START_X, GRID_SIZE } = GameConfig.IMAGES.BOARD_POSITION;
        return START_X + this.x * GRID_SIZE;
    }

    /** 获取像素Y坐标 */
    getPixelY() {
        const { START_Y, GRID_SIZE } = GameConfig.IMAGES.BOARD_POSITION;
        return START_Y + this.y * GRID_SIZE;
    }

    /** 获取图片路径 */
    getImagePath() {
        return this.camp === 1 ? this.imageRed : this.imageBlack;
    }

    // ==================== 绘制 ====================
    /**
     * 绘制棋子
     * @param {CanvasRenderingContext2D} ctx Canvas上下文
     */
    draw(ctx) {
        if (!this.isAlive) return;

        const img = Piece.imageCache[this.getImagePath()];
        if (!img) return;

        // 计算绘制参数
        const { GRID_SIZE } = GameConfig.IMAGES.BOARD_POSITION;
        const { WIDTH: pw, HEIGHT: ph } = GameConfig.IMAGES.PIECE_SIZE;
        const scale = GRID_SIZE / (pw / 5);
        const dw = pw * scale, dh = ph * scale;
        const dx = this.getPixelX() - dw / 2;
        const dy = this.getPixelY() - dh / 2;

        // 绘制图片
        ctx.drawImage(img, dx, dy, dw, dh);

        // 选中效果 - 四角边框
        if (this.isSelected) {
            const cornerLen = Math.min(dw, dh) * 0.3;  // 角长度
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            // 左上角
            ctx.beginPath(); ctx.moveTo(dx - 2, dy - 2 + cornerLen); ctx.lineTo(dx - 2, dy - 2); ctx.lineTo(dx - 2 + cornerLen, dy - 2); ctx.stroke();
            // 右上角
            ctx.beginPath(); ctx.moveTo(dx + dw + 2 - cornerLen, dy - 2); ctx.lineTo(dx + dw + 2, dy - 2); ctx.lineTo(dx + dw + 2, dy - 2 + cornerLen); ctx.stroke();
            // 左下角
            ctx.beginPath(); ctx.moveTo(dx - 2, dy + dh + 2 - cornerLen); ctx.lineTo(dx - 2, dy + dh + 2); ctx.lineTo(dx - 2 + cornerLen, dy + dh + 2); ctx.stroke();
            // 右下角
            ctx.beginPath(); ctx.moveTo(dx + dw + 2 - cornerLen, dy + dh + 2); ctx.lineTo(dx + dw + 2, dy + dh + 2); ctx.lineTo(dx + dw + 2, dy + dh + 2 - cornerLen); ctx.stroke();
        }
    }

    // ==================== 状态操作 ====================
    /** 设置位置 */
    setPosition(x, y) { this.x = x; this.y = y; }

    /** 获取阵营名称 */
    getCampName() { return this.camp === 1 ? "红方" : "黑方"; }

    /** 选中 */
    select() { this.isSelected = true; }

    /** 取消选中 */
    deselect() { this.isSelected = false; }

    /** 被吃 */
    beEaten() {
        this.isAlive = false;
        this.x = -1;
        this.y = -1;
    }

    /** 获取信息字符串 */
    toString() { return `${this.getCampName()}${this.name} (${this.x}, ${this.y})`; }
}
