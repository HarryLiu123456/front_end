/**
 * 主入口文件
 * 职责：管理三个界面（菜单、颜色选择、棋盘）的显示和切换
 */
import { Game } from './jss/game.js';

let game = null;  // 游戏实例

/** 初始化主入口 */
function initMain() {
    showScreen('menu');
    
    // 第一界面：菜单按钮
    document.querySelector('.menu-box__start-btn')?.addEventListener('click', () => showScreen('color'));
    
    // 第二界面：颜色选择按钮
    document.getElementById('redBtn')?.addEventListener('click', () => startGame('红方'));
    document.getElementById('blackBtn')?.addEventListener('click', () => startGame('黑方'));
    
    // 第三界面：游戏控制按钮
    document.getElementById('regretBtn')?.addEventListener('click', () => game?.regret());
    document.getElementById('restartBtn')?.addEventListener('click', () => game?.restart());
    document.getElementById('backBtn')?.addEventListener('click', backToMenu);
}

/** 切换界面显示 */
function showScreen(screen) {
    document.querySelector('.menu-box').style.display = screen === 'menu' ? 'block' : 'none';
    document.querySelector('.color-selection').style.display = screen === 'color' ? 'block' : 'none';
    document.querySelector('.chess-board-box').style.display = screen === 'board' ? 'block' : 'none';
}

/** 开始游戏 */
async function startGame(playerCamp) {
    showScreen('board');
    
    // 获取canvas和画笔，传入Game构造函数
    const canvas = document.getElementById('chessCanvas');
    const ctx = canvas.getContext('2d');
    game = new Game(canvas, ctx, playerCamp);
    
    // 加载图片并初始化
    await game.initCanvas();
    
    // 绑定点击事件
    canvas.addEventListener('click', (e) => game.onCanvasClick(e));
    
    // 开始游戏
    await game.startGame();
}

/** 返回菜单 */
function backToMenu() {
    game = null;
    showScreen('menu');
}

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', initMain);