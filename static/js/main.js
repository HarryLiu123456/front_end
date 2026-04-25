/**
 * 主入口文件
 * 职责：管理三个界面（菜单、选择阵营、棋盘游戏）的显示和切换
 */
import { Game } from './jss/game.js';

let game = null;  // 游戏实例

/** 界面枚举 */
const Screen = {
    MENU: 'menu',
    CAMP_SELECT: 'camp-select',
    GAME: 'game',
    GAMEOVER: 'gameover'
};

/** 初始化主入口 */
function initMain() {
    showScreen(Screen.MENU);
    
    // 界面1：菜单开始按钮
    document.querySelector('.screen--menu .screen__btn')?.addEventListener('click', () => showScreen(Screen.CAMP_SELECT));
    
    // 界面2：阵营选择按钮
    document.getElementById('redBtn')?.addEventListener('click', () => startGame('红方'));
    document.getElementById('blackBtn')?.addEventListener('click', () => startGame('黑方'));
    
    // 界面3：游戏控制按钮
    document.getElementById('regretBtn')?.addEventListener('click', () => game?.regret());
    document.getElementById('restartBtn')?.addEventListener('click', () => game?.restart());
    document.getElementById('backBtn')?.addEventListener('click', backToMenu);
}

/** 切换界面显示 */
function showScreen(screenName) {
    // 移除所有界面的显示状态
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('is-visible'));
    
    // 显示目标界面
    if (screenName === Screen.MENU) {
        document.querySelector('.screen--menu')?.classList.add('is-visible');
    } else if (screenName === Screen.CAMP_SELECT) {
        document.querySelector('.screen--camp-select')?.classList.add('is-visible');
    } else if (screenName === Screen.GAME) {
        document.querySelector('.screen--game')?.classList.add('is-visible');
    } else if (screenName === Screen.GAMEOVER) {
        document.querySelector('.screen--gameover')?.classList.add('is-visible');
    }
}

/** 显示游戏结束界面
 * @param {string} winner - 获胜方（'红方' 或 '黑方'）
 */
function showGameOver(winner) {
    const titleEl = document.getElementById('gameoverTitle');
    const messageEl = document.getElementById('gameoverMessage');
    
    if (titleEl) titleEl.textContent = '游戏结束';
    if (messageEl) messageEl.textContent = `${winner}获胜！`;
    
    showScreen(Screen.GAMEOVER);
    
    // 3秒后自动返回主菜单
    setTimeout(() => {
        backToMenu();
    }, 3000);
}

/** 开始游戏 */
async function startGame(playerCamp) {
    showScreen(Screen.GAME);
    
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
    // 清除棋盘画布内容
    const canvas = document.getElementById('chessCanvas');
    const ctx = canvas?.getContext('2d');
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // 停止游戏中的轮询和等待状态
    if (game) {
        game.stopWaitingForEnemy();
        game.isPlay = false;
    }
    game = null;
    
    // 重置右侧面板的显示状态
    const turnCampEl = document.getElementById('turnCamp');
    const turnIndicatorEl = document.getElementById('turnIndicator');
    const moveCountEl = document.getElementById('moveCount');
    const noCaptureCountEl = document.getElementById('noCaptureCount');
    
    if (turnCampEl) turnCampEl.textContent = '红方';
    if (turnIndicatorEl) {
        turnIndicatorEl.classList.remove('waiting-player', 'waiting-ai');
        const textEl = turnIndicatorEl.querySelector('.turn-indicator__text');
        if (textEl) textEl.textContent = '等待操作';
    }
    if (moveCountEl) moveCountEl.textContent = '当前步数：0';
    if (noCaptureCountEl) noCaptureCountEl.textContent = '未吃子步数：0';
    
    showScreen(Screen.MENU);
}

// 将 showGameOver 挂载到 window 上，供 game.js 调用
window.showGameOver = showGameOver;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', initMain);
