"use client";

import { PropsSecaoLeitura } from "@/types/liturgia";
import ReferenciaBiblica from "./ReferenciaBiblica";

const ReadingSection = ({ titulo, leitura, Icon }: PropsSecaoLeitura) => {
  return (
    <section className="space-y-10">
      {/* Label */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/5 transition-colors group-hover:bg-primary/10"
            aria-hidden="true"
          >
            <Icon size={20} className="text-primary" />
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground">
            {titulo}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="bg-card/40 backdrop-blur-sm p-10 md:p-14 border border-border/40 rounded-[2rem] shadow-2xl shadow-foreground/5 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        {/* Reference */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-[1px] bg-primary/30"></div>
          <ReferenciaBiblica referencia={leitura.referencia} />
        </div>

        {/* Title */}
        <h3 className="font-heading text-3xl md:text-5xl font-medium mb-12 text-foreground leading-[1.2] max-w-3xl">
          {leitura.titulo}
        </h3>

        {/* Text */}
        <div className="text-foreground/90 text-xl md:text-2xl leading-[1.7] whitespace-pre-line font-reading italic">
          {leitura.texto}
        </div>

        {/* Sacred Divider for end of reading */}
        <div className="flex items-center justify-center gap-6 mt-16 opacity-30">
          <div className="h-[1px] w-12 bg-primary"></div>
          <div className="w-2 h-2 rounded-full border border-primary rotate-45"></div>
          <div className="h-[1px] w-12 bg-primary"></div>
        </div>
      </div>
    </section>
  );
};

export default ReadingSection;