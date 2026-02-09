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
    const tokens: Array<{ type: string; value: string; start: number; end: number }> = [];
    let i = 0;

    const skipWhitespace = () => {
      while (i < code.length && /\s/.test(code[i])) i++;
    };

    const parseString = () => {
      const start = i;
      i++;
      while (i < code.length && code[i] !== '"') {
        if (code[i] === '\\') i++;
        i++;
      }
      i++;
      return code.slice(start, i);
    };

    const parseNumber = () => {
      const start = i;
      if (code[i] === '-') i++;
      while (i < code.length && /\d/.test(code[i])) i++;
      if (code[i] === '.') {
        i++;
        while (i < code.length && /\d/.test(code[i])) i++;
      }
      return code.slice(start, i);
    };

    while (i < code.length) {
      skipWhitespace();
      if (i >= code.length) break;

      const start = i;

      if (code[i] === '"') {
        const value = parseString();
        skipWhitespace();
        const type = code[i] === ':' ? 'property' : 'string';
        tokens.push({ type, value, start, end: i });
      } else if (/[-\d]/.test(code[i])) {
        const value = parseNumber();
        tokens.push({ type: 'number', value, start, end: i });
      } else if (code.substr(i, 4) === 'true' || code.substr(i, 5) === 'false') {
        const value = code.substr(i, 4) === 'true' ? 'true' : 'false';
        i += value.length;
        tokens.push({ type: 'boolean', value, start, end: i });
      } else if (code.substr(i, 4) === 'null') {
        tokens.push({ type: 'null', value: 'null', start, end: i + 4 });
        i += 4;
      } else if (/[{}[\]:,]/.test(code[i])) {
        tokens.push({ type: 'punctuation', value: code[i], start, end: i + 1 });
        i++;
      } else {
        i++;
      }
    }

    let result = '';
    let lastEnd = 0;

    tokens.forEach(token => {
      result += escapeHtml(code.slice(lastEnd, token.start));

      const colors = {
        property: '#4fc1ff',
        string: '#ce9178',
        number: '#b5cea8',
        boolean: '#569cd6',
        null: '#569cd6',
        punctuation: '#cccccc'
      };

      result += `<span style="color: ${colors[token.type as keyof typeof colors]}">${escapeHtml(token.value)}</span>`;
      lastEnd = token.end;
    });

    result += escapeHtml(code.slice(lastEnd));
    return result;
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
        '<span style="color: #569cd6">$1</span>'
      );
    });

    html = html.replace(
      /"([^"\\]*(\\.[^"\\]*)*)"/g,
      '<span style="color: #ce9178">"$1"</span>'
    );

    html = html.replace(
      /'([^'\\]*(\\.[^'\\]*)*)'/g,
      '<span style="color: #ce9178">\'$1\'</span>'
    );

    html = html.replace(
      /`([^`]*)`/g,
      '<span style="color: #ce9178">`$1`</span>'
    );

    html = html.replace(
      /\/\/.*$/gm,
      '<span style="color: #6a9955">$&</span>'
    );

    html = html.replace(
      /\/\*[\s\S]*?\*\//g,
      '<span style="color: #6a9955">$&</span>'
    );

    html = html.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span style="color: #b5cea8">$1</span>'
    );

    html = html.replace(
      /\b(console)\b/g,
      '<span style="color: #4ec9b0">$1</span>'
    );

    return html;
  };

  const highlightXML = (code: string): string => {
    let html = escapeHtml(code);

    html = html.replace(
      /(&lt;\/?)([\w-]+)/g,
      '$1<span style="color: #569cd6">$2</span>'
    );

    html = html.replace(
      /([\w-]+)(=)/g,
      '<span style="color: #9cdcfe">$1</span>$2'
    );

    html = html.replace(
      /="([^"]*)"/g,
      '=<span style="color: #ce9178">"$1"</span>'
    );

    html = html.replace(
      /&lt;!--[\s\S]*?--&gt;/g,
      '<span style="color: #6a9955">$&</span>'
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
    <div className={`relative ${className}`} style={{ minHeight, height: minHeight === '100%' ? '100%' : undefined }}>
      {!readOnly && (
        <div
          ref={highlightRef}
          className="absolute inset-0 px-4 py-3 font-mono text-base leading-relaxed whitespace-pre-wrap break-all overflow-auto pointer-events-none z-10"
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
          relative w-full h-full px-4 py-3 font-mono text-base leading-relaxed
          bg-transparent border rounded resize-none
          ${readOnly ? 'cursor-default' : 'cursor-text'}
          ${isFocused && !readOnly ? 'outline-none ring-2 ring-blue-500 border-transparent' : 'border-gray-700'}
          ${readOnly ? 'text-gray-100' : 'text-transparent caret-white'}
          placeholder-gray-500
          overflow-auto
        `}
        style={{
          minHeight: minHeight === '100%' ? undefined : minHeight,
          caretColor: '#fff',
          WebkitTextFillColor: readOnly ? undefined : 'transparent',
        }}
      />
      {readOnly && (
        <div
          className="absolute inset-0 px-4 py-3 font-mono text-base leading-relaxed whitespace-pre-wrap break-all overflow-auto pointer-events-none"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      )}
    </div>
  );
}
