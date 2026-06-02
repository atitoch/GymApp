import {
  Dumbbell,
  Loader2,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Menu,
  X,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  const { login, register, loginWithGoogle, loginWithGitHub } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
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
    rememberMe: false,
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

    // Si es confirmPassword, también validar cuando cambia password
    if (name === "password" && touchedFields.has("confirmPassword")) {
      validateField("confirmPassword", formData.confirmPassword);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouchedFields((prev) => new Set(prev).add(name));
    validateField(name, value);
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
          rememberMe: formData.rememberMe,
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
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      {/* Header móvil con menú hamburguesa */}
      <header
        ref={menuRef}
        className="lg:hidden sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">GymTrack</span>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
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
          <div className="border-t border-slate-800 bg-slate-900/95 backdrop-blur-md">
            <nav className="px-4 py-3 space-y-1">
              <button
                onClick={() => {
                  navigate("/");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Inicio
              </button>
              <button
                onClick={() => {
                  navigate("/terms");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Términos de Servicio
              </button>
              <button
                onClick={() => {
                  navigate("/privacy");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Política de Privacidad
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Panel izquierdo - Información de la app */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-600 via-amber-700 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">GymTrack</h2>
          </div>

          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Organiza tu entrenamiento
            <br />
            <span className="text-amber-200">de forma inteligente</span>
          </h1>

          <p className="text-amber-100 text-lg mb-12 max-w-md">
            Planifica tus rutinas, sigue tu progreso y alcanza tus objetivos de
            fitness con nuestra plataforma.
          </p>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Rutinas Personalizadas
                </h3>
                <p className="text-amber-100 text-sm">
                  Crea y gestiona rutinas adaptadas a tus objetivos y
                  disponibilidad.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Seguimiento de Progreso
                </h3>
                <p className="text-amber-100 text-sm">
                  Monitorea tu evolución y mantén la motivación día a día.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Patrones Inteligentes
                </h3>
                <p className="text-amber-100 text-sm">
                  Sistema de días consecutivos que se adapta a tu ritmo de
                  entrenamiento.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del panel izquierdo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-amber-200 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>100% Gratis</span>
            <span className="mx-2">•</span>
            <span>Sin tarjetas de crédito</span>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl mb-4 shadow-lg shadow-amber-500/30">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-50 mb-2">GymTrack</h1>
            <p className="text-slate-400">
              {isRegistering
                ? "Crea tu cuenta para comenzar"
                : "Inicia sesión para continuar"}
            </p>
          </div>

          {/* Título desktop */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-slate-50 mb-2">
              {isRegistering ? "Crear cuenta" : "Bienvenido de vuelta"}
            </h2>
            <p className="text-slate-400">
              {isRegistering
                ? "Comienza tu viaje hacia tus objetivos de fitness"
                : "Inicia sesión para continuar con tu rutina"}
            </p>
          </div>

          {/* Formulario sin bordes - diseño minimalista */}
          <div className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {isRegistering && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="John Doe"
                    disabled={isLoading}
                    className={`w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-slate-800/80 focus:border-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      fieldErrors.fullName && touchedFields.has("fullName")
                        ? "focus:ring-red-500/50 ring-2 ring-red-500/50 border-red-500/50"
                        : "focus:ring-amber-500/50"
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
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="tu@email.com"
                  disabled={isLoading}
                  autoComplete="email"
                  className={`w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-slate-800/80 focus:border-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    fieldErrors.email && touchedFields.has("email")
                      ? "focus:ring-red-500/50 ring-2 ring-red-500/50 border-red-500/50"
                      : "focus:ring-amber-500/50"
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
                <label className="block text-sm font-medium text-slate-400 mb-2">
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
                    disabled={isLoading}
                    autoComplete={
                      isRegistering ? "new-password" : "current-password"
                    }
                    className={`w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-3 pr-11 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-slate-800/80 focus:border-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      fieldErrors.password && touchedFields.has("password")
                        ? "focus:ring-red-500/50 ring-2 ring-red-500/50 border-red-500/50"
                        : "focus:ring-amber-500/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="••••••••"
                      disabled={isLoading}
                      autoComplete="new-password"
                      className={`w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-3 pr-11 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-slate-800/80 focus:border-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        fieldErrors.confirmPassword &&
                        touchedFields.has("confirmPassword")
                          ? "focus:ring-red-500/50 ring-2 ring-red-500/50 border-red-500/50"
                          : "focus:ring-amber-500/50"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-900/30 text-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="group-hover:text-slate-300 transition-colors">
                      Recordarme
                    </span>
                  </label>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isRegistering ? "Crear cuenta" : "Iniciar sesión"}
              </button>
            </form>

            {/* Divider - más sutil */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-950 text-slate-500">
                  O continúa con
                </span>
              </div>
            </div>

            {/* Social login - sin bordes */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
            <div className="mt-6 text-center text-sm">
              <span className="text-slate-400">
                {isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
              </span>{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                  setFieldErrors({});
                  setTouchedFields(new Set());
                }}
                disabled={isLoading}
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegistering ? "Inicia sesión" : "Regístrate"}
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-slate-500">
              <p>Al continuar, aceptas nuestros</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <button
                  onClick={() => navigate("/terms")}
                  className="hover:text-slate-400 transition-colors"
                >
                  Términos de servicio
                </button>
                <span>•</span>
                <button
                  onClick={() => navigate("/privacy")}
                  className="hover:text-slate-400 transition-colors"
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
