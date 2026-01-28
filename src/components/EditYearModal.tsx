import { useState, useRef, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import MountainScape from './MountainScape';

interface EditYearModalProps {
  isOpen: boolean;
  year: number;
  initialText: string;
  isFuture: boolean;
  onSave: (text: string) => void;
  onClose: () => void;
}

const EditYearModal: React.FC<EditYearModalProps> = ({
  isOpen,
  year,
  initialText,
  isFuture,
  onSave,
  onClose,
}) => {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, initialText]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Ctrl+Enter 保存
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSave();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, text, onClose, onSave]);

  const handleSave = () => {
    onSave(text.trim());
    onClose();
  };

  // 获取预览文字（用于山水画生成）
  const previewText = text.trim() || (isFuture ? '未来待描绘...' : `${year}`);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(44,36,27,0.7)] backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="modal-enter w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="paper-texture scroll-shadow rounded-lg p-6 chinese-border">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="seal text-sm">{year.toString().slice(-2)}</div>
              <div>
                <h3 className="text-xl font-medium brush-text text-[var(--ink)]">{year}年</h3>
                {isFuture && <span className="text-xs text-[var(--accent-red)]">未来年份</span>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--secondary)] transition-colors"
            >
              <X size={20} className="text-[var(--light-ink)]" />
            </button>
          </div>

          {/* 山水画预览 */}
          <div className="flex justify-center mb-4 p-4 bg-gradient-to-b from-[var(--paper)] to-[#f0ede6] rounded-lg border border-[var(--light-ink)]/20">
            <div className="transition-all duration-300">
              <MountainScape year={year} text={previewText} size={120} />
            </div>
          </div>

          {/* 输入区域 */}
          <div className="mb-4">
            <label className="block text-sm text-[var(--light-ink)] mb-2">
              记录这一年的故事（文字变化会影响山水画）
            </label>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isFuture ? '写下你对这一年的期待...' : '这一年发生了什么值得记录的事？'}
              className="w-full px-4 py-3 bg-transparent border-2 border-[var(--light-ink)] rounded-lg
                       text-[var(--ink)] placeholder:text-[var(--cloud)]
                       focus:outline-none focus:border-[var(--ink)] transition-colors
                       resize-none min-h-[100px]"
              maxLength={100}
            />
            <div className="flex justify-between mt-2 text-xs text-[var(--light-ink)]">
              <span>快捷键：Ctrl + Enter 保存，Esc 取消</span>
              <span>{text.length}/100</span>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-[var(--light-ink)] text-[var(--light-ink)]
                       hover:bg-[var(--secondary)] transition-colors text-sm tracking-wide"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 rounded-lg bg-[var(--ink)] text-[var(--paper)]
                       hover:bg-[var(--light-ink)] transition-all text-sm tracking-wide
                       flex items-center justify-center gap-2"
            >
              <Save size={16} />
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditYearModal;
