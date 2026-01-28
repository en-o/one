import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

interface YearInputModalProps {
  isOpen: boolean;
  onSubmit: (year: number) => void;
  onClose?: () => void;
}

const YearInputModal: React.FC<YearInputModalProps> = ({ isOpen, onSubmit, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const year = parseInt(inputValue);
    
    if (!inputValue || isNaN(year)) {
      setError('请输入有效年份');
      return;
    }
    
    if (year !== 1 && (year < 1900 || year > 2024)) {
      setError('请输入 1900-2024 之间的年份，或输入 0001 体验彩蛋');
      return;
    }
    
    setError('');
    onSubmit(year);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-[rgba(44,36,27,0.7)] backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="modal-enter w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="paper-texture scroll-shadow rounded-lg p-8 chinese-border">
          {/* 标题区域 */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="seal">人生</div>
            </div>
            <h2 className="text-2xl font-medium brush-text text-[var(--ink)] mb-2">
              人生长卷
            </h2>
            <p className="text-sm text-[var(--light-ink)] tracking-wide">
              输入出生年份，绘制你的人生画卷
            </p>
          </div>
          
          {/* 输入表单 */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={inputValue}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setInputValue(val.slice(0, 4));
                    setError('');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="1995"
                  className="w-full px-6 py-4 text-center text-2xl bg-transparent border-2 border-[var(--light-ink)] rounded-lg 
                           text-[var(--ink)] placeholder:text-[var(--cloud)] 
                           focus:outline-none focus:border-[var(--ink)] transition-colors
                           tracking-widest"
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={() => setInputValue('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--light-ink)] hover:text-[var(--ink)] transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              
              {error && (
                <p className="mt-3 text-sm text-[var(--accent-red)] text-center">
                  {error}
                </p>
              )}
              
              <p className="mt-4 text-xs text-[var(--light-ink)] text-center flex items-center justify-center gap-2">
                <Sparkles size={12} />
                输入 0001 自动生成 1995→当前+3 的演示长卷
              </p>
            </div>
            
            {/* 按钮 */}
            <div className="flex gap-3">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-lg border border-[var(--light-ink)] text-[var(--light-ink)]
                           hover:bg-[var(--secondary)] transition-colors text-sm tracking-wide"
                >
                  取消
                </button>
              )}
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-lg bg-[var(--ink)] text-[var(--paper)]
                         hover:bg-[var(--light-ink)] transition-all text-sm tracking-wide
                         hover:shadow-lg hover:-translate-y-0.5"
              >
                生成长卷
              </button>
            </div>
          </form>
          
          {/* 装饰元素 */}
          <div className="absolute -bottom-3 -right-3 w-16 h-16 border border-[var(--light-ink)] opacity-20 rounded-lg pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default YearInputModal;
