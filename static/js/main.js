/** 主入口文件 - 游戏初始化和交互绑定 */
import { Game } from './jss/game.js';  // 导入游戏类
import { Config } from './config.js';  // 导入游戏配置

// 游戏全局变量
let game = null;           // 游戏实例
let playerCamp = '红方';   // 玩家阵营（"红方"/"黑方"）
let chessCanvas = null;    // Canvas元素

// 页面元素引用
let menuBox = null;        // 菜单界面容器
let gameBox = null;        // 选择颜色界面容器
let chessBoardBox = null;  // 棋盘界面容器

/** 初始化游戏主入口 */
function initMain() {
    console.log('初始化游戏...');
    
    // 获取页面元素
    menuBox = document.getElementById('menuBox');
    gameBox = document.getElementById('gameBox');
    chessBoardBox = document.getElementById('chessBoardBox');
    chessCanvas = document.getElementById('chessCanvas');
    
    // 检查元素是否存在
    console.log('menuBox:', menuBox);
    console.log('gameBox:', gameBox);
    console.log('chessBoardBox:', chessBoardBox);
    
    if (!menuBox || !gameBox || !chessBoardBox) {
        console.error('无法找到界面元素！');
        return;
    }
    
    // 初始状态：只显示菜单界面
    menuBox.style.display = 'block';
    gameBox.style.display = 'none';
    chessBoardBox.style.display = 'none';
    
    // 绑定开始游戏按钮
    const startBtn = document.getElementById('startBtn');
    console.log('startBtn:', startBtn);
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            console.log('开始游戏按钮被点击');
            menuBox.style.display = 'none';
            gameBox.style.display = 'block';
            console.log('gameBox display:', gameBox.style.display);
        });
    } else {
        console.error('无法找到开始按钮！');
    }
    
    // 绑定红方按钮
    const redBtn = document.getElementById('redBtn');
    console.log('redBtn:', redBtn);
    if (redBtn) {
        redBtn.addEventListener('click', function() {
            console.log('红方按钮被点击');
            playerCamp = '红方';
            startGame();
        });
    }
    
    // 绑定黑方按钮
    const blackBtn = document.getElementById('blackBtn');
    console.log('blackBtn:', blackBtn);
    if (blackBtn) {
        blackBtn.addEventListener('click', function() {
            console.log('黑方按钮被点击');
            playerCamp = '黑方';
            startGame();
        });
    }
    
    console.log('初始化完成');
}

/** 开始游戏 - 切换到棋盘界面并绘制棋盘 */
async function startGame() {
    try {
        // 隐藏选择颜色界面
        gameBox.style.display = 'none';
        // 显示棋盘界面
        chessBoardBox.style.display = 'block';
        
        // 创建游戏实例
        game = new Game();
        
        // 初始化画布（Game.initCanvas会预加载图片）
        await game.initCanvas('chessCanvas');
        
        // 设置游戏开始
        game.isPlay = true;
        
        // 绑定画布点击事件
        chessCanvas.addEventListener('click', handleCanvasClick);
        
        console.log('Game started successfully');
    } catch (error) {
        console.error('Failed to start game:', error);
    }
}

/** 处理画布点击事件 */
function handleCanvasClick(event) {
    if (!game || !game.isPlay || !chessCanvas) return;
    
    // 获取点击位置的像素坐标
    const rect = chessCanvas.getBoundingClientRect();
    const scaleX = chessCanvas.width / rect.width;
    const scaleY = chessCanvas.height / rect.height;
    const pixelX = (event.clientX - rect.left) * scaleX;
    const pixelY = (event.clientY - rect.top) * scaleY;
    
    // 使用ChessBoard的getPieceAtPixel方法获取被点击的棋子
    const clickedPiece = game.board.getPieceAtPixel(pixelX, pixelY);
    
    if (clickedPiece) {
        // 如果有棋子被点击，设置选中状态
        clickedPiece.isSelected = true;
        console.log('点击了棋子:', clickedPiece.toString());
        game.render();  // 重绘以显示选中效果
    } else {
        // 点击空白区域，取消所有选中
        const pieces = game.board.grid.flat().filter(p => p && p.isAlive);
        pieces.forEach(p => p.isSelected = false);
        game.render();
    }
    
    // 更新UI显示
    updateUI();
}

/** 处理游戏结果 */
function handleGameResult(result) {
    if (!result) return;
    
    switch (result.action) {
        case 'move':
            if (result.gameResult) {
                // 游戏结束，显示胜利信息
                alert(`${result.gameResult.winner}获胜！`);
            }
            break;
        case 'select':
            // 可以添加选中效果反馈
            break;
        case 'deselect':
            // 可以添加取消选中反馈
            break;
    }
}

/** 更新UI显示 */
function updateUI() {
    if (!game) return;
    
    const status = game.getStatus();
    
    // 更新当前回合显示
    const turnDisplay = document.getElementById('turnDisplay');
    if (turnDisplay) {
        turnDisplay.textContent = status.isPlay ? `当前回合: ${status.currentCampName}` : '游戏未开始';
    }
    
    // 更新步数显示
    const moveCountDisplay = document.getElementById('moveCountDisplay');
    if (moveCountDisplay) {
        moveCountDisplay.textContent = `步数: ${status.moveCount}`;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initMain);