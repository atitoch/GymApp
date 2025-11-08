export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rpe: string;
  rest: string;
  notes?: string;
}

export interface Section {
  title: string;
  exercises: Exercise[];
}

export interface DayRoutine {
  day: string;
  dayName: string;
  title: string;
  warmup?: string[];
  sections: Section[];
  cooldown?: string[];
}
