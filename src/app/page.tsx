import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fantasy X - La Red Social de los Reinos Oscuros",
  description:
    "Unete a Fantasy X, la red social dark fantasy. Publica proclamaciones, envia mensajes oscuros, personaliza tu perfil de guerrero y explora los reinos.",
};

export default async function Home() {
  const session = await getSession();
  if (session) {
    redirect("/muro");
  }

  return (
    <div className="min-h-screen flex flex-col vignette">
      {/* Hero */}
      <header className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center relative">
        <div className="slide-up max-w-2xl mx-auto">
          <div className="torch-glow inline-block mb-6">
            <h1 className="fantasy-title glow-text text-5xl sm:text-7xl tracking-wide">
              Fantasy X
            </h1>
          </div>

          <div className="ornament mt-4 mb-6">
            <span className="ornament-diamond" />
          </div>

          <p className="text-[var(--color-text-secondary)] text-lg sm:text-xl italic leading-relaxed max-w-lg mx-auto">
            La red social de los reinos oscuros. Comparte tus proclamaciones,
            forja alianzas y susurra en la sombra.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/login"
              className="btn-fantasy px-8 py-3 text-sm w-full sm:w-auto text-center"
            >
              Entrar al Castillo
            </Link>
            <Link
              href="/login?registro=1"
              className="btn-ghost px-8 py-3 text-sm w-full sm:w-auto text-center border border-[var(--color-border-glow)] hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              Forjar un Alma Nueva
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="px-4 pb-16 max-w-4xl mx-auto w-full">
        <div className="ornament mb-10">
          <span className="ornament-diamond" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="castle-card p-6 text-center fade-in">
            <div className="mb-4 flex justify-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1.5" className="opacity-80">
                <path d="M5 30V15l5-5V5h4v3l6-6 6 6V5h4v5l5 5v15H5z" />
                <rect x="16" y="22" width="8" height="8" />
                <rect x="8" y="18" width="5" height="5" />
                <rect x="27" y="18" width="5" height="5" />
              </svg>
            </div>
            <h3 className="fantasy-title text-[var(--color-accent-gold)] text-xs mb-2">
              Muro del Reino
            </h3>
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
              Publica proclamaciones con imagenes, videos y audio. Dale &ldquo;me gusta&rdquo; y comenta las de otros.
            </p>
          </div>

          <div className="castle-card p-6 text-center fade-in">
            <div className="mb-4 flex justify-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--color-accent-purple)" strokeWidth="1.5" className="opacity-80">
                <path d="M5 8h30v18H12l-7 7V8z" />
                <path d="M12 15h16M12 20h10" strokeWidth="1" />
              </svg>
            </div>
            <h3 className="fantasy-title text-[var(--color-accent-purple)] text-xs mb-2">
              Mensajes Oscuros
            </h3>
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
              Susurra en privado con otros guerreros. Mensajes directos con notificaciones.
            </p>
          </div>

          <div className="castle-card p-6 text-center fade-in">
            <div className="mb-4 flex justify-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--color-accent-red)" strokeWidth="1.5" className="opacity-80">
                <circle cx="20" cy="14" r="7" />
                <path d="M6 35c0-7 6-12 14-12s14 5 14 12" />
              </svg>
            </div>
            <h3 className="fantasy-title text-[var(--color-accent-red)] text-xs mb-2">
              Perfil de Guerrero
            </h3>
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
              Personaliza tu avatar, banner, nombre y elige tu reino. Visita perfiles de otros.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-[var(--color-border-dark)]">
        <p className="text-[var(--color-text-muted)] text-xs italic">
          Fantasy X — Los reinos oscuros te esperan
        </p>
      </footer>
    </div>
  );
}
