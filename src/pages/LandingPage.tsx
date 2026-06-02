import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dumbbell,
  Target,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  LineChart,
  ClipboardCheck,
  UserCheck,
  Sparkles,
  Gift,
  Menu,
  X,
} from "lucide-react";
import { themeClasses, cn } from "../theme/constants";
import { useColors } from "../theme";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const colors = useColors();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Configurar scroll-snap solo en PC (pantallas grandes)
  useEffect(() => {
    const applyScrollSnap = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint de Tailwind (1024px)
        // Usar "proximity" en lugar de "mandatory" para permitir scroll libre
        document.documentElement.style.scrollSnapType = "y proximity";
        document.documentElement.style.scrollBehavior = "smooth";
      } else {
        document.documentElement.style.scrollSnapType = "none";
        document.documentElement.style.scrollBehavior = "auto";
      }
    };

    // Aplicar al montar
    applyScrollSnap();

    // Aplicar al redimensionar
    window.addEventListener("resize", applyScrollSnap);

    // Limpiar al desmontar
    return () => {
      window.removeEventListener("resize", applyScrollSnap);
      document.documentElement.style.scrollSnapType = "none";
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  const problemPoints = [
    {
      icon: TrendingUp,
      text: "Te estancas y no sabes por qué",
      color: "text-red-400",
    },
    {
      icon: Target,
      text: "No llevas registro de tu progreso",
      color: "text-orange-400",
    },
    {
      icon: Users,
      text: "Es difícil contactar coaches profesionales",
      color: "text-yellow-400",
    },
  ];

  const solutionFeatures = [
    {
      icon: ClipboardCheck,
      title: "Registro al Pie de la Letra",
      description:
        "Registra series, repeticiones, peso y RPE en cada entrenamiento. Nunca más olvides qué hiciste la última vez.",
      gradient: "from-lime-400/20 to-lime-500/20",
      iconColor: "text-lime-400",
      highlight: "Precisión total",
    },
    {
      icon: LineChart,
      title: "Métricas Visuales de Progreso",
      description:
        "Visualiza tu evolución en pesos, repeticiones y rendimiento con gráficos claros. Ve tu progreso día, semana, mes y año.",
      gradient: "from-green-500/20 to-green-600/20",
      iconColor: "text-green-400",
      highlight: "Lo que no se mide no se puede mejorar",
    },
    {
      icon: Calendar,
      title: "Rutinas Organizadas por Día",
      description:
        "Ve tu rutina del día al instante. Sistema de días consecutivos que se adapta a tu ritmo de entrenamiento.",
      gradient: "from-purple-500/20 to-purple-600/20",
      iconColor: "text-purple-400",
      highlight: "Siempre sabes qué hacer",
    },
    {
      icon: BarChart3,
      title: "Análisis Detallado",
      description:
        "Apartados fácilmente localizables para ver tu progreso. Compara tu rendimiento actual con semanas anteriores.",
      gradient: "from-lime-400/20 to-lime-500/20",
      iconColor: "text-lime-400",
      highlight: "Datos que importan",
    },
    {
      icon: UserCheck,
      title: "Para Coaches y Usuarios",
      description:
        "Los coaches pueden llevar registro de sus usuarios. Los usuarios pueden entrenar solos o con un profesional.",
      gradient: "from-pink-500/20 to-pink-600/20",
      iconColor: "text-pink-400",
      highlight: "Flexible para todos",
    },
    {
      icon: Gift,
      title: "Gratis por Tiempo Limitado",
      description:
        "Accede a todas las funciones sin costo durante el período de lanzamiento. Próximamente habrá planes de pago para coaches y usuarios individuales (principalmente por almacenamiento en la nube).",
      gradient: "from-cyan-500/20 to-cyan-600/20",
      iconColor: "text-cyan-400",
      highlight: "Oferta de lanzamiento",
    },
  ];

  const dailyFlow = [
    {
      step: "1",
      icon: Calendar,
      title: "Abre la App",
      description: "Ve tu rutina del día al instante",
    },
    {
      step: "2",
      icon: ClipboardCheck,
      title: "Registra tu Entrenamiento",
      description: "Anota series, repeticiones, peso y RPE",
    },
    {
      step: "3",
      icon: TrendingUp,
      title: "Guarda tu Progreso",
      description: "Tus datos se guardan automáticamente",
    },
    {
      step: "4",
      icon: LineChart,
      title: "Visualiza tu Evolución",
      description: "Ve cómo mejoras con el tiempo",
    },
  ];

  const benefits = [
    "Acceso completo a todas las funciones - Gratis por tiempo limitado",
    "Sin anuncios molestos",
    "Datos seguros y privados en la nube",
    "Registros detallados por día, semana, mes y año",
    "Configura tus rutinas y ejercicios sin límites",
    "Visualización clara de tu progreso",
  ];

  const coachFeatures = [
    {
      title: "Gestión de Usuarios",
      description:
        "Lleva registro detallado de todos tus clientes en un solo lugar",
      coming: "Próximamente",
    },
    {
      title: "Análisis de Progreso",
      description:
        "Visualiza el progreso de tus usuarios con métricas profesionales",
      coming: "Próximamente",
    },
    {
      title: "Rutinas Personalizadas",
      description: "Crea y asigna rutinas específicas para cada usuario",
      coming: "Próximamente",
    },
    {
      title: "Comunicación Directa",
      description: "Mantén contacto cercano con tus usuarios",
      coming: "Próximamente",
    },
  ];

  return (
    <div className={cn("min-h-screen", themeClasses.backgrounds.primary)}>
      {/* Header */}
      <header
        ref={menuRef}
        className={cn(
          "sticky top-0 z-50 backdrop-blur-md border-b",
          themeClasses.backgrounds.secondary,
          themeClasses.borders.default
        )}
        style={{ borderColor: colors.border.default }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div
            className={cn(themeClasses.layout.flexBetween, "flex-wrap gap-2")}
          >
            <div
              className={cn(themeClasses.layout.flexCenter, "gap-2 sm:gap-3")}
            >
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: colors.button.primary.bg,
                }}
              >
                <Dumbbell className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <h1
                className="text-xl sm:text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                GymTrack
              </h1>
            </div>
            {/* Botones desktop - ocultos en móvil */}
            <div
              className={cn(
                themeClasses.layout.flexCenter,
                "gap-2 sm:gap-4 hidden sm:flex"
              )}
            >
              <button
                onClick={() => navigate("/login")}
                className={cn(
                  themeClasses.buttons.ghost,
                  "px-3 sm:px-6 text-sm sm:text-base"
                )}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => navigate("/login")}
                className={cn(
                  themeClasses.buttons.primary,
                  "px-3 sm:px-6 text-sm sm:text-base"
                )}
              >
                Registrarse
              </button>
            </div>
            {/* Botón hamburguesa - solo visible en móvil */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "sm:hidden p-2 rounded-lg transition-colors",
                "hover:bg-opacity-10"
              )}
              style={{
                color: colors.text.primary,
                backgroundColor: isMenuOpen
                  ? colors.background.tertiary
                  : "transparent",
              }}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menú desplegable móvil */}
        {isMenuOpen && (
          <div
            className="sm:hidden border-t"
            style={{
              borderColor: colors.border.default,
              backgroundColor: colors.background.secondary,
            }}
          >
            <nav className="px-4 py-3 space-y-1">
              <button
                onClick={() => {
                  navigate("/login");
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-lg transition-colors",
                  "hover:bg-opacity-10"
                )}
                style={{
                  color: colors.text.primary,
                  backgroundColor: colors.background.tertiary + "40",
                }}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => {
                  navigate("/login");
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-lg transition-colors font-semibold",
                  "hover:opacity-90"
                )}
                style={{
                  color: "white",
                  background: colors.button.primary.bg,
                }}
              >
                Registrarse
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-4 md:py-20 w-full lg:min-h-screen lg:py-0 lg:flex lg:items-center"
        style={{ scrollSnapAlign: "start" }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
          <div className="text-center max-w-5xl mx-auto w-full">
            {/* Trust Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border"
              style={{
                backgroundColor: colors.background.tertiary,
                borderColor: colors.border.default,
              }}
            >
              <Gift
                className="w-4 h-4"
                style={{ color: colors.status.success }}
              />
              <span
                style={{ color: colors.text.secondary }}
                className="text-sm font-medium"
              >
                Gratis por Tiempo Limitado - Acceso Completo
              </span>
            </div>

            {/* Main Headline - Más profesional y legible */}
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-[1.15] tracking-tight"
              style={{ color: colors.text.primary }}
            >
              El seguimiento preciso que necesitas
              <br className="hidden sm:block" />
              <span
                className="block sm:inline"
                style={{ color: colors.primary[400] }}
              >
                {" "}
                para superar tu estancamiento
              </span>
            </h2>

            {/* Subheadline - Más conciso y legible */}
            <p
              className="text-base sm:text-lg lg:text-xl mb-6 max-w-3xl mx-auto leading-relaxed font-normal"
              style={{ color: colors.text.secondary }}
            >
              Registra cada ejercicio con precisión y visualiza tu progreso con
              métricas claras
            </p>

            {/* Value Proposition - Destacado pero no intrusivo */}
            <div className="mb-8">
              <p
                className="text-sm sm:text-base lg:text-lg font-medium max-w-2xl mx-auto italic"
                style={{ color: colors.primary[300] }}
              >
                "Lo que no se mide, no se puede mejorar"
              </p>
            </div>

            {/* Problem Points - Más compactos y profesionales */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              {problemPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all hover:scale-105"
                    style={{
                      backgroundColor: colors.background.tertiary,
                      borderColor: colors.border.default,
                    }}
                  >
                    <Icon className={`w-4 h-4 ${point.color}`} />
                    <span
                      style={{ color: colors.text.secondary }}
                      className="text-sm font-medium"
                    >
                      {point.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div
              className={cn(
                themeClasses.layout.flexCenter,
                "gap-4 flex-wrap justify-center mb-12"
              )}
            >
              <button
                onClick={() => navigate("/login")}
                className={cn(
                  themeClasses.buttons.primary,
                  "px-8 py-3.5 text-base sm:text-lg flex items-center gap-2 font-semibold"
                )}
              >
                Comenzar Gratis Ahora
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById("how-it-works");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                className={cn(
                  themeClasses.buttons.secondary,
                  "px-8 py-3.5 text-base sm:text-lg font-medium"
                )}
              >
                Ver Cómo Funciona
              </button>
            </div>

            {/* Trust Indicators - Más compactos */}
            <div
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm"
              style={{ color: colors.text.tertiary }}
            >
              {benefits.slice(0, 3).map((benefit, index) => (
                <div
                  key={index}
                  className={cn(
                    themeClasses.layout.flexCenter,
                    "gap-1.5 sm:gap-2 max-w-full sm:max-w-none"
                  )}
                >
                  <CheckCircle2
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                    style={{ color: colors.status.success }}
                  />
                  <span className="whitespace-normal sm:whitespace-nowrap text-center sm:text-left">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="min-h-screen lg:min-h-screen w-full flex items-center justify-center py-12 lg:py-0"
        style={{
          backgroundColor: colors.background.secondary,
          scrollSnapAlign: "start",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h3
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: colors.text.primary }}
            >
              Así de simple es tu día a día
            </h3>
            <p
              className="text-base sm:text-lg max-w-2xl mx-auto"
              style={{ color: colors.text.secondary }}
            >
              En 4 pasos simples, registra tu entrenamiento y visualiza tu
              progreso
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {dailyFlow.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className={cn(
                    themeClasses.cards.base,
                    "relative overflow-hidden text-center"
                  )}
                  style={{
                    borderColor: colors.border.default,
                  }}
                >
                  <div className="relative z-10">
                    <div
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 font-bold text-lg"
                      style={{
                        backgroundColor: colors.primary[500] + "20",
                        color: colors.primary[400],
                      }}
                    >
                      {step.step}
                    </div>
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: colors.button.primary.bg,
                      }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h4
                      className="text-lg font-bold mb-2"
                      style={{ color: colors.text.primary }}
                    >
                      {step.title}
                    </h4>
                    <p
                      style={{ color: colors.text.secondary }}
                      className="text-sm"
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solution Features Section */}
      <section
        id="features"
        className="min-h-screen lg:min-h-screen w-full flex items-center justify-center py-12 lg:py-0"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h3
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: colors.text.primary }}
            >
              La solución a tu estancamiento
            </h3>
            <p
              className="text-base sm:text-lg max-w-2xl mx-auto"
              style={{ color: colors.text.secondary }}
            >
              Registro preciso y métricas visuales para que siempre sepas cómo
              vas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {solutionFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={cn(
                    themeClasses.cards.base,
                    themeClasses.cards.hover,
                    themeClasses.cards.withShadow,
                    "relative overflow-hidden group"
                  )}
                  style={{
                    borderColor: colors.border.default,
                  }}
                >
                  {/* Gradient Background */}
                  <div
                    className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      `bg-gradient-to-br ${feature.gradient}`
                    )}
                  />

                  <div className="relative z-10">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
                        `bg-gradient-to-br ${feature.gradient}`
                      )}
                    >
                      <Icon className={cn("w-7 h-7", feature.iconColor)} />
                    </div>
                    <div className="mb-2">
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          backgroundColor: colors.primary[500] + "20",
                          color: colors.primary[400],
                        }}
                      >
                        {feature.highlight}
                      </span>
                    </div>
                    <h4
                      className="text-xl font-bold mb-2"
                      style={{ color: colors.text.primary }}
                    >
                      {feature.title}
                    </h4>
                    <p style={{ color: colors.text.secondary }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        className="min-h-screen lg:min-h-screen w-full flex items-center justify-center py-12 lg:py-0"
        style={{
          backgroundColor: colors.background.secondary,
          scrollSnapAlign: "start",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="w-full">
            <div className="text-center mb-8 sm:mb-12">
              <h3
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
                style={{ color: colors.text.primary }}
              >
                ¿Por qué elegir GymTrack?
              </h3>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border mt-4 max-w-2xl mx-auto"
                style={{
                  backgroundColor: colors.background.tertiary,
                  borderColor: colors.border.default,
                }}
              >
                <Gift
                  className="w-4 h-4"
                  style={{ color: colors.primary[400] }}
                />
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  <strong style={{ color: colors.text.primary }}>
                    Gratis por tiempo limitado:
                  </strong>{" "}
                  Durante el período de lanzamiento, todas las funciones son
                  gratuitas. Próximamente habrá planes de pago para coaches y
                  usuarios individuales (principalmente por almacenamiento en la
                  nube).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className={cn(
                    themeClasses.layout.flexCenter,
                    "gap-3 p-4 rounded-lg border"
                  )}
                  style={{
                    backgroundColor: colors.background.tertiary,
                    borderColor: colors.border.default,
                  }}
                >
                  <CheckCircle2
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: colors.status.success }}
                  />
                  <span style={{ color: colors.text.secondary }}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Coaches Section */}
      <section
        className="min-h-screen lg:min-h-screen w-full flex items-center justify-center py-12 lg:py-0"
        style={{
          backgroundColor: colors.background.secondary,
          scrollSnapAlign: "start",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full mb-4 sm:mb-6 border text-sm sm:text-base"
              style={{
                backgroundColor: colors.primary[500] + "20",
                borderColor: colors.primary[500] + "40",
              }}
            >
              <UserCheck
                className="w-4 h-4 sm:w-5 sm:h-5"
                style={{ color: colors.primary[400] }}
              />
              <span
                style={{ color: colors.primary[400] }}
                className="font-semibold"
              >
                Para Coaches Profesionales
              </span>
            </div>
            <h3
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: colors.text.primary }}
            >
              Gestiona a tus usuarios de forma profesional
            </h3>
            <p
              className="text-base sm:text-lg max-w-2xl mx-auto"
              style={{ color: colors.text.secondary }}
            >
              Próximamente podrás llevar registro detallado de todos tus
              clientes, visualizar su progreso y crear rutinas personalizadas.
              <strong style={{ color: colors.text.primary }}>
                {" "}
                Conecta con entrenadores certificados fácilmente.
              </strong>
              <br />
              <span style={{ color: colors.text.tertiary }}>
                Los planes para coaches estarán disponibles próximamente con
                funcionalidades avanzadas de gestión y análisis.
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {coachFeatures.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  themeClasses.cards.base,
                  "relative overflow-hidden opacity-75"
                )}
                style={{
                  borderColor: colors.border.default,
                }}
              >
                <div className="relative z-10">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3"
                    style={{
                      backgroundColor: colors.primary[500] + "20",
                      color: colors.primary[400],
                    }}
                  >
                    <Sparkles className="w-3 h-3" />
                    {feature.coming}
                  </div>
                  <h4
                    className="text-lg font-bold mb-2"
                    style={{ color: colors.text.primary }}
                  >
                    {feature.title}
                  </h4>
                  <p
                    style={{ color: colors.text.tertiary }}
                    className="text-sm"
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="min-h-screen lg:min-h-screen w-full flex items-center justify-center py-12 lg:py-0 relative overflow-hidden"
        style={{
          backgroundColor: colors.background.secondary,
          scrollSnapAlign: "start",
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10 w-full">
          <div className="max-w-4xl mx-auto">
            <h3
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
              style={{ color: colors.text.primary }}
            >
              Deja de estancarte. Comienza a medir.
            </h3>
            <p
              className="text-base sm:text-lg lg:text-xl mb-4 sm:mb-6 max-w-3xl mx-auto"
              style={{ color: colors.text.secondary }}
            >
              Únete a GymTrack hoy.{" "}
              <strong style={{ color: colors.text.primary }}>
                Gratis por tiempo limitado
              </strong>
              , sin restricciones, sin tarjetas de crédito. Registra tu progreso
              y visualiza tu evolución.{" "}
              <span style={{ color: colors.text.tertiary }}>
                Próximamente habrá planes de pago para coaches y usuarios
                individuales (principalmente por almacenamiento en la nube).
              </span>
            </p>
            <p
              className="text-base sm:text-lg mb-6 sm:mb-10 max-w-2xl mx-auto font-semibold"
              style={{ color: colors.primary[400] }}
            >
              "Lo que no se mide, no se puede mejorar"
            </p>
            <button
              onClick={() => navigate("/login")}
              className={cn(
                themeClasses.buttons.primary,
                "px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg flex items-center gap-2 mx-auto"
              )}
            >
              Crear Cuenta Gratis
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 border-t w-full"
        style={{
          backgroundColor: colors.background.primary,
          borderColor: colors.border.default,
          scrollSnapAlign: "end",
          scrollSnapStop: "always",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div
            className={cn(themeClasses.layout.flexBetween, "flex-wrap gap-4")}
          >
            <div className={cn(themeClasses.layout.flexCenter, "gap-3")}>
              <Dumbbell
                className="w-6 h-6"
                style={{ color: colors.primary[500] }}
              />
              <span
                style={{ color: colors.text.secondary }}
                className="font-semibold"
              >
                GymTrack
              </span>
            </div>
            <div
              className={cn(themeClasses.layout.flexCenter, "gap-6 flex-wrap")}
            >
              <button
                onClick={() => navigate("/terms")}
                className="text-sm hover:underline"
                style={{ color: colors.text.tertiary }}
              >
                Términos de Servicio
              </button>
              <button
                onClick={() => navigate("/privacy")}
                className="text-sm hover:underline"
                style={{ color: colors.text.tertiary }}
              >
                Política de Privacidad
              </button>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm" style={{ color: colors.text.tertiary }}>
              © 2024 GymTrack. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
