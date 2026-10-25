import type { Difficulty, Equipment, Focus, Workout, WorkoutFormat, WorkoutSection } from './types'
import { uid } from './storage'

export interface GeneratorOptions {
  focus: Focus
  format: WorkoutFormat
  duration: number
  difficulty: Difficulty
  equipment: Equipment[]
  prompt: string
}

export function generateDemoWorkout(options: GeneratorOptions): Workout {
  const { focus, format, duration, difficulty, equipment, prompt } = options
  const available = equipment.length ? equipment : ['Kroppsvikt' as Equipment]
  const has = (item: Equipment) => available.includes(item)
  const exercises: { name: string; prescription: string }[] = []

  if (focus === 'Styrka' || focus === 'Olympiska lyft') {
    exercises.push(
      { name: focus === 'Olympiska lyft' ? 'Power clean' : 'Front squat', prescription: difficulty === 'Avancerad' ? '5 × 3 reps' : '4 × 5 reps' },
      { name: has('Hantlar') ? 'Dumbbell row' : 'Strict press', prescription: '3 × 8 reps' },
      { name: 'Core work', prescription: '3 × 30–40 sek' },
    )
  } else if (focus === 'Hyrox') {
    exercises.push(
      { name: has('Roddmaskin') ? 'Rodd' : 'Burpees', prescription: '500 m / 12 reps' },
      { name: has('Kettlebell') ? 'Kettlebell lunges' : 'Walking lunges', prescription: '20 reps' },
      { name: has('Assault bike') ? 'Assault bike' : 'High knees', prescription: '12 kalorier / 40 sek' },
      { name: 'Wall balls (substitute: thrusters)', prescription: '15 reps' },
    )
  } else {
    exercises.push(
      { name: has('Skivstång') ? 'Hang power clean' : has('Hantlar') ? 'Dumbbell snatch' : 'Burpees', prescription: '8 reps' },
      { name: has('Roddmaskin') ? 'Rodd' : has('Assault bike') ? 'Assault bike' : 'Mountain climbers', prescription: has('Roddmaskin') ? '10 kalorier' : '10–12 kalorier / 30 sek' },
      { name: has('Box') ? 'Box jumps' : 'Air squats', prescription: '10 reps' },
    )
    if (has('Pull-up rig')) exercises.push({ name: 'Pull-ups', prescription: '6–8 reps' })
    else exercises.push({ name: 'Push-ups', prescription: '8–12 reps' })
  }

  const section: WorkoutSection = {
    id: uid(),
    title: focus === 'Styrka' || focus === 'Olympiska lyft' ? 'Styrkedel' : 'Workout of the day',
    format,
    durationMinutes: duration,
    instructions: format === 'AMRAP'
      ? `Så många kvalitetsvarv som möjligt på ${duration} minuter.`
      : format === 'EMOM'
      ? `Starta en ny arbetsuppgift varje minut i ${duration} minuter. Anpassa reps så att du får vila kvar.`
      : format === 'For Time'
      ? `Genomför arbetet så effektivt som möjligt med god teknik. Sätt en rimlig time cap på ${duration} minuter.`
      : `Arbeta i ${duration} minuter med kontrollerad intensitet.`,
    exercises: exercises.map((exercise) => ({ id: uid(), ...exercise })),
  }

  const name = focus === 'Kondition' ? 'Engine Builder' : focus === 'Styrka' ? 'Strength Session' : focus === 'Olympiska lyft' ? 'Barbell Practice' : focus === 'Hyrox' ? 'Race Ready' : 'WOD Generator #1'

  return {
    id: uid(),
    name,
    description: prompt.trim() || `${focus} med ${format.toLowerCase()}-upplägg.`,
    focus: [focus],
    format,
    durationMinutes: duration,
    difficulty,
    equipment: available,
    category: 'Att testa',
    favorite: false,
    createdAt: new Date().toISOString(),
    source: 'generated',
    notes: 'Demopass: kontrollera övningar och belastning innan träning. Detta är ännu inte AI-genererat.',
    sections: [section],
  }
}
