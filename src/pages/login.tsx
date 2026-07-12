import {
  Dumbbell,
  Loader2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Menu,
  X,
  Zap,
  Activity,
  ArrowRight,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { ApiError } from "../types/api";
import { normalizeFieldErrors } from "../utils/errorHandler";

interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loginWithGoogle, loginWithGitHub } = useAuth();
  // Permite abrir directamente en modo registro desde la landing
  // (navigate("/login", { state: { register: true } }))
  const [isRegistering, setIsRegistering] = useState(
    Boolean((location.state as { register?: boolean } | null)?.register)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  // Validación de email
  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return "El correo electrónico es requerido";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Por favor, ingresa un correo electrónico válido";
    }
    return undefined;
  };

  // Validación de contraseña
  const validatePassword = (
    password: string,
    isRegistering: boolean
  ): string | undefined => {
    if (!password) {
      return "La contraseña es requerida";
    }
    if (isRegistering && password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }
    return undefined;
  };

  // Validación de confirmación de contraseña
  const validateConfirmPassword = (
    confirmPassword: string,
    password: string
  ): string | undefined => {
    if (!confirmPassword) {
      return "Por favor, confirma tu contraseña";
    }
    if (confirmPassword !== password) {
      return "Las contraseñas no coinciden";
    }
    return undefined;
  };

  // Validación de nombre completo
  const validateFullName = (fullName: string): string | undefined => {
    if (!fullName) {
      return "El nombre completo es requerido";
    }
    if (fullName.trim().length < 2) {
      return "El nombre debe tener al menos 2 caracteres";
    }
    return undefined;
  };

  // Validar un campo específico
  const validateField = (name: string, value: string) => {
    let error: string | undefined;

    switch (name) {
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value, isRegistering);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(value, formData.password);
        break;
      case "fullName":
        error = validateFullName(value);
        break;
    }

    setFieldErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return !error;
  };

  // Validar todo el formulario
  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    if (isRegistering) {
      const fullNameError = validateFullName(formData.fullName);
      if (fullNameError) {
        errors.fullName = fullNameError;
        isValid = false;
      }
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      errors.email = emailError;
      isValid = false;
    }

    const passwordError = validatePassword(formData.password, isRegistering);
    if (passwordError) {
      errors.password = passwordError;
      isValid = false;
    }

    if (isRegistering) {
      const confirmPasswordError = validateConfirmPassword(
        formData.confirmPassword,
        formData.password
      );
      if (confirmPasswordError) {
        errors.confirmPassword = confirmPasswordError;
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Limpiar error general
    if (error) setError(null);

    // Validar en tiempo real solo si el campo ya fue tocado
    if (touchedFields.has(name)) {
      validateField(name, value);
    }

    // Revalidar confirmPassword con el nuevo valor de password (no el del estado anterior)
    if (name === "password" && touchedFields.has("confirmPassword")) {
      const confirmError = validateConfirmPassword(formData.confirmPassword, value);
      setFieldErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouchedFields((prev) => new Set(prev).add(name));
    validateField(name, value);
    if (name === "password" && touchedFields.has("confirmPassword")) {
      const confirmError = validateConfirmPassword(formData.confirmPassword, value);
      setFieldErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos los campos como tocados
    const allFields = isRegistering
      ? ["fullName", "email", "password", "confirmPassword"]
      : ["email", "password"];
    setTouchedFields(new Set(allFields));

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      if (isRegistering) {
        await register({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          fullName: formData.fullName,
        });
      } else {
        await login({
          email: formData.email,
          password: formData.password,
        });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        // Si es un error de validación con errores por campo
        if (err.isValidationError() && err.fieldErrors) {
          const normalizedErrors = normalizeFieldErrors(err.fieldErrors);
          if (normalizedErrors) {
            // Mapear errores del backend a los campos del formulario
            const mappedErrors: FieldErrors = {};

            // Mapear errores comunes del backend a los campos del formulario
            Object.entries(normalizedErrors).forEach(([field, message]) => {
              // El backend puede devolver errores con nombres diferentes
              // Mapear a los nombres de campos del formulario
              const fieldMap: Record<string, keyof FieldErrors> = {
                email: "email",
                password: "password",
                confirmPassword: "confirmPassword",
                fullName: "fullName",
                firstName: "fullName", // El backend puede usar firstName
                lastName: "fullName", // El backend puede usar lastName
              };

              const mappedField = fieldMap[field.toLowerCase()];
              if (mappedField) {
                mappedErrors[mappedField] = message;
              }
            });

            setFieldErrors(mappedErrors);

            // Si hay errores de campo, marcar esos campos como tocados
            const fieldsWithErrors = Object.keys(mappedErrors);
            if (fieldsWithErrors.length > 0) {
              setTouchedFields((prev) => {
                const newSet = new Set(prev);
                fieldsWithErrors.forEach((field) => newSet.add(field));
                return newSet;
              });
            }
          }

          // Mostrar el mensaje general de error también
          setError(err.message);
        } else {
          // Error general sin errores por campo
          setError(err.message);
        }
      } else {
        setError(
          err instanceof Error ? err.message : "Error al procesar la solicitud"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al iniciar sesión con Google"
      );
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginWithGitHub();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al iniciar sesión con GitHub"
      );
      setIsLoading(false);
    }
  };

  return (
    <div
      className="bg-stone-950 flex flex-col lg:flex-row overflow-hidden"
      style={{ height: '100dvh', minHeight: '100vh' }}
    >
      {/* Header móvil con menú hamburguesa */}
      <header
        ref={menuRef}
        className="lg:hidden shrink-0 z-50 bg-stone-950/80 backdrop-blur-md border-b border-stone-800/80"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 bg-gradient-to-br from-lime-400 to-lime-500 rounded-xl flex items-center justify-center shadow-lg shadow-lime-500/30">
              <div className="absolute inset-0 rounded-xl bg-lime-400 blur-md opacity-40 gt-glow" />
              <Dumbbell className="relative w-5 h-5 text-stone-950" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-bold text-lg tracking-tight">
                Gym<span className="text-lime-400">Track</span>
              </span>
              <span className="text-[9px] font-semibold tracking-[0.22em] text-stone-500 uppercase">
                Training OS
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Menú desplegable */}
        {isMenuOpen && (
          <div className="border-t border-stone-800 bg-stone-900/95 backdrop-blur-md">
            <nav className="px-4 py-3 space-y-1">
              <button
                onClick={() => {
                  navigate("/");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
              >
                Inicio
              </button>
              <button
                onClick={() => {
                  navigate("/terms");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
              >
                Términos de Servicio
              </button>
              <button
                onClick={() => {
                  navigate("/privacy");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
              >
                Política de Privacidad
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Panel izquierdo - Showcase atlético */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-stone-950 p-8 xl:p-12 flex-col justify-between">
        {/* Capas de fondo: rejilla blueprint + glows + halo lima */}
        <div className="absolute inset-0 gt-grid opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-br from-lime-500/[0.12] via-transparent to-transparent" />
        <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] bg-lime-400/20 rounded-full blur-[120px] gt-float" />
        <div className="absolute -bottom-32 -left-20 w-[26rem] h-[26rem] bg-lime-600/15 rounded-full blur-[120px] gt-float-slow" />
        {/* Trazo diagonal de energía */}
        <div className="absolute -right-10 top-1/4 h-[140%] w-px bg-gradient-to-b from-transparent via-lime-400/40 to-transparent rotate-12" />
        {/* Borde derecho luminoso (división con el formulario) */}
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-lime-400/50 to-transparent" />

        <div className="relative z-10">
          {/* Marca */}
          <div className="flex items-center gap-3 mb-5 gt-rise">
            <div className="relative w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-500 rounded-2xl flex items-center justify-center shadow-lg shadow-lime-500/40">
              <div className="absolute inset-0 rounded-2xl bg-lime-400 blur-lg opacity-50 gt-glow" />
              <Dumbbell className="relative w-7 h-7 text-stone-950" />
            </div>
            <div className="flex flex-col leading-none">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Gym<span className="text-lime-400">Track</span>
              </h2>
              <span className="text-[10px] font-semibold tracking-[0.28em] text-stone-500 uppercase mt-1">
                Training OS · Est. 2026
              </span>
            </div>
          </div>

          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full border border-lime-400/30 bg-lime-400/10 gt-rise"
            style={{ animationDelay: "0.05s" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
            </span>
            <span className="text-xs font-semibold tracking-wide text-lime-300 uppercase">
              Tu gimnasio, en datos
            </span>
          </div>

          {/* Titular kinético */}
          <h1
            className="text-4xl xl:text-5xl font-extrabold text-white mb-4 leading-[0.95] tracking-tight gt-rise"
            style={{ animationDelay: "0.1s" }}
          >
            ENTRENA.
            <br />
            REGISTRA.
            <br />
            <span className="relative inline-block text-lime-400">
              PROGRESA.
              <span className="absolute -bottom-2 left-0 h-1.5 w-full bg-gradient-to-r from-lime-400 to-transparent rounded-full" />
            </span>
          </h1>

          <p
            className="text-stone-400 text-sm mb-4 leading-relaxed gt-rise"
            style={{ animationDelay: "0.15s" }}
          >
            No es solo otra app de fitness. Es el sistema que convierte cada
            serie, cada repetición y cada racha en{" "}
            <span className="text-stone-200 font-medium">progreso medible</span>.
          </p>


          {/* Features compactos */}
          <div
            className="space-y-2.5 gt-rise"
            style={{ animationDelay: "0.25s" }}
          >
            {[
              {
                icon: Calendar,
                title: "Rutinas que se adaptan a ti",
                desc: "Planes flexibles según tus días y objetivos.",
              },
              {
                icon: Activity,
                title: "Cada rep cuenta",
                desc: "Registra series, pesos y siente la evolución.",
              },
              {
                icon: Zap,
                title: "Patrones inteligentes",
                desc: "El sistema aprende tu ritmo de entrenamiento.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group flex items-center gap-3 rounded-xl border border-stone-800/80 bg-stone-900/30 p-3 hover:bg-stone-900/60 hover:border-lime-400/30 transition-all"
              >
                <div className="relative w-9 h-9 shrink-0 rounded-lg bg-lime-400/10 border border-lime-400/20 flex items-center justify-center group-hover:bg-lime-400/20 transition-colors">
                  <Icon className="w-5 h-5 text-lime-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-sm">{title}</h3>
                  <p className="text-stone-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust bar */}
        <div className="relative z-10 mt-6 flex items-center gap-2 text-stone-600 text-xs gt-rise" style={{ animationDelay: "0.3s" }}>
          <CheckCircle2 className="w-3.5 h-3.5 text-lime-500" />
          <span>100% Gratis</span>
          <span className="mx-1.5 text-stone-800">•</span>
          <span>Sin tarjetas de crédito</span>
          <span className="mx-1.5 text-stone-800">•</span>
          <span>Cancela cuando quieras</span>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="relative w-full lg:w-1/2 flex-1 flex items-center justify-center p-4 lg:p-8 xl:p-12 overflow-hidden">
        {/* Textura sutil + glow para unificar con el panel izquierdo */}
        <div className="absolute inset-0 gt-grid opacity-[0.25] pointer-events-none" />
        <div className="absolute -bottom-32 -right-24 w-[24rem] h-[24rem] bg-lime-500/[0.07] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden flex items-center gap-3 mb-5">
            <div className="relative inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-lime-400 to-lime-500 rounded-xl shadow-lg shadow-lime-400/30 shrink-0">
              <div className="absolute inset-0 rounded-xl bg-lime-400 blur-lg opacity-40 gt-glow" />
              <Dumbbell className="relative w-5 h-5 text-stone-950" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-stone-50 tracking-tight leading-tight">
                Gym<span className="text-lime-400">Track</span>
              </h1>
              <p className="text-xs text-stone-500">
                {isRegistering ? "Crea tu cuenta" : "Inicia sesión para continuar"}
              </p>
            </div>
          </div>

          {/* Título desktop */}
          <div className="hidden lg:block mb-8">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-stone-800 bg-stone-900/60">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
              <span className="text-[11px] font-semibold tracking-wide text-stone-400 uppercase">
                {isRegistering ? "Crea tu perfil" : "Acceso de atleta"}
              </span>
            </div>
            <h2 className="text-4xl font-extrabold text-stone-50 mb-2 tracking-tight">
              {isRegistering ? "Crear cuenta" : "Bienvenido de vuelta"}
            </h2>
            <p className="text-stone-400">
              {isRegistering
                ? "Comienza tu viaje hacia tus objetivos de fitness"
                : "Inicia sesión para continuar con tu rutina"}
            </p>
          </div>

          {/* Formulario sin bordes - diseño minimalista */}
          <div className="space-y-4">
            {error && (
              <div className="p-2.5 bg-red-500/10 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              {isRegistering && (
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1.5">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Carlos Mendoza"
                    maxLength={201}
                    disabled={isLoading}
                    className={`w-full bg-stone-800/60 border border-stone-700/50 rounded-lg px-4 py-2.5 text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:bg-stone-800/80 focus:border-stone-600 transition-[border-color,box-shadow,background-color] duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                      fieldErrors.fullName && touchedFields.has("fullName")
                        ? "focus:ring-red-500/50 ring-2 ring-red-500/50 border-red-500/50"
                        : "focus:ring-lime-400/50"
                    }`}
                  />
                  {fieldErrors.fullName && touchedFields.has("fullName") && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{fieldErrors.fullName}</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-400 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="tu@email.com"
                  maxLength={254}
                  disabled={isLoading}
                  autoComplete="email"
                  className={`w-full bg-stone-800/60 border border-stone-700/50 rounded-lg px-4 py-2.5 text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:bg-stone-800/80 focus:border-stone-600 transition-[border-color,box-shadow,background-color] duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                    fieldErrors.email && touchedFields.has("email")
                      ? "focus:ring-red-500/50 ring-2 ring-red-500/50 border-red-500/50"
                      : "focus:ring-lime-400/50"
                  }`}
                />
                {fieldErrors.email && touchedFields.has("email") && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-400 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    maxLength={128}
                    disabled={isLoading}
                    autoComplete={
                      isRegistering ? "new-password" : "current-password"
                    }
                    className={`w-full bg-stone-800/60 border border-stone-700/50 rounded-lg px-4 py-2.5 pr-11 text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:bg-stone-800/80 focus:border-stone-600 transition-[border-color,box-shadow,background-color] duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                      fieldErrors.password && touchedFields.has("password")
                        ? "focus:ring-red-500/50 ring-2 ring-red-500/50 border-red-500/50"
                        : "focus:ring-lime-400/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && touchedFields.has("password") && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{fieldErrors.password}</span>
                  </div>
                )}
              </div>

              {isRegistering && (
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1.5">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      maxLength={128}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="••••••••"
                      disabled={isLoading}
                      autoComplete="new-password"
                      className={`w-full bg-stone-800/60 border border-stone-700/50 rounded-lg px-4 py-2.5 pr-11 text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:bg-stone-800/80 focus:border-stone-600 transition-[border-color,box-shadow,background-color] duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                        fieldErrors.confirmPassword &&
                        touchedFields.has("confirmPassword")
                          ? "focus:ring-red-500/50 ring-2 ring-red-500/50 border-red-500/50"
                          : "focus:ring-lime-400/50"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={
                        showConfirmPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword &&
                    touchedFields.has("confirmPassword") && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{fieldErrors.confirmPassword}</span>
                      </div>
                    )}
                </div>
              )}

              {!isRegistering && (
                <div className="flex items-center justify-end text-sm">
                  <button
                    type="button"
                    disabled={isLoading}
                    className="text-lime-400 hover:text-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full overflow-hidden bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-stone-950 font-bold py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-lime-400/25 hover:shadow-lime-400/40 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {/* Destello al pasar */}
                <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/30 blur-md opacity-0 group-hover:opacity-100 group-hover:animate-[gt-sheen_0.9s_ease-out]" />
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                <span className="relative">
                  {isRegistering ? "Crear cuenta" : "Iniciar sesión"}
                </span>
                {!isLoading && (
                  <ArrowRight className="relative w-5 h-5 transition-transform group-hover:translate-x-1" />
                )}
              </button>
            </form>

            {/* Divider - más sutil */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-stone-950 text-stone-500">
                  O continúa con
                </span>
              </div>
            </div>

            {/* Social login - sin bordes */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white/5 hover:bg-white/10 text-stone-300 font-medium py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={handleGitHubLogin}
                disabled={isLoading}
                className="w-full bg-white/5 hover:bg-white/10 text-stone-300 font-medium py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </button>
            </div>

            {/* Toggle entre login y registro */}
            <div className="mt-4 text-center text-sm">
              <span className="text-stone-400">
                {isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
              </span>{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                  setFieldErrors({});
                  setTouchedFields(new Set());
                  setFormData({ email: "", password: "", confirmPassword: "", fullName: "" });
                }}
                disabled={isLoading}
                className="text-lime-400 hover:text-lime-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegistering ? "Inicia sesión" : "Regístrate"}
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-stone-500">
              <p>Al continuar, aceptas nuestros</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <button
                  onClick={() => navigate("/terms")}
                  className="hover:text-stone-400 transition-colors"
                >
                  Términos de servicio
                </button>
                <span>•</span>
                <button
                  onClick={() => navigate("/privacy")}
                  className="hover:text-stone-400 transition-colors"
                >
                  Política de privacidad
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
