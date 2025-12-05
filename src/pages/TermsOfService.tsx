import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  Shield,
  Scale,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="bg-slate-800/50 rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Scale className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold">
              Términos y Condiciones de Uso
            </h1>
          </div>

          <p className="text-slate-400 mb-8">
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
                <FileText className="w-6 h-6 text-blue-500" />
                1. Aceptación de los Términos
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Al acceder y utilizar la aplicación <strong>GymTrack</strong>{" "}
                (en adelante "la Aplicación" o "el Servicio"), usted acepta
                quedar vinculado por estos Términos y Condiciones de Uso. Si no
                está de acuerdo con alguna parte de estos términos, no debe
                utilizar la Aplicación.
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                Estos términos constituyen un acuerdo legal entre usted y{" "}
                <strong>GymTrack</strong>. Al crear una cuenta o utilizar
                nuestros servicios, confirma que ha leído, entendido y acepta
                estos términos en su totalidad.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                2. Descripción del Servicio
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                GymTrack es una aplicación web que permite a los usuarios:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>
                  Crear y gestionar rutinas de entrenamiento personalizadas
                </li>
                <li>Organizar ejercicios por días y semanas</li>
                <li>Seguir su progreso de entrenamiento</li>
                <li>
                  Acceder a contenido relacionado con fitness y entrenamiento
                </li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Nos reservamos el derecho de modificar, suspender o discontinuar
                cualquier aspecto del Servicio en cualquier momento, con o sin
                previo aviso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-500" />
                3. Cuenta de Usuario
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-200 mb-2">
                    3.1. Registro
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    Para utilizar ciertas funcionalidades de la Aplicación, debe
                    crear una cuenta. Usted se compromete a:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4 mt-2">
                    <li>Proporcionar información veraz, precisa y completa</li>
                    <li>
                      Mantener y actualizar su información cuando sea necesario
                    </li>
                    <li>Mantener la confidencialidad de su contraseña</li>
                    <li>
                      Notificarnos inmediatamente de cualquier uso no autorizado
                      de su cuenta
                    </li>
                    <li>
                      Ser responsable de todas las actividades que ocurran bajo
                      su cuenta
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 mb-2">
                    3.2. Elegibilidad
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    Debe tener al menos 18 años de edad para utilizar la
                    Aplicación. Si es menor de 18 años, debe contar con el
                    consentimiento y supervisión de un padre o tutor legal.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-blue-500" />
                4. Uso Aceptable
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Usted se compromete a utilizar la Aplicación de manera legal y
                apropiada. Está prohibido:
              </p>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                  <li>
                    Utilizar la Aplicación para fines ilegales o no autorizados
                  </li>
                  <li>
                    Intentar acceder a áreas restringidas o a cuentas de otros
                    usuarios
                  </li>
                  <li>
                    Interferir o interrumpir el funcionamiento de la Aplicación
                  </li>
                  <li>Transmitir virus, malware o código malicioso</li>
                  <li>
                    Realizar ingeniería inversa, descompilar o desensamblar la
                    Aplicación
                  </li>
                  <li>
                    Copiar, modificar o distribuir el contenido sin autorización
                  </li>
                  <li>
                    Utilizar bots, scripts automatizados o métodos similares
                  </li>
                  <li>Suplantar la identidad de otra persona o entidad</li>
                  <li>
                    Recopilar información de otros usuarios sin su
                    consentimiento
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                5. Propiedad Intelectual
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Todos los derechos de propiedad intelectual sobre la Aplicación,
                incluyendo pero no limitado a:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Diseño, código fuente, gráficos, logos e iconos</li>
                <li>Contenido, textos, imágenes y materiales</li>
                <li>Marcas comerciales y nombres comerciales</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Son propiedad exclusiva de GymTrack o de sus licenciantes. Usted
                no adquiere ningún derecho de propiedad sobre estos elementos al
                utilizar la Aplicación.
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                El contenido que usted cree y almacene en la Aplicación
                (rutinas, ejercicios, etc.) permanece bajo su propiedad. Sin
                embargo, al utilizar la Aplicación, nos otorga una licencia no
                exclusiva para almacenar, procesar y mostrar dicho contenido en
                el contexto del Servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                6. Limitación de Responsabilidad
              </h2>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  <strong className="text-yellow-400">IMPORTANTE:</strong> La
                  información proporcionada en la Aplicación es solo para fines
                  informativos y educativos. No constituye asesoramiento médico,
                  nutricional o profesional de entrenamiento.
                </p>
                <div>
                  <h3 className="font-semibold text-slate-200 mb-2">
                    6.1. Exención de Responsabilidad
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    GymTrack no se hace responsable de:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4 mt-2">
                    <li>
                      Lesiones o daños resultantes del uso de las rutinas o
                      ejercicios sugeridos
                    </li>
                    <li>
                      Pérdida de datos o información almacenada en la Aplicación
                    </li>
                    <li>Interrupciones en el servicio o errores técnicos</li>
                    <li>
                      Decisiones tomadas basándose en la información de la
                      Aplicación
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 mb-2">
                    6.2. Recomendación Médica
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    Antes de comenzar cualquier programa de ejercicios, consulte
                    con un médico o profesional de la salud. No utilice la
                    Aplicación si tiene alguna condición médica que pueda verse
                    afectada por el ejercicio físico.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                7. Disponibilidad del Servicio
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Nos esforzamos por mantener la Aplicación disponible de manera
                continua, pero no garantizamos que el Servicio esté disponible
                en todo momento. Podemos interrumpir el servicio para
                mantenimiento, actualizaciones o por causas fuera de nuestro
                control. No seremos responsables por cualquier pérdida o daño
                resultante de la indisponibilidad del Servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                8. Cancelación y Terminación
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-200 mb-2">
                    8.1. Por el Usuario
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    Puede cancelar su cuenta en cualquier momento a través de la
                    configuración de la Aplicación o contactándonos
                    directamente. Al cancelar, sus datos personales serán
                    eliminados según se describe en nuestra Política de
                    Privacidad.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 mb-2">
                    8.2. Por Nosotros
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    Nos reservamos el derecho de suspender o terminar su acceso
                    a la Aplicación, con o sin previo aviso, si:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4 mt-2">
                    <li>Viola estos Términos y Condiciones</li>
                    <li>
                      Utiliza la Aplicación de manera fraudulenta o ilegal
                    </li>
                    <li>No utiliza la cuenta durante un período prolongado</li>
                    <li>Por razones legales o de seguridad</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                9. Modificaciones a los Términos
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Nos reservamos el derecho de modificar estos Términos y
                Condiciones en cualquier momento. Le notificaremos sobre cambios
                significativos mediante:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mt-4">
                <li>Un aviso prominente en la Aplicación</li>
                <li>
                  Correo electrónico a la dirección asociada con su cuenta
                </li>
                <li>Actualización de la fecha de "Última actualización"</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                El uso continuado de la Aplicación después de los cambios
                constituye su aceptación de los nuevos términos. Si no está de
                acuerdo con los cambios, debe dejar de utilizar la Aplicación y
                cancelar su cuenta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                10. Enlaces a Terceros
              </h2>
              <p className="text-slate-300 leading-relaxed">
                La Aplicación puede contener enlaces a sitios web o servicios de
                terceros. No tenemos control sobre el contenido, políticas de
                privacidad o prácticas de estos sitios de terceros. No nos
                hacemos responsables por ningún daño o pérdida relacionada con
                el uso de servicios de terceros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                11. Indemnización
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Usted acepta indemnizar, defender y eximir de responsabilidad a
                GymTrack, sus afiliados, directores, empleados y agentes de
                cualquier reclamo, daño, obligación, pérdida, responsabilidad,
                costo o deuda, y gastos (incluyendo honorarios de abogados) que
                surjan de:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4 mt-2">
                <li>Su uso o mal uso de la Aplicación</li>
                <li>Su violación de estos Términos y Condiciones</li>
                <li>Su violación de cualquier derecho de terceros</li>
                <li>
                  El contenido que publique o transmita a través de la
                  Aplicación
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                12. Legislación Aplicable y Jurisdicción
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Estos Términos y Condiciones se rigen e interpretan de acuerdo
                con las leyes de los Estados Unidos Mexicanos. Cualquier disputa
                que surja de o esté relacionada con estos términos o con el uso
                de la Aplicación será sometida a la jurisdicción exclusiva de
                los tribunales competentes de [Ciudad, Estado], México.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                13. Disposiciones Generales
              </h2>
              <div className="space-y-3">
                <p className="text-slate-300 leading-relaxed">
                  <strong>13.1. Divisibilidad:</strong> Si alguna disposición de
                  estos términos se considera inválida o inaplicable, las
                  disposiciones restantes permanecerán en pleno vigor y efecto.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  <strong>13.2. Renuncia:</strong> El hecho de que no ejerzamos
                  algún derecho o disposición de estos términos no constituye
                  una renuncia a tal derecho o disposición.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  <strong>13.3. Acuerdo Completo:</strong> Estos términos
                  constituyen el acuerdo completo entre usted y GymTrack
                  respecto al uso de la Aplicación.
                </p>
              </div>
            </section>

            <section className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">
                Contacto
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Si tiene preguntas sobre estos Términos y Condiciones, puede
                contactarnos en:
              </p>
              <p className="text-blue-400 mt-2">
                <strong>Email:</strong> support@gymtrack.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
