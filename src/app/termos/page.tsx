import { Metadata } from "next";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { pageMetadata } from "@/lib/shared/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Termos de Uso",
  description: "Termos de uso do Meu Canto Católico.",
  path: "/termos",
});

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 py-16 md:py-24 px-5 md:px-16">
        <div className="max-w-2xl mx-auto">
          <Breadcrumb items={[{ label: "Termos de Uso" }]} className="mb-6" />
          <h1 className="font-headline-xl text-primary mb-8">Termos de Uso</h1>

          <div className="space-y-6 font-body-md text-on-surface-variant leading-relaxed">
            <p>
              O Meu Canto Católico é um site devocional gratuito. Ao criar uma conta, você concorda em usá-la
              de boa-fé, sem tentar burlar limites de uso, sobrecarregar o serviço ou acessar dados de outros
              usuários.
            </p>
            <p>
              Sua conta é pessoal e intransferível. Você é responsável por manter sua senha em sigilo.
            </p>
            <p>
              O conteúdo devocional (liturgia, bíblia, santos, orações) é fornecido para fins de estudo e
              oração pessoal, com base em fontes públicas e tradição católica. O site pode ficar
              indisponível temporariamente para manutenção.
            </p>
            <p>
              Podemos atualizar estes termos conforme o site evolui — mudanças relevantes serão refletidas
              nesta página.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
