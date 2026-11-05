"use client";

import { PropsBooksGrid } from "@/types/biblia";
import { useState } from "react";
import { BookCard } from "./BookCard";
import { ChevronDown, ChevronUp } from "lucide-react";

export function BooksGrid({ title, subtitle, books }: PropsBooksGrid) {
  const [showAll, setShowAll] = useState(false);
  const initialCount = 10;
  const displayedBooks = showAll ? books : books.slice(0, initialCount);

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-primary/10 gap-4">
        <div>
          <p className="font-body text-xs text-primary font-bold uppercase tracking-[0.3em] mb-3">{subtitle}</p>
          <h2 className="font-heading text-4xl lg:text-5xl text-foreground font-medium">{title}</h2>
        </div>
        <button 
          onClick={() => setShowAll(!showAll)}
          className="font-body text-[10px] font-bold text-primary uppercase tracking-widest hover:underline underline-offset-4"
        >
          {showAll ? "Ver menos" : `Ver todos os ${books.length} livros`}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedBooks.map((book) => (
          <BookCard key={book.nome} name={book.nome} chapters={book.totalCapitulos} />
        ))}
        
        {!showAll && books.length > initialCount && (
          <button 
            onClick={() => setShowAll(true)}
            className="bg-pearl/50 border border-primary/10 border-dashed p-8 rounded-2xl flex flex-col items-center justify-center group cursor-pointer hover:bg-pearl transition-all hover:border-primary/30 min-h-[140px]"
          >
            <span className="font-body text-xs font-bold text-primary uppercase tracking-widest mb-2">+ {books.length - initialCount} Livros</span>
            <ChevronDown className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 group-hover:translate-y-1 transition-all" />
          </button>
        )}

        {showAll && (
          <button 
            onClick={() => setShowAll(false)}
            className="bg-pearl/50 border border-primary/10 border-dashed p-8 rounded-2xl flex flex-col items-center justify-center group cursor-pointer hover:bg-pearl transition-all hover:border-primary/30 min-h-[140px]"
          >
            <span className="font-body text-xs font-bold text-primary uppercase tracking-widest mb-2">Ver menos</span>
            <ChevronUp className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 group-hover:-translate-y-1 transition-all" />
          </button>
        )}
      </div>
    </section>
  );
}
