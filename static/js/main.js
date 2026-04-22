/** 主入口文件 - 游戏初始化和交互绑定 (优化版) */
import { Game } from './jss/game.js';  // 导入游戏类
import { Config } from './config.js';  // 导入游戏配置

// 游戏全局变量
let game = null;           // 游戏实例
let playerCamp = '红方';   // 玩家阵营（"红方"/"黑方"）
let chessCanvas = null;    // Canvas元素

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
    
    console.log('点击像素坐标:', pixelX, pixelY);
    
    // 将像素坐标转换为棋盘坐标
    const boardPos = game.board.getBoardPos(pixelX, pixelY);
    console.log('棋盘坐标:', boardPos.x, boardPos.y);
    
    // 验证坐标是否在有效范围内
    if (boardPos.x < 0 || boardPos.x > 8 || boardPos.y < 0 || boardPos.y > 9) {
        console.log('点击超出棋盘范围');
        return;
    }
    
    // 调用Game类的handleClick方法处理点击逻辑
    const result = game.handleClick(boardPos.x, boardPos.y);
    console.log('点击处理结果:', result);
    
    // 处理游戏结果
    handleGameResult(result);
}

/** 处理游戏结果 */
function handleGameResult(result) {
    if (!result) return;
    
    switch (result.action) {
        case 'move':
            console.log(`棋子移动: (${result.fromX}, ${result.fromY}) -> (${result.toX}, ${result.toY})`);
            if (result.captured?.piece) {
                console.log(`吃子: ${result.captured.piece.name}`);
            }
            if (result.gameResult) {
                alert(`${result.gameResult.winner}获胜！`);
            }
            break;
        case 'select':
            console.log('选中棋子:', result.piece?.name);
            break;
        case 'deselect':
            console.log('取消选中');
            break;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initMain);