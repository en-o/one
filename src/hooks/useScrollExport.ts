import { useCallback, useRef } from 'react';

export const useScrollExport = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  
  const exportToPNG = useCallback(async (years: { year: number; text: string; isFuture: boolean }[]) => {
    try {
      // 动态导入 html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      // 创建临时容器
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: fixed;
        left: -99999px;
        top: 0;
        display: flex;
        background: #f7f5f0;
        padding: 40px;
        gap: 0;
      `;
      
      // 添加年份卡片
      years.forEach((yearData) => {
        const card = document.createElement('div');
        card.style.cssText = `
          width: 200px;
          height: 500px;
          background: linear-gradient(180deg, #f7f5f0 0%, #f0ede6 100%);
          border-left: 1px solid rgba(90, 77, 61, 0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          flex-shrink: 0;
        `;
        
        const yearLabel = document.createElement('div');
        yearLabel.textContent = String(yearData.year);
        yearLabel.style.cssText = `
          font-size: 28px;
          color: #2c241b;
          margin-bottom: 20px;
          font-family: 'Noto Serif SC', serif;
        `;
        
        const text = document.createElement('div');
        text.textContent = yearData.isFuture ? '未来待描绘...' : (yearData.text || `${yearData.year}`);
        text.style.cssText = `
          font-size: 12px;
          color: #5a4d3d;
          text-align: center;
          max-width: 160px;
          line-height: 1.5;
        `;
        
        card.appendChild(yearLabel);
        card.appendChild(text);
        tempContainer.appendChild(card);
      });
      
      document.body.appendChild(tempContainer);
      
      // 使用 html2canvas 截图
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#f7f5f0',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      // 清理临时容器
      document.body.removeChild(tempContainer);
      
      // 下载图片
      const link = document.createElement('a');
      link.download = `人生清明上河图_${years[0]?.year || ''}_${years[years.length - 1]?.year || ''}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      return true;
    } catch (error) {
      console.error('导出失败:', error);
      
      // 降级方案：使用原生 Canvas API
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('无法创建 Canvas 上下文');
        
        const cardWidth = 200;
        const cardHeight = 500;
        const padding = 40;
        canvas.width = (years.length * cardWidth + padding * 2) * 2;
        canvas.height = (cardHeight + padding * 2) * 2;
        ctx.scale(2, 2);
        
        // 背景
        ctx.fillStyle = '#f7f5f0';
        ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2);
        
        // 绘制每个年份
        years.forEach((yearData, index) => {
          const x = padding + index * cardWidth;
          const y = padding;
          
          // 卡片背景
          ctx.fillStyle = '#f7f5f0';
          ctx.fillRect(x, y, cardWidth, cardHeight);
          
          // 左边框
          ctx.strokeStyle = 'rgba(90, 77, 61, 0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + cardHeight);
          ctx.stroke();
          
          // 年份
          ctx.fillStyle = '#2c241b';
          ctx.font = '28px "Noto Serif SC", serif';
          ctx.textAlign = 'center';
          ctx.fillText(String(yearData.year), x + cardWidth / 2, y + 60);
          
          // 描述文字
          ctx.fillStyle = '#5a4d3d';
          ctx.font = '12px "Noto Serif SC", serif';
          const displayText = yearData.isFuture ? '未来待描绘...' : (yearData.text || `${yearData.year}`);
          
          // 文字换行
          const maxWidth = 160;
          const lineHeight = 18;
          const words = displayText.split('');
          let line = '';
          let lineY = y + cardHeight - 80;
          
          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
              ctx.fillText(line, x + cardWidth / 2, lineY);
              line = words[i];
              lineY += lineHeight;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, x + cardWidth / 2, lineY);
        });
        
        // 下载
        const link = document.createElement('a');
        link.download = `人生清明上河图_${years[0]?.year || ''}_${years[years.length - 1]?.year || ''}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        return true;
      } catch (fallbackError) {
        console.error('降级导出也失败:', fallbackError);
        alert('导出失败，请重试');
        return false;
      }
    }
  }, []);
  
  return { exportToPNG, exportRef };
};
