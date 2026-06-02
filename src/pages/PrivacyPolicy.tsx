import { ArrowLeft, Shield, Lock, Eye, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-lime-400 hover:text-lime-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="bg-stone-800/50 rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-lime-400" />
            <h1 className="text-4xl font-bold">Política de Privacidad</h1>
          </div>

          <p className="text-stone-400 mb-8">
            Última actualización:{" "}
            {new Date().toLocaleDateString("es-MX", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-lime-400" />
                1. Identificación del Responsable
              </h2>
              <p className="text-stone-300 leading-relaxed">
                El responsable del tratamiento de sus datos personales es{" "}
                <strong>GymTrack</strong>
                (en adelante "la Aplicación" o "nosotros"). Para cualquier
                consulta relacionada con el tratamiento de sus datos personales,
                puede contactarnos a través de:
              </p>
              <ul className="list-disc list-inside text-stone-300 space-y-2 ml-4">
                <li>Correo electrónico: privacidad@gymroutine.com</li>
                <li>
                  Dirección: [Dirección física de la empresa, Ciudad, Estado,
                  C.P., México]
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-lime-400" />
                2. Datos Personales que Recopilamos
              </h2>
              <p className="text-stone-300 leading-relaxed mb-4">
                Recopilamos los siguientes tipos de datos personales:
              </p>
              <div className="bg-stone-900/50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-stone-200 mb-2">
                    Datos de Identificación:
                  </h3>
                  <ul className="list-disc list-inside text-stone-300 space-y-1 ml-4">
                    <li>Nombre completo</li>
                    <li>Correo electrónico</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-200 mb-2">
                    Datos de Autenticación:
                  </h3>
                  <ul className="list-disc list-inside text-stone-300 space-y-1 ml-4">
                    <li>Contraseña (almacenada de forma encriptada)</li>
                    <li>Tokens de autenticación</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-200 mb-2">
                    Datos de Uso:
                  </h3>
                  <ul className="list-disc list-inside text-stone-300 space-y-1 ml-4">
                    <li>Rutinas de entrenamiento creadas y personalizadas</li>
                    <li>Historial de uso de la aplicación</li>
                    <li>Preferencias de usuario</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-200 mb-2">
                    Datos Técnicos:
                  </h3>
                  <ul className="list-disc list-inside text-stone-300 space-y-1 ml-4">
                    <li>Dirección IP</li>
                    <li>Tipo de navegador y dispositivo</li>
                    <li>Fecha y hora de acceso</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-lime-400" />
                3. Finalidades del Tratamiento
              </h2>
              <p className="text-stone-300 leading-relaxed mb-4">
                Utilizamos sus datos personales para las siguientes finalidades:
              </p>
              <div className="space-y-3">
                <div className="bg-stone-900/50 rounded-lg p-4">
                  <h3 className="font-semibold text-stone-200 mb-2">
                    Finalidades Primarias (Necesarias para el servicio):
                  </h3>
                  <ul className="list-disc list-inside text-stone-300 space-y-1 ml-4">
                    <li>Crear y gestionar su cuenta de usuario</li>
                    <li>
                      Proporcionar acceso a la aplicación y sus funcionalidades
                    </li>
                    <li>Guardar y sincronizar sus rutinas de entrenamiento</li>
                    <li>Personalizar su experiencia de usuario</li>
                    <li>
                      Procesar sus solicitudes y responder a sus consultas
                    </li>
                    <li>Enviar notificaciones relacionadas con el servicio</li>
                  </ul>
                </div>
                <div className="bg-stone-900/50 rounded-lg p-4">
                  <h3 className="font-semibold text-stone-200 mb-2">
                    Finalidades Secundarias (Con su consentimiento):
                  </h3>
                  <ul className="list-disc list-inside text-stone-300 space-y-1 ml-4">
                    <li>Enviar comunicaciones promocionales y marketing</li>
                    <li>Realizar análisis estadísticos y de uso</li>
                    <li>
                      Mejorar nuestros servicios y desarrollar nuevas
                      funcionalidades
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-lime-400" />
                4. Transferencias de Datos
              </h2>
              <p className="text-stone-300 leading-relaxed mb-4">
                Sus datos personales pueden ser compartidos con:
              </p>
              <ul className="list-disc list-inside text-stone-300 space-y-2 ml-4">
                <li>
                  <strong>Proveedores de servicios:</strong> Empresas que nos
                  ayudan a operar la aplicación (hosting, bases de datos,
                  servicios de autenticación). Estos proveedores están obligados
                  a mantener la confidencialidad de sus datos.
                </li>
                <li>
                  <strong>Autoridades:</strong> Cuando sea requerido por ley o
                  por orden judicial.
                </li>
              </ul>
              <p className="text-stone-300 leading-relaxed mt-4">
                No vendemos, alquilamos ni compartimos sus datos personales con
                terceros para fines comerciales sin su consentimiento explícito.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-lime-400" />
                5. Derechos ARCO
              </h2>
              <p className="text-stone-300 leading-relaxed mb-4">
                Usted tiene derecho a ejercer los siguientes derechos sobre sus
                datos personales:
              </p>
              <div className="bg-stone-900/50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-stone-200 mb-2">Acceso:</h3>
                  <p className="text-stone-300">
                    Conocer qué datos personales tenemos sobre usted y para qué
                    los utilizamos.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-200 mb-2">
                    Rectificación:
                  </h3>
                  <p className="text-stone-300">
                    Solicitar la corrección de sus datos personales si son
                    inexactos o incompletos.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-200 mb-2">
                    Cancelación:
                  </h3>
                  <p className="text-stone-300">
                    Solicitar que eliminemos sus datos personales de nuestros
                    registros cuando considere que no están siendo utilizados
                    conforme a los principios y deberes previstos en la ley.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-200 mb-2">
                    Oposición:
                  </h3>
                  <p className="text-stone-300">
                    Oponerse al tratamiento de sus datos personales para fines
                    específicos.
                  </p>
                </div>
              </div>
              <p className="text-stone-300 leading-relaxed mt-4">
                Para ejercer cualquiera de estos derechos, puede enviar una
                solicitud a
                <strong className="text-lime-400">
                  {" "}
                  privacidad@gymroutine.com
                </strong>{" "}
                indicando claramente el derecho que desea ejercer. Responderemos
                a su solicitud en un plazo máximo de 20 días hábiles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-lime-400" />
                6. Medidas de Seguridad
              </h2>
              <p className="text-stone-300 leading-relaxed mb-4">
                Implementamos medidas técnicas y organizativas para proteger sus
                datos personales:
              </p>
              <ul className="list-disc list-inside text-stone-300 space-y-2 ml-4">
                <li>Encriptación de datos en tránsito (HTTPS/TLS)</li>
                <li>Encriptación de contraseñas usando algoritmos seguros</li>
                <li>Control de acceso mediante autenticación</li>
                <li>Monitoreo continuo de seguridad</li>
                <li>Copias de seguridad regulares</li>
                <li>Actualizaciones periódicas de seguridad</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-lime-400" />
                7. Cookies y Tecnologías Similares
              </h2>
              <p className="text-stone-300 leading-relaxed mb-4">
                Utilizamos cookies y tecnologías similares para:
              </p>
              <ul className="list-disc list-inside text-stone-300 space-y-2 ml-4">
                <li>Mantener su sesión activa</li>
                <li>Recordar sus preferencias</li>
                <li>Mejorar la funcionalidad de la aplicación</li>
                <li>Analizar el uso de la aplicación</li>
              </ul>
              <p className="text-stone-300 leading-relaxed mt-4">
                Puede configurar su navegador para rechazar cookies, aunque esto
                puede afectar algunas funcionalidades de la aplicación.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-lime-400" />
                8. Retención de Datos
              </h2>
              <p className="text-stone-300 leading-relaxed">
                Conservaremos sus datos personales durante el tiempo necesario
                para cumplir con las finalidades descritas en esta política, y
                mientras sea necesario para cumplir con obligaciones legales.
                Cuando solicite la eliminación de su cuenta, eliminaremos sus
                datos personales en un plazo máximo de 30 días, excepto cuando
                la ley requiera su conservación por más tiempo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-lime-400" />
                9. Menores de Edad
              </h2>
              <p className="text-stone-300 leading-relaxed">
                Nuestra aplicación está dirigida a usuarios mayores de 18 años.
                Si un menor de edad desea utilizar nuestros servicios, debe
                contar con el consentimiento de sus padres o tutores. Si
                descubrimos que hemos recopilado datos de un menor sin el
                consentimiento apropiado, eliminaremos dicha información de
                nuestros servidores.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-lime-400" />
                10. Modificaciones a esta Política
              </h2>
              <p className="text-stone-300 leading-relaxed">
                Nos reservamos el derecho de modificar esta Política de
                Privacidad en cualquier momento. Le notificaremos sobre cambios
                significativos mediante un aviso en la aplicación o por correo
                electrónico. La fecha de "Última actualización" al inicio de
                este documento indica cuándo se realizó la última modificación.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-lime-400" />
                11. Legislación Aplicable
              </h2>
              <p className="text-stone-300 leading-relaxed">
                Esta Política de Privacidad se rige por la{" "}
                <strong>
                  Ley Federal de Protección de Datos Personales en Posesión de
                  Particulares (LFPDPPP)
                </strong>{" "}
                y demás normativa aplicable en los Estados Unidos Mexicanos.
              </p>
            </section>

            <section className="bg-lime-400/10 border border-lime-400/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-lime-400">
                Contacto
              </h2>
              <p className="text-stone-300 leading-relaxed">
                Si tiene preguntas sobre esta Política de Privacidad o sobre el
                tratamiento de sus datos personales, puede contactarnos en:
              </p>
              <p className="text-lime-400 mt-2">
                <strong>Email:</strong> privacidad@gymroutine.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
