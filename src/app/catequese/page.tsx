import { Metadata } from 'next';
import { HeroSection } from '@/components/catequese/HeroSection';
import { CategoryGrid } from '@/components/catequese/CategoryGrid';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { pageMetadata } from '@/lib/shared/pageMetadata';

export const metadata: Metadata = pageMetadata({
  title: 'Catequese',
  description: 'Explore os fundamentos da Igreja Católica: os Sete Sacramentos, a Santa Missa, as Festas e os Períodos Litúrgicos, e os Dias de Preceito.',
  path: '/catequese',
  keywords: ['catequese católica', 'sacramentos', 'festas litúrgicas', 'períodos litúrgicos'],
});

export default function CatequesePage() {
  return (
    <div className="bg-[#fbf9f4] text-[#1b1c19] selection:bg-[#ffe08f]/30 selection:text-[#584400]">
      <Breadcrumb items={[{ label: "Catequese" }]} />
      <HeroSection />
      <CategoryGrid />
    </div>
  );
}
