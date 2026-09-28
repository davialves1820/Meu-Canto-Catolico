import { Metadata } from "next";
import EsqueciSenhaForm from "@/components/auth/EsqueciSenhaForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { pageMetadata } from "@/lib/shared/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Esqueci minha senha",
  description: "Redefina a senha da sua conta no Meu Canto Católico.",
  path: "/esqueci-senha",
  noIndex: true,
});

export default function EsqueciSenhaPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 py-12 md:py-20 px-5 md:px-16">
        <Breadcrumb items={[{ label: "Esqueci minha senha" }]} className="max-w-md mx-auto mb-8" />

        <div className="max-w-md mx-auto bg-surface-container-lowest border border-secondary/10 rounded-2xl shadow-xl p-8 sm:p-12">
          <div className="mb-8">
            <h1 className="font-headline-xl text-primary mb-3">Esqueci minha senha</h1>
            <p className="font-body-md text-on-surface-variant">
              Informe o e-mail da sua conta e enviaremos um link para você escolher uma nova senha.
            </p>
          </div>

          <EsqueciSenhaForm />
        </div>
      </main>
    </div>
  );
}
