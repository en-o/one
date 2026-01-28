import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, User, Users } from 'lucide-react';
import type { UserData } from '@/types';

interface YearInputModalProps {
  isOpen: boolean;
  onSubmit: (name: string, year: number) => void;
  onSelectUser?: (user: UserData) => void;
  onClose?: () => void;
  existingUsers?: UserData[];
}

const YearInputModal: React.FC<YearInputModalProps> = ({
  isOpen,
  onSubmit,
  onSelectUser,
  onClose,
  existingUsers = [],
}) => {
  const [nameValue, setNameValue] = useState('');
  const [yearValue, setYearValue] = useState('');
  const [error, setError] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // 重置表单
  useEffect(() => {
    if (isOpen) {
      setNameValue('');
      setYearValue('');
      setError('');
      setShowUserList(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 检查是否是彩蛋模式
    if (yearValue === '0001' || yearValue === '1') {
      onSubmit('演示用户', 1);
      return;
    }

    if (!nameValue.trim()) {
      setError('请输入姓名');
      return;
    }

    const year = parseInt(yearValue);
    if (!yearValue || isNaN(year)) {
      setError('请输入有效年份');
      return;
    }

    if (year < 1900 || year > 2024) {
      setError('请输入 1900-2024 之间的年份');
      return;
    }

    setError('');
    onSubmit(nameValue.trim(), year);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  const handleSelectUser = (user: UserData) => {
    if (onSelectUser) {
      onSelectUser(user);
    }
    setShowUserList(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(44,36,27,0.7)] backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="modal-enter w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="paper-texture scroll-shadow rounded-lg p-8 chinese-border">
          {/* 标题区域 */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="seal">人生</div>
            </div>
            <h2 className="text-2xl font-medium brush-text text-[var(--ink)] mb-2">
              春秋数载
            </h2>
            <p className="text-sm text-[var(--light-ink)] tracking-wide">
              {showUserList ? '选择已有用户' : '输入信息，绘制你的人生画卷'}
            </p>
          </div>

          {/* 已有用户列表 */}
          {showUserList ? (
            <div className="space-y-3 mb-6">
              {existingUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full p-4 rounded-lg border border-[var(--light-ink)] hover:bg-[var(--secondary)]
                           transition-colors text-left flex items-center gap-3"
                >
                  <User size={20} className="text-[var(--light-ink)]" />
                  <div className="flex-1">
                    <div className="text-[var(--ink)] font-medium">{user.name}</div>
                    <div className="text-xs text-[var(--light-ink)]">
                      {user.birthYear} 年生 · {user.years.length} 年记录
                    </div>
                  </div>
                </button>
              ))}
              <button
                onClick={() => setShowUserList(false)}
                className="w-full px-6 py-3 rounded-lg border border-[var(--light-ink)] text-[var(--light-ink)]
                         hover:bg-[var(--secondary)] transition-colors text-sm tracking-wide"
              >
                创建新用户
              </button>
            </div>
          ) : (
            /* 输入表单 */
            <form onSubmit={handleSubmit}>
              <div className="mb-6 space-y-4">
                {/* 姓名输入 */}
                <div className="relative">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={nameValue}
                    onChange={(e) => {
                      setNameValue(e.target.value);
                      setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="你的名字"
                    className="w-full px-6 py-3 text-center text-lg bg-transparent border-2 border-[var(--light-ink)] rounded-lg
                             text-[var(--ink)] placeholder:text-[var(--cloud)]
                             focus:outline-none focus:border-[var(--ink)] transition-colors
                             tracking-widest"
                  />
                  {nameValue && (
                    <button
                      type="button"
                      onClick={() => setNameValue('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--light-ink)] hover:text-[var(--ink)] transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* 年份输入 */}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={yearValue}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setYearValue(val.slice(0, 4));
                      setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="出生年份 (如 1995)"
                    className="w-full px-6 py-3 text-center text-lg bg-transparent border-2 border-[var(--light-ink)] rounded-lg
                             text-[var(--ink)] placeholder:text-[var(--cloud)]
                             focus:outline-none focus:border-[var(--ink)] transition-colors
                             tracking-widest"
                  />
                  {yearValue && (
                    <button
                      type="button"
                      onClick={() => setYearValue('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--light-ink)] hover:text-[var(--ink)] transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-[var(--accent-red)] text-center">{error}</p>
                )}

                <p className="text-xs text-[var(--light-ink)] text-center flex items-center justify-center gap-2">
                  <Sparkles size={12} />
                  <button
                    type="button"
                    onClick={() => onSubmit('t001', 1)}
                    className="underline hover:text-[var(--ink)] transition-colors"
                  >
                    点击查看演示
                  </button>
                </p>
              </div>

              {/* 按钮 */}
              <div className="flex gap-3">
                {existingUsers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowUserList(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[var(--light-ink)] text-[var(--light-ink)]
                             hover:bg-[var(--secondary)] transition-colors text-sm"
                  >
                    <Users size={16} />
                  </button>
                )}
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
          )}

          {/* 装饰元素 */}
          <div className="absolute -bottom-3 -right-3 w-16 h-16 border border-[var(--light-ink)] opacity-20 rounded-lg pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default YearInputModal;
