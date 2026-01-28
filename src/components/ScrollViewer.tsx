import { useRef, useEffect, useState, useCallback } from 'react';
import MountainScape from './MountainScape';
import EditYearModal from './EditYearModal';
import type { YearData } from '@/types';
import { ChevronLeft, ChevronRight, Download, RotateCcw, Edit3 } from 'lucide-react';

interface ScrollViewerProps {
  years: YearData[];
  onReset: () => void;
  onExport: () => void;
  onUpdateYear?: (year: number, text: string) => void;
}

const ScrollViewer: React.FC<ScrollViewerProps> = ({ years, onReset, onExport, onUpdateYear }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // 编辑模态框状态
  const [editingYear, setEditingYear] = useState<YearData | null>(null);

  // 拖拽状态 - 使用 ref 避免闭包问题
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScroll, { passive: true });
      return () => scrollEl.removeEventListener('scroll', checkScroll);
    }
  }, [checkScroll, years]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!scrollRef.current) return;

      const scrollAmount = 300;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ========== 统一的拖拽/滚动事件处理 ==========
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    // 鼠标按下
    const handleMouseDown = (e: MouseEvent) => {
      // 只响应左键
      if (e.button !== 0) return;
      // 如果点击的是按钮，不启动拖拽
      const target = e.target as HTMLElement;
      if (target.closest('button')) return;

      e.preventDefault();
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      scrollLeftRef.current = scrollEl.scrollLeft;
      dragDistanceRef.current = 0;
      scrollEl.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    };

    // 鼠标移动 - 绑定到 document 确保拖出容器也能工作
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const x = e.clientX;
      const walk = startXRef.current - x;
      dragDistanceRef.current = Math.abs(walk);
      scrollEl.scrollLeft = scrollLeftRef.current + walk;
    };

    // 鼠标松开
    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      scrollEl.style.cursor = 'grab';
      document.body.style.userSelect = '';
      // 延迟重置拖拽距离
      setTimeout(() => {
        dragDistanceRef.current = 0;
      }, 100);
    };

    // 触摸开始
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button')) return;

      const touch = e.touches[0];
      isDraggingRef.current = true;
      startXRef.current = touch.clientX;
      scrollLeftRef.current = scrollEl.scrollLeft;
      dragDistanceRef.current = 0;
    };

    // 触摸移动
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const x = touch.clientX;
      const walk = startXRef.current - x;
      dragDistanceRef.current = Math.abs(walk);
      scrollEl.scrollLeft = scrollLeftRef.current + walk;
    };

    // 触摸结束
    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      setTimeout(() => {
        dragDistanceRef.current = 0;
      }, 100);
    };

    // 鼠标滚轮（垂直滚动转水平滚动）
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      scrollEl.scrollLeft += delta;
    };

    // 添加事件监听 - 容器上的事件
    scrollEl.addEventListener('mousedown', handleMouseDown);
    scrollEl.addEventListener('touchstart', handleTouchStart, { passive: false });
    scrollEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    scrollEl.addEventListener('touchend', handleTouchEnd);
    scrollEl.addEventListener('wheel', handleWheel, { passive: false });

    // 全局鼠标事件 - 确保拖出容器也能工作
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      scrollEl.removeEventListener('mousedown', handleMouseDown);
      scrollEl.removeEventListener('touchstart', handleTouchStart);
      scrollEl.removeEventListener('touchmove', handleTouchMove);
      scrollEl.removeEventListener('touchend', handleTouchEnd);
      scrollEl.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getYearText = (data: YearData) => {
    if (data.isFuture) {
      return data.text || '未来待描绘...';
    }
    return data.text || `${data.year}`;
  };

  // 处理年份卡片点击（编辑）
  const handleYearClick = (yearData: YearData) => {
    // 如果拖拽距离超过 5px，认为是拖拽而非点击
    if (dragDistanceRef.current > 5) return;
    setEditingYear(yearData);
  };
  
  // 保存编辑
  const handleSaveEdit = (text: string) => {
    if (editingYear && onUpdateYear) {
      onUpdateYear(editingYear.year, text);
    }
  };
  
  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden">
      {/* 编辑模态框 */}
      <EditYearModal
        isOpen={!!editingYear}
        year={editingYear?.year || 0}
        initialText={editingYear?.text || ''}
        isFuture={editingYear?.isFuture || false}
        onSave={handleSaveEdit}
        onClose={() => setEditingYear(null)}
      />
      
      {/* 顶部标题栏 */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 flex items-center justify-between pointer-events-none bg-gradient-to-b from-[var(--paper)] to-transparent">
        <div className="flex items-center gap-3 md:gap-4 pointer-events-auto">
          <div className="seal text-[10px] md:text-xs scale-75 md:scale-100 origin-left">长卷</div>
          <div>
            <h1 className="text-lg md:text-xl font-medium brush-text text-[var(--ink)]">
              人生长卷
            </h1>
            <p className="text-[10px] md:text-xs text-[var(--light-ink)]">
              {years.length > 0 && `${years[0].year} — ${years[years.length - 1].year}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
          <button
            onClick={onReset}
            className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-full bg-[var(--paper)] border border-[var(--light-ink)]
                     text-[var(--light-ink)] hover:text-[var(--ink)] hover:border-[var(--ink)]
                     transition-all text-xs md:text-sm shadow-sm hover:shadow-md"
          >
            <RotateCcw size={12} className="md:w-4 md:h-4" />
            <span className="hidden md:inline">重新开始</span>
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-full bg-[var(--ink)] text-[var(--paper)]
                     hover:bg-[var(--light-ink)] transition-all text-xs md:text-sm shadow-md hover:shadow-lg
                     hover:-translate-y-0.5"
          >
            <Download size={12} className="md:w-4 md:h-4" />
            <span className="hidden md:inline">导出长图</span>
          </button>
        </div>
      </div>
      
      {/* 滚动控制按钮 - 桌面端显示 */}
      <button
        onClick={() => scroll('left')}
        className={`hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full 
                   bg-[var(--paper)] border border-[var(--light-ink)] shadow-lg
                   items-center justify-center transition-all pointer-events-auto
                   ${canScrollLeft ? 'opacity-100 hover:bg-[var(--secondary)]' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronLeft size={20} className="md:w-6 md:h-6 text-[var(--ink)]" />
      </button>
      
      <button
        onClick={() => scroll('right')}
        className={`hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full 
                   bg-[var(--paper)] border border-[var(--light-ink)] shadow-lg
                   items-center justify-center transition-all pointer-events-auto
                   ${canScrollRight ? 'opacity-100 hover:bg-[var(--secondary)]' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronRight size={20} className="md:w-6 md:h-6 text-[var(--ink)]" />
      </button>
      
      {/* 长卷容器 */}
      <div
        ref={scrollRef}
        className="scroll-container flex-1 flex items-center px-4 md:px-20 py-12 md:py-16 overflow-x-auto overflow-y-hidden"
        style={{
          cursor: 'grab',
          background: `
            linear-gradient(180deg, var(--paper) 0%, #f5f2ea 50%, var(--paper) 100%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d0c8' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
          `,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="flex h-[400px] md:h-[500px] scroll-shadow rounded-lg flex-shrink-0">
          {years.map((yearData, index) => (
            <div
              key={yearData.year}
              className={`year-card w-[140px] md:w-[200px] h-full flex-shrink-0 ${yearData.isFuture ? 'ai-generated' : ''} 
                         relative group hover:bg-[#faf8f3] transition-colors`}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
              onClick={() => handleYearClick(yearData)}
            >
              {/* 编辑按钮 */}
              <button
                className="absolute top-1 md:top-2 right-1 md:right-2 z-10 p-1.5 md:p-2 rounded-full bg-[var(--paper)] border border-[var(--light-ink)]
                         opacity-0 group-hover:opacity-100 transition-opacity shadow-sm
                         hover:bg-[var(--secondary)] pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingYear(yearData);
                }}
              >
                <Edit3 size={12} className="md:w-4 md:h-4 text-[var(--light-ink)]" />
              </button>
              
              {/* 年份标签 */}
              <div className="year-label text-xl md:text-3xl font-light text-[var(--ink)] tracking-widest mb-2 md:mb-4">
                {yearData.year}
              </div>
              
              {/* 山水画 */}
              <div className="flex-1 flex items-center justify-center">
                <MountainScape 
                  year={yearData.year} 
                  text={getYearText(yearData)}
                  size={100}
                />
              </div>
              
              {/* 年份描述 */}
              <div className="px-2 md:px-4 pb-4 md:pb-6">
                <p className={`text-[10px] md:text-xs text-center leading-relaxed line-clamp-3 ${yearData.text ? 'text-[var(--ink)]' : 'text-[var(--light-ink)]'}`}>
                  {getYearText(yearData)}
                </p>
              </div>
              
              {/* 分隔线装饰 */}
              {index < years.length - 1 && (
                <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b 
                              from-transparent via-[var(--light-ink)] to-transparent opacity-20" />
              )}
            </div>
          ))}
        </div>
        
        {/* 卷尾装饰 */}
        <div className="flex-shrink-0 w-12 md:w-20 h-[400px] md:h-[500px] ml-2 md:ml-4 flex items-center justify-center">
          <div className="vertical-text text-[var(--light-ink)] text-xs md:text-sm tracking-widest opacity-50">
            卷终
          </div>
        </div>
      </div>
      
      {/* 底部提示 */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs text-[var(--light-ink)] opacity-60 text-center px-4">
        <span className="hidden md:inline">左右拖拽浏览长卷 · 点击卡片编辑内容 · </span>
        <span className="md:hidden">左右滑动浏览 · 点击编辑 · </span>
        共 {years.length} 年
      </div>
    </div>
  );
};

export default ScrollViewer;
