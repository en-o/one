import { useRef, useEffect, useState, useCallback } from 'react';
import MountainScape from './MountainScape';
import EditYearModal from './EditYearModal';
import type { YearData } from '@/types';
import { ChevronLeft, ChevronRight, Download, RotateCcw, Edit3, UserCircle } from 'lucide-react';

// 画轴组件 - 固定在屏幕两侧（仿古卷轴风格）
const ScrollRod: React.FC<{
  position: 'left' | 'right';
  thickness: number; // 卷入的"厚度" 0-40
}> = ({ position, thickness }) => {
  // 计算容器宽度：轴身20px + 纸卷厚度
  const containerWidth = 20 + Math.max(0, thickness);

  return (
    <div
      className={`scroll-rod-fixed scroll-rod-fixed-${position}`}
      style={{ width: `${containerWidth}px` }}
    >
      {/* 卷入的纸卷 - 厚度随滚动变化 */}
      {thickness > 2 && (
        <div
          className="scroll-rod-paper-roll"
          style={{
            width: `${thickness}px`,
            opacity: Math.min(1, thickness / 8),
          }}
        />
      )}
      {/* 画轴主体 - 紫檀木 */}
      <div className="scroll-rod-body-fixed" />
      {/* 顶部轴头 */}
      <div className="scroll-rod-cap-fixed scroll-rod-cap-top-fixed" />
      {/* 底部轴头 */}
      <div className="scroll-rod-cap-fixed scroll-rod-cap-bottom-fixed" />
    </div>
  );
};

interface ScrollViewerProps {
  years: YearData[];
  userName?: string;
  onReset: () => void;
  onSwitchUser?: () => void;
  onExport: () => void;
  onUpdateYear?: (year: number, text: string) => void;
}

const ScrollViewer: React.FC<ScrollViewerProps> = ({ years, userName, onReset, onSwitchUser, onExport, onUpdateYear }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // 编辑模态框状态
  const [editingYear, setEditingYear] = useState<YearData | null>(null);

  // 画轴纸卷厚度状态
  const [leftRodThickness, setLeftRodThickness] = useState(0);
  const [rightRodThickness, setRightRodThickness] = useState(35);

  // 动画帧引用
  const animationFrameRef = useRef<number | null>(null);

  // 拖拽状态
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

  // 画轴动画 - 根据滚动位置计算纸卷厚度（徐徐展开效果）
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const updateAnimation = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollEl;
      const maxScroll = scrollWidth - clientWidth;

      // 计算滚动百分比
      const scrollPercent = maxScroll > 0 ? scrollLeft / maxScroll : 0;

      // 最大纸卷厚度
      const maxThickness = 35;

      // 左侧画轴：滚动越多，卷入越多（已看过的内容）
      const leftThickness = scrollPercent * maxThickness;

      // 右侧画轴：滚动越少，卷入越多（未看的内容）
      const rightThickness = (1 - scrollPercent) * maxThickness;

      setLeftRodThickness(leftThickness);
      setRightRodThickness(rightThickness);

      animationFrameRef.current = requestAnimationFrame(updateAnimation);
    };

    animationFrameRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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

  // 拖拽/滚动事件处理
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
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

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const x = e.clientX;
      const walk = startXRef.current - x;
      dragDistanceRef.current = Math.abs(walk);
      scrollEl.scrollLeft = scrollLeftRef.current + walk;
    };

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      scrollEl.style.cursor = 'grab';
      document.body.style.userSelect = '';
      setTimeout(() => {
        dragDistanceRef.current = 0;
      }, 100);
    };

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button')) return;

      const touch = e.touches[0];
      isDraggingRef.current = true;
      startXRef.current = touch.clientX;
      scrollLeftRef.current = scrollEl.scrollLeft;
      dragDistanceRef.current = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const x = touch.clientX;
      const walk = startXRef.current - x;
      dragDistanceRef.current = Math.abs(walk);
      scrollEl.scrollLeft = scrollLeftRef.current + walk;
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      setTimeout(() => {
        dragDistanceRef.current = 0;
      }, 100);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      scrollEl.scrollLeft += delta;
    };

    scrollEl.addEventListener('mousedown', handleMouseDown);
    scrollEl.addEventListener('touchstart', handleTouchStart, { passive: false });
    scrollEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    scrollEl.addEventListener('touchend', handleTouchEnd);
    scrollEl.addEventListener('wheel', handleWheel, { passive: false });

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

  const handleYearClick = (yearData: YearData) => {
    if (dragDistanceRef.current > 5) return;
    setEditingYear(yearData);
  };

  const handleSaveEdit = (text: string) => {
    if (editingYear && onUpdateYear) {
      onUpdateYear(editingYear.year, text);
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden">
      {/* 虚化背景 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/them.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(8px)',
          transform: 'scale(1.1)',
        }}
      />
      <div className="absolute inset-0 z-0 bg-[var(--paper)]/70" />

      {/* 编辑模态框 */}
      <EditYearModal
        isOpen={!!editingYear}
        year={editingYear?.year || 0}
        initialText={editingYear?.text || ''}
        isFuture={editingYear?.isFuture || false}
        onSave={handleSaveEdit}
        onClose={() => setEditingYear(null)}
      />

      {/* 固定的左侧画轴 */}
      <ScrollRod
        position="left"
        thickness={leftRodThickness}
      />

      {/* 固定的右侧画轴 */}
      <ScrollRod
        position="right"
        thickness={rightRodThickness}
      />

      {/* 顶部标题栏 */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 md:p-6 flex items-center justify-between pointer-events-none bg-gradient-to-b from-[var(--paper)] to-transparent">
        <div className="flex items-center gap-3 md:gap-4 pointer-events-auto ml-16 md:ml-20">
          <div className="seal text-[10px] md:text-xs scale-75 md:scale-100 origin-left">长卷</div>
          <div>
            <h1 className="text-lg md:text-xl font-medium brush-text text-[var(--ink)]">
              {userName ? `${userName}的春秋数载` : '春秋数载'}
            </h1>
            <p className="text-[10px] md:text-xs text-[var(--light-ink)]">
              {years.length > 0 && `${years[0].year} — ${years[years.length - 1].year}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto mr-16 md:mr-20">
          {onSwitchUser && (
            <button
              onClick={onSwitchUser}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-full bg-[var(--paper)] border border-[var(--light-ink)]
                       text-[var(--light-ink)] hover:text-[var(--ink)] hover:border-[var(--ink)]
                       transition-all text-xs md:text-sm shadow-sm hover:shadow-md"
            >
              <UserCircle size={12} className="md:w-4 md:h-4" />
              <span className="hidden md:inline">切换用户</span>
            </button>
          )}
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

      {/* 滚动控制按钮 */}
      <button
        onClick={() => scroll('left')}
        className={`hidden md:flex absolute left-[60px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full
                   bg-[var(--paper)] border border-[var(--light-ink)] shadow-lg
                   items-center justify-center transition-all pointer-events-auto
                   ${canScrollLeft ? 'opacity-100 hover:bg-[var(--secondary)]' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronLeft size={20} className="md:w-6 md:h-6 text-[var(--ink)]" />
      </button>

      <button
        onClick={() => scroll('right')}
        className={`hidden md:flex absolute right-[60px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full
                   bg-[var(--paper)] border border-[var(--light-ink)] shadow-lg
                   items-center justify-center transition-all pointer-events-auto
                   ${canScrollRight ? 'opacity-100 hover:bg-[var(--secondary)]' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronRight size={20} className="md:w-6 md:h-6 text-[var(--ink)]" />
      </button>

      {/* 画卷内容区域 */}
      <div
        ref={scrollRef}
        className="scroll-content-area relative z-10 flex-1 flex items-center overflow-x-auto overflow-y-hidden"
        style={{
          cursor: 'grab',
          WebkitOverflowScrolling: 'touch',
          marginLeft: '56px',
          marginRight: '56px',
        }}
      >
        <div className="painting-paper flex h-[420px] md:h-[520px] flex-shrink-0">
          {/* 卷首装饰 */}
          <div className="scroll-header h-full">
            <div className="vertical-text text-[var(--light-ink)] text-xs md:text-sm tracking-[0.3em] opacity-60">
              春秋数载
            </div>
          </div>

          {/* 年份卡片区域 */}
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

          {/* 卷尾装饰 */}
          <div className="scroll-footer h-full">
            <div className="vertical-text text-[var(--light-ink)] text-xs md:text-sm tracking-[0.3em] opacity-60">
              卷终
            </div>
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-10 text-[10px] md:text-xs text-[var(--light-ink)] opacity-60 text-center px-4">
        <span className="hidden md:inline">左右拖拽展开画卷 · 点击卡片编辑内容 · </span>
        <span className="md:hidden">左右滑动展开 · 点击编辑 · </span>
        共 {years.length} 年
      </div>
    </div>
  );
};

export default ScrollViewer;
