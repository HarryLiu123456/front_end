/** 主入口文件 - 游戏初始化和交互绑定 */
import { Game } from './jss/game.js';
import { Config } from './config.js';
import { Utils } from './utils.js';

let game = null, playerCamp = '红方';
let chessCanvas = null, isProcessing = false;
let menuBox = null, colorSelection = null, chessBoardBox = null;

function initMain() {
    menuBox = document.querySelector('.menu-box');
    colorSelection = document.querySelector('.color-selection');
    chessBoardBox = document.querySelector('.chess-board-box');
    chessCanvas = document.getElementById('chessCanvas');
    
    if (!menuBox || !colorSelection || !chessBoardBox) return;
    
    showScreen('menu');
    
    document.querySelector('.menu-box__start-btn')?.addEventListener('click', () => showScreen('color'));
    // 选择红方：玩家执红棋，从下方观察棋盘
    document.getElementById('redBtn')?.addEventListener('click', () => { playerCamp = '红方'; startGame(); });
    // 选择黑方：玩家执黑棋，从下方观察棋盘（棋盘会自动翻转）
    document.getElementById('blackBtn')?.addEventListener('click', () => { playerCamp = '黑方'; startGame(); });
    document.getElementById('regretBtn')?.addEventListener('click', () => game?.regret());
    document.getElementById('restartBtn')?.addEventListener('click', () => game?.restart());
    document.getElementById('backBtn')?.addEventListener('click', () => {
        if (chessCanvas) chessCanvas.removeEventListener('click', handleCanvasClick);
        game = null;
        showScreen('menu');
    });
}

/** 切换界面显示 */
function showScreen(screen) {
    menuBox.style.display = 'none';
    colorSelection.style.display = 'none';
    chessBoardBox.style.display = 'none';
    if (screen === 'menu') menuBox.style.display = 'block';
    else if (screen === 'color') colorSelection.style.display = 'block';
    else if (screen === 'board') chessBoardBox.style.display = 'block';
}

/** 开始游戏 */
async function startGame() {
    try {
        showScreen('board');
        game = new Game(Config.INIT_FEN, playerCamp);
        await game.initCanvas('chessCanvas');
        game.isPlay = true;
        chessCanvas.addEventListener('click', handleCanvasClick);
        if (playerCamp === '黑方') await executeAIMove();
    } catch (error) { console.error('Failed to start game:', error); }
}

/** 处理画布点击事件 */
function handleCanvasClick(event) {
    if (!game || !game.isPlay || !chessCanvas || isProcessing) return;
    
    const rect = chessCanvas.getBoundingClientRect();
    const scaleX = chessCanvas.width / rect.width;
    const scaleY = chessCanvas.height / rect.height;
    const pixelX = (event.clientX - rect.left) * scaleX;
    const pixelY = (event.clientY - rect.top) * scaleY;
    
    const boardPos = game.getBoardPos(pixelX, pixelY, game.canvas);
    // 使用Utils验证坐标
    if (!Utils.isValidPosition(boardPos.x, boardPos.y)) return;
    
    const result = game.handleClick(boardPos.x, boardPos.y, playerCamp);
    handleGameResult(result);
}

/** 处理游戏结果 */
async function handleGameResult(result) {
    if (!result) return;
    
    switch (result.action) {
        case 'move':
            if (result.gameResult) {
                alert(`${result.gameResult.winner}获胜！`);
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
            await executeAIMove();
            break;
        case 'select': case 'deselect': case 'illegal': break;
    }
}

/** 执行后端命令移动 */
async function executeBackendCommand() {
    if (!game || !game.isPlay || isProcessing) return null;
    try {
        const response = await fetch('/api/backend/command');
        const data = await response.json();
        if (data.has_command && data.move) {
            const [fromX, fromY, toX, toY] = data.move;
            return { fromX, fromY, toX, toY };
        }
    } catch (error) { console.error('获取后端指令失败:', error); }
    return null;
}

/** 执行AI移动 */
async function executeAIMove() {
    if (!game || !game.isPlay || isProcessing) return;
    
    const enemyCamp = playerCamp === '红方' ? '黑方' : '红方';
    if (game.currentCamp !== enemyCamp) return;
    
    isProcessing = true;
    try {
        const backendMove = await executeBackendCommand();
        let move = null;
        
        if (backendMove) {
            move = [backendMove.fromX, backendMove.fromY, backendMove.toX, backendMove.toY];
        } else {
            const response = await fetch('/api/ai/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ board_state: game.getFullFen(), camp: enemyCamp === '红方' ? 'red' : 'black' })
            });
            const data = await response.json();
            if (data.valid && data.move) move = data.move;
            else return;
        }
        
        const [fromX, fromY, toX, toY] = move;
        const piece = game.getPieceAt(fromX, fromY);
        if (piece) {
            const result = game.movePiece(piece, toX, toY);
            if (result) {
                game.fenHistory.push(game.getFullFen());
                game.noCaptureMoveCount = result.captured ? 0 : game.noCaptureMoveCount + 1;
                if (game.currentCamp === '黑方') game.fullmoveNumber++;
                game.deselectPiece();
                game.render();
                game.updateMoveDisplay();
                game.switchTurn();
            }
        }
    } catch (error) { console.error('移动失败:', error); }
    finally { isProcessing = false; }
}

document.addEventListener('DOMContentLoaded', initMain);