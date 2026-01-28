import React, { useMemo } from 'react';

interface MountainScapeProps {
  year: number;
  text: string;
  size?: number;
}

const MountainScape: React.FC<MountainScapeProps> = ({ year, text, size = 200 }) => {
  const svgContent = useMemo(() => {
    const len = text.length || 1;
    const yearSum = String(year).split('').reduce((a, b) => a + parseInt(b), 0);
    const seed = (len * 7 + yearSum * 13) % 100;
    
    // 基于文本长度和年份生成山峰高度
    const mainPeak = 80 + (seed % 40);
    const subPeak1 = 50 + ((seed * 3) % 35);
    const subPeak2 = 40 + ((seed * 7) % 30);
    const distantPeak = 30 + ((seed * 11) % 25);
    
    // 生成山脉路径
    const generateMountainPath = (height: number, width: number, offsetX: number, complexity: number) => {
      const points: string[] = [];
      const steps = complexity;
      points.push(`${offsetX} ${size}`);
      
      for (let i = 0; i <= steps; i++) {
        const x = offsetX + (width * i) / steps;
        const progress = i / steps;
        const y = size - height * Math.sin(progress * Math.PI) * (0.7 + 0.3 * Math.sin(progress * Math.PI * 3 + seed));
        points.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
      }
      
      points.push(`${offsetX + width} ${size}`);
      return `M ${points.join(' L ')} Z`;
    };
    
    // 生成水波纹
    const generateWaterPath = (y: number, amplitude: number, frequency: number) => {
      const points: string[] = [];
      points.push(`0 ${y}`);
      
      for (let x = 0; x <= size; x += 5) {
        const waveY = y + amplitude * Math.sin((x * frequency + seed * 10) * Math.PI / 180);
        points.push(`${x} ${waveY.toFixed(1)}`);
      }
      
      points.push(`${size} ${size}`);
      points.push(`0 ${size}`);
      return `M ${points.join(' L ')} Z`;
    };
    
    // 生成云朵
    const generateCloud = (cx: number, cy: number, r: number) => {
      return `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="#d4d0c8" opacity="0.4"/>
        <circle cx="${cx + r * 0.6}" cy="${cy - r * 0.2}" r="${r * 0.8}" fill="#d4d0c8" opacity="0.35"/>
        <circle cx="${cx - r * 0.5}" cy="${cy + r * 0.1}" r="${r * 0.6}" fill="#d4d0c8" opacity="0.3"/>
      `;
    };
    
    // 生成飞鸟
    const generateBird = (x: number, y: number, scale: number) => {
      return `
        <path d="M${x} ${y} Q${x + 8 * scale} ${y - 4 * scale} ${x + 16 * scale} ${y}" 
              stroke="#5a4d3d" stroke-width="1.5" fill="none" opacity="0.6"/>
      `;
    };
    
    // 生成树木
    const generateTree = (x: number, y: number, height: number) => {
      return `
        <line x1="${x}" y1="${y}" x2="${x}" y2="${y - height}" stroke="#5a4d3d" stroke-width="1.5"/>
        <circle cx="${x}" cy="${y - height}" r="${height * 0.4}" fill="#6b655d" opacity="0.5"/>
        <circle cx="${x - 3}" cy="${y - height + 2}" r="${height * 0.25}" fill="#7a746c" opacity="0.4"/>
      `;
    };
    
    const hasCloud = seed % 3 === 0;
    const hasBird = seed % 4 === 0;
    const hasWater = seed % 2 === 0;
    const hasTree = seed % 5 === 0;
    
    return `
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mountainGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#a8a39c;stop-opacity:0.6" />
            <stop offset="100%" style="stop-color:#d4d0c8;stop-opacity:0.3" />
          </linearGradient>
          <linearGradient id="mountainGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#8b8680;stop-opacity:0.5" />
            <stop offset="100%" style="stop-color:#c4c0b8;stop-opacity:0.2" />
          </linearGradient>
          <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#a8c4d9;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#c4d4e0;stop-opacity:0.1" />
          </linearGradient>
        </defs>
        
        <!-- 远山 -->
        <path d="${generateMountainPath(distantPeak, size * 0.8, size * 0.1, 6)}" 
              fill="url(#mountainGrad2)" opacity="0.4"/>
        
        <!-- 次峰 -->
        <path d="${generateMountainPath(subPeak2, size * 0.5, size * 0.05, 5)}" 
              fill="#c4c0b8" opacity="0.3"/>
        <path d="${generateMountainPath(subPeak1, size * 0.6, size * 0.35, 7)}" 
              fill="#d4d0c8" opacity="0.35"/>
        
        ${hasCloud ? generateCloud(size * 0.75, size * 0.25, 15 + (seed % 10)) : ''}
        
        <!-- 主峰 -->
        <path d="${generateMountainPath(mainPeak, size * 0.7, size * 0.15, 8)}" 
              fill="url(#mountainGrad1)" opacity="0.7"/>
        
        ${hasBird ? generateBird(size * 0.6 + (seed % 20), size * 0.2 + (seed % 15), 0.8 + (seed % 3) * 0.2) : ''}
        ${hasTree ? generateTree(size * 0.25 + (seed % 30), size * 0.85, 20 + (seed % 15)) : ''}
        
        ${hasWater ? `
          <path d="${generateWaterPath(size * 0.78, 3, 2)}" fill="url(#waterGrad)" opacity="0.5"/>
          <path d="M 0 ${size * 0.75} Q ${size * 0.25} ${size * 0.73} ${size * 0.5} ${size * 0.75} T ${size} ${size * 0.75}" 
                stroke="#a8c4d9" stroke-width="1" fill="none" opacity="0.4"/>
        ` : ''}
      </svg>
    `;
  }, [year, text, size]);
  
  return (
    <div 
      className="year-svg"
      dangerouslySetInnerHTML={{ __html: svgContent }}
      style={{ width: size, height: size }}
    />
  );
};

export default MountainScape;
