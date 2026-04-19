export default function HomePage() {
  return (
    <div className="aesthete-page bg-background text-on-background">
      <nav className="fixed top-0 z-50 w-full bg-[#fbf9f6]/80 shadow-[0_40px_60px_rgba(49,51,48,0.05)] backdrop-blur-xl transition-all duration-500">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-12 lg:py-6">
          <div className="font-serif text-sm tracking-[0.2em] text-[#313330] sm:text-xl">AESTHETE AI</div>
          <div className="hidden items-center gap-10 lg:flex">
            <a className="border-b border-[#58624e]/20 text-[12px] font-medium uppercase tracking-[0.1em] text-[#58624e]" href="#">
              Soluciones
            </a>
            <a className="text-[12px] uppercase tracking-[0.1em] text-[#313330]/60 transition-all duration-500 hover:text-[#58624e]" href="#">
              Infraestructura
            </a>
            <a className="text-[12px] uppercase tracking-[0.1em] text-[#313330]/60 transition-all duration-500 hover:text-[#58624e]" href="#">
              Inteligencia
            </a>
            <a className="text-[12px] uppercase tracking-[0.1em] text-[#313330]/60 transition-all duration-500 hover:text-[#58624e]" href="#">
              Red
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            <button className="text-[10px] uppercase tracking-[0.1em] text-[#313330]/60 transition-all duration-500 hover:text-[#58624e] sm:text-[12px]">
              Ingresar
            </button>
            <button className="bg-primary px-3 py-2 text-[10px] font-medium uppercase tracking-[0.15em] text-on-primary transition-transform active:scale-95 sm:px-6 sm:py-2.5 sm:text-[11px]">
              Solicitar acceso
            </button>
          </div>
        </div>
      </nav>

      <main className="bg-background pt-20 text-on-background selection:bg-[#dce6cd] selection:text-[#4b5542] sm:pt-24">
        <section className="mx-auto flex max-w-7xl items-center overflow-hidden px-4 py-10 sm:px-6 lg:min-h-screen lg:px-12 lg:py-0">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-8 lg:col-span-6 lg:space-y-10">
              <div className="space-y-5 sm:space-y-6">
                <h1 className="letter-spacing-display text-4xl font-normal leading-[1.08] text-on-background sm:text-5xl lg:text-6xl lg:leading-[1.1]">
                  La mayoría de las inmobiliarias no necesitan <span className="italic text-[#58624e]/80">más leads</span>. Necesitan saber cuáles van a cerrar.
                </h1>
                <p className="max-w-xl text-base font-light leading-relaxed text-on-surface-variant sm:text-lg">
                  Un sistema de ventas con IA que identifica compradores serios, recomienda el siguiente paso y ayuda a tu equipo a enfocarse donde hay más chances de concretar.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <button className="w-fit bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-widest text-on-primary shadow-lg transition-transform active:scale-[0.98] sm:px-10 sm:py-5 sm:text-sm">
                  Reservar demo privada
                </button>
                <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-outline">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  Normalmente reduce el tiempo de respuesta en 70%
                </p>
              </div>
            </div>

            <div className="relative lg:col-span-6">
              <div className="absolute -right-20 -top-20 -z-10 hidden h-[120%] w-[120%] rounded-full bg-surface-container opacity-50 blur-3xl lg:block"></div>
              <div className="relative space-y-4">
                <div className="relative z-10 border-l-2 border-primary/20 bg-surface-container-lowest p-5 shadow-[0_40px_80px_-20px_rgba(49,51,48,0.1)] sm:p-8">
                  <div className="mb-6 flex items-start justify-between sm:mb-8">
                    <div>
                      <span className="mb-1 block text-[10px] uppercase tracking-widest text-outline">Análisis del lead</span>
                      <h3 className="serif text-xl italic">Valeria Di Rossy</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-light text-primary">82%</span>
                      <span className="block text-[10px] uppercase tracking-widest text-outline">Probabilidad de cierre</span>
                    </div>
                  </div>
                  <div className="space-y-4 border-t border-surface-container pt-5 sm:pt-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <span className="material-symbols-outlined text-lg text-primary">lightbulb</span>
                      <p className="text-sm leading-relaxed text-on-surface">Este lead tiene alta probabilidad de agendar una visita dentro de 3 días.</p>
                    </div>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <span className="material-symbols-outlined text-lg text-primary">rocket_launch</span>
                      <div className="w-full bg-surface-container-low p-4">
                        <span className="mb-2 block text-[10px] uppercase tracking-widest text-outline">Movimiento recomendado</span>
                        <p className="text-sm font-medium">Mostrar 2 propiedades en Palermo y sugerir una llamada mañana.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-20 ml-auto w-full bg-surface-container p-4 shadow-xl sm:p-6 lg:-mt-8 lg:w-[85%]">
                  <div className="flex items-center gap-4">
                    <img
                      alt=""
                      className="h-16 w-16 object-cover grayscale brightness-110"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUZ7WQrGPfrLOgpeN-T8hDVZ-ex8nCFeSsy3bZ4SO6vE8X9r8-_KsOOBLqX_MFhqzMqgTiQj_kWtXdTVlhM6yliPpqROfKd7y2eGjvbjjxNz95Uml17ov5xE27RAzfb7fKUIcwBNKWowCrvKG5lH1R1hCP8Bc8fkXhkuapbL1QX6bgOte8JeQk5-8FyK9Q-IOc5JDMk8vPKJ5ouy7uXfof9YFB1RiIg3tIGtpXLY_2qIiGdXWQNkKY189IZfAkYotbRRgMKO9xVoWA"
                    />
                    <div>
                      <span className="mb-1 block text-[10px] uppercase tracking-widest text-outline">Mejor match</span>
                      <p className="text-xs font-semibold">Palazzo Della Flora, Unidad 12B</p>
                      <p className="mt-1 text-[11px] italic text-on-surface-variant">
                        Encaja por presupuesto del comprador y preferencia arquitectónica por diseño brutalista.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-30 flex items-center gap-3 border-l border-error bg-error-container/10 px-4 py-3 backdrop-blur-md lg:absolute lg:-left-12 lg:bottom-20">
                  <span className="material-symbols-outlined text-sm text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                    warning
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-on-error-container">
                    Alto riesgo si se ignora en las próximas 4h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
            <div className="mb-12 max-w-3xl sm:mb-16 lg:mb-24">
              <h2 className="letter-spacing-display text-3xl font-normal leading-tight text-on-background sm:text-4xl lg:text-5xl">
                Ya estás pagando por leads. <br />Solo estás <span className="italic text-error-dim">perdiendo</span> los mejores.
              </h2>
            </div>
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-20">
              <div className="relative h-[300px] sm:h-[360px] lg:col-span-7 lg:h-[400px]">
                <div className="absolute left-0 top-0 rotate-2 border border-outline-variant/10 bg-surface-container-lowest p-3 text-xs opacity-40 blur-[1px] sm:p-4">
                  Lead #4928 - Consulta
                </div>
                <div className="absolute left-24 top-16 -rotate-3 border border-outline-variant/10 bg-surface-container-lowest p-3 text-xs opacity-60 shadow-sm sm:left-40 sm:top-20 sm:p-4">
                  Lead #5011 - Facebook
                </div>
                <div className="absolute bottom-10 left-8 rotate-6 border border-outline-variant/10 bg-surface-container-lowest p-3 text-xs opacity-30 blur-[2px] sm:left-10 sm:p-4">
                  Lead #3882 - Web
                </div>
                <div className="absolute left-1/3 top-1/2 rotate-1 border border-outline-variant/10 bg-surface-container-lowest p-3 text-xs opacity-50 sm:p-4">
                  Lead #4001 - Portal
                </div>
                <div className="absolute bottom-1/4 right-1/4 -rotate-6 border border-outline-variant/10 bg-surface-container-lowest p-3 text-xs opacity-70 shadow-md sm:p-4">
                  Lead #4122 - Referido
                </div>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
                  <span className="material-symbols-outlined text-[90px] font-extralight text-outline sm:text-[120px]">grain</span>
                </div>
              </div>

              <div className="relative bg-surface-container-lowest p-6 shadow-2xl sm:p-10 lg:col-span-5">
                <div className="absolute -left-3 -top-3 bg-primary p-3 text-[9px] font-bold uppercase tracking-widest text-on-primary sm:-left-6 sm:-top-6 sm:p-4 sm:text-[10px]">
                  La oportunidad
                </div>
                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-surface-container pb-6">
                    <h4 className="serif text-2xl italic">Dra. Elena Sterling</h4>
                    <span className="text-lg font-bold text-primary">94%</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs uppercase tracking-widest text-outline">
                      <span>Intensidad de señales</span>
                      <span className="text-on-surface">Muy alta</span>
                    </div>
                    <div className="h-1 w-full bg-surface-container">
                      <div className="h-full w-[94%] bg-primary"></div>
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-6">
                    <p className="text-sm italic leading-relaxed text-on-surface-variant">
                      &quot;Detectamos 4 visitas separadas a la planta &apos;Penthouse Terrace&apos; en los últimos 12 minutos. Perfil de alta urgencia.&quot;
                    </p>
                  </div>
                  <button className="w-full border border-primary py-4 text-[11px] font-bold uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-on-primary">
                    Contactar ahora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface py-16 sm:py-24 lg:py-40">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-12">
            <div className="lg:col-span-5">
              <img
                alt=""
                className="h-[340px] w-full object-cover grayscale brightness-105 shadow-2xl sm:h-[480px] lg:h-[600px]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfh9p4s4u3O2k_qb2f0NHT79FpQ2BtUOtmWJ7swUvCSRNv7-slhXqw1jcYWpvn7-o51UPqeMNcGKkKroZaoo1eCUXB9Lf4mbfyrumfTT_Io6ZVuvkokqz2V8QUmnhsx2MtufVMohVOEfdwFZv256MOScYrLOnzCf391S4tEK56h6A9IBPoqcIpq2txDR7wS2Y56IVVXOCKMeMiVDXx6qw0dr-XATnDzUofzPIa5vf8XU9bEMdh_G5wmR9dadKwCOHjpGSSXxITIc8t"
              />
            </div>
            <div className="space-y-10 lg:col-span-7 lg:space-y-12 lg:pl-12">
              <h2 className="letter-spacing-display text-4xl font-normal leading-tight sm:text-5xl lg:text-6xl">
                Sabé quién realmente tiene chances <span className="italic text-primary">de cerrar.</span>
              </h2>
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-12 lg:gap-y-16">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">01 / Seriedad</span>
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    Nuestra IA analiza huellas digitales para distinguir curiosos de inversores con intención real.
                  </p>
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">02 / Urgencia</span>
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    Disparadores en tiempo real detectan ventanas de oportunidad antes de que se cierren.
                  </p>
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">03 / Capacidad</span>
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    Verificación automatizada de presupuesto y activos sin preguntas invasivas.
                  </p>
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">04 / Precisión</span>
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    Matching geográfico y arquitectónico según perfiles históricos de preferencia.
                  </p>
                </div>
              </div>
              <div className="pt-4 sm:pt-8">
                <p className="serif max-w-lg text-xl font-light italic leading-relaxed text-on-background opacity-60 sm:text-2xl">
                  No solo contamos clics. Medimos compromiso.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-surface-container-low py-16 sm:py-24 lg:py-40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
            <div className="mx-auto mb-12 max-w-3xl space-y-4 text-center sm:mb-16 lg:mb-24">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">El playbook</span>
              <h2 className="letter-spacing-display text-3xl font-normal leading-tight sm:text-4xl lg:text-5xl">
                Sabé qué hacer después, antes de que el comprador desaparezca.
              </h2>
            </div>
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-1">
              <div className="flex min-h-[280px] flex-1 flex-col justify-between border-r border-surface-container-low bg-surface-container-lowest p-6 shadow-sm sm:p-8 lg:h-[380px] lg:p-10">
                <div className="space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary">auto_awesome</span>
                  <h4 className="serif text-xl">Identificar acción</h4>
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  La IA analiza el punto de fricción en el recorrido del lead y sugiere el próximo contacto exacto.
                </p>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Paso uno</div>
              </div>

              <div className="relative z-10 flex min-h-[300px] flex-1 flex-col justify-between bg-surface-container-lowest p-6 shadow-xl sm:p-8 lg:h-[420px] lg:scale-105 lg:p-10">
                <div className="space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary">house</span>
                  <h4 className="serif text-xl">Propiedad ideal</h4>
                </div>
                <div className="border border-surface-container-high bg-surface p-4">
                  <p className="mb-2 text-[10px] uppercase tracking-widest text-outline">Activo con mejor encaje</p>
                  <p className="text-xs font-semibold">The Obsidian Heights — Loft 4</p>
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Coincide con los atributos específicos con los que el comprador más interactuó en su búsqueda.
                </p>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Paso dos</div>
              </div>

              <div className="flex min-h-[280px] flex-1 flex-col justify-between border-l border-surface-container-low bg-surface-container-lowest p-6 shadow-sm sm:p-8 lg:h-[380px] lg:p-10">
                <div className="space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary">schedule</span>
                  <h4 className="serif text-xl">Momento ideal</h4>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Enviar a las 10:15</span>
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Los datos históricos muestran que este comprador responde más en media mañana.
                </p>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Paso tres</div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
            <div className="mb-16 flex flex-col items-center justify-between gap-10 border-b border-surface-container pb-12 md:flex-row md:gap-16 lg:mb-32 lg:pb-20">
              <div className="flex-1 text-center md:text-left">
                <span className="mb-2 block font-serif text-5xl text-primary">35%</span>
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-outline">más visitas calificadas</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <span className="mb-2 block font-serif text-5xl text-primary">2x</span>
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-outline">más seguimientos completados</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <span className="mb-2 block font-serif text-5xl text-primary">70%</span>
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-outline">respuesta más rápida</span>
              </div>
            </div>

            <div className="mx-auto max-w-4xl space-y-8 text-center sm:space-y-10">
              <span className="material-symbols-outlined text-4xl text-[#58624e]/30 sm:text-5xl">format_quote</span>
              <blockquote className="serif text-2xl italic leading-snug text-on-background sm:text-3xl lg:text-4xl">
                &quot;Por primera vez sabemos qué leads realmente merecen la atención del equipo. Nuestra conversión no solo subió: evolucionó.&quot;
              </blockquote>
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.25em]">Julian Vane</span>
                <span className="text-[10px] uppercase tracking-widest text-outline">Fundador, Vane Global Realty</span>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface-container-high py-24 sm:py-32 lg:py-48">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
            <span className="material-symbols-outlined text-[320px] sm:text-[500px] lg:text-[800px]">fingerprint</span>
          </div>
          <div className="relative z-10 mx-auto max-w-4xl space-y-10 px-4 text-center sm:space-y-12 sm:px-6 lg:px-12">
            <div className="space-y-6">
              <h2 className="letter-spacing-display text-3xl font-normal leading-tight sm:text-4xl lg:text-5xl">
                Descubrí qué oportunidades está perdiendo tu inmobiliaria y qué hacer al respecto.
              </h2>
              <p className="mx-auto max-w-2xl text-base font-light leading-relaxed text-on-surface-variant sm:text-lg">
                Una recorrida privada para inmobiliarias que quieren obtener más de los leads que ya generan.
              </p>
            </div>
            <div className="space-y-8">
              <button className="bg-primary px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-on-primary shadow-2xl transition-transform active:scale-95 sm:px-16 sm:py-6 sm:text-sm sm:tracking-[0.25em]">
                Reservar demo privada
              </button>
              <div className="flex items-center justify-center gap-2">
                <span className="h-px w-8 bg-[#7a7b77]/20 sm:w-12"></span>
                <p className="text-[10px] italic uppercase tracking-[0.2em] text-outline">
                  Actualmente incorporando un número limitado de agencias
                </p>
                <span className="h-px w-8 bg-[#7a7b77]/20 sm:w-12"></span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-surface-container py-12 text-[#58624e] sm:py-16 lg:py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-center sm:px-6 md:flex-row md:gap-8 md:text-left lg:px-12">
          <div className="font-serif text-lg tracking-widest text-[#313330]">AESTHETE AI</div>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-10">
            <a className="font-sans text-[12px] uppercase tracking-widest text-[#313330]/40 transition-colors hover:text-[#58624e]" href="#">
              Infraestructura
            </a>
            <a className="font-sans text-[12px] uppercase tracking-widest text-[#313330]/40 transition-colors hover:text-[#58624e]" href="#">
              Privacidad
            </a>
            <a className="font-sans text-[12px] uppercase tracking-widest text-[#313330]/40 transition-colors hover:text-[#58624e]" href="#">
              Términos
            </a>
            <a className="font-sans text-[12px] uppercase tracking-widest text-[#313330]/40 transition-colors hover:text-[#58624e]" href="#">
              Contacto
            </a>
          </div>
          <div className="font-sans text-[11px] uppercase tracking-widest text-[#313330]/40 sm:text-[12px]">
            © 2024 Aesthete AI. El atelier digital para real estate.
          </div>
        </div>
      </footer>
    </div>
  );
}
