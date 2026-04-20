// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('网页已加载');
    
    // 为所有卡片添加点击事件
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent;
            alert('你点击了: ' + title);
        });
    });
    
    // 动态更新时间
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN');
        const timeElement = document.getElementById('time');
        if (timeElement) {
            timeElement.textContent = '当前时间: ' + timeString;
        }
    }
    
    updateTime();
    setInterval(updateTime, 1000);
});