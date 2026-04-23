"""
后端命令行输入工具
独立运行，用于输入敌方移动指令
"""
import requests
import sys

# 默认服务器地址
DEFAULT_URL = "http://127.0.0.1:8000"


def send_command(url, move):
    """
    发送移动指令到服务器
    :param url: 服务器地址
    :param move: [from_x, from_y, to_x, to_y]
    """
    try:
        response = requests.post(
            f"{url}/api/backend/command",
            json={"move": move},
            timeout=5
        )
        if response.status_code == 200:
            print(f"✓ 指令发送成功: ({move[0]},{move[1]}) -> ({move[2]},{move[3]})")
            return True
        else:
            print(f"✗ 指令发送失败: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ 无法连接到服务器，请确保服务器已启动")
        return False
    except Exception as e:
        print(f"✗ 发送失败: {e}")
        return False


def get_current_command(url):
    """获取当前待执行的指令"""
    try:
        response = requests.get(f"{url}/api/backend/command", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get("has_command"):
                print(f"当前待执行指令: {data.get('move')}")
            else:
                print("当前无待执行指令")
    except Exception as e:
        print(f"获取指令状态失败: {e}")


def main():
    """主函数"""
    # 检查命令行参数
    url = DEFAULT_URL
    if len(sys.argv) > 1:
        url = sys.argv[1]
    
    print("=" * 50)
    print("后端命令行移动指令输入工具")
    print("=" * 50)
    print(f"服务器地址: {url}")
    print("输入格式: from_x,from_y,to_x,to_y")
    print("例如: 0,0,1,1")
    print("输入 'status' 查看当前指令状态")
    print("输入 'quit' 退出")
    print("=" * 50)
    print()
    
    while True:
        try:
            user_input = input("请输入移动指令: ").strip()
            
            if user_input.lower() == 'quit':
                print("退出程序")
                break
            
            if user_input.lower() == 'status':
                get_current_command(url)
                continue
            
            # 解析指令
            parts = user_input.split(',')
            if len(parts) == 4:
                try:
                    from_x = int(parts[0])
                    from_y = int(parts[1])
                    to_x = int(parts[2])
                    to_y = int(parts[3])
                    
                    # 验证范围
                    if all(0 <= v < 10 for v in [from_x, from_y, to_x, to_y]):
                        send_command(url, [from_x, from_y, to_x, to_y])
                    else:
                        print("错误: 坐标必须在 0-9 之间")
                except ValueError:
                    print("错误: 请输入有效的数字")
            else:
                print("错误: 格式应为 from_x,from_y,to_x,to_y")
                
        except KeyboardInterrupt:
            print("\n退出程序")
            break
        except Exception as e:
            print(f"输入错误: {e}")


if __name__ == "__main__":
    main()
