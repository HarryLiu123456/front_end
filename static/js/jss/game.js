/** 游戏控制类 - 管理游戏流程、回合、胜负 */
class Game {
    constructor() {
        this.isPlay = false;       // 是否开始游戏
        this.currentCamp = 1;      // 当前阵营 1=红 -1=黑
        this.selectedPiece = null;  // 选中的棋子
        this.legalMoves = [];       // 合法移动列表
        this.board = new Board();   // 棋盘实例
        this.moveHistory = [];      // 移动历史
        this.initBoard();
    }

    initBoard() { this.board.clear(); this.setupInitialPosition(); }

    // 初始化棋盘 - 使用FEN格式简化
    setupInitialPosition() {
        const pieces = [
            // 红方(小写): 车r 马n 相b 士a 帅k 炮c 兵p
            [0,9,'r0',Rook],[1,9,'n0',Knight],[2,9,'b0',Bishop],[3,9,'a0',Advisor],[4,9,'k0',King],
            [5,9,'a1',Advisor],[6,9,'b1',Bishop],[7,9,'n1',Knight],[8,9,'r1',Rook],
            [1,7,'c0',Cannon],[7,7,'c1',Cannon],[0,6,'p0',Pawn],[2,6,'p1',Pawn],
            [4,6,'p2',Pawn],[6,6,'p3',Pawn],[8,6,'p4',Pawn],
            // 黑方(大写): 车R 马N 象B 士A 将K 炮C 卒P
            [0,0,'R0',Rook],[1,0,'N0',Knight],[2,0,'B0',Bishop],[3,0,'A0',Advisor],[4,0,'K0',King],
            [5,0,'A1',Advisor],[6,0,'B1',Bishop],[7,0,'N1',Knight],[8,0,'R1',Rook],
            [1,2,'C0',Cannon],[7,2,'C1',Cannon],[0,3,'P0',Pawn],[2,3,'P1',Pawn],
            [4,3,'P2',Pawn],[6,3,'P3',Pawn],[8,3,'P4',Pawn]
        ];
        pieces.forEach(([x, y, key, PieceClass]) => {
            this.board.placePiece(x, y, key, new PieceClass(x, y, key < 'a' ? -1 : 1));
        });
    }

    // 处理点击
    handleClick(gridX, gridY) {
        if (!this.isPlay) return { action: 'none' };
        const clickedPiece = this.board.getPieceAt(gridX, gridY);

        // 有选中棋子时
        if (this.selectedPiece) {
            if (this.legalMoves.some(m => m[0] === gridX && m[1] === gridY)) {
                return this.executeMove(this.selectedPiece, gridX, gridY);
            }
            if (clickedPiece?.camp === this.currentCamp) {
                this.selectPiece(clickedPiece);
                return { action: 'select', piece: clickedPiece };
            }
            this.deselectPiece();
            return { action: 'deselect' };
        }

        // 选择己方棋子
        if (clickedPiece?.camp === this.currentCamp) {
            this.selectPiece(clickedPiece);
            return { action: 'select', piece: clickedPiece };
        }
        return { action: 'none' };
    }

    selectPiece(piece) {
        this.selectedPiece = piece;
        piece.select();
        this.legalMoves = piece.getLegalMoves(this.board.grid, this.board.pieces);
    }

    deselectPiece() {
        this.selectedPiece?.deselect();
        this.selectedPiece = null;
        this.legalMoves = [];
    }

    executeMove(piece, toX, toY) {
        const { x: fromX, y: fromY } = piece;
        const result = this.board.movePiece(fromX, fromY, toX, toY);
        this.moveHistory.push({ piece, fromX, fromY, toX, toY, captured: result.captured });
        this.deselectPiece();
        const gameResult = this.checkGameEnd();
        this.switchTurn();
        return { action: 'move', fromX, fromY, toX, toY, captured: result.captured, gameResult };
    }

    switchTurn() { this.currentCamp = -this.currentCamp; }

    checkGameEnd() {
        const enemy = this.currentCamp === 1 ? -1 : 1;
        return this.board.isCheckmate(enemy) ? { winner: this.currentCamp, reason: '将死' } : null;
    }

    // 悔棋 - 撤销最近两步
    regret() {
        if (this.moveHistory.length < 2) return false;
        for (let i = 0; i < 2; i++) {
            const m = this.moveHistory.pop();
            if (m) {
                this.board.movePiece(m.toX, m.toY, m.fromX, m.fromY);
                if (m.captured.key) this.board.placePiece(m.toX, m.toY, m.captured.key, m.captured.piece);
            }
        }
        this.currentCamp = 1;
        this.deselectPiece();
        return true;
    }

    restart() {
        this.isPlay = true;
        this.currentCamp = 1;
        this.moveHistory = [];
        this.deselectPiece();
        this.initBoard();
    }

    getStatus() {
        return {
            isPlay: this.isPlay,
            currentCamp: this.currentCamp,
            currentCampName: this.currentCamp === 1 ? '红方' : '黑方',
            moveCount: this.moveHistory.length
        };
    }

    // 获取当前阵营所有合法移动
    getAllLegalMoves() {
        return this.board.getPiecesByCamp(this.currentCamp).flatMap(p =>
            p.getLegalMoves(this.board.grid, this.board.pieces).map(m => [p.x, p.y, m[0], m[1]])
        );
    }
}