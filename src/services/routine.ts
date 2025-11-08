import type { DayRoutine } from '../types/routineType';

export const routineData: Record<string, DayRoutine[]> = {
  '1': [
    {
      day: 'Lunes',
      dayName: 'PIERNA',
      title: 'Dominante de Rodilla - Énfasis Cuádriceps',
      warmup: [
        'Movilidad de cadera en círculos x 10/dirección',
        'Bicicleta estática 3-5 min (intensidad baja-media)',
        'Activación de glúteo: caminar lateral con banda en rodillas x 15 pasos/lado',
        'Sentadillas sin peso x 15',
      ],
      sections: [
        {
          title: 'Entrenamiento Principal',
          exercises: [
            {
              name: 'Sentadilla Trasera o Frontal',
              sets: '4',
              reps: '6-8',
              rpe: '8-9',
              rest: '2.5-3 min',
              notes: 'Explosión controlada, profundidad completa',
            },
            {
              name: 'Prensa de Pierna',
              sets: '4',
              reps: '10-12',
              rpe: '8',
              rest: '2.5-3 min',
              notes: 'Pies al ancho de hombros, bajar hasta 90°',
            },
            {
              name: 'Sentadilla Búlgara',
              sets: '3',
              reps: '10/pierna',
              rpe: '8',
              rest: '2.5-3 min',
              notes: 'Torso erguido, rodilla delantera no sobrepasa el pie',
            },
          ],
        },
        {
          title: 'Ejercicios Complementarios',
          exercises: [
            {
              name: 'Extensión de Cuádriceps',
              sets: '3',
              reps: '12-15',
              rpe: '8-9',
              rest: '2.5-3 min',
              notes: 'Contracción pico en extensión completa',
            },
            {
              name: 'Aductores en Máquina',
              sets: '3',
              reps: '15',
              rpe: '7-8',
              rest: '2.5-3 min',
            },
            {
              name: 'Elevación de Gemelos Parado',
              sets: '3',
              reps: '15-20',
              rpe: '8',
              rest: '1.5-2 min',
              notes: 'Pausa 1 seg arriba',
            },
          ],
        },
      ],
      cooldown: [
        'Estiramiento de cuádriceps, flexores de cadera y gemelos (5 min)',
      ],
    },
    {
      day: 'Martes',
      dayName: 'TORSO',
      title: 'Empuje - Pecho/Hombro/Tríceps',
      warmup: [
        'Remo en polea baja con cuerda x 15 reps (peso ligero, enfoque en retracción escapular)',
        'Estiramientos de hombro en polea a altura de cadera: sujetar con una mano y rotar el torso x 10/lado',
        'Press de pecho en máquina (peso muy ligero) x 12 reps',
      ],
      sections: [
        {
          title: 'Pecho',
          exercises: [
            {
              name: 'Press de Banca con Barra',
              sets: '4',
              reps: '6-8',
              rpe: '8-9',
              rest: '2.5-3 min',
            },
            {
              name: 'Press Inclinado con Mancuernas',
              sets: '3',
              reps: '10-12',
              rpe: '8',
              rest: '2.5-3 min',
            },
            {
              name: 'Aperturas con Mancuernas o en Máquina (Peck Deck)',
              sets: '3',
              reps: '12-15',
              rpe: '7-8',
              rest: '2 min',
              notes: 'Estiramiento controlado, contracción en el centro',
            },
          ],
        },
        {
          title: 'Hombro',
          exercises: [
            {
              name: 'Press Militar con Mancuernas o Barra',
              sets: '3',
              reps: '8-10',
              rpe: '8',
              rest: '2.5-3 min',
            },
            {
              name: 'Elevaciones Laterales',
              sets: '3',
              reps: '12-15',
              rpe: '7-8',
              rest: '2-2.5 min',
            },
          ],
        },
        {
          title: 'Tríceps',
          exercises: [
            {
              name: 'Extensiones de Tríceps en Polea (agarre recto o cuerda)',
              sets: '3',
              reps: '12-15',
              rpe: '8',
              rest: '2-3 min',
            },
            {
              name: 'Press Francés con Barra Z o Mancuernas',
              sets: '3',
              reps: '10-12',
              rpe: '7-8',
              rest: '2 min',
            },
            {
              name: 'Plancha Abdominal',
              sets: '3',
              reps: '30-45 seg',
              rpe: '7',
              rest: '1.5 min',
            },
          ],
        },
      ],
    },
    {
      day: 'Miércoles',
      dayName: 'PIERNA',
      title: 'Dominante de Cadera - Énfasis Glúteo/Femoral',
      warmup: [
        'Bicicleta o elíptica 3-5 min',
        'Puente de glúteo (en suelo) x 20 reps',
        'Bisagra de cadera con palo x 15 reps (aprender el patrón)',
        'Abducción de pierna acostado lateral x 15/lado',
      ],
      sections: [
        {
          title: 'Glúteo/Femoral',
          exercises: [
            {
              name: 'Peso Muerto Rumano (variación: con mancuernas, con barra, con trap bar)',
              sets: '4',
              reps: '6-8',
              rpe: '8-9',
              rest: '2.5-3 min',
              notes: 'Bisagra de cadera perfecta, barra pegada al cuerpo',
            },
            {
              name: 'Hip Thrust con Barra',
              sets: '4',
              reps: '8-10',
              rpe: '9',
              rest: '2.5-3 min',
              notes: 'Contracción máxima arriba 1-2 seg, retroversión pélvica',
            },
            {
              name: 'Curl Femoral Acostado o Sentado',
              sets: '4',
              reps: '10-12',
              rpe: '8',
              rest: '2.5-3 min',
              notes: 'Cadera pegada al banco, contracción controlada',
            },
          ],
        },
        {
          title: 'Complementarios',
          exercises: [
            {
              name: 'Patada de Glúteo en Polea o Máquina',
              sets: '3',
              reps: '12-15/pierna',
              rpe: '8',
              rest: '1.5-2 min',
              notes: 'Extensión completa sin arquear lumbar',
            },
            {
              name: 'Abducción de Cadera en Máquina (separar piernas hacia los lados)',
              sets: '3',
              reps: '15-20',
              rpe: '7-8',
              rest: '2 min',
            },
            {
              name: 'Elevación de Gemelos Sentado',
              sets: '3',
              reps: '15-20',
              rpe: '8',
              rest: '1.5-2 min',
            },
          ],
        },
      ],
      cooldown: [
        'Estiramiento profundo de glúteos, isquios y flexores de cadera (5 min)',
      ],
    },
    {
      day: 'Jueves',
      dayName: 'DESCANSO',
      title: 'Descanso Activo o Completo',
      sections: [
        {
          title: 'Opciones',
          exercises: [
            {
              name: 'Descanso completo',
              sets: '-',
              reps: '-',
              rpe: '-',
              rest: '-',
            },
            {
              name: 'Caminata ligera 20-30 min',
              sets: '-',
              reps: '-',
              rpe: '-',
              rest: '-',
            },
            {
              name: 'Yoga o estiramientos suaves',
              sets: '-',
              reps: '-',
              rpe: '-',
              rest: '-',
            },
            {
              name: 'Movilidad articular',
              sets: '-',
              reps: '-',
              rpe: '-',
              rest: '-',
            },
          ],
        },
      ],
    },
    {
      day: 'Viernes',
      dayName: 'TORSO',
      title: 'Tirón - Espalda/Bíceps',
      warmup: [
        'Jalón en polea alta con agarre ancho (peso ligero) x 15 reps',
        'Remo en máquina sentado (peso ligero) x 15 reps',
        'Estirar brazos en polea alta cruzándolos x 10/lado',
        'Colgarse de barra x 15-20 seg',
      ],
      sections: [
        {
          title: 'Espalda',
          exercises: [
            {
              name: 'Peso Muerto Convencional o Remo en T (variación: con barra, con mancuerna, en máquina)',
              sets: '4',
              reps: '5-6',
              rpe: '8-9',
              rest: '2.5-3 min',
              notes:
                'Si eliges peso muerto: refuerza toda la cadena posterior. Si eliges remo T: torso a 45°, jalar hacia abdomen bajo',
            },
            {
              name: 'Jalón al Pecho con Agarre Ancho',
              sets: '4',
              reps: '8-10',
              rpe: '8',
              rest: '2.5-3 min',
              notes: 'Sacar pecho, llevar codos hacia atrás',
            },
            {
              name: 'Remo con Barra o Barra en T (agarre medio)',
              sets: '3',
              reps: '8-10',
              rpe: '8',
              rest: '2.5-3 min',
              notes:
                'Si usaste remo T arriba, aquí haz remo con barra y viceversa',
            },
            {
              name: 'Remo en Polea Baja con Agarre Cerrado (triángulo o agarre estrecho)',
              sets: '3',
              reps: '10-12',
              rpe: '7-8',
              rest: '2-2.5 min',
              notes: 'Torso erguido, sacar pecho, jalar hacia abdomen',
            },
          ],
        },
        {
          title: 'Hombro Posterior',
          exercises: [
            {
              name: 'Face Pulls (para deltoides posterior y manguito rotador)',
              sets: '3',
              reps: '15',
              rpe: '7',
              rest: '2 min',
              notes: 'Jalar hacia la cara, codos arriba',
            },
          ],
        },
        {
          title: 'Bíceps',
          exercises: [
            {
              name: 'Curl de Bíceps con Barra Z o Recta',
              sets: '3',
              reps: '10-12',
              rpe: '8',
              rest: '2-2.5 min',
            },
            {
              name: 'Spider Curl o Curl en Banco Inclinado',
              sets: '3',
              reps: '10-12',
              rpe: '7-8',
              rest: '2 min',
            },
          ],
        },
        {
          title: 'Core',
          exercises: [
            {
              name: 'Rueda Abdominal o Dead Bug',
              sets: '3',
              reps: '10-12',
              rpe: '8',
              rest: '1.5 min',
            },
            {
              name: 'Plancha Lateral',
              sets: '3',
              reps: '30 seg/lado',
              rpe: '7',
              rest: '1.5 min',
            },
          ],
        },
      ],
    },
    {
      day: 'Sábado',
      dayName: 'PIERNA',
      title: 'Full Leg - Balance y Volumen',
      warmup: [
        'Elíptica o bicicleta 3-5 min',
        'Movilidad de tobillo y cadera',
        'Estocadas sin peso x 10/pierna',
        'Activación de glúteos con banda x 15 reps',
      ],
      sections: [
        {
          title: 'Cuádriceps + Glúteo',
          exercises: [
            {
              name: 'Sentadilla Hack o Sentadilla con Barra (variación diferente al Día 1)',
              sets: '3',
              reps: '10-12',
              rpe: '7-8',
              rest: '2.5-3 min',
              notes:
                'Si hiciste sentadilla trasera el lunes, haz frontal o hack hoy',
            },
            {
              name: 'Peso Muerto con Piernas Rígidas o Buenos Días con Barra',
              sets: '3',
              reps: '10-12',
              rpe: '7-8',
              rest: '2.5-3 min',
              notes: 'Enfoque en estiramiento de femorales',
            },
            {
              name: 'Sentadilla Búlgara (énfasis en glúteo - torso inclinado)',
              sets: '3',
              reps: '12/pierna',
              rpe: '8',
              rest: '2.5-3 min',
              notes: 'Torso más inclinado para mayor activación de glúteo',
            },
          ],
        },
        {
          title: 'Complementarios',
          exercises: [
            {
              name: 'Step-Ups o Subidas al Banco con Mancuernas',
              sets: '3',
              reps: '10-12/pierna',
              rpe: '7',
              rest: '2 min',
              notes: 'Banco a altura de rodilla, empujar con el talón',
            },
            {
              name: 'Curl Femoral Nórdico o Curl con Fitball',
              sets: '3',
              reps: '8-10',
              rpe: '8',
              rest: '2 min',
              notes: 'Alternativa más funcional al curl en máquina',
            },
            {
              name: 'Abducción + Aducción en Máquina (Superserie)',
              sets: '3',
              reps: '15 c/u',
              rpe: '7',
              rest: '2 min',
              notes: 'Hacer abducción inmediatamente seguida de aducción',
            },
            {
              name: 'Elevación de Gemelos en Prensa de Pierna',
              sets: '3',
              reps: '20',
              rpe: '8',
              rest: '1.5-2 min',
              notes: 'Rango completo de movimiento',
            },
          ],
        },
      ],
      cooldown: ['Estiramiento completo de tren inferior (8-10 min)'],
    },
    {
      day: 'Domingo',
      dayName: 'DESCANSO',
      title: 'Descanso Completo',
      sections: [
        {
          title: 'Recuperación',
          exercises: [
            {
              name: 'Descanso total',
              sets: '-',
              reps: '-',
              rpe: '-',
              rest: '-',
              notes: '8-9 horas de sueño mínimo para recuperación óptima',
            },
          ],
        },
      ],
    },
  ],
};
