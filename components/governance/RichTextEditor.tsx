'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  ChevronDown,
  List,
  ListOrdered,
  Quote,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table as TableIcon,
  Undo,
  Redo,
  Indent,
  Outdent,
  RemoveFormatting,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Type details for this new meeting',
  minHeight = '140px',
  className = '',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [paragraphDropdownOpen, setParagraphDropdownOpen] = useState(false);
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [alignDropdownOpen, setAlignDropdownOpen] = useState(false);
  const [currentBlockFormat, setCurrentBlockFormat] = useState('Paragraph');
  const isUpdatingFromProps = useRef(false);

  // Sync value from props to contentEditable innerHTML when external changes happen
  useEffect(() => {
    if (editorRef.current && !isUpdatingFromProps.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    // Normalize empty content
    const cleaned =
      html === '<br>' || html === '<p><br></p>' || html.trim() === '' ? '' : html;
    isUpdatingFromProps.current = true;
    onChange(cleaned);
    setTimeout(() => {
      isUpdatingFromProps.current = false;
    }, 0);
  }, [onChange]);

  // Execute standard formatting commands
  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, arg);
    handleInput();
  };

  // Format block (Paragraph, Heading 1, Heading 2, Heading 3)
  const formatBlock = (tag: string, label: string) => {
    executeCommand('formatBlock', tag);
    setCurrentBlockFormat(label);
    setParagraphDropdownOpen(false);
  };

  // Add Link
  const handleInsertLink = () => {
    const url = prompt('Enter link URL (e.g. https://...):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  // Insert Simple Table
  const handleInsertTable = () => {
    const tableHtml = `
      <table style="width:100%; border-collapse: collapse; margin: 8px 0; border: 1px solid #d1d5db;">
        <thead>
          <tr style="background-color: #fef3c7;">
            <th style="border: 1px solid #d1d5db; padding: 6px 10px; font-size: 11px; text-align: left;">Item #</th>
            <th style="border: 1px solid #d1d5db; padding: 6px 10px; font-size: 11px; text-align: left;">Agenda Topic</th>
            <th style="border: 1px solid #d1d5db; padding: 6px 10px; font-size: 11px; text-align: left;">Designated Custodian</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; font-size: 11px;">1</td>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; font-size: 11px;">Sample discussion point</td>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; font-size: 11px;">Executive Officer</td>
          </tr>
        </tbody>
      </table>
      <p><br></p>
    `;
    executeCommand('insertHTML', tableHtml);
  };

  const isEmpty =
    !value ||
    value.trim() === '' ||
    value === '<br>' ||
    value === '<p><br></p>';

  return (
    <div
      className={`border border-outline-variant/60 rounded-2xl overflow-hidden bg-white shadow-2xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all ${className}`}
    >
      {/* Rich Text Toolbar (Styled precisely matching user's reference) */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 bg-[#f8f9fa] border-b border-outline-variant/30 select-none">
        {/* Group 1: Basic Text Styles */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('bold');
            }}
            className="w-7 h-7 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Bold (Ctrl+B)"
          >
            <Bold size={14} strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('italic');
            }}
            className="w-7 h-7 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Italic (Ctrl+I)"
          >
            <Italic size={14} strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('underline');
            }}
            className="w-7 h-7 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Underline (Ctrl+U)"
          >
            <Underline size={14} strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('strikeThrough');
            }}
            className="w-7 h-7 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Strikethrough"
          >
            <Strikethrough size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Separator */}
        <div className="w-[1px] h-4 bg-neutral-300 mx-1.5 self-center" />

        {/* Group 2: Color, Highlight & Formatting Dropdown */}
        <div className="flex items-center gap-1 relative">
          {/* Text Color / Pen Icon */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setColorDropdownOpen(!colorDropdownOpen);
              }}
              className="h-7 px-1.5 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center gap-0.5 transition-colors cursor-pointer"
              title="Text Color"
            >
              <span className="font-serif font-bold text-xs underline decoration-amber-700 decoration-2">
                A
              </span>
              <ChevronDown size={11} className="text-neutral-500" />
            </button>

            {colorDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-300 rounded-xl shadow-xl p-2 z-50 flex gap-1 animate-[fadeIn_0.15s_ease-out]">
                {[
                  { name: 'Default', color: '#1f2937' },
                  { name: 'Sacred Gold / Amber', color: '#b45309' },
                  { name: 'Crimson Red', color: '#991b1b' },
                  { name: 'Deep Forest', color: '#166534' },
                  { name: 'Temple Blue', color: '#1e40af' },
                ].map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      executeCommand('foreColor', c.color);
                      setColorDropdownOpen(false);
                    }}
                    className="w-5 h-5 rounded-full border border-neutral-300 hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Highlight / Fill */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('hiliteColor', '#fef08a');
            }}
            className="w-7 h-7 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Highlight Text (Yellow)"
          >
            <Highlighter size={14} />
          </button>

          {/* Text Size (AA) */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('fontSize', '4');
            }}
            className="h-7 px-1 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center justify-center font-bold text-[11px] transition-colors cursor-pointer"
            title="Large Text (AA)"
          >
            AA
          </button>

          {/* Paragraph Style Dropdown */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setParagraphDropdownOpen(!paragraphDropdownOpen);
              }}
              className="h-7 px-2 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer"
              title="Text Format"
            >
              <span className="text-[11px] font-sans">{currentBlockFormat}</span>
              <ChevronDown size={11} className="text-neutral-500" />
            </button>

            {paragraphDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-300 rounded-xl shadow-xl py-1 w-36 z-50 animate-[fadeIn_0.15s_ease-out]">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatBlock('<p>', 'Paragraph');
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 font-sans cursor-pointer"
                >
                  Paragraph
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatBlock('<h1>', 'Heading 1');
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-neutral-900 hover:bg-neutral-100 font-serif font-bold cursor-pointer"
                >
                  Heading 1
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatBlock('<h2>', 'Heading 2');
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-neutral-900 hover:bg-neutral-100 font-serif font-bold cursor-pointer"
                >
                  Heading 2
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatBlock('<h3>', 'Heading 3');
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-neutral-800 hover:bg-neutral-100 font-sans font-semibold cursor-pointer"
                >
                  Heading 3
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="w-[1px] h-4 bg-neutral-300 mx-1.5 self-center" />

        {/* Group 3: Indentation & Lists */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('outdent');
            }}
            className="w-7 h-7 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Decrease Indent"
          >
            <Outdent size={14} />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('indent');
            }}
            className="w-7 h-7 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Increase Indent"
          >
            <Indent size={14} />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('insertUnorderedList');
            }}
            className="w-7 h-7 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Bulleted List"
          >
            <List size={14} />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('insertOrderedList');
            }}
            className="w-7 h-7 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Numbered List"
          >
            <ListOrdered size={14} />
          </button>
        </div>

        {/* Separator */}
        <div className="w-[1px] h-4 bg-neutral-300 mx-1.5 self-center" />

        {/* Group 4: Quote, Link, Align & Table */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('formatBlock', 'blockquote');
            }}
            className="w-7 h-7 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Quote Block"
          >
            <Quote size={13} />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInsertLink();
            }}
            className="w-7 h-7 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Insert Link"
          >
            <Link2 size={14} />
          </button>

          {/* Alignment Toggle / Dropdown */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setAlignDropdownOpen(!alignDropdownOpen);
              }}
              className="w-7 h-7 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Text Alignment"
            >
              <AlignLeft size={14} />
            </button>

            {alignDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-300 rounded-xl shadow-xl p-1 z-50 flex gap-0.5 animate-[fadeIn_0.15s_ease-out]">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    executeCommand('justifyLeft');
                    setAlignDropdownOpen(false);
                  }}
                  className="w-7 h-7 rounded-md hover:bg-neutral-100 flex items-center justify-center cursor-pointer text-neutral-700"
                  title="Align Left"
                >
                  <AlignLeft size={13} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    executeCommand('justifyCenter');
                    setAlignDropdownOpen(false);
                  }}
                  className="w-7 h-7 rounded-md hover:bg-neutral-100 flex items-center justify-center cursor-pointer text-neutral-700"
                  title="Align Center"
                >
                  <AlignCenter size={13} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    executeCommand('justifyRight');
                    setAlignDropdownOpen(false);
                  }}
                  className="w-7 h-7 rounded-md hover:bg-neutral-100 flex items-center justify-center cursor-pointer text-neutral-700"
                  title="Align Right"
                >
                  <AlignRight size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Insert Table */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInsertTable();
            }}
            className="w-7 h-7 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Insert Agenda Table"
          >
            <TableIcon size={14} />
          </button>
        </div>

        {/* Separator */}
        <div className="w-[1px] h-4 bg-neutral-300 mx-1.5 self-center" />

        {/* Group 5: Undo & Redo */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('undo');
            }}
            className="w-7 h-7 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={14} />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('redo');
            }}
            className="w-7 h-7 rounded-md hover:bg-neutral-200/70 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={14} />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('removeFormat');
            }}
            className="w-7 h-7 rounded-md hover:bg-neutral-200/70 text-neutral-500 hover:text-neutral-700 flex items-center justify-center transition-colors cursor-pointer ml-1"
            title="Clear Formatting"
          >
            <RemoveFormatting size={13} />
          </button>
        </div>
      </div>

      {/* Writing Canvas */}
      <div className="relative p-4">
        {/* Placeholder overlay when empty */}
        {isEmpty && (
          <div
            onClick={() => editorRef.current?.focus()}
            className="absolute left-4 top-4 text-xs font-sans text-neutral-400 pointer-events-none select-none"
          >
            {placeholder}
          </div>
        )}

        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          style={{ minHeight }}
          className="focus:outline-none text-xs font-sans text-neutral-800 leading-relaxed max-w-none [&_h1]:text-base [&_h1]:font-serif [&_h1]:font-bold [&_h1]:my-2 [&_h2]:text-sm [&_h2]:font-serif [&_h2]:font-bold [&_h2]:my-1.5 [&_h3]:text-xs [&_h3]:font-bold [&_h3]:my-1 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-600 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 [&_a]:text-amber-800 [&_a]:underline"
        />
      </div>
    </div>
  );
}
