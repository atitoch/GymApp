import type {
  DayRoutine,
  RoutinePattern,
  CalculatedDayRoutine,
} from "../types/routineType";
import {
  getRoutinesForDisplay,
  getRoutineForDay,
  getCurrentDayOfWeek,
} from "../utils/routineCalculations";
import {
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
} from "../utils/api";
import { ApiError, HttpStatus } from "../types/api";

export const routineData: Record<string, DayRoutine[]> = {
  "1": [
    {
      day: "Lunes",
      dayName: "PIERNA",
      title: "Dominante de Rodilla - Énfasis Cuádriceps",
      warmup: [
        "Movilidad de cadera en círculos x 10/dirección",
        "Bicicleta estática 3-5 min (intensidad baja-media)",
        "Activación de glúteo: caminar lateral con banda en rodillas x 15 pasos/lado",
        "Sentadillas sin peso x 15",
      ],
      sections: [
        {
          title: "Entrenamiento Principal",
          exercises: [
            {
              name: "Sentadilla Trasera o Frontal",
              sets: "4",
              reps: "6-8",
              rpe: "8-9",
              rest: "2.5-3 min",
              notes: "Explosión controlada, profundidad completa",
            },
            {
              name: "Prensa de Pierna",
              sets: "4",
              reps: "10-12",
              rpe: "8",
              rest: "2.5-3 min",
              notes: "Pies al ancho de hombros, bajar hasta 90°",
            },
            {
              name: "Sentadilla Búlgara",
              sets: "3",
              reps: "10/pierna",
              rpe: "8",
              rest: "2.5-3 min",
              notes: "Torso erguido, rodilla delantera no sobrepasa el pie",
            },
          ],
        },
        {
          title: "Ejercicios Complementarios",
          exercises: [
            {
              name: "Extensión de Cuádriceps",
              sets: "3",
              reps: "12-15",
              rpe: "8-9",
              rest: "2.5-3 min",
              notes: "Contracción pico en extensión completa",
            },
            {
              name: "Aductores en Máquina",
              sets: "3",
              reps: "15",
              rpe: "7-8",
              rest: "2.5-3 min",
            },
            {
              name: "Elevación de Gemelos Parado",
              sets: "3",
              reps: "15-20",
              rpe: "8",
              rest: "1.5-2 min",
              notes: "Pausa 1 seg arriba",
            },
          ],
        },
      ],
      cooldown: [
        "Estiramiento de cuádriceps, flexores de cadera y gemelos (5 min)",
      ],
    },
    {
      day: "Martes",
      dayName: "TORSO",
      title: "Empuje - Pecho/Hombro/Tríceps",
      warmup: [
        "Remo en polea baja con cuerda x 15 reps (peso ligero, enfoque en retracción escapular)",
        "Estiramientos de hombro en polea a altura de cadera: sujetar con una mano y rotar el torso x 10/lado",
        "Press de pecho en máquina (peso muy ligero) x 12 reps",
      ],
      sections: [
        {
          title: "Pecho",
          exercises: [
            {
              name: "Press de Banca con Barra",
              sets: "4",
              reps: "6-8",
              rpe: "8-9",
              rest: "2.5-3 min",
            },
            {
              name: "Press Inclinado con Mancuernas",
              sets: "3",
              reps: "10-12",
              rpe: "8",
              rest: "2.5-3 min",
            },
            {
              name: "Aperturas con Mancuernas o en Máquina (Peck Deck)",
              sets: "3",
              reps: "12-15",
              rpe: "7-8",
              rest: "2 min",
              notes: "Estiramiento controlado, contracción en el centro",
            },
          ],
        },
        {
          title: "Hombro",
          exercises: [
            {
              name: "Press Militar con Mancuernas o Barra",
              sets: "3",
              reps: "8-10",
              rpe: "8",
              rest: "2.5-3 min",
            },
            {
              name: "Elevaciones Laterales",
              sets: "3",
              reps: "12-15",
              rpe: "7-8",
              rest: "2-2.5 min",
            },
          ],
        },
        {
          title: "Tríceps",
          exercises: [
            {
              name: "Extensiones de Tríceps en Polea (agarre recto o cuerda)",
              sets: "3",
              reps: "12-15",
              rpe: "8",
              rest: "2-3 min",
            },
            {
              name: "Press Francés con Barra Z o Mancuernas",
              sets: "3",
              reps: "10-12",
              rpe: "7-8",
              rest: "2 min",
            },
            {
              name: "Plancha Abdominal",
              sets: "3",
              reps: "30-45 seg",
              rpe: "7",
              rest: "1.5 min",
            },
          ],
        },
      ],
    },
    {
      day: "Miércoles",
      dayName: "PIERNA",
      title: "Dominante de Cadera - Énfasis Glúteo/Femoral",
      warmup: [
        "Bicicleta o elíptica 3-5 min",
        "Puente de glúteo (en suelo) x 20 reps",
        "Bisagra de cadera con palo x 15 reps (aprender el patrón)",
        "Abducción de pierna acostado lateral x 15/lado",
      ],
      sections: [
        {
          title: "Glúteo/Femoral",
          exercises: [
            {
              name: "Peso Muerto Rumano (variación: con mancuernas, con barra, con trap bar)",
              sets: "4",
              reps: "6-8",
              rpe: "8-9",
              rest: "2.5-3 min",
              notes: "Bisagra de cadera perfecta, barra pegada al cuerpo",
            },
            {
              name: "Hip Thrust con Barra",
              sets: "4",
              reps: "8-10",
              rpe: "9",
              rest: "2.5-3 min",
              notes: "Contracción máxima arriba 1-2 seg, retroversión pélvica",
            },
            {
              name: "Curl Femoral Acostado o Sentado",
              sets: "4",
              reps: "10-12",
              rpe: "8",
              rest: "2.5-3 min",
              notes: "Cadera pegada al banco, contracción controlada",
            },
          ],
        },
        {
          title: "Complementarios",
          exercises: [
            {
              name: "Patada de Glúteo en Polea o Máquina",
              sets: "3",
              reps: "12-15/pierna",
              rpe: "8",
              rest: "1.5-2 min",
              notes: "Extensión completa sin arquear lumbar",
            },
            {
              name: "Abducción de Cadera en Máquina (separar piernas hacia los lados)",
              sets: "3",
              reps: "15-20",
              rpe: "7-8",
              rest: "2 min",
            },
            {
              name: "Elevación de Gemelos Sentado",
              sets: "3",
              reps: "15-20",
              rpe: "8",
              rest: "1.5-2 min",
            },
          ],
        },
      ],
      cooldown: [
        "Estiramiento profundo de glúteos, isquios y flexores de cadera (5 min)",
      ],
    },
    {
      day: "Jueves",
      dayName: "DESCANSO",
      title: "Descanso Activo o Completo",
      sections: [
        {
          title: "Opciones",
          exercises: [
            {
              name: "Descanso completo",
              sets: "-",
              reps: "-",
              rpe: "-",
              rest: "-",
            },
            {
              name: "Caminata ligera 20-30 min",
              sets: "-",
              reps: "-",
              rpe: "-",
              rest: "-",
            },
            {
              name: "Yoga o estiramientos suaves",
              sets: "-",
              reps: "-",
              rpe: "-",
              rest: "-",
            },
            {
              name: "Movilidad articular",
              sets: "-",
              reps: "-",
              rpe: "-",
              rest: "-",
            },
          ],
        },
      ],
    },
    {
      day: "Viernes",
      dayName: "TORSO",
      title: "Tirón - Espalda/Bíceps",
      warmup: [
        "Jalón en polea alta con agarre ancho (peso ligero) x 15 reps",
        "Remo en máquina sentado (peso ligero) x 15 reps",
        "Estirar brazos en polea alta cruzándolos x 10/lado",
        "Colgarse de barra x 15-20 seg",
      ],
      sections: [
        {
          title: "Espalda",
          exercises: [
            {
              name: "Peso Muerto Convencional o Remo en T (variación: con barra, con mancuerna, en máquina)",
              sets: "4",
              reps: "5-6",
              rpe: "8-9",
              rest: "2.5-3 min",
              notes:
                "Si eliges peso muerto: refuerza toda la cadena posterior. Si eliges remo T: torso a 45°, jalar hacia abdomen bajo",
            },
            {
              name: "Jalón al Pecho con Agarre Ancho",
              sets: "4",
              reps: "8-10",
              rpe: "8",
              rest: "2.5-3 min",
              notes: "Sacar pecho, llevar codos hacia atrás",
            },
            {
              name: "Remo con Barra o Barra en T (agarre medio)",
              sets: "3",
              reps: "8-10",
              rpe: "8",
              rest: "2.5-3 min",
              notes:
                "Si usaste remo T arriba, aquí haz remo con barra y viceversa",
            },
            {
              name: "Remo en Polea Baja con Agarre Cerrado (triángulo o agarre estrecho)",
              sets: "3",
              reps: "10-12",
              rpe: "7-8",
              rest: "2-2.5 min",
              notes: "Torso erguido, sacar pecho, jalar hacia abdomen",
            },
          ],
        },
        {
          title: "Hombro Posterior",
          exercises: [
            {
              name: "Face Pulls (para deltoides posterior y manguito rotador)",
              sets: "3",
              reps: "15",
              rpe: "7",
              rest: "2 min",
              notes: "Jalar hacia la cara, codos arriba",
            },
          ],
        },
        {
          title: "Bíceps",
          exercises: [
            {
              name: "Curl de Bíceps con Barra Z o Recta",
              sets: "3",
              reps: "10-12",
              rpe: "8",
              rest: "2-2.5 min",
            },
            {
              name: "Spider Curl o Curl en Banco Inclinado",
              sets: "3",
              reps: "10-12",
              rpe: "7-8",
              rest: "2 min",
            },
          ],
        },
        {
          title: "Core",
          exercises: [
            {
              name: "Rueda Abdominal o Dead Bug",
              sets: "3",
              reps: "10-12",
              rpe: "8",
              rest: "1.5 min",
            },
            {
              name: "Plancha Lateral",
              sets: "3",
              reps: "30 seg/lado",
              rpe: "7",
              rest: "1.5 min",
            },
          ],
        },
      ],
    },
    {
      day: "Sábado",
      dayName: "PIERNA",
      title: "Full Leg - Balance y Volumen",
      warmup: [
        "Elíptica o bicicleta 3-5 min",
        "Movilidad de tobillo y cadera",
        "Estocadas sin peso x 10/pierna",
        "Activación de glúteos con banda x 15 reps",
      ],
      sections: [
        {
          title: "Cuádriceps + Glúteo",
          exercises: [
            {
              name: "Sentadilla Hack o Sentadilla con Barra (variación diferente al Día 1)",
              sets: "3",
              reps: "10-12",
              rpe: "7-8",
              rest: "2.5-3 min",
              notes:
                "Si hiciste sentadilla trasera el lunes, haz frontal o hack hoy",
            },
            {
              name: "Peso Muerto con Piernas Rígidas o Buenos Días con Barra",
              sets: "3",
              reps: "10-12",
              rpe: "7-8",
              rest: "2.5-3 min",
              notes: "Enfoque en estiramiento de femorales",
            },
            {
              name: "Sentadilla Búlgara (énfasis en glúteo - torso inclinado)",
              sets: "3",
              reps: "12/pierna",
              rpe: "8",
              rest: "2.5-3 min",
              notes: "Torso más inclinado para mayor activación de glúteo",
            },
          ],
        },
        {
          title: "Complementarios",
          exercises: [
            {
              name: "Step-Ups o Subidas al Banco con Mancuernas",
              sets: "3",
              reps: "10-12/pierna",
              rpe: "7",
              rest: "2 min",
              notes: "Banco a altura de rodilla, empujar con el talón",
            },
            {
              name: "Curl Femoral Nórdico o Curl con Fitball",
              sets: "3",
              reps: "8-10",
              rpe: "8",
              rest: "2 min",
              notes: "Alternativa más funcional al curl en máquina",
            },
            {
              name: "Abducción + Aducción en Máquina (Superserie)",
              sets: "3",
              reps: "15 c/u",
              rpe: "7",
              rest: "2 min",
              notes: "Hacer abducción inmediatamente seguida de aducción",
            },
            {
              name: "Elevación de Gemelos en Prensa de Pierna",
              sets: "3",
              reps: "20",
              rpe: "8",
              rest: "1.5-2 min",
              notes: "Rango completo de movimiento",
            },
          ],
        },
      ],
      cooldown: ["Estiramiento completo de tren inferior (8-10 min)"],
    },
    {
      day: "Domingo",
      dayName: "DESCANSO",
      title: "Descanso Completo",
      sections: [
        {
          title: "Recuperación",
          exercises: [
            {
              name: "Descanso total",
              sets: "-",
              reps: "-",
              rpe: "-",
              rest: "-",
              notes: "8-9 horas de sueño mínimo para recuperación óptima",
            },
          ],
        },
      ],
    },
  ],
  "2": [
    {
      day: "Lunes",
      dayName: "UPPER 1",
      title: "Entrenamiento Superior - Día 1",
      warmup: [
        "Remo ligero en máquina x 15 reps",
        "Movilidad de hombros x 10/dirección",
        "Press de pecho con peso ligero x 12 reps",
      ],
      sections: [
        {
          title: "Pecho y Tríceps",
          exercises: [
            {
              name: "Press Banca Plano con Barra",
              sets: "4",
              reps: "6-8",
              rpe: "8-9",
              rest: "2.5-3 min",
            },
            {
              name: "Cruces en Polea / Pec Deck",
              sets: "3",
              reps: "12-15",
              rpe: "8",
              rest: "2 min",
            },
          ],
        },
        {
          title: "Espalda",
          exercises: [
            {
              name: "Remo en Máquina con Respaldo (agarre amplio)",
              sets: "3",
              reps: "8-10",
              rpe: "8",
              rest: "2.5-3 min",
            },
            {
              name: "Pull-ups Lastradas/Supinas",
              sets: "3",
              reps: "8-10",
              rpe: "8",
              rest: "2.5-3 min",
            },
          ],
        },
        {
          title: "Hombros",
          exercises: [
            {
              name: "Press Militar con Barra",
              sets: "3",
              reps: "6-8",
              rpe: "8",
              rest: "2.5-3 min",
            },
            {
              name: "Face Pulls",
              sets: "3",
              reps: "15-20",
              rpe: "7-8",
              rest: "2 min",
            },
          ],
        },
        {
          title: "Bíceps y Tríceps",
          exercises: [
            {
              name: "Curl Bíceps Inclinado",
              sets: "2",
              reps: "10-12",
              rpe: "8",
              rest: "2 min",
            },
            {
              name: "Extensión Tríceps Cuerda",
              sets: "2",
              reps: "12-15",
              rpe: "8",
              rest: "2 min",
            },
          ],
        },
      ],
    },
    {
      day: "Martes",
      dayName: "LOWER 1",
      title: "Entrenamiento Inferior - Día 1",
      warmup: [
        "Bicicleta estática 3-5 min",
        "Movilidad de cadera x 10/dirección",
        "Sentadillas sin peso x 15 reps",
      ],
      sections: [
        {
          title: "Cuádriceps",
          exercises: [
            {
              name: "Sentadilla Hack",
              sets: "4",
              reps: "6-8",
              rpe: "8-9",
              rest: "2.5-3 min",
            },
            {
              name: "Extensiones de Cuádriceps",
              sets: "3",
              reps: "12-15",
              rpe: "8",
              rest: "2 min",
            },
          ],
        },
        {
          title: "Isquiosurales",
          exercises: [
            {
              name: "Curl Femoral Sentado",
              sets: "3",
              reps: "12-15",
              rpe: "8",
              rest: "2.5-3 min",
            },
          ],
        },
        {
          title: "Glúteos y Abductores",
          exercises: [
            {
              name: "Máquina de Abductor",
              sets: "3",
              reps: "15-20",
              rpe: "7-8",
              rest: "2 min",
            },
          ],
        },
        {
          title: "Gemelos y Core",
          exercises: [
            {
              name: "Elevación de Talones de Pie",
              sets: "4",
              reps: "15-20",
              rpe: "8",
              rest: "1.5-2 min",
            },
            {
              name: "Plancha Frontal y Lateral",
              sets: "3",
              reps: "30-45s",
              rpe: "7",
              rest: "1.5 min",
            },
          ],
        },
      ],
    },
    {
      day: "Miércoles",
      dayName: "PUSH",
      title: "Entrenamiento Push - Pecho, Hombros y Tríceps",
      warmup: [
        "Remo ligero x 15 reps",
        "Movilidad de hombros x 10/dirección",
        "Press inclinado ligero x 12 reps",
      ],
      sections: [
        {
          title: "Pecho",
          exercises: [
            {
              name: "Press Inclinado con Mancuernas",
              sets: "3",
              reps: "8-10",
              rpe: "8",
              rest: "2.5-3 min",
            },
            {
              name: "Press en Máquina/Smith Plano",
              sets: "3",
              reps: "10-12",
              rpe: "8",
              rest: "2.5-3 min",
            },
          ],
        },
        {
          title: "Hombros",
          exercises: [
            {
              name: "Press Militar Mancuernas Sentado",
              sets: "3",
              reps: "6-8",
              rpe: "8",
              rest: "2.5-3 min",
            },
            {
              name: "Elevaciones Laterales",
              sets: "3",
              reps: "15-20",
              rpe: "7-8",
              rest: "2 min",
            },
          ],
        },
        {
          title: "Tríceps",
          exercises: [
            {
              name: "Extensiones de Tríceps",
              sets: "3",
              reps: "8-10",
              rpe: "8",
              rest: "2 min",
            },
            {
              name: "Extensión Tríceps Overhead",
              sets: "2",
              reps: "12-15",
              rpe: "8",
              rest: "2 min",
            },
          ],
        },
      ],
    },
    {
      day: "Jueves",
      dayName: "PULL",
      title: "Entrenamiento Pull - Espalda y Bíceps",
      warmup: [
        "Jalón al pecho ligero x 15 reps",
        "Remo ligero x 15 reps",
        "Movilidad de hombros x 10/dirección",
      ],
      sections: [
        {
          title: "Espalda",
          exercises: [
            {
              name: "Remo Unilateral Mancuerna/Máquina",
              sets: "3",
              reps: "10-12",
              rpe: "8",
              rest: "2.5-3 min",
            },
            {
              name: "Jalón al Pecho",
              sets: "3",
              reps: "6-8",
              rpe: "8",
              rest: "2.5-3 min",
            },
            {
              name: "Reverse Fly / Pájaros",
              sets: "3",
              reps: "15-20",
              rpe: "7-8",
              rest: "2 min",
            },
          ],
        },
        {
          title: "Bíceps",
          exercises: [
            {
              name: "Predicador en Máquina",
              sets: "3",
              reps: "10-12",
              rpe: "8",
              rest: "2 min",
            },
            {
              name: "Spider Curl o Concentrada",
              sets: "2",
              reps: "12-15",
              rpe: "8",
              rest: "2 min",
            },
          ],
        },
      ],
    },
    {
      day: "Viernes",
      dayName: "LOWER 2",
      title: "Entrenamiento Inferior - Día 2",
      warmup: [
        "Elíptica 3-5 min",
        "Movilidad de cadera x 10/dirección",
        "Puente de glúteo x 15 reps",
      ],
      sections: [
        {
          title: "Cadena Posterior",
          exercises: [
            {
              name: "Peso Muerto Rumano",
              sets: "3",
              reps: "8-10",
              rpe: "8",
              rest: "2.5-3 min",
            },
            {
              name: "Curl Femoral de Pie",
              sets: "3",
              reps: "12-15",
              rpe: "8",
              rest: "2.5-3 min",
            },
          ],
        },
        {
          title: "Cuádriceps y Glúteos",
          exercises: [
            {
              name: "Sentadilla Hack",
              sets: "3",
              reps: "10-12",
              rpe: "8",
              rest: "2.5-3 min",
            },
            {
              name: "Sentadilla Búlgara",
              sets: "3",
              reps: "10",
              rpe: "8",
              rest: "2.5-3 min",
            },
          ],
        },
        {
          title: "Gemelos y Core",
          exercises: [
            {
              name: "Elevación de Talones Sentado",
              sets: "4",
              reps: "15-20",
              rpe: "8",
              rest: "1.5-2 min",
            },
            {
              name: "Hollow Hold + Piernas Colgado",
              sets: "3",
              reps: "30-45s",
              rpe: "7",
              rest: "1.5 min",
            },
          ],
        },
      ],
    },
    {
      day: "Sábado",
      dayName: "UPPER 2",
      title: "Entrenamiento Superior - Día 2",
      warmup: [
        "Remo en máquina ligero x 15 reps",
        "Movilidad de hombros x 10/dirección",
        "Press inclinado ligero x 12 reps",
      ],
      sections: [
        {
          title: "Pecho",
          exercises: [
            {
              name: "Press Inclinado en Máquina",
              sets: "3",
              reps: "10-12",
              rpe: "8",
              rest: "2.5-3 min",
            },
          ],
        },
        {
          title: "Espalda",
          exercises: [
            {
              name: "Remo en Máquina / Cable",
              sets: "3",
              reps: "12",
              rpe: "8",
              rest: "2.5-3 min",
            },
            {
              name: "Pull-over en Polea o Mancuerna",
              sets: "2-3",
              reps: "12-15",
              rpe: "8",
              rest: "2 min",
            },
          ],
        },
        {
          title: "Hombros",
          exercises: [
            {
              name: "Elevaciones Laterales con Pausa",
              sets: "3",
              reps: "15-20",
              rpe: "7-8",
              rest: "2 min",
            },
            {
              name: "Face Pull / Band Pull-aparts",
              sets: "2",
              reps: "20",
              rpe: "7",
              rest: "2 min",
            },
          ],
        },
        {
          title: "Bíceps y Tríceps",
          exercises: [
            {
              name: "Curl Martillo + Extensión Cuerda",
              sets: "2",
              reps: "12-15",
              rpe: "8",
              rest: "2 min",
            },
          ],
        },
      ],
    },
    {
      day: "Domingo",
      dayName: "DESCANSO",
      title: "Descanso Completo - Recuperación",
      sections: [
        {
          title: "Recuperación Activa",
          exercises: [
            {
              name: "Descanso total o caminata ligera",
              sets: "-",
              reps: "-",
              rpe: "-",
              rest: "-",
              notes: "8-9 horas de sueño mínimo para recuperación óptima",
            },
          ],
        },
      ],
    },
  ],
};

// ============================================
// Funciones para conectar con el backend
// ============================================

/**
 * Obtiene el patrón de rutina de un usuario desde el backend
 * @param userId ID del usuario
 * @returns Patrón de rutina del usuario
 */
export const fetchUserRoutinePattern = async (
  userId: string
): Promise<RoutinePattern | null> => {
  try {
    return await authenticatedGet<RoutinePattern>(
      `/users/${userId}/routine-pattern`
    );
  } catch (error) {
    // Si es 404, el usuario no tiene rutina configurada (comportamiento esperado)
    if (
      error instanceof ApiError &&
      error.statusCode === HttpStatus.NOT_FOUND
    ) {
      return null;
    }
    // Solo loguear errores que no sean 404 (no hacer nada, solo retornar null)
    // En caso de error, retornar null para que la app use datos locales como fallback
    return null;
  }
};

/**
 * Obtiene las rutinas calculadas para mostrar en la lista
 * @param userId ID del usuario
 * @param daysToShow Número de días a mostrar (default: 7)
 * @returns Array de rutinas calculadas
 */
/**
 * Resultado de fetchUserRoutines con el día actual incluido
 */
export interface UserRoutinesResult {
  routines: CalculatedDayRoutine[];
  currentDayNumber: number; // Día actual de la semana (1-7)
}

/**
 * Obtiene las rutinas de la semana completa para un usuario
 * Siempre devuelve los días 1-7 (lunes a domingo)
 * @param userId ID del usuario
 * @param daysToShow Número de días a mostrar (default: 7)
 * @returns Objeto con las rutinas y el día actual
 */
export const fetchUserRoutines = async (
  userId: string,
  daysToShow: number = 7
): Promise<UserRoutinesResult> => {
  const routinePattern = await fetchUserRoutinePattern(userId);

  if (!routinePattern) {
    // Fallback: usar datos locales si no hay patrón en el backend
    const routines = getLocalRoutinesAsCalculated(userId, daysToShow);
    // Calcular día actual basado en el día de la semana (Lunes=1, ..., Domingo=7)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const currentDayNumber = dayOfWeek === 0 ? 7 : dayOfWeek;
    return { routines, currentDayNumber };
  }

  const routines = getRoutinesForDisplay(routinePattern, undefined, daysToShow);
  const currentDayNumber = getCurrentDayOfWeek(routinePattern);

  return { routines, currentDayNumber };
};

/**
 * Obtiene la rutina de un día específico
 * @param userId ID del usuario
 * @param dayNumber Día consecutivo desde el inicio
 * @returns Rutina calculada para ese día
 */
export const fetchDayRoutine = async (
  userId: string,
  dayNumber: number
): Promise<CalculatedDayRoutine | null> => {
  const routinePattern = await fetchUserRoutinePattern(userId);

  if (!routinePattern) {
    // Fallback: usar datos locales
    return getLocalDayRoutineAsCalculated(userId, dayNumber);
  }

  return getRoutineForDay(routinePattern, dayNumber);
};

/**
 * Crea o actualiza el patrón de rutina de un usuario
 * @param userId ID del usuario
 * @param pattern Patrón de rutina a guardar
 * @returns Patrón de rutina guardado
 */
export const saveUserRoutinePattern = async (
  userId: string,
  pattern: Omit<RoutinePattern, "id" | "userId">
): Promise<RoutinePattern> => {
  return await authenticatedPost<RoutinePattern>(
    `/users/${userId}/routine-pattern`,
    pattern
  );
};

/**
 * Actualiza el patrón de rutina de un usuario
 * @param userId ID del usuario
 * @param patternId ID del patrón
 * @param pattern Datos del patrón a actualizar
 * @returns Patrón de rutina actualizado
 */
export const updateUserRoutinePattern = async (
  userId: string,
  patternId: string,
  pattern: Partial<RoutinePattern>
): Promise<RoutinePattern> => {
  return await authenticatedPut<RoutinePattern>(
    `/users/${userId}/routine-pattern/${patternId}`,
    pattern
  );
};

// ============================================
// Funciones de fallback (datos locales)
// ============================================

/**
 * Convierte datos locales a formato CalculatedDayRoutine (para compatibilidad)
 * @param userId ID del usuario
 * @param daysToShow Número de días a mostrar
 * @returns Array de rutinas calculadas desde datos locales
 */
const getLocalRoutinesAsCalculated = (
  userId: string,
  daysToShow: number
): CalculatedDayRoutine[] => {
  const localRoutines = routineData[userId] || [];
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes, etc.

  // Convertir a formato CalculatedDayRoutine
  return localRoutines.slice(0, daysToShow).map((routine, index) => {
    const dayNumber = dayOfWeek === 0 ? 7 : dayOfWeek; // Ajustar para que Lunes sea día 1
    const calculatedDay = ((dayNumber - 1 + index) % 7) + 1;

    // Calcular la fecha usando hora local
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + index);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    return {
      ...routine,
      day: calculatedDay,
      dayNumber: calculatedDay,
      cycleDay: index % localRoutines.length,
      patternType: routine.dayName,
      date: dateString,
    };
  });
};

/**
 * Obtiene una rutina local convertida a formato CalculatedDayRoutine
 * @param userId ID del usuario
 * @param dayNumber Día consecutivo
 * @returns Rutina calculada o null
 */
const getLocalDayRoutineAsCalculated = (
  userId: string,
  dayNumber: number
): CalculatedDayRoutine | null => {
  const localRoutines = routineData[userId] || [];
  const index = (dayNumber - 1) % localRoutines.length;
  const routine = localRoutines[index];

  if (!routine) {
    return null;
  }

  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + (dayNumber - 1));

  // Usar hora local para evitar problemas de zona horaria
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;

  return {
    ...routine,
    day: dayNumber,
    dayNumber,
    cycleDay: index,
    patternType: routine.dayName,
    date: dateString,
  };
};
