import Link from "next/link";
import { Church } from "lucide-react";
import { siteConfig } from "@/config/site";

const LINKS = [
  { label: "Liturgia Diária", href: "/liturgia" },
  { label: "Bíblia Sagrada", href: "/biblia" },
  { label: "Santoral", href: "/santos" },
  { label: "Orações", href: "/oracoes" },
  { label: "Calendário Litúrgico", href: "/calendario" },
  { label: "Catequese", href: "/catequese" },
  { label: "Santo Rosário", href: "/rosario" },
  { label: "Confissão", href: "/confissao" },
  { label: "Notícias", href: "/noticias" },
  { label: "Recursos", href: "/recursos" },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-[#755b00]/10 bg-[#fbf9f4]">
      <div className="container mx-auto px-5 md:px-16 py-14">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-3 group" aria-label={`${siteConfig.name} — Página Inicial`}>
              <Church size={22} className="text-[#000000]" aria-hidden="true" />
              <span className="font-sans text-[13px] leading-[20px] tracking-[0.2em] font-bold uppercase text-[#000000]">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-4 font-body-sm text-on-surface-variant leading-relaxed">
              {siteConfig.description}
            </p>
          </div>

          <nav aria-label="Links do rodapé">
            <h2 className="font-label-sm text-[11px] uppercase tracking-widest text-primary mb-4">
              Explorar
            </h2>
            <ul className="grid grid-cols-2 gap-x-10 gap-y-3">
              {LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="font-body-sm text-on-surface-variant hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 pt-6 border-t border-[#755b00]/10 text-center">
          <p className="font-label-sm text-[11px] text-on-surface-variant">
            © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
          </p>
          <p className="mt-2 font-label-sm text-[11px] text-on-surface-variant">
            Desenvolvido por{" "}
            <a
              href="https://site-davi-five.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline underline-offset-2"
            >
              Davi Alves Rodrigues
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
