import { JsonLd } from "@/components/shared/JsonLd";
import { absoluteUrl } from "@/config/site";

export interface BreadcrumbItem {
  label: string;
  /** Omitir no último item (página atual). */
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Sem efeito desde que a trilha deixou de ser exibida; mantido para não mexer nos chamadores. */
  className?: string;
}

/** BreadcrumbList (Schema.org) para SEO; não renderiza nada visível. */
export function Breadcrumb({ items }: BreadcrumbProps) {
  const full: BreadcrumbItem[] = [{ label: "Início", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: full.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };

  return <JsonLd data={jsonLd} />;
}
