import { useCallback } from 'react';

interface YearData {
  year: number;
  text: string;
  isFuture: boolean;
}

// 生成山水画的种子
const getSeed = (year: number, text: string) => {
  const len = text.length || 1;
  const yearSum = String(year).split('').reduce((a, b) => a + parseInt(b), 0);
  return (len * 7 + yearSum * 13) % 100;
};

// 绘制画轴
const drawScrollRod = (
  ctx: CanvasRenderingContext2D,
  x: number,
  topY: number,
  bottomY: number,
  rodWidth: number = 24
) => {
  const rodHeight = bottomY - topY;
  const capSize = 36;
  const ringHeight = 10;

  // 画轴主体 - 木纹渐变
  const rodGradient = ctx.createLinearGradient(x - rodWidth / 2, 0, x + rodWidth / 2, 0);
  rodGradient.addColorStop(0, '#8b6914');
  rodGradient.addColorStop(0.15, '#d4a84b');
  rodGradient.addColorStop(0.3, '#f5d78e');
  rodGradient.addColorStop(0.5, '#d4a84b');
  rodGradient.addColorStop(0.7, '#a67c00');
  rodGradient.addColorStop(0.85, '#8b6914');
  rodGradient.addColorStop(1, '#6b5210');

  ctx.fillStyle = rodGradient;
  ctx.beginPath();
  ctx.roundRect(x - rodWidth / 2, topY + capSize / 2, rodWidth, rodHeight - capSize, rodWidth / 2);
  ctx.fill();

  // 画轴阴影
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 0;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;

  // 顶部玉石装饰
  const topCapGradient = ctx.createRadialGradient(
    x - capSize * 0.2, topY + capSize * 0.3, 0,
    x, topY + capSize / 2, capSize / 2
  );
  topCapGradient.addColorStop(0, '#e8f5e9');
  topCapGradient.addColorStop(0.3, '#a5d6a7');
  topCapGradient.addColorStop(0.6, '#66bb6a');
  topCapGradient.addColorStop(1, '#388e3c');

  ctx.fillStyle = topCapGradient;
  ctx.beginPath();
  ctx.arc(x, topY + capSize / 2, capSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // 玉石边框
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 底部玉石装饰
  const bottomCapGradient = ctx.createRadialGradient(
    x - capSize * 0.2, bottomY - capSize * 0.3, 0,
    x, bottomY - capSize / 2, capSize / 2
  );
  bottomCapGradient.addColorStop(0, '#e8f5e9');
  bottomCapGradient.addColorStop(0.3, '#a5d6a7');
  bottomCapGradient.addColorStop(0.6, '#66bb6a');
  bottomCapGradient.addColorStop(1, '#388e3c');

  ctx.fillStyle = bottomCapGradient;
  ctx.beginPath();
  ctx.arc(x, bottomY - capSize / 2, capSize / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 顶部金属环
  const ringGradient = ctx.createLinearGradient(0, topY + capSize, 0, topY + capSize + ringHeight);
  ringGradient.addColorStop(0, '#ffd700');
  ringGradient.addColorStop(0.3, '#ffecb3');
  ringGradient.addColorStop(0.5, '#ffd700');
  ringGradient.addColorStop(1, '#b8860b');

  ctx.fillStyle = ringGradient;
  ctx.beginPath();
  ctx.roundRect(x - rodWidth / 2 - 2, topY + capSize, rodWidth + 4, ringHeight, 2);
  ctx.fill();

  // 底部金属环
  ctx.fillStyle = ringGradient;
  ctx.beginPath();
  ctx.roundRect(x - rodWidth / 2 - 2, bottomY - capSize - ringHeight, rodWidth + 4, ringHeight, 2);
  ctx.fill();
};

// 在 Canvas 上绘制连续的山水画
const drawContinuousMountainScape = (
  ctx: CanvasRenderingContext2D,
  years: YearData[],
  cardWidth: number,
  height: number,
  padding: number
) => {
  const totalWidth = years.length * cardWidth;

  // 绘制背景渐变
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, '#f7f5f0');
  bgGradient.addColorStop(0.5, '#f0ede6');
  bgGradient.addColorStop(1, '#e8e4db');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(padding, padding, totalWidth, height);

  // 收集所有年份的山峰参数
  const peaks = years.map((yearData) => {
    const seed = getSeed(yearData.year, yearData.isFuture ? '未来' : (yearData.text || `${yearData.year}`));
    return {
      seed,
      mainPeak: 80 + (seed % 40),
      subPeak1: 50 + ((seed * 3) % 35),
      subPeak2: 40 + ((seed * 7) % 30),
      distantPeak: 30 + ((seed * 11) % 25),
      hasCloud: seed % 3 === 0,
      hasBird: seed % 4 === 0,
      hasWater: seed % 2 === 0,
      hasTree: seed % 5 === 0,
    };
  });

  // 绘制连续的远山（最后层）
  ctx.fillStyle = 'rgba(139, 134, 128, 0.25)';
  ctx.beginPath();
  ctx.moveTo(padding, padding + height);

  years.forEach((_, index) => {
    const x = padding + index * cardWidth;
    const peak = peaks[index];
    const peakHeight = peak.distantPeak * (height / 100) * 0.6;

    for (let i = 0; i <= 10; i++) {
      const progress = i / 10;
      const px = x + progress * cardWidth;
      const baseHeight = peakHeight * Math.sin(progress * Math.PI);
      // 添加一些随机变化
      const variation = Math.sin(progress * Math.PI * 3 + peak.seed) * 10;
      const py = padding + height * 0.5 - baseHeight - variation;
      ctx.lineTo(px, py);
    }
  });

  ctx.lineTo(padding + totalWidth, padding + height);
  ctx.closePath();
  ctx.fill();

  // 绘制连续的次山（中间层）
  ctx.fillStyle = 'rgba(180, 176, 168, 0.35)';
  ctx.beginPath();
  ctx.moveTo(padding, padding + height);

  years.forEach((_, index) => {
    const x = padding + index * cardWidth;
    const peak = peaks[index];
    const peakHeight = peak.subPeak1 * (height / 100) * 0.7;

    for (let i = 0; i <= 12; i++) {
      const progress = i / 12;
      const px = x + progress * cardWidth;
      const baseHeight = peakHeight * Math.sin(progress * Math.PI);
      const variation = Math.sin(progress * Math.PI * 4 + peak.seed * 2) * 15;
      const py = padding + height * 0.55 - baseHeight - variation;
      ctx.lineTo(px, py);
    }
  });

  ctx.lineTo(padding + totalWidth, padding + height);
  ctx.closePath();
  ctx.fill();

  // 绘制连续的主山（前景层）
  const mountainGradient = ctx.createLinearGradient(0, padding + height * 0.3, 0, padding + height);
  mountainGradient.addColorStop(0, 'rgba(120, 115, 108, 0.6)');
  mountainGradient.addColorStop(1, 'rgba(180, 176, 168, 0.3)');
  ctx.fillStyle = mountainGradient;
  ctx.beginPath();
  ctx.moveTo(padding, padding + height);

  years.forEach((_, index) => {
    const x = padding + index * cardWidth;
    const peak = peaks[index];
    const peakHeight = peak.mainPeak * (height / 100) * 0.8;

    for (let i = 0; i <= 15; i++) {
      const progress = i / 15;
      const px = x + progress * cardWidth;
      const baseHeight = peakHeight * Math.sin(progress * Math.PI);
      const variation = Math.sin(progress * Math.PI * 5 + peak.seed * 3) * 20;
      const py = padding + height * 0.6 - baseHeight - variation;
      ctx.lineTo(px, py);
    }
  });

  ctx.lineTo(padding + totalWidth, padding + height);
  ctx.closePath();
  ctx.fill();

  // 绘制水波纹（底部）
  ctx.fillStyle = 'rgba(168, 196, 217, 0.2)';
  ctx.beginPath();
  ctx.moveTo(padding, padding + height);

  for (let x = 0; x <= totalWidth; x += 5) {
    const waveY = padding + height * 0.88 + Math.sin((x * 0.03) * Math.PI) * 5;
    ctx.lineTo(padding + x, waveY);
  }

  ctx.lineTo(padding + totalWidth, padding + height);
  ctx.closePath();
  ctx.fill();

  // 绘制水波线条
  ctx.strokeStyle = 'rgba(168, 196, 217, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= totalWidth; x += 3) {
    const waveY = padding + height * 0.85 + Math.sin((x * 0.02 + 1) * Math.PI) * 3;
    if (x === 0) {
      ctx.moveTo(padding + x, waveY);
    } else {
      ctx.lineTo(padding + x, waveY);
    }
  }
  ctx.stroke();

  // 绘制云朵
  years.forEach((_, index) => {
    const peak = peaks[index];
    if (peak.hasCloud) {
      const x = padding + index * cardWidth + cardWidth * 0.6;
      const y = padding + height * 0.15 + (peak.seed % 30);

      ctx.fillStyle = 'rgba(212, 208, 200, 0.4)';
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.arc(x + 12, y - 3, 12, 0, Math.PI * 2);
      ctx.arc(x - 8, y + 2, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 绘制飞鸟
  years.forEach((_, index) => {
    const peak = peaks[index];
    if (peak.hasBird) {
      const x = padding + index * cardWidth + cardWidth * 0.5 + (peak.seed % 40);
      const y = padding + height * 0.12 + (peak.seed % 20);

      ctx.strokeStyle = 'rgba(90, 77, 61, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 8, y - 4, x + 16, y);
      ctx.stroke();
    }
  });

  // 绘制树木
  years.forEach((_, index) => {
    const peak = peaks[index];
    if (peak.hasTree) {
      const x = padding + index * cardWidth + cardWidth * 0.3 + (peak.seed % 50);
      const y = padding + height * 0.82;
      const treeHeight = 25 + (peak.seed % 15);

      ctx.strokeStyle = '#5a4d3d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - treeHeight);
      ctx.stroke();

      ctx.fillStyle = 'rgba(107, 101, 93, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y - treeHeight, treeHeight * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 绘制年份和文字
  years.forEach((yearData, index) => {
    const x = padding + index * cardWidth + cardWidth / 2;

    // 年份
    ctx.fillStyle = 'rgba(44, 36, 27, 0.7)';
    ctx.font = '24px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(yearData.year), x, padding + 35);

    // 描述文字
    ctx.fillStyle = 'rgba(90, 77, 61, 0.8)';
    ctx.font = '11px "Noto Serif SC", serif';
    const displayText = yearData.isFuture ? '未来待描绘...' : (yearData.text || '');

    if (displayText) {
      // 文字换行
      const maxWidth = cardWidth - 20;
      const lineHeight = 16;
      const words = displayText.split('');
      let line = '';
      let lineY = padding + height - 50;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, x, lineY);
          line = words[i];
          lineY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, lineY);
    }
  });
};

export const useScrollExport = () => {
  const exportToPNG = useCallback(async (years: YearData[]) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法创建 Canvas 上下文');

      const cardWidth = 160;
      const cardHeight = 400;
      const padding = 60;
      const rodWidth = 30; // 画轴宽度
      const headerWidth = 50; // 卷首装饰区域宽度
      const scale = 2; // 高清输出

      const totalContentWidth = years.length * cardWidth + headerWidth * 2;
      const totalWidth = totalContentWidth + rodWidth * 2 + padding * 2;

      canvas.width = totalWidth * scale;
      canvas.height = (cardHeight + padding * 2) * scale;
      ctx.scale(scale, scale);

      // 绘制整体背景
      ctx.fillStyle = '#f7f5f0';
      ctx.fillRect(0, 0, totalWidth, cardHeight + padding * 2);

      // 绘制画卷边框（金色边框）
      const contentStartX = padding + rodWidth;
      const contentEndX = contentStartX + totalContentWidth;

      // 上边框
      ctx.fillStyle = '#8b6914';
      ctx.fillRect(contentStartX, padding - 4, totalContentWidth, 4);

      // 下边框
      ctx.fillRect(contentStartX, padding + cardHeight, totalContentWidth, 4);

      // 绘制连续的山水画
      drawContinuousMountainScape(ctx, years, cardWidth, cardHeight, padding + rodWidth + headerWidth);

      // 绘制卷首装饰区域
      const headerGradient = ctx.createLinearGradient(contentStartX, 0, contentStartX + headerWidth, 0);
      headerGradient.addColorStop(0, 'rgba(139,105,20,0.15)');
      headerGradient.addColorStop(1, 'rgba(139,105,20,0)');
      ctx.fillStyle = headerGradient;
      ctx.fillRect(contentStartX, padding, headerWidth, cardHeight);

      // 卷首竖线
      ctx.strokeStyle = 'rgba(139,105,20,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(contentStartX + headerWidth, padding);
      ctx.lineTo(contentStartX + headerWidth, padding + cardHeight);
      ctx.stroke();

      // 卷首文字
      ctx.fillStyle = '#c9a961';
      ctx.font = '16px "Noto Serif SC", serif';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(contentStartX + headerWidth / 2, padding + cardHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('春秋数载', 0, 5);
      ctx.restore();

      // 绘制卷尾装饰区域
      const footerStartX = contentEndX - headerWidth;
      const footerGradient = ctx.createLinearGradient(footerStartX, 0, contentEndX, 0);
      footerGradient.addColorStop(0, 'rgba(139,105,20,0)');
      footerGradient.addColorStop(1, 'rgba(139,105,20,0.15)');
      ctx.fillStyle = footerGradient;
      ctx.fillRect(footerStartX, padding, headerWidth, cardHeight);

      // 卷尾竖线
      ctx.strokeStyle = 'rgba(139,105,20,0.3)';
      ctx.beginPath();
      ctx.moveTo(footerStartX, padding);
      ctx.lineTo(footerStartX, padding + cardHeight);
      ctx.stroke();

      // 卷尾文字
      ctx.fillStyle = '#c9a961';
      ctx.save();
      ctx.translate(footerStartX + headerWidth / 2, padding + cardHeight / 2);
      ctx.rotate(Math.PI / 2);
      ctx.fillText('卷终', 0, 5);
      ctx.restore();

      // 绘制左侧画轴
      drawScrollRod(ctx, padding + rodWidth / 2, padding - 20, padding + cardHeight + 20, rodWidth - 6);

      // 绘制右侧画轴
      drawScrollRod(ctx, contentEndX + rodWidth / 2, padding - 20, padding + cardHeight + 20, rodWidth - 6);

      // 画轴投影到画面的阴影
      const leftShadowGradient = ctx.createLinearGradient(contentStartX, 0, contentStartX + 25, 0);
      leftShadowGradient.addColorStop(0, 'rgba(0,0,0,0.2)');
      leftShadowGradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = leftShadowGradient;
      ctx.fillRect(contentStartX, padding, 25, cardHeight);

      const rightShadowGradient = ctx.createLinearGradient(contentEndX - 25, 0, contentEndX, 0);
      rightShadowGradient.addColorStop(0, 'rgba(0,0,0,0)');
      rightShadowGradient.addColorStop(1, 'rgba(0,0,0,0.2)');
      ctx.fillStyle = rightShadowGradient;
      ctx.fillRect(contentEndX - 25, padding, 25, cardHeight);

      // 下载图片
      const link = document.createElement('a');
      link.download = `春秋数载_${years[0]?.year || ''}_${years[years.length - 1]?.year || ''}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      return true;
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
      return false;
    }
  }, []);

  return { exportToPNG };
};
