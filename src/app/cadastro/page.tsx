import { Metadata } from "next";
import CadastroForm from "@/components/auth/CadastroForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { pageMetadata } from "@/lib/shared/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Criar Conta",
  description: "Crie sua conta no Meu Canto Católico.",
  path: "/cadastro",
  noIndex: true,
});

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 py-12 md:py-20 px-5 md:px-16">
        <Breadcrumb items={[{ label: "Criar Conta" }]} className="max-w-md mx-auto mb-8" />

        <div className="max-w-md mx-auto bg-surface-container-lowest border border-secondary/10 rounded-2xl shadow-xl p-8 sm:p-12">
          <div className="mb-8">
            <h1 className="font-headline-xl text-primary mb-3">Criar sua Conta</h1>
            <p className="font-body-md text-on-surface-variant">
              Comece gratuitamente sua jornada pelas Escrituras e Tradição Católica.
            </p>
          </div>

          <CadastroForm />
        </div>
      </main>
    </div>
  );
}
