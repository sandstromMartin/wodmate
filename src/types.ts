export type Focus = 'Styrka' | 'Kondition' | 'Blandat' | 'Olympiska lyft' | 'Gymnastics' | 'Hyrox'
export type WorkoutFormat = 'AMRAP' | 'EMOM' | 'For Time' | 'Intervaller' | 'Styrka + Metcon' | 'Chipper' | 'Öppet upplägg'
export type Equipment = 'Skivstång' | 'Hantlar' | 'Kettlebell' | 'Roddmaskin' | 'Assault bike' | 'Box' | 'Pull-up rig' | 'Kroppsvikt' | 'Hopprep'
export type Difficulty = 'Nybörjare' | 'Medel' | 'Avancerad'

export interface Exercise {
  id: string
  name: string
  prescription: string
  note?: string
}

export interface WorkoutSection {
  id: string
  title: string
  format: WorkoutFormat | string
  durationMinutes?: number
  instructions?: string
  exercises: Exercise[]
}

export interface Workout {
  id: string
  name: string
  description: string
  focus: Focus[]
  format: WorkoutFormat
  durationMinutes: number
  difficulty: Difficulty
  equipment: Equipment[]
  category: string
  favorite: boolean
  createdAt: string
  source: 'generated' | 'manual' | 'imported' | 'shared'
  notes: string
  sections: WorkoutSection[]
}
