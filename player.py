"""
玩家类
根据FEN串随机移动己方棋子
"""
import random


class Player:
    """随机移动玩家类"""
    
    @staticmethod
    def random_move(fen):
        """
        根据FEN串生成随机移动指令，不考虑游戏规则
        :param fen: FEN字符串
        :return: 移动指令字符串，如 "b2c3"（b2到c3），或 None
        """
        if not fen:
            return None
        
        # 解析FEN获取棋子位置
        pieces = {}
        parts = fen.split(' ')
        rows = parts[0].split('/')
        
        for y, row in enumerate(rows):
            x = 0
            for c in row:
                if c.isdigit():
                    x += int(c)
                else:
                    pieces[(x, y)] = c
                    x += 1
        
        if not pieces:
            return None
        
        # 获取当前移动方（w=红方，b=黑方）
        current_camp = parts[1] if len(parts) > 1 else 'w'
        
        # 选择己方棋子
        if current_camp == 'w':
            my_pieces = {pos: p for pos, p in pieces.items() if p.isupper()}
        else:
            my_pieces = {pos: p for pos, p in pieces.items() if p.islower()}
        
        if not my_pieces:
            return None
        
        # 随机选择起始位置
        from_pos = random.choice(list(my_pieces.keys()))
        
        # 随机选择目标位置
        to_x = random.randint(0, 8)
        to_y = random.randint(0, 9)
        to_pos = (to_x, to_y)
        
        # 排除原地不动
        while to_pos == from_pos:
            to_x = random.randint(0, 8)
            to_y = random.randint(0, 9)
            to_pos = (to_x, to_y)
        
        # 转换为后端坐标格式（4字符格式：b2c3）
        # 后端坐标系：左下角a0，x=a-i(0-8)，y=0-9(从下到上)
        # 游戏坐标系：左上角(0,0)，x=0-8(从左到右)，y=0-9(从上到下)
        # 后端x = chr(ord('a') + game_x)  # 游戏x直接对应后端x
        # 后端y = 9 - game_y  # 游戏y需要反转
        from_backend = chr(ord('a') + from_pos[0]) + str(9 - from_pos[1])
        to_backend = chr(ord('a') + to_pos[0]) + str(9 - to_pos[1])
        
        return from_backend + to_backend