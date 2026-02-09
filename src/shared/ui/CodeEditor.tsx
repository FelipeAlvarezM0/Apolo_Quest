import { useEffect, useRef, useState } from 'react';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: 'json' | 'javascript' | 'xml' | 'html' | 'text' | 'yaml' | 'graphql';
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  minHeight?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = 'json',
  placeholder = '',
  readOnly = false,
  className = '',
  minHeight = '16rem',
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current?.scrollTop || 0;
      highlightRef.current.scrollLeft = textareaRef.current?.scrollLeft || 0;
    }
  }, [value]);

  const handleScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const highlightCode = (code: string, lang: string): string => {
    if (!code) return '';

    switch (lang) {
      case 'json':
        return highlightJSON(code);
      case 'javascript':
        return highlightJavaScript(code);
      case 'xml':
      case 'html':
        return highlightXML(code);
      default:
        return escapeHtml(code);
    }
  };

  const highlightJSON = (code: string): string => {
    let html = escapeHtml(code);

    html = html.replace(
      /"([^"]+)"(\s*:)/g,
      '<span class="text-[#9cdcfe]">"$1"</span>$2'
    );

    html = html.replace(
      /:\s*"([^"]*)"/g,
      ': <span class="text-[#ce9178]">"$1"</span>'
    );

    html = html.replace(
      /:\s*(-?\d+\.?\d*)/g,
      ': <span class="text-[#b5cea8]">$1</span>'
    );

    html = html.replace(
      /:\s*(true|false)/g,
      ': <span class="text-[#569cd6]">$1</span>'
    );

    html = html.replace(
      /:\s*(null)/g,
      ': <span class="text-[#569cd6]">$1</span>'
    );

    html = html.replace(
      /([{}[\],])/g,
      '<span class="text-[#d4d4d4]">$1</span>'
    );

    return html;
  };

  const highlightJavaScript = (code: string): string => {
    let html = escapeHtml(code);

    const keywords = [
      'const', 'let', 'var', 'function', 'if', 'else', 'for', 'while', 'return',
      'try', 'catch', 'throw', 'new', 'class', 'import', 'export', 'from',
      'async', 'await', 'true', 'false', 'null', 'undefined', 'typeof', 'instanceof'
    ];

    keywords.forEach(keyword => {
      html = html.replace(
        new RegExp(`\\b(${keyword})\\b`, 'g'),
        '<span class="text-[#569cd6]">$1</span>'
      );
    });

    html = html.replace(
      /"([^"\\]*(\\.[^"\\]*)*)"/g,
      '<span class="text-[#ce9178]">"$1"</span>'
    );

    html = html.replace(
      /'([^'\\]*(\\.[^'\\]*)*)'/g,
      '<span class="text-[#ce9178]">\'$1\'</span>'
    );

    html = html.replace(
      /`([^`]*)`/g,
      '<span class="text-[#ce9178]">`$1`</span>'
    );

    html = html.replace(
      /\/\/.*$/gm,
      '<span class="text-[#6a9955]">$&</span>'
    );

    html = html.replace(
      /\/\*[\s\S]*?\*\//g,
      '<span class="text-[#6a9955]">$&</span>'
    );

    html = html.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span class="text-[#b5cea8]">$1</span>'
    );

    html = html.replace(
      /\b(console)\b/g,
      '<span class="text-[#4ec9b0]">$1</span>'
    );

    return html;
  };

  const highlightXML = (code: string): string => {
    let html = escapeHtml(code);

    html = html.replace(
      /(&lt;\/?)([\w-]+)/g,
      '$1<span class="text-[#569cd6]">$2</span>'
    );

    html = html.replace(
      /([\w-]+)(=)/g,
      '<span class="text-[#9cdcfe]">$1</span>$2'
    );

    html = html.replace(
      /="([^"]*)"/g,
      '=<span class="text-[#ce9178]">"$1"</span>'
    );

    html = html.replace(
      /&lt;!--[\s\S]*?--&gt;/g,
      '<span class="text-[#6a9955]">$&</span>'
    );

    return html;
  };

  const escapeHtml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const displayValue = value || '';
  const highlighted = highlightCode(displayValue, language);

  return (
    <div className={`relative ${className}`} style={{ minHeight }}>
      {!readOnly && (
        <div
          ref={highlightRef}
          className="absolute inset-0 px-4 py-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-all overflow-auto pointer-events-none z-10"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      )}
      <textarea
        ref={textareaRef}
        value={displayValue}
        onChange={(e) => onChange?.(e.target.value)}
        onScroll={handleScroll}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        readOnly={readOnly}
        spellCheck={false}
        className={`
          relative w-full px-4 py-3 font-mono text-sm leading-relaxed
          bg-transparent border rounded resize-none
          ${readOnly ? 'cursor-default' : 'cursor-text'}
          ${isFocused && !readOnly ? 'outline-none ring-2 ring-blue-500 border-transparent' : 'border-gray-700'}
          ${readOnly ? 'text-gray-100' : 'text-transparent caret-white'}
          placeholder-gray-500
          overflow-auto
        `}
        style={{
          minHeight,
          caretColor: '#fff',
          WebkitTextFillColor: readOnly ? undefined : 'transparent',
        }}
      />
      {readOnly && (
        <div
          className="absolute inset-0 px-4 py-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-all overflow-auto pointer-events-none"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      )}
    </div>
  );
}
