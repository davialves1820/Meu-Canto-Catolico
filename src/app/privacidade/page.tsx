import { Metadata } from "next";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { pageMetadata } from "@/lib/shared/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Política de Privacidade",
  description: "Política de privacidade do Meu Canto Católico.",
  path: "/privacidade",
});

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 py-16 md:py-24 px-5 md:px-16">
        <div className="max-w-2xl mx-auto">
          <Breadcrumb items={[{ label: "Política de Privacidade" }]} className="mb-6" />
          <h1 className="font-headline-xl text-primary mb-8">Política de Privacidade</h1>

          <div className="space-y-6 font-body-md text-on-surface-variant leading-relaxed">
            <p>
              Ao criar uma conta no Meu Canto Católico, coletamos apenas o necessário para o funcionamento
              dela: seu nome, e-mail e senha (armazenada de forma criptografada, nunca em texto puro).
              Se você enviar uma foto de perfil, ela fica hospedada em um serviço de armazenamento de
              arquivos (Vercel Blob) e é usada apenas para exibição na sua conta.
            </p>
            <p>
              Se você estiver conectado, guardamos também o seu progresso nas novenas e no Rosário (os
              dias rezados e onde você parou), para que possa continuar em outro aparelho. Como revela a
              sua prática religiosa, é um dado pessoal sensível: usamos apenas para mostrar o progresso a
              você, sem compartilhar com ninguém. Ele é apagado junto com a conta. Sem login, o
              progresso fica só no seu navegador; se você entrar na conta no mesmo aparelho, o que foi
              feito sem login é juntado a ela.
            </p>
            <p>
              O Exame de Consciência não é enviado nem guardado por nós.
            </p>
            <p>
              Não vendemos nem compartilhamos seus dados com terceiros para fins de marketing.
              Usamos um cookie de sessão para manter você conectado — ele é necessário para o login
              funcionar e não é usado para rastreamento entre sites.
            </p>
            <p>
              Você pode pedir a exclusão da sua conta e dos seus dados a qualquer momento entrando em
              contato com a equipe do site.
            </p>
            <p>
              Podemos atualizar esta política conforme o site evolui — mudanças relevantes serão
              refletidas nesta página.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
