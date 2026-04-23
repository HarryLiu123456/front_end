"""
FastAPI 应用主文件
这是一个基于 FastAPI 的网页项目
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import asyncio

app = FastAPI(title="FastAPI 网页应用", version="1.0.0")

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

# 后端指令存储（用于接收命令行输入的移动指令）
backend_command = {"move": None, "event": asyncio.Event()}

# 主页路由
@app.get("/")
async def root():
    """返回主页面"""
    return FileResponse("templates/index.html")

# API 路由示例
@app.get("/api/data")
async def get_data():
    """返回 JSON 数据示例"""
    return {
        "message": "Hello from FastAPI!",
        "status": "success",
        "data": {
            "version": "1.0.0",
            "features": ["快速", "简单", "强大"]
        }
    }

@app.get("/api/hello/{name}")
async def say_hello(name: str):
    """带参数的 API 示例"""
    return {
        "message": f"你好, {name}!",
        "greeting": "欢迎使用 FastAPI"
    }


# 棋子移动请求模型
class MoveRequest(BaseModel):
    board_state: List[List[str]]  # 棋盘状态 10x10
    camp: str  # 'red' 或 'black'
    from_x: int  # 起始位置X
    from_y: int  # 起始位置Y
    to_x: int    # 目标位置X
    to_y: int    # 目标位置Y


# AI移动响应模型
class AIMoveResponse(BaseModel):
    valid: bool  # 移动是否有效
    move: Optional[List[int]] = None  # [from_x, from_y, to_x, to_y]
    reason: Optional[str] = None  # 无效原因


@app.post("/api/ai/move", response_model=AIMoveResponse)
async def get_ai_move(request: MoveRequest):
    """
    获取AI的随机合法移动
    :param request: 包含棋盘状态和阵营的请求
    :return: AI的移动指令
    """
    try:
        # 获取随机合法移动
        move = ai.get_random_move(request.board_state, request.camp)
        
        if move is None:
            return AIMoveResponse(
                valid=False,
                reason="No valid moves available"
            )
        
        return AIMoveResponse(
            valid=True,
            move=list(move)
        )
    
    except Exception as e:
        return AIMoveResponse(
            valid=False,
            reason=f"Error: {str(e)}"
        )


@app.post("/api/ai/validate")
async def validate_ai_move(request: MoveRequest):
    """
    验证AI移动是否合法
    :param request: 包含棋盘状态和移动信息的请求
    :return: 验证结果
    """
    try:
        board_state = request.board_state
        from_x, from_y = request.from_x, request.from_y
        to_x, to_y = request.to_x, request.to_y
        
        # 检查起始位置是否有棋子
        if not (0 <= from_x < 10 and 0 <= from_y < 10):
            return {"valid": False, "reason": "起始位置超出范围"}
        
        piece = board_state[from_y][from_x]
        if not piece:
            return {"valid": False, "reason": "起始位置没有棋子"}
        
        # 检查是否是敌方棋子
        piece_camp = 'red' if piece[0].lower() == 'r' else 'black'
        if piece_camp != request.camp:
            return {"valid": False, "reason": "该棋子不属于当前阵营"}
        
        # 获取该棋子的合法移动
        valid_moves = ai.get_piece_valid_moves(board_state, from_x, from_y)
        
        # 检查目标位置是否在合法移动中
        if (to_x, to_y) in valid_moves:
            return {"valid": True}
        else:
            return {"valid": False, "reason": "移动不合法"}
    
    except Exception as e:
        return {"valid": False, "reason": f"Error: {str(e)}"}


# 后端指令接收API
@app.get("/api/backend/command")
async def get_backend_command():
    """
    获取后端命令行指令（如有）
    前端轮询此接口获取敌方移动指令
    指令格式：from_x,from_y,to_x,to_y（如 "0,0,1,1"）
    """
    move = backend_command["move"]
    backend_command["move"] = None  # 消费指令
    return {"has_command": move is not None, "move": move}


@app.post("/api/backend/command")
async def set_backend_command(move_data: dict):
    """
    设置后端命令行指令（供外部工具调用）
    """
    move = move_data.get("move")
    if move:
        backend_command["move"] = move
        backend_command["event"].set()
    return {"status": "ok"}


# 运行命令：
# uv run uvicorn main:app --reload
# 单独运行命令输入工具：
# uv run python command_input.py
