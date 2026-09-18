import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getLiturgiaInsights } from "@/lib/server/services/liturgiaInsights";
import { LiturgiaDiaria } from "@/types/liturgia";

export default async function ExegeseButton({ liturgia }: { liturgia: LiturgiaDiaria }) {
  const insights = await getLiturgiaInsights(liturgia);
  if (!insights) return null;

  return (
    <Link
      href="/liturgia#exegese-meditacao"
      className="inline-flex items-center gap-2 border border-primary/40 text-primary px-12 py-4 text-[14px] font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all active:scale-95"
    >
      <Sparkles size={16} aria-hidden="true" />
      Ver Exegese &amp; Meditação
    </Link>
  );
}
