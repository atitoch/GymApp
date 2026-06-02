import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, Mail, Loader2 } from "lucide-react";
import * as authService from "../../services/auth";

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  const success = searchParams.get("success") === "true";
  const verified = searchParams.get("verified") === "true";
  const error = searchParams.get("error");
  const message = searchParams.get("message") || "";
  const emailParam = searchParams.get("email");

  // Si hay email en los params, guardarlo para reenvío
  useEffect(() => {
    if (emailParam && !email) {
      setEmail(emailParam);
    }
  }, [emailParam, email]);

  const handleResendEmail = async () => {
    if (!email) {
      setResendError("Por favor, ingresa tu correo electrónico");
      return;
    }

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      await authService.resendVerificationEmail(email);
      setResendSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setResendError(error.message);
      } else {
        setResendError(
          "Error al reenviar el correo. Por favor, intenta de nuevo."
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  // Si es éxito, mostrar mensaje de éxito
  if (success && verified) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-stone-800/60 border border-stone-700/50 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-stone-50 mb-2">
            ¡Correo Confirmado!
          </h1>
          <p className="text-stone-400 mb-6">
            Correo confirmado, ya puedes iniciar sesión.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-lime-400 hover:bg-lime-500 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  // Si hay error, mostrar mensaje de error con opción de reenviar
  if (error) {
    const errorMessages: Record<string, string> = {
      otp_expired: "El link de verificación ha expirado",
      invalid_token: "El link de verificación no es válido",
      email_already_verified: "Este correo electrónico ya está verificado",
      user_not_found: "No se encontró una cuenta con este correo electrónico",
    };

    const errorMessage =
      message ||
      errorMessages[error] ||
      "Ocurrió un error al verificar tu correo electrónico";

    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-stone-800/60 border border-stone-700/50 rounded-lg p-8">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-stone-50 mb-2 text-center">
            Error de Verificación
          </h1>
          <p className="text-stone-400 mb-6 text-center">{errorMessage}</p>

          {/* Formulario para reenviar correo */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-stone-300 mb-2"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setResendError(null);
                    setResendSuccess(false);
                  }}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-2 bg-stone-900/50 border border-stone-700 rounded-lg text-stone-50 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                />
              </div>
            </div>

            {resendSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm text-green-400">
                Se ha enviado un nuevo correo de verificación. Por favor, revisa
                tu bandeja de entrada.
              </div>
            )}

            {resendError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                {resendError}
              </div>
            )}

            <button
              onClick={handleResendEmail}
              disabled={isResending || !email}
              className="w-full bg-lime-400 hover:bg-lime-500 disabled:bg-stone-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Reenviar correo de verificación
                </>
              )}
            </button>

            <button
              onClick={() => navigate("/login")}
              className="w-full bg-stone-700 hover:bg-stone-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Estado inicial: mostrar mensaje de que se envió el correo (después del registro)
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-stone-800/60 border border-stone-700/50 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-lime-400" />
        </div>
        <h1 className="text-2xl font-bold text-stone-50 mb-2">
          Verifica tu Correo Electrónico
        </h1>
        <p className="text-stone-400 mb-2">
          Hemos enviado un correo de verificación a:
        </p>
        {email && (
          <p className="text-lg font-semibold text-lime-400 mb-4">{email}</p>
        )}
        <p className="text-stone-400 text-sm mb-6">
          Por favor revisa tu bandeja de entrada y haz clic en el link de
          verificación.
        </p>

        {resendSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm text-green-400 mb-4">
            Correo reenviado. Por favor revisa tu bandeja de entrada.
          </div>
        )}

        {resendError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 mb-4">
            {resendError}
          </div>
        )}

        <div className="space-y-3">
          {email && (
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full bg-lime-400 hover:bg-lime-500 disabled:bg-stone-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Reenviar Correo
                </>
              )}
            </button>
          )}

          <p className="text-xs text-stone-500">
            ¿No recibiste el correo? Revisa tu carpeta de spam o solicita un
            nuevo correo.
          </p>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-stone-700 hover:bg-stone-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};
