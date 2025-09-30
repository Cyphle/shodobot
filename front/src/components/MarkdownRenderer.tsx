import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Personnaliser le style des éléments
        h1: ({ children }) => (
          <h1 style={{ 
            color: 'white', 
            fontSize: '20px', 
            fontWeight: 'bold', 
            margin: '16px 0 8px 0',
            borderBottom: '1px solid #444',
            paddingBottom: '4px'
          }}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 style={{ 
            color: 'white', 
            fontSize: '18px', 
            fontWeight: 'bold', 
            margin: '14px 0 6px 0',
            borderBottom: '1px solid #444',
            paddingBottom: '2px'
          }}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 style={{ 
            color: 'white', 
            fontSize: '16px', 
            fontWeight: 'bold', 
            margin: '12px 0 4px 0'
          }}>
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p style={{ 
            color: 'white', 
            margin: '8px 0', 
            lineHeight: '1.5'
          }}>
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul style={{ 
            color: 'white', 
            margin: '8px 0', 
            paddingLeft: '20px',
            lineHeight: '1.5'
          }}>
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol style={{ 
            color: 'white', 
            margin: '8px 0', 
            paddingLeft: '20px',
            lineHeight: '1.5'
          }}>
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li style={{ 
            color: 'white', 
            margin: '4px 0',
            lineHeight: '1.4'
          }}>
            {children}
          </li>
        ),
        strong: ({ children }) => (
          <strong style={{ 
            color: '#DC2626', 
            fontWeight: 'bold'
          }}>
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em style={{ 
            color: '#FFD700', 
            fontStyle: 'italic'
          }}>
            {children}
          </em>
        ),
        code: ({ children }) => (
          <code style={{ 
            background: '#333', 
            color: '#00FF00', 
            padding: '2px 4px', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre style={{ 
            background: '#1a1a1a', 
            color: '#00FF00', 
            padding: '12px', 
            borderRadius: '8px',
            overflow: 'auto',
            margin: '8px 0',
            border: '1px solid #444',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote style={{ 
            borderLeft: '4px solid #DC2626', 
            paddingLeft: '16px', 
            margin: '8px 0',
            color: '#ccc',
            fontStyle: 'italic'
          }}>
            {children}
          </blockquote>
        ),
        a: ({ children, href }) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#4A9EFF', 
              textDecoration: 'underline'
            }}
          >
            {children}
          </a>
        ),
        hr: () => (
          <hr style={{ 
            border: 'none', 
            borderTop: '1px solid #444', 
            margin: '16px 0' 
          }} />
        ),
        // Style pour les listes de résultats Notion
        'ul ul': ({ children }) => (
          <ul style={{ 
            color: '#ccc', 
            margin: '4px 0', 
            paddingLeft: '16px',
            fontSize: '14px'
          }}>
            {children}
          </ul>
        ),
        'ul ul li': ({ children }) => (
          <li style={{ 
            color: '#ccc', 
            margin: '2px 0',
            fontSize: '14px'
          }}>
            {children}
          </li>
        )
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
