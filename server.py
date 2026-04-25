"""
FastAPI 应用主文件
中国象棋服务器
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware


# 创建FastAPI应用
app = FastAPI(title="中国象棋", version="1.0.0")

# 配置 CORS 允许跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件目录
app.mount("/static", StaticFiles(directory="static"), name="static")


# 主页路由
@app.get("/")
async def root():
    """返回主页面"""
    return FileResponse("templates/index.html")


# 敌方移动API - 前端调用获取后端输入的移动指令
@app.post("/api/enemy/move")
async def request_enemy_move(move_data: dict):
    """
    前端请求敌方移动
    格式: { fen: "当前棋盘FEN串" }
    返回: { action: "move_ready", move: "a0c1" } 移动字符串格式
         或 { action: "waiting" } 等待中
    """
    fen = move_data.get("fen")
    
    # 使用player生成随机移动
    from player import Player
    move = Player.random_move(fen)
    if move:
        return {"action": "move_ready", "move": move}
    return {"action": "waiting"}


if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("启动中国象棋服务器...")
    print("访问 http://localhost:8000 查看网页")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")