import { redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { auth, signOut } from "@/auth";
import { buscarDataCadastro } from "@/lib/server/services/usuarios";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { pageMetadata } from "@/lib/shared/pageMetadata";
import { RECURSOS } from "@/config/recursos";
import ContaBanner from "@/components/auth/ContaBanner";

export const metadata: Metadata = pageMetadata({
  title: "Meu Perfil",
  description: "Seu perfil no Meu Canto Católico.",
  path: "/conta",
  noIndex: true,
});

async function sair() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function ContaPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/entrar?callbackUrl=/conta");
  }

  const criadoEm = await buscarDataCadastro(session.user.id);
  const membroDesde = criadoEm
    ? new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(criadoEm)
    : "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 py-12 md:py-20 px-5 md:px-16">
        <Breadcrumb items={[{ label: "Meu Perfil" }]} className="max-w-[1140px] mx-auto mb-8" />

        <div className="max-w-[1140px] mx-auto space-y-8">
          <ContaBanner
            nomeInicial={session.user.name ?? ""}
            email={session.user.email ?? ""}
            avatarUrlInicial={session.user.image ?? null}
            membroDesde={membroDesde}
            onSignOut={sair}
          />

          <div className="bg-surface-container-lowest border border-secondary/10 rounded-2xl p-6 sm:p-8">
            <h2 className="font-headline-md text-primary mb-6">Explorar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {RECURSOS.map(({ href, icone: Icone, titulo }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center text-center gap-2 p-5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
                >
                  <Icone size={24} className="text-primary" aria-hidden="true" />
                  <span className="font-label-sm text-xs text-on-surface uppercase tracking-wider">{titulo}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
