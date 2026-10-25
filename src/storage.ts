import type { Workout } from './types'

const STORAGE_KEY = 'wodmate.workouts.v1'

export function loadWorkouts(): Workout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedWorkouts()
    const parsed = JSON.parse(raw) as Workout[]
    return Array.isArray(parsed) ? parsed : seedWorkouts()
  } catch {
    return seedWorkouts()
  }
}

export function saveWorkouts(workouts: Workout[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts))
}

export function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `wod-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function seedWorkouts(): Workout[] {
  const now = new Date().toISOString()
  return [
    {
      id: uid(),
      name: 'Engine Room',
      description: 'Kort och intensiv konditionsmix.',
      focus: ['Kondition', 'Blandat'],
      format: 'AMRAP',
      durationMinutes: 12,
      difficulty: 'Medel',
      equipment: ['Roddmaskin', 'Kroppsvikt'],
      category: 'Att testa',
      favorite: true,
      createdAt: now,
      source: 'generated',
      notes: 'Håll ett jämnt tempo från start.',
      sections: [{
        id: uid(),
        title: 'Workout of the day',
        format: 'AMRAP',
        durationMinutes: 12,
        instructions: 'Så många kvalitetsvarv som möjligt på 12 minuter.',
        exercises: [
          { id: uid(), name: 'Rodd', prescription: '12 kalorier' },
          { id: uid(), name: 'Burpees', prescription: '8 reps' },
          { id: uid(), name: 'Air squats', prescription: '12 reps' }
        ]
      }]
    },
    {
      id: uid(),
      name: 'Barbell Basics',
      description: 'Teknik och kontrollerad styrka med skivstång.',
      focus: ['Styrka', 'Olympiska lyft'],
      format: 'Styrka + Metcon',
      durationMinutes: 30,
      difficulty: 'Medel',
      equipment: ['Skivstång'],
      category: 'Styrka',
      favorite: false,
      createdAt: now,
      source: 'manual',
      notes: 'Prioritera teknik framför vikt.',
      sections: [{
        id: uid(),
        title: 'Styrkedel',
        format: 'Öppet upplägg',
        durationMinutes: 20,
        instructions: 'Arbeta med kontrollerade set och vila efter behov.',
        exercises: [
          { id: uid(), name: 'Front squat', prescription: '5 × 5' },
          { id: uid(), name: 'Strict press', prescription: '4 × 6' }
        ]
      }]
    }
  ]
}
