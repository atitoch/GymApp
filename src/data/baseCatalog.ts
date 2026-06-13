export type MuscleGroup =
  | 'pecho' | 'espalda' | 'hombros' | 'biceps' | 'triceps'
  | 'piernas' | 'gluteos' | 'abdomen' | 'cardio' | 'otro';

export interface BaseExercise {
  name: string;
  muscleGroup: MuscleGroup;
  instructions?: string;
}

export const BASE_CATALOG: BaseExercise[] = [
  // Pecho
  { name: 'Press de banca plano', muscleGroup: 'pecho', instructions: 'Barra a la altura del pecho, bajar controlado hasta rozar el pecho y empujar explosivo.' },
  { name: 'Press de banca inclinado', muscleGroup: 'pecho', instructions: 'Banco a 30-45°. Enfoca la parte superior del pectoral.' },
  { name: 'Press de banca declinado', muscleGroup: 'pecho', instructions: 'Banco declinado. Activa la parte inferior del pectoral.' },
  { name: 'Aperturas con mancuernas', muscleGroup: 'pecho', instructions: 'Codos ligeramente flexionados, baja hasta sentir estiramiento y cierra en arco.' },
  { name: 'Press con mancuernas plano', muscleGroup: 'pecho' },
  { name: 'Fondos en paralelas (pecho)', muscleGroup: 'pecho', instructions: 'Inclínate hacia adelante para enfatizar el pecho.' },
  { name: 'Crossover en polea', muscleGroup: 'pecho', instructions: 'Cruza las manos al frente, contrae el pecho en la posición cerrada.' },
  { name: 'Pullover con mancuerna', muscleGroup: 'pecho' },

  // Espalda
  { name: 'Jalón al pecho (polea alta)', muscleGroup: 'espalda', instructions: 'Agarre prono, lleva la barra hacia el pecho contrayendo los dorsales.' },
  { name: 'Remo con barra', muscleGroup: 'espalda', instructions: 'Espalda recta, tira hacia el ombligo. No uses el impulso de la cadera.' },
  { name: 'Remo con mancuerna', muscleGroup: 'espalda', instructions: 'Apoya la rodilla y la mano en el banco, tira hacia la cadera.' },
  { name: 'Dominadas', muscleGroup: 'espalda', instructions: 'Agarre supino o prono, sube hasta la barbilla por encima de la barra.' },
  { name: 'Peso muerto', muscleGroup: 'espalda', instructions: 'Espalda neutra, empuja el suelo con los pies al levantar. No redondees la lumbar.' },
  { name: 'Peso muerto rumano', muscleGroup: 'espalda', instructions: 'Piernas casi rectas, baja la barra pegada al cuerpo sintiendo el estiramiento de isquios.' },
  { name: 'Remo en polea baja', muscleGroup: 'espalda' },
  { name: 'Jalón al pecho agarre neutro', muscleGroup: 'espalda' },
  { name: 'Hiperextensiones', muscleGroup: 'espalda' },

  // Hombros
  { name: 'Press militar con barra', muscleGroup: 'hombros', instructions: 'De pie o sentado, empuja la barra sobre la cabeza sin arquear la lumbar.' },
  { name: 'Press de hombros con mancuernas', muscleGroup: 'hombros' },
  { name: 'Elevaciones laterales', muscleGroup: 'hombros', instructions: 'Codos ligeramente flexionados, sube hasta la altura de los hombros.' },
  { name: 'Elevaciones frontales', muscleGroup: 'hombros' },
  { name: 'Pájaros (posterior de hombro)', muscleGroup: 'hombros', instructions: 'Inclinado hacia adelante, abre los brazos hacia atrás.' },
  { name: 'Face pull en polea', muscleGroup: 'hombros', instructions: 'Jala hacia la cara separando las manos. Excelente para el manguito rotador.' },
  { name: 'Encogimientos con barra (trapecios)', muscleGroup: 'hombros' },

  // Bíceps
  { name: 'Curl con barra', muscleGroup: 'biceps', instructions: 'Codos pegados al cuerpo, sube la barra sin balancear el torso.' },
  { name: 'Curl con mancuernas', muscleGroup: 'biceps' },
  { name: 'Curl martillo', muscleGroup: 'biceps', instructions: 'Agarre neutro, trabaja el braquial y el braquiorradial.' },
  { name: 'Curl en polea baja', muscleGroup: 'biceps' },
  { name: 'Curl concentrado', muscleGroup: 'biceps', instructions: 'Sentado, apoya el codo en el muslo y curla sin balancear.' },
  { name: 'Curl predicador', muscleGroup: 'biceps' },

  // Tríceps
  { name: 'Fondos en paralelas (tríceps)', muscleGroup: 'triceps', instructions: 'Cuerpo erguido para enfocar el tríceps.' },
  { name: 'Press francés', muscleGroup: 'triceps', instructions: 'Acostado, baja la barra hacia la frente flexionando solo los codos.' },
  { name: 'Extensión de tríceps en polea', muscleGroup: 'triceps' },
  { name: 'Jalón de polea con cuerda (tríceps)', muscleGroup: 'triceps', instructions: 'Separa las manos al final del movimiento para mayor contracción.' },
  { name: 'Press cerrado', muscleGroup: 'triceps', instructions: 'Agarre estrecho en la barra, baja hasta el pecho y empuja.' },
  { name: 'Patada de tríceps', muscleGroup: 'triceps' },

  // Piernas
  { name: 'Sentadilla con barra', muscleGroup: 'piernas', instructions: 'Pies a la altura de los hombros, baja hasta que los muslos queden paralelos al suelo.' },
  { name: 'Sentadilla frontal', muscleGroup: 'piernas' },
  { name: 'Prensa de pierna', muscleGroup: 'piernas' },
  { name: 'Extensión de cuádriceps', muscleGroup: 'piernas' },
  { name: 'Curl femoral acostado', muscleGroup: 'piernas' },
  { name: 'Curl femoral sentado', muscleGroup: 'piernas' },
  { name: 'Zancada con mancuernas', muscleGroup: 'piernas', instructions: 'Paso largo, rodilla delantera sin sobrepasar la punta del pie.' },
  { name: 'Zancada búlgara', muscleGroup: 'piernas', instructions: 'Pie trasero elevado, baja la cadera en línea recta.' },
  { name: 'Sentadilla Hack', muscleGroup: 'piernas' },
  { name: 'Elevación de talones de pie (gemelos)', muscleGroup: 'piernas' },
  { name: 'Elevación de talones sentado (sóleo)', muscleGroup: 'piernas' },

  // Glúteos
  { name: 'Hip thrust con barra', muscleGroup: 'gluteos', instructions: 'Hombros apoyados en banco, empuja la cadera hacia arriba contrayendo glúteos.' },
  { name: 'Puente de glúteos', muscleGroup: 'gluteos' },
  { name: 'Patada de glúteo en polea', muscleGroup: 'gluteos' },
  { name: 'Abducción de cadera en máquina', muscleGroup: 'gluteos' },
  { name: 'Good Morning', muscleGroup: 'gluteos' },
  { name: 'Sentadilla sumo', muscleGroup: 'gluteos' },

  // Abdomen
  { name: 'Crunch abdominal', muscleGroup: 'abdomen' },
  { name: 'Plancha frontal', muscleGroup: 'abdomen', instructions: 'Cuerpo recto de cabeza a talones, activa el core sin dejar caer las caderas.' },
  { name: 'Plancha lateral', muscleGroup: 'abdomen' },
  { name: 'Elevación de piernas', muscleGroup: 'abdomen' },
  { name: 'Rueda abdominal', muscleGroup: 'abdomen' },
  { name: 'Crunch en polea', muscleGroup: 'abdomen' },
  { name: 'Russian twist', muscleGroup: 'abdomen' },
  { name: 'Tijeras', muscleGroup: 'abdomen' },
  { name: 'Mountain climbers', muscleGroup: 'abdomen' },

  // Cardio
  { name: 'Caminata en caminadora', muscleGroup: 'cardio' },
  { name: 'Carrera en caminadora', muscleGroup: 'cardio' },
  { name: 'Bicicleta estática', muscleGroup: 'cardio' },
  { name: 'Elíptica', muscleGroup: 'cardio' },
  { name: 'Remo ergómetro', muscleGroup: 'cardio' },
  { name: 'Saltos de cuerda', muscleGroup: 'cardio' },
  { name: 'Burpees', muscleGroup: 'cardio' },
  { name: 'HIIT en bicicleta', muscleGroup: 'cardio' },
];

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  hombros: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  piernas: 'Piernas',
  gluteos: 'Glúteos',
  abdomen: 'Abdomen',
  cardio: 'Cardio',
  otro: 'Otro',
};

export const MUSCLE_GROUP_ORDER: MuscleGroup[] = [
  'pecho', 'espalda', 'hombros', 'biceps', 'triceps',
  'piernas', 'gluteos', 'abdomen', 'cardio', 'otro',
];
