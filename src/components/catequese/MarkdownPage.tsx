import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Breadcrumb, type BreadcrumbItem } from '@/components/shared/Breadcrumb';
import { JsonLd } from '@/components/shared/JsonLd';
import { siteConfig, absoluteUrl } from '@/config/site';

// Extract text from React node to generate IDs
const extractText = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return children.toString();
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (React.isValidElement(children)) {
    return extractText((children.props as { children?: React.ReactNode }).children);
  }
  return '';
};

// Generate slug from text
const generateId = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

interface MarkdownPageProps {
  content: string;
  title: string;
  backHref: string;
  backLabel: string;
  description?: string;
  path?: string;
  breadcrumbItems?: BreadcrumbItem[];
}

export function MarkdownPage({ content, title, backHref, backLabel, description, path, breadcrumbItems }: MarkdownPageProps) {
  // Extract headings for Table of Contents
  const toc = useMemo(() => {
    const headings: { level: number; text: string; id: string }[] = [];
    // Matches '## Title' or '### Title'
    const regex = /^(##|###)\s+(.*)$/gm;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const text = match[2].trim();
      // To avoid duplicate IDs, we could append index, but usually titles are unique
      headings.push({
        level: match[1].length,
        text,
        id: generateId(text)
      });
    }
    return headings;
  }, [content]);

  const articleJsonLd = path
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description: description ?? content.slice(0, 200),
        author: { "@type": "Organization", name: siteConfig.name },
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
          logo: { "@type": "ImageObject", url: absoluteUrl("/images/icon-512.png") },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(path) },
      }
    : null;

  return (
    <div className="bg-[#fbf9f4] text-[#1b1c19] min-h-screen">
      {articleJsonLd && <JsonLd data={articleJsonLd} />}
      <div className="w-full bg-[#f5f3ee] border-b border-[#d0c4be]/20 pt-8 pb-12">
        <div className="max-w-container-max mx-auto px-margin-desktop w-full">
          {breadcrumbItems && <Breadcrumb items={breadcrumbItems} className="mb-6" />}
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 font-label-sm text-on-surface-variant hover:text-primary transition-colors mb-6 group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {backLabel}
          </Link>
          <h1 className="font-headline-xl text-headline-xl text-[#000000]">{title}</h1>
        </div>
      </div>
      <div className="max-w-container-max mx-auto px-margin-desktop py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-start relative">

          {/* Desktop Table of Contents (Sidebar) */}
          {toc.length > 0 && (
            <aside className="lg:w-80 shrink-0 lg:sticky lg:top-8 bg-[#f5f3ee] border border-[#d0c4be]/30 rounded-xl p-6 shadow-sm hidden lg:block max-h-[85vh] overflow-y-auto custom-scrollbar">
              <h4 className="font-headline-md text-xl text-[#000000] mb-4 border-b border-[#d0c4be]/30 pb-3 flex items-center">
                Nesta página
              </h4>
              <nav className="flex flex-col space-y-3">
                {toc.map((heading, i) => (
                  <a
                    key={i}
                    href={`#${heading.id}`}
                    className={`text-sm transition-colors hover:text-primary leading-snug ${heading.level === 2 ? 'font-semibold text-[#4d4540] mt-2' : 'pl-4 text-[#736a65]'
                      }`}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </aside>
          )}

          {/* Main Article Container */}
          <div className="flex-1 w-full max-w-4xl bg-[#ffffff] shadow-[0_10px_40px_-10px_rgba(201,168,76,0.15)] border border-[#c9a84c]/30 rounded-2xl p-8 md:p-16 lg:p-20 relative overflow-hidden">
            {/* Subtle decoration in corners */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t border-l border-[#c9a84c]/20 rounded-tl-2xl m-4 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b border-r border-[#c9a84c]/20 rounded-br-2xl m-4 pointer-events-none"></div>

            {/* Mobile Table of Contents */}
            {toc.length > 0 && (
              <details className="lg:hidden mb-12 bg-[#f5f3ee] border border-[#d0c4be]/30 rounded-xl p-6 shadow-sm group">
                <summary className="font-headline-md text-lg text-[#000000] cursor-pointer font-semibold list-none flex items-center justify-between">
                  <div className="flex items-center">
                    Nesta página
                  </div>
                </summary>
                <nav className="flex flex-col space-y-3 mt-4 pt-4 border-t border-[#d0c4be]/30">
                  {toc.map((heading, i) => (
                    <a
                      key={i}
                      href={`#${heading.id}`}
                      className={`text-sm transition-colors hover:text-primary leading-snug ${heading.level === 2 ? 'font-semibold text-[#4d4540]' : 'pl-4 text-[#736a65]'
                        }`}
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </details>
            )}

            <article className="
              prose prose-stone lg:prose-xl max-w-none
              prose-p:font-body-lg prose-p:text-[#4d4540] prose-p:leading-relaxed prose-p:mb-6 prose-p:text-justify
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-semibold
              prose-strong:text-[#000000] prose-strong:font-semibold
              prose-blockquote:border-l-4 prose-blockquote:border-[#c9a84c] prose-blockquote:bg-[#fbf9f4] prose-blockquote:px-8 prose-blockquote:py-6 prose-blockquote:italic prose-blockquote:text-[#584400] prose-blockquote:rounded-r-xl prose-blockquote:shadow-sm prose-blockquote:my-10
              prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6
              prose-li:marker:text-[#c9a84c] prose-li:text-[#4d4540] prose-li:mb-2
              prose-hr:border-[#c9a84c]/30 prose-hr:my-12
              [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:text-7xl [&>p:first-of-type]:first-letter:font-headline-xl [&>p:first-of-type]:first-letter:text-primary [&>p:first-of-type]:first-letter:pr-4 [&>p:first-of-type]:first-letter:-mt-2 [&>p:first-of-type]:first-letter:mb-[-12px]
            ">
              <ReactMarkdown
                components={{
                  // Demovido para h2: o h1 da página já é exibido no cabeçalho (título curto),
                  // evitar dois <h1> mantém a hierarquia de headings correta para SEO/acessibilidade.
                  h1: ({ children, ...props }) => (
                    <h2 className="font-headline-xl text-4xl text-center mb-12 text-[#000000]" {...props}>{children}</h2>
                  ),
                  h2: ({ children, ...props }) => {
                    const text = extractText(children);
                    return <h3 id={generateId(text)} className="font-headline-lg text-3xl mt-16 mb-6 border-b border-[#d0c4be]/30 pb-4 text-[#000000] scroll-mt-[100px]" {...props}>{children}</h3>;
                  },
                  h3: ({ children, ...props }) => {
                    const text = extractText(children);
                    return <h4 id={generateId(text)} className="font-headline-md text-2xl text-primary mt-10 scroll-mt-[100px]" {...props}>{children}</h4>;
                  },
                  a: ({ children, ...props }) => {
                    const isExternal = (props.href && (props.href.startsWith('http') || props.href.startsWith('//')));
                    if (isExternal) {
                      return <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline font-semibold hover:no-underline transition-colors inline-flex items-center gap-1 group">
                        {children}
                        <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>;
                    }
                    return <a {...props} className="text-primary underline font-semibold hover:no-underline transition-colors">{children}</a>;
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            </article>

            <p className="mt-16 pt-8 border-t border-[#d0c4be]/30 text-sm text-[#736a65]">
              Conteúdo baseado em material da{" "}
              <a
                href="https://bibliotecacatolica.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline font-semibold hover:no-underline transition-colors"
              >
                Biblioteca Católica
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
