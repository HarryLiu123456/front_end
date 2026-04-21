/**
 * 游戏主入口
 */
class GameMain {
    constructor() {
        this.game = null;
        this.canvas = null;
        this.ctx = null;
        this.images = {};
        this.isRunning = false;
    }

    init() {
        console.log('游戏初始化中...');
        this.game = new Game();
        this.canvas = document.getElementById('chess');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = GameConfig.BOARD.WIDTH;
            this.canvas.height = GameConfig.BOARD.HEIGHT;
            this.canvas.addEventListener('click', e => this.handleCanvasClick(e));
        }
        this.bindButtonEvents();
        this.preloadImages();
        this.draw();
        console.log('游戏初始化完成');
    }

    bindButtonEvents() {
        const btnIds = ['playBtn', 'regretBtn', 'restartBtn', 'gohomeBtn'];
        const handlers = [() => this.startGame(), () => this.regret(), () => this.restart(), () => this.goHome()];
        btnIds.forEach((id, i) => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', handlers[i]);
        });
    }

    preloadImages() {
        ['bg', 'r_box', 'dot', 'r_c', 'r_m', 'r_x', 'r_s', 'r_j', 'r_p', 'r_z',
         'b_c', 'b_m', 'b_x', 'b_s', 'b_j', 'b_p', 'b_z'].forEach(key => {
            this.images[key] = new Image();
            this.images[key].src = `imgs/${GameConfig.IMAGES.SKIN_PATH}/${key}.png`;
        });
    }

    startGame() {
        this.game.isPlay = true;
        this.game.currentCamp = 1;
        const chessBox = document.getElementById('chessBox');
        const menuBox = document.getElementById('menuBox');
        if (chessBox) chessBox.style.display = 'block';
        if (menuBox) menuBox.style.display = 'none';
        this.draw();
        console.log('游戏开始！红方先行');
    }

    handleCanvasClick(event) {
        if (!this.game || !this.game.isPlay) return;
        const rect = this.canvas.getBoundingClientRect();
        const grid = Utils.pixelToGrid(event.clientX - rect.left, event.clientY - rect.top, GameConfig.BOARD);
        this.processAction(this.game.handleClick(grid.gridX, grid.gridY));
        this.draw();
    }

    processAction(result) {
        switch (result.action) {
            case 'select': console.log(`选中: ${result.piece.name}`); break;
            case 'move':
                console.log(`移动: (${result.fromX},${result.fromY}) -> (${result.toX},${result.toY})`);
                if (result.captured.key) console.log(`吃子: ${result.captured.key}`);
                if (result.gameResult) this.gameOver(result.gameResult);
                break;
            case 'deselect': console.log('取消选中'); break;
        }
    }

    gameOver(result) {
        this.game.isPlay = false;
        alert(`游戏结束！${result.winner === 1 ? '红方' : '黑方'}获胜！原因：${result.reason}`);
    }

    regret() {
        if (this.game.regret()) {
            this.draw();
            console.log('悔棋成功');
        } else {
            console.log('无法悔棋');
        }
    }

    restart() {
        if (confirm('确定要重新开始吗？')) {
            this.game.restart();
            this.draw();
            console.log('游戏重新开始');
        }
    }

    goHome() {
        ['chessBox', 'menuBox', 'indexBox'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = id === 'menuBox' || id === 'indexBox' ? 'block' : 'none';
        });
    }

    draw() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, GameConfig.BOARD.WIDTH, GameConfig.BOARD.HEIGHT);
        this.drawBackground();
        if (this.game && this.game.selectedPiece) this.drawSelectBox(this.game.selectedPiece);
        if (this.game && this.game.legalMoves.length > 0) this.drawMoveHints(this.game.legalMoves);
        if (this.game && this.game.board) this.drawPieces();
    }

    drawBackground() {
        if (this.images['bg']) this.ctx.drawImage(this.images['bg'], 0, 0);
    }

    drawSelectBox(piece) {
        if (!this.images['r_box']) return;
        const pos = Utils.gridToPixel(piece.x, piece.y, GameConfig.BOARD);
        this.ctx.drawImage(this.images['r_box'], pos.pixelX, pos.pixelY);
    }

    drawMoveHints(moves) {
        if (!this.images['dot']) return;
        for (const move of moves) {
            const pos = Utils.gridToPixel(move[0], move[1], GameConfig.BOARD);
            this.ctx.drawImage(this.images['dot'], pos.pixelX + 10, pos.pixelY + 10);
        }
    }

    drawPieces() {
        for (const piece of Object.values(this.game.board.pieces)) {
            if (piece && piece.isAlive) this.drawPiece(piece);
        }
    }

    drawPiece(piece) {
        const imageKey = GameConfig.IMAGES.PIECES[piece.name] || piece.getImage();
        const img = this.images[imageKey];
        if (!img) {
            this.drawPieceText(piece);
            return;
        }
        const pos = Utils.gridToPixel(piece.x, piece.y, GameConfig.BOARD);
        this.ctx.drawImage(img, pos.pixelX, pos.pixelY);
    }

    drawPieceText(piece) {
        const pos = Utils.gridToPixel(piece.x, piece.y, GameConfig.BOARD);
        const centerX = pos.pixelX + GameConfig.BOARD.SPACE_X / 2;
        const centerY = pos.pixelY + GameConfig.BOARD.SPACE_Y / 2;
        this.ctx.font = '24px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = piece.camp === 1 ? '#ff0000' : '#000000';
        this.ctx.fillText(piece.name, centerX, centerY);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.gameMain = new GameMain();
    window.gameMain.init();
});
