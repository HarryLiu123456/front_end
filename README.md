# FastAPI 网页项目

这是一个使用 FastAPI 框架创建的网页应用。

## 项目结构

```
front_end/
├── main.py              # FastAPI 应用主文件
├── static/              # 静态资源目录
│   ├── index.html      # 主页面
│   ├── css/
│   │   └── style.css   # 样式文件
│   └── js/
│       └── script.js   # JavaScript 文件
└── README.md           # 项目说明
```

## 安装依赖

```bash
pip install fastapi uvicorn
```

## 运行项目

```bash
uvicorn main:app --reload
```

或者：

```bash
python -m uvicorn main:app --reload
```

## 访问地址

- 主页面: http://127.0.0.1:8000/
- API 数据: http://127.0.0.1:8000/api/data
- 带参数 API: http://127.0.0.1:8000/api/hello/你的名字

## API 文档

启动服务后访问：
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## 功能特点

- ✅ 静态文件服务
- ✅ REST API 路由
- ✅ CORS 跨域支持
- ✅ 自动 API 文档
- ✅ 热重载开发