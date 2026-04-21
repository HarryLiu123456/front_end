# 中国象棋游戏 - JavaScript 模块

## 项目概述

这是一个基于 JavaScript 的中国象棋游戏，采用模块化架构设计，使用 UCCI 标准命名。

## 文件结构

```
static/js/
├── main.js          # 游戏主入口
├── config.js        # 配置文件
├── utils.js         # 工具函数
└── jss/             # 游戏类模块（UCCI 标准命名）
    ├── chessman.js  # 棋子基类
    ├── king.js      # 将/帅类 (UCCI: K)
    ├── rook.js      # 车类 (UCCI: R)
    ├── knight.js     # 马类 (UCCI: N)
    ├── cannon.js    # 炮类 (UCCI: C)
    ├── bishop.js    # 相/象类 (UCCI: B)
    ├── advisor.js   # 士类 (UCCI: A)
    ├── pawn.js      # 兵/卒类 (UCCI: P)
    ├── board.js     # 棋盘类
    └── game.js      # 游戏控制类
```

---

## UCCI 棋子标识规范

UCCI（United Computer Chess Institute）是中国象棋的计算机接口标准，定义了棋子的标准字母标识。

### UCCI 标准标识

| 棋子名称 | UCCI标识 | 类名 | 英文名称 |
|---------|---------|------|---------|
| 将/帅 | `K` | King | King |
| 车 | `R` | Rook | Rook |
| 马 | `N` | Knight | Horse |
| 炮 | `C` | Cannon | Cannon |
| 相/象 | `B` | Bishop | Bishop |
| 士 | `A` | Advisor | Advisor |
| 兵/卒 | `P` | Pawn | Pawn |

### FEN 串棋子标识

在 FEN（Forsyth-Edwards Notation）格式中，棋子使用以下标识：

#### 红方棋子（大写字母）

| 棋子名称 | FEN标识 | UCCI类 |
|---------|--------|--------|
| 帅 | `J` | King |
| 车 | `C` | Rook |
| 马 | `M` | Knight |
| 炮 | `P` | Cannon |
| 相 | `X` | Bishop |
| 士 | `S` | Advisor |
| 兵 | `Z` | Pawn |

#### 黑方棋子（小写字母）

| 棋子名称 | FEN标识 | UCCI类 |
|---------|--------|--------|
| 将 | `j` | King |
| 车 | `c` | Rook |
| 马 | `m` | Knight |
| 炮 | `p` | Cannon |
| 象 | `x` | Bishop |
| 士 | `s` | Advisor |
| 卒 | `z` | Pawn |

---

### 本项目中的棋子完整标识

本项目使用 FEN 串格式定义棋子（类型+序号）：

```javascript
// 红方棋子
'J0'  // 帅（唯一）
'S0', 'S1'  // 仕×2
'X0', 'X1'  // 相×2
'M0', 'M1'  // 马×2
'C0', 'C1'  // 车×2
'P0', 'P1'  // 炮×2
'Z0', 'Z1', 'Z2', 'Z3', 'Z4'  // 兵×5

// 黑方棋子
'j0'  // 将（唯一）
's0', 's1'  // 士×2
'x0', 'x1'  // 象×2
'm0', 'm1'  // 马×2
'c0', 'c1'  // 车×2
'p0', 'p1'  // 炮×2
'z0', 'z1', 'z2', 'z3', 'z4'  // 卒×5
```

**标识规则：**
- 第一个字符：棋子类型（大写=红方，小写=黑方）
- 第二个字符：序号（用于区分同类棋子）

---

### FEN 串格式示例

标准开局 FEN 串格式：

```
rnsmkhsr/c1c1c1c1/p1p1p1p1p/9/9/9/P1P1P1P1P/C1C1C1C1C/RNSMKHSR w - - 0 1
```

- **小写字母**：黑方棋子
- **大写字母**：红方棋子
- **数字**：表示该行中连续的空格数
- **`/`**：行分隔符
- **`w`**：红方回合
- **`-`**：无吃过路兵
- **`-`**：无历史着法
- **`0`**：半回合计数
- **`1`**：回合编号

---

## 棋子移动规则

### 帅/将（King, UCCI: K）

- 只能在九宫内移动
- 只能走直线一步（上下左右）
- 红方九宫范围：(3-5列, 7-9行)
- 黑方九宫范围：(3-5列, 0-2行)
- 特殊规则：可以"将帅对面"（直线中间无子时）

### 车（Rook, UCCI: R）

- 沿横竖方向直线移动
- 不能越子
- 任意步数

### 马（Knight, UCCI: N）

- 走"日"字
- 有蹩马腿限制
- 8个方向

### 炮（Cannon, UCCI: C）

- 沿横竖方向直线移动
- 移动时不能越子
- 吃子时必须隔一个棋子（炮架）

### 相/象（Bishop, UCCI: B）

- 走"田"字
- 有塞象眼限制
- 红相不能过河（只能在0-4行）
- 黑象不能过河（只能在5-9行）

### 士（Advisor, UCCI: A）

- 沿斜线移动一步
- 只能在九宫内
- 红方士：(3-5列, 7-9行)
- 黑方士：(3-5列, 0-2行)

### 兵/卒（Pawn, UCCI: P）

- 未过河时只能前进一步
- 过河后可以前进或左右移动
- 红方前进方向：向上（Y减小）
- 黑方前进方向：向下（Y增大）

---

## 棋盘坐标系

```
   0   1   2   3   4   5   6   7   8
0 [车] [马] [象] [士] [将] [士] [象] [马] [车]   ← 黑方
1 [　] [　] [　] [　] [　] [　] [　] [　] [　]
2 [　] [炮] [　] [　] [　] [　] [　] [炮] [　]
3 [卒] [　] [卒] [　] [卒] [　] [卒] [　] [卒]   ← 黑方过河线
4 [　] [　] [　] [　] [　] [　] [　] [　] [　]
5 [　] [　] [　] [　] [　] [　] [　] [　] [　]   ← 红方过河线
6 [兵] [　] [兵] [　] [兵] [　] [兵] [　] [兵]
7 [　] [炮] [　] [　] [　] [　] [　] [炮] [　]
8 [　] [　] [　] [　] [　] [　] [　] [　] [　]
9 [车] [马] [相] [仕] [帅] [仕] [相] [马] [车]   ← 红方
```

**坐标系说明：**
- X轴：从左到右，0-8
- Y轴：从上到下，0-9
- 红方在下方（Y=6-9）
- 黑方在上方（Y=0-5）

---

## 开发说明

### 类继承关系

```
ChessMan (基类)
├── King (将/帅)
├── Rook (车)
├── Knight (马)
├── Cannon (炮)
├── Bishop (相/象)
├── Advisor (士)
└── Pawn (兵/卒)

Board (棋盘类)
Game (游戏控制类)
```

### 使用方法

1. 在 HTML 文件中引入脚本（按依赖顺序）：

```html
<script src="static/js/config.js"></script>
<script src="static/js/utils.js"></script>
<script src="static/js/jss/chessman.js"></script>
<script src="static/js/jss/king.js"></script>
<script src="static/js/jss/rook.js"></script>
<script src="static/js/jss/knight.js"></script>
<script src="static/js/jss/cannon.js"></script>
<script src="static/js/jss/bishop.js"></script>
<script src="static/js/jss/advisor.js"></script>
<script src="static/js/jss/pawn.js"></script>
<script src="static/js/jss/board.js"></script>
<script src="static/js/jss/game.js"></script>
<script src="static/js/main.js"></script>
```

2. 在 HTML 中创建 Canvas 元素：

```html
<canvas id="chess" width="523" height="580"></canvas>
```

---

## 参考资料

- [UCCI 规范文档](http://www.xqbase.com/protocol/cchessucci.htm)
- [中国象棋 FEN 格式](http://www.xqbase.com/protocol/cchessfen.htm)
