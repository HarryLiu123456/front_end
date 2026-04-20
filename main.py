"""
FastAPI 应用主文件
这是一个基于 FastAPI 的网页项目
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

# 主页路由
@app.get("/")
async def root():
    """返回主页面"""
    return FileResponse("static/index.html")

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

# 运行命令：
# uvicorn main:app --reload