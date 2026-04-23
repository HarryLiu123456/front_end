/** 主入口文件 - 游戏初始化和交互绑定 */
import { Game } from './jss/game.js';  // 导入游戏类
import { Config } from './config.js';  // 导入游戏配置

// 游戏全局变量
let game = null;           // 游戏实例
let playerCamp = '红方';   // 玩家阵营（"红方"/"黑方"）
let chessCanvas = null;    // Canvas元素
let isProcessing = false;  // 是否正在处理（防止重复点击）

// 页面元素引用 - 使用类名选择器
let menuBox = null;        // 菜单界面容器
let colorSelection = null; // 选择颜色界面容器
let chessBoardBox = null;  // 棋盘界面容器

/** 初始化游戏主入口 */
function initMain() {
    console.log('初始化游戏...');
    
    // 获取页面元素
    menuBox = document.querySelector('.menu-box');
    colorSelection = document.querySelector('.color-selection');
    chessBoardBox = document.querySelector('.chess-board-box');
    chessCanvas = document.getElementById('chessCanvas');
    
    // 检查元素是否存在
    if (!menuBox || !colorSelection || !chessBoardBox) {
        console.error('无法找到界面元素！');
        return;
    }
    
    // 初始状态：只显示菜单界面
    showScreen('menu');
    
    // 绑定开始游戏按钮
    const startBtn = document.querySelector('.menu-box__start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => showScreen('color'));
    }
    
    // 绑定红方按钮
    const redBtn = document.getElementById('redBtn');
    if (redBtn) {
        redBtn.addEventListener('click', () => {
            playerCamp = '红方';
            startGame();
        });
    }
    
    // 绑定黑方按钮
    const blackBtn = document.getElementById('blackBtn');
    if (blackBtn) {
        blackBtn.addEventListener('click', () => {
            playerCamp = '黑方';
            startGame();
        });
    }
    
    // 绑定棋盘界面的按钮
    // 悔棋按钮
    const regretBtn = document.getElementById('regretBtn');
    if (regretBtn) {
        regretBtn.addEventListener('click', () => {
            if (game && !isProcessing) {
                game.regret();
            }
        });
    }
    
    // 重新开始按钮
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            if (game) {
                game.restart();
            }
        });
    }
    
    // 回到开始界面按钮
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // 移除画布点击事件
            if (chessCanvas) {
                chessCanvas.removeEventListener('click', handleCanvasClick);
            }
            // 重置游戏
            game = null;
            // 显示菜单界面
            showScreen('menu');
        });
    }
    
    console.log('初始化完成');
}

/** 切换界面显示
 * @param {string} screen - 界面名称 ('menu' | 'color' | 'board')
 */
function showScreen(screen) {
    // 隐藏所有界面
    menuBox.style.display = 'none';
    colorSelection.style.display = 'none';
    chessBoardBox.style.display = 'none';
    
    // 根据参数显示对应界面
    switch (screen) {
        case 'menu':
            menuBox.style.display = 'block';
            break;
        case 'color':
            colorSelection.style.display = 'block';
            break;
        case 'board':
            chessBoardBox.style.display = 'block';
            break;
    }
}

/** 开始游戏 - 切换到棋盘界面并绘制棋盘 */
async function startGame() {
    try {
        // 隐藏选择颜色界面，显示棋盘界面
        showScreen('board');
        
        // 创建游戏实例，传递玩家选择的起始阵营
        game = new Game(Config.INIT_FEN, playerCamp);
        
        // 设置棋盘是否旋转（如果玩家是黑方，则旋转180度使黑方在下方）
        game.board.shouldRotate = (playerCamp === '黑方');
        
        // 初始化画布（Game.initCanvas会预加载图片）
        await game.initCanvas('chessCanvas');
        
        // 设置游戏开始
        game.isPlay = true;
        
        // 绑定画布点击事件
        chessCanvas.addEventListener('click', handleCanvasClick);
        
        // 如果玩家是黑方，先让AI走一步
        if (playerCamp === '黑方') {
            await executeAIMove();
        }
        
        console.log('Game started successfully, playerCamp:', playerCamp);
    } catch (error) {
        console.error('Failed to start game:', error);
    }
}

/** 处理画布点击事件 */
function handleCanvasClick(event) {
    if (!game || !game.isPlay || !chessCanvas || isProcessing) return;
    
    // 获取点击位置的像素坐标
    const rect = chessCanvas.getBoundingClientRect();
    const scaleX = chessCanvas.width / rect.width;
    const scaleY = chessCanvas.height / rect.height;
    const pixelX = (event.clientX - rect.left) * scaleX;
    const pixelY = (event.clientY - rect.top) * scaleY;
    
    console.log('点击像素坐标:', pixelX, pixelY);
    
    // 将像素坐标转换为棋盘坐标
    const boardPos = game.board.getBoardPos(pixelX, pixelY, game.canvas);
    console.log('棋盘坐标:', boardPos.x, boardPos.y);
    
    // 验证坐标是否在有效范围内
    if (boardPos.x < 0 || boardPos.x > 8 || boardPos.y < 0 || boardPos.y > 9) {
        console.log('点击超出棋盘范围');
        return;
    }
    
    // 调用Game类的handleClick方法处理点击逻辑，传递玩家阵营
    const result = game.handleClick(boardPos.x, boardPos.y, playerCamp);
    console.log('点击处理结果:', result);
    
    // 处理游戏结果
    handleGameResult(result);
}

/** 处理游戏结果 */
async function handleGameResult(result) {
    if (!result) return;
    
    switch (result.action) {
        case 'move':
            console.log(`棋子移动: (${result.fromX}, ${result.fromY}) -> (${result.toX}, ${result.toY})`);
            if (result.captured) {
                console.log(`吃子: ${result.captured.name}`);
            }
            if (result.gameResult) {
                alert(`${result.gameResult.winner}获胜！`);
                return;  // 游戏结束，不执行AI
            }
            
            // 玩家移动后，等待一小段时间让AI思考，然后执行AI移动
            await new Promise(resolve => setTimeout(resolve, 500));
            await executeAIMove();
            break;
        case 'select':
            console.log('选中棋子:', result.piece?.name);
            break;
        case 'deselect':
            console.log('取消选中');
            break;
        case 'illegal':
            console.log('非法移动:', result.reason);
            break;
    }
}

/** 执行后端命令移动（由后端命令行输入的指令） */
async function executeBackendCommand() {
    if (!game || !game.isPlay || isProcessing) return null;
    
    try {
        // 调用后端API获取命令行指令
        const response = await fetch('/api/backend/command');
        const data = await response.json();
        
        if (data.has_command && data.move) {
            const [fromX, fromY, toX, toY] = data.move;
            console.log(`后端指令移动: (${fromX}, ${fromY}) -> (${toX}, ${toY})`);
            return { fromX, fromY, toX, toY };
        }
    } catch (error) {
        console.error('获取后端指令失败:', error);
    }
    
    return null;
}

/** 执行AI移动 */
async function executeAIMove() {
    if (!game || !game.isPlay || isProcessing) return;
    
    const enemyCamp = playerCamp === '红方' ? '黑方' : '红方';
    
    // 检查是否是AI的回合
    if (game.currentCamp !== enemyCamp) {
        console.log('不是AI的回合');
        return;
    }
    
    isProcessing = true;
    
    try {
        // 先检查后端是否有命令行指令
        const backendMove = await executeBackendCommand();
        
        let move = null;
        
        if (backendMove) {
            // 使用后端指令
            console.log('使用后端命令行指令');
            move = [backendMove.fromX, backendMove.fromY, backendMove.toX, backendMove.toY];
        } else {
            // 没有后端指令，使用随机AI
            console.log('使用随机AI移动');
            const boardState = game.board.getBoardState();
            console.log('发送AI请求，敌方阵营:', enemyCamp);
            
            const response = await fetch('/api/ai/move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    board_state: boardState,
                    camp: enemyCamp === '红方' ? 'red' : 'black',
                    from_x: 0,
                    from_y: 0,
                    to_x: 0,
                    to_y: 0
                })
            });
            
            const data = await response.json();
            console.log('AI响应:', data);
            
            if (data.valid && data.move) {
                move = data.move;
            } else {
                console.log('AI没有可用的移动:', data.reason);
                return;
            }
        }
        
        // 执行移动
        const [fromX, fromY, toX, toY] = move;
        console.log(`移动: (${fromX}, ${fromY}) -> (${toX}, ${toY})`);
        
        // 获取棋子
        const piece = game.board.getPieceAt(fromX, fromY);
        if (piece) {
            // 执行移动
            const result = game.board.movePiece(piece, toX, toY);
            if (result) {
                // 保存FEN
                const fullFen = game.getFullFen();
                game.fenHistory.push(fullFen);
                console.log('加入新FEN，当前末尾FEN:', game.fenHistory[game.fenHistory.length - 1]);
                
                // 更新状态
                if (result.captured) {
                    game.noCaptureMoveCount = 0;
                } else {
                    game.noCaptureMoveCount++;
                }
                
                if (game.currentCamp === '黑方') {
                    game.fullmoveNumber++;
                }
                
                game.deselectPiece();
                game.render();
                game.updateMoveDisplay();
                
                // 切换回合
                game.switchTurn();
                
                console.log('移动完成');
            }
        }
    } catch (error) {
        console.error('移动失败:', error);
    } finally {
        isProcessing = false;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initMain);
