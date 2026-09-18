import Link from "next/link";
import Image from "next/image";
import { getLiturgiaDiaria } from "@/lib/server/services/liturgia";
import { buscarNoticias } from "@/lib/server/services/noticias";
import NoticiaCard from "@/components/noticias/NoticiaCard";
import SantoDoDia from "@/components/santos/SantoDoDia";
import ExegeseButton from "@/components/liturgia/ExegeseButton";
import { Leaf, Sparkles, BookOpenText, Book, ArrowRight, Newspaper, Compass } from "lucide-react";
import { Suspense } from "react";
import { SantoDoDiaSkeleton } from "@/components/ui/skeletons";

export default async function Home() {
  const now = new Date();
  const brDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));

  const day = brDate.getDate();
  const month = brDate.toLocaleString('pt-BR', { month: 'long' });
  const monthNumeric = (brDate.getMonth() + 1).toString();
  const year = brDate.getFullYear().toString();

  const [liturgia, noticias] = await Promise.all([
    getLiturgiaDiaria(day.toString(), monthNumeric, year),
    buscarNoticias(["vaticannews"], 3)
  ]);

  return (
    <div className="selection:bg-[#fed977]">
      <main className="max-w-[1200px] mx-auto pb-24">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center px-5 py-24 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-15">
            <Image
              alt="Sacred interior"
              className="w-full h-full object-cover grayscale"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAOMN8HDrHX6N8F6U8sHi2M0SDf6hsW_PTmg47hpyyc4GWhWTroNGGlOvE2Z3BhXV8ZaqEuW-is42z2sXE8beMWN69fVwhnjwv5JcZQkLvOFVn0PrKC3H7biULzC3Kv3Is546DgfVlX4OGL4aPkrrZVz3_WZEk9a7rEubjYk5iAErLLeOEEfDo03F_xSLIGFeHk4SI4hxiHN6RnxI4uTO6IgHE73N1O28ptxGjKLigPD9eAVBQ3dNhDZRwlyD53lBgOb-L7oYkrYo0"
              fill
              priority
              unoptimized
            />
          </div>
          <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(180deg, rgba(251, 249, 244, 0) 0%, rgba(251, 249, 244, 1) 100%)" }}></div>
          <div className="relative z-20 text-center max-w-4xl px-4">
            <h1 className="sr-only">
              Meu Canto Católico — Liturgia Diária, Bíblia, Santos e Orações
            </h1>
            <span className="text-[12px] font-semibold text-[#755b00] uppercase tracking-[0.4em] mb-8 block">Sacer Quotidianus</span>
            <h2 className="font-heading text-4xl md:text-6xl text-primary mb-10 italic leading-tight">&quot;A caridade é o centro que une todas as virtudes.&quot;</h2>
            <p className="font-sans text-[14px] font-semibold text-[#4d4540] tracking-[0.3em] uppercase">— SANTO AGOSTINHO</p>
            <div className="mt-16 flex justify-center">
              <div className="w-px h-24 bg-gradient-to-b from-primary/40 to-transparent"></div>
            </div>
          </div>
        </section>

        {/* Main Categories Grid */}
        <section className="px-5 md:px-16 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <Link className="flex flex-col items-center p-8 bg-[#f5f3ee] hover:bg-[#f0eee9] transition-all group border border-primary/30 hover:-translate-y-1 duration-300" href="/biblia">
              <Book size={32} className="text-primary mb-4 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#1b1c19]">Bíblia</span>
            </Link>
            <Link className="flex flex-col items-center p-8 bg-[#f5f3ee] hover:bg-[#f0eee9] transition-all group border border-primary/30 hover:-translate-y-1 duration-300" href="/liturgia">
              <BookOpenText size={32} className="text-primary mb-4 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#1b1c19]">Liturgia</span>
            </Link>
            <Link className="flex flex-col items-center p-8 bg-[#f5f3ee] hover:bg-[#f0eee9] transition-all group border border-primary/30 hover:-translate-y-1 duration-300" href="/oracoes">
              <Sparkles size={32} className="text-primary mb-4 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#1b1c19]">Orações</span>
            </Link>
            <Link className="flex flex-col items-center p-8 bg-[#f5f3ee] hover:bg-[#f0eee9] transition-all group border border-primary/30 hover:-translate-y-1 duration-300" href="/noticias">
              <Newspaper size={32} className="text-primary mb-4 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#1b1c19]">Notícias</span>
            </Link>
            <Link className="flex flex-col items-center p-8 bg-[#f5f3ee] hover:bg-[#f0eee9] transition-all group border border-primary/30 hover:-translate-y-1 duration-300" href="/recursos">
              <Compass size={32} className="text-primary mb-4 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#1b1c19]">Recursos</span>
            </Link>
          </div>
        </section>

        {/* Daily Liturgy Section */}
        {liturgia && (
          <section className="px-5 md:px-16 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-[#ffffff] p-8 md:p-16 border border-primary/30">
              <div className="lg:col-span-10 lg:col-start-2 text-center">
                <div className="flex flex-col items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center">
                    <span className="font-heading text-2xl font-medium text-primary">{day}</span>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold uppercase text-primary tracking-widest mb-1">{month}</p>
                    <p className="text-[14px] font-bold uppercase tracking-tight text-[#1b1c19]">{liturgia.liturgia}</p>
                  </div>
                </div>
                <h3 className="font-heading text-4xl mb-6 text-primary italic">Evangelho {liturgia.evangelho.referencia}</h3>
                <p className="font-sans text-[20px] text-[#4d4540] italic mb-10 leading-relaxed max-w-2xl mx-auto">
                  &quot;{liturgia.evangelho.texto}&quot;
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link href="/liturgia" className="inline-block bg-[#000000] text-[#ffffff] px-12 py-4 text-[14px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all active:scale-95 shadow-lg">
                    Ler Liturgia Completa
                  </Link>

                  <Suspense fallback={null}>
                    <ExegeseButton liturgia={liturgia} />
                  </Suspense>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Santo do Dia */}
        <Suspense fallback={<SantoDoDiaSkeleton />}>
          <SantoDoDia />
        </Suspense>

        {/* Divider */}
        <div className="px-5 md:px-16">
          <div className="gold-divider" />
        </div>

        {/* Vatican News Grid */}
        <section className="px-5 md:px-16 py-20">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 border-b border-[#d0c4be] pb-4">
            <div>
              <span className="text-[12px] font-semibold text-primary uppercase tracking-[0.3em] mb-2 block">Mundus</span>
              <h2 className="font-heading text-4xl text-primary">Vatican News</h2>
            </div>
            <Link className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#4d4540] hover:text-primary flex items-center gap-2 mt-4 md:mt-0 transition-colors" href="/noticias">
              Ver todas as notícias <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {noticias.map((n) => (
              <NoticiaCard key={n.id} noticia={n} />
            ))}
          </div>
        </section>

        {/* Sacred Divider */}
        <div className="flex items-center justify-center py-24">
          <div className="h-px w-32 bg-gradient-to-r from-transparent to-[#755b00]/40"></div>
          <Leaf size={18} className="text-[#755b00] mx-6" />
          <div className="h-px w-32 bg-gradient-to-l from-transparent to-[#755b00]/40"></div>
        </div>
      </main>
    </div>
  );
}