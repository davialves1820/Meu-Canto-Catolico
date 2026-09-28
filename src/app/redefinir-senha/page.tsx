import { Suspense } from "react";
import { Metadata } from "next";
import RedefinirSenhaForm from "@/components/auth/RedefinirSenhaForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { pageMetadata } from "@/lib/shared/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Redefinir senha",
  description: "Escolha uma nova senha para sua conta no Meu Canto Católico.",
  path: "/redefinir-senha",
  noIndex: true,
});

export default function RedefinirSenhaPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 py-12 md:py-20 px-5 md:px-16">
        <Breadcrumb items={[{ label: "Redefinir senha" }]} className="max-w-md mx-auto mb-8" />

        <div className="max-w-md mx-auto bg-surface-container-lowest border border-secondary/10 rounded-2xl shadow-xl p-8 sm:p-12">
          <div className="mb-8">
            <h1 className="font-headline-xl text-primary mb-3">Redefinir senha</h1>
            <p className="font-body-md text-on-surface-variant">
              Escolha uma nova senha para sua conta.
            </p>
          </div>

          <Suspense fallback={null}>
            <RedefinirSenhaForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
