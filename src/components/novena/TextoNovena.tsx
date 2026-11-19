import ReactMarkdown from "react-markdown";
import { PropsTextoNovena } from "@/types/novena";

/**
 * Texto da novena em Markdown. O HTML cru é ignorado pelo react-markdown, então o
 * conteúdo importado nunca injeta marcação na página.
 */
export default function TextoNovena({ texto, capitular = false }: PropsTextoNovena) {
  return (
    <div
      className={`font-reading text-body-lg text-on-surface/90 leading-relaxed space-y-5 ${
        capitular
          ? "[&>p:first-child]:first-letter:text-5xl [&>p:first-child]:first-letter:font-heading [&>p:first-child]:first-letter:float-left [&>p:first-child]:first-letter:mr-3 [&>p:first-child]:first-letter:mt-1 [&>p:first-child]:first-letter:text-primary"
          : ""
      }`}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h4 className="font-headline-md text-xl text-primary pt-4">{children}</h4>,
          h2: ({ children }) => <h4 className="font-headline-md text-xl text-primary pt-4">{children}</h4>,
          h3: ({ children }) => <h4 className="font-headline-md text-xl text-primary pt-4">{children}</h4>,
          strong: ({ children }) => <strong className="font-semibold text-on-surface">{children}</strong>,
          em: ({ children }) => <em className="text-on-surface-variant">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-secondary/40 pl-5 italic text-on-surface-variant space-y-4">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 marker:text-secondary">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 marker:text-secondary">{children}</ol>,
          hr: () => <hr className="border-secondary/20 my-8" />,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
              {children}
            </a>
          ),
        }}
      >
        {texto}
      </ReactMarkdown>
    </div>
  );
}
