"use client";

import { PropsSecaoSalmo } from "../../types/liturgia";
import { Music } from "lucide-react";
import ReferenciaBiblica from "./ReferenciaBiblica";

const PsalmSection = ({ salmo }: PropsSecaoSalmo) => {
  return (
    <section className="space-y-10">
      {/* Label */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/5"
          aria-hidden="true"
        >
          <Music size={20} className="text-primary" />
        </div>
        <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground">
          Salmo Responsorial
        </h2>
      </div>

      <div className="bg-card/40 backdrop-blur-sm p-10 md:p-14 border border-border/40 rounded-[2rem] shadow-2xl shadow-foreground/5 relative overflow-hidden">
        {/* Reference */}
        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-[1px] bg-primary/30"></div>
          <ReferenciaBiblica referencia={salmo.referencia} />
        </div>

        {/* Refrain */}
        <div className="bg-pearl/50 backdrop-blur-sm p-10 rounded-2xl border-l-4 border-primary mb-14 text-center">
          <p className="font-heading text-2xl md:text-3xl font-medium text-foreground italic">
            <span className="text-primary not-italic mr-2">R.</span> {salmo.refrao}
          </p>
        </div>

        {/* Psalm text */}
        <div className="text-foreground/90 text-xl md:text-2xl leading-[1.8] whitespace-pre-line font-reading italic">
          {salmo.texto}
        </div>
      </div>
    </section>
  );
};

export default PsalmSection;