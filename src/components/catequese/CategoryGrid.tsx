import Link from 'next/link';
import { CATEQUESE } from '@/config/catequese';

export function CategoryGrid() {
  return (
    <section className="max-w-container-max mx-auto px-margin-desktop pb-24">
      <div className="grid grid-cols-12 gap-gutter">
        {CATEQUESE.map((secao) => {
          if (secao.id === 'missa') {
            return (
              <Link key={secao.id} href="/catequese/missa" className="col-span-12 md:col-span-6 group cursor-pointer block">
                <div className="bg-[#f5f3ee] p-10 min-h-[400px] rounded-xl border border-[#c9a84c]/30 flex flex-col justify-between transition-colors hover:bg-[#f0eee9]">
                  <div>
                    <h3 className="font-headline-lg text-headline-lg mb-4 text-primary">Santa Missa</h3>
                    <p className="font-body-md text-body-md text-[#4d4540]">
                      O sacrifício eucarístico, fonte e ápice de toda a vida cristã e espiritualidade.
                    </p>
                  </div>
                  <div className="font-label-md text-label-md [font-variant:small-caps] text-primary flex items-center group-hover:translate-x-2 transition-transform">
                    Explorar Ritos
                  </div>
                </div>
              </Link>
            );
          }

          return (
            <div key={secao.id} className="col-span-12 md:col-span-6 group">
              <div className="bg-[#f5f3ee] p-10 min-h-[400px] rounded-xl border border-[#c9a84c]/30 flex flex-col justify-between transition-colors hover:bg-[#f0eee9]">
                <div>
                  <h3 className="font-headline-lg text-headline-lg mb-4 text-primary">{secao.secao}</h3>
                  <ul className="space-y-4 font-body-md text-body-md text-[#4d4540]">
                    {secao.itens.map((item) => (
                      <li key={item.slug}>
                        <Link href={`/catequese/${secao.id}/${item.slug}`} className="flex items-center hover:text-primary transition-colors">
                          {item.titulo}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
