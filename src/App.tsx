import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity, ArrowDownToLine, ArrowLeft, ArrowUpFromLine, Bookmark, Check, ChevronDown,
  CirclePlus, Clock3, Dumbbell, Flame, Heart, Link2, Plus, Search, Share2,
  Sparkles, Trash2, Trophy, X
} from 'lucide-react'
import type { Difficulty, Equipment, Focus, Workout, WorkoutFormat } from './types'
import { generateDemoWorkout } from './generator'
import { loadWorkouts, saveWorkouts, uid } from './storage'

type Tab = 'discover' | 'library' | 'shared'
const focuses: Focus[] = ['Styrka', 'Kondition', 'Blandat', 'Olympiska lyft', 'Gymnastics', 'Hyrox']
const formats: WorkoutFormat[] = ['AMRAP', 'EMOM', 'For Time', 'Intervaller', 'Styrka + Metcon', 'Chipper', 'Öppet upplägg']
const equipmentOptions: Equipment[] = ['Skivstång', 'Hantlar', 'Kettlebell', 'Roddmaskin', 'Assault bike', 'Box', 'Pull-up rig', 'Kroppsvikt', 'Hopprep']
const categories = ['Alla pass', 'Favoriter', 'Att testa', 'Styrka', 'Kondition', 'Skivstång', 'Hyrox', 'Egna pass']

function safeDecodeShare(): Workout | null {
  try {
    const hash = window.location.hash
    if (!hash.startsWith('#pass=')) return null
    const json = decodeURIComponent(escape(atob(hash.slice(6))))
    const parsed = JSON.parse(json) as Workout
    if (!parsed || !parsed.name || !Array.isArray(parsed.sections)) return null
    return { ...parsed, id: uid(), source: 'shared', favorite: false, category: 'Att testa' }
  } catch {
    return null
  }
}

function shareEncode(workout: Workout) {
  const json = JSON.stringify(workout)
  return `${window.location.origin}${window.location.pathname}#pass=${btoa(unescape(encodeURIComponent(json)))}`
}

function App() {
  const [workouts, setWorkouts] = useState<Workout[]>(() => loadWorkouts())
  const [tab, setTab] = useState<Tab>('discover')
  const [selected, setSelected] = useState<Workout | null>(null)
  const [focus, setFocus] = useState<Focus>('Blandat')
  const [format, setFormat] = useState<WorkoutFormat>('AMRAP')
  const [duration, setDuration] = useState(20)
  const [difficulty, setDifficulty] = useState<Difficulty>('Medel')
  const [equipment, setEquipment] = useState<Equipment[]>(['Kroppsvikt', 'Skivstång', 'Box'])
  const [prompt, setPrompt] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Alla pass')
  const [toast, setToast] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualDescription, setManualDescription] = useState('')
  const [editName, setEditName] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => { saveWorkouts(workouts) }, [workouts])
  useEffect(() => {
    const shared = safeDecodeShare()
    if (shared) {
      setSelected(shared)
      setToast('Du har öppnat ett delat pass')
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`)
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const visibleWorkouts = useMemo(() => workouts.filter((workout) => {
    const matchesSearch = `${workout.name} ${workout.description} ${workout.focus.join(' ')} ${workout.equipment.join(' ')}`
      .toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'Alla pass'
      || (filter === 'Favoriter' && workout.favorite)
      || (filter === 'Egna pass' && workout.source === 'manual')
      || workout.category === filter
      || (filter === 'Skivstång' && workout.equipment.includes('Skivstång'))
      || (filter === 'Hyrox' && workout.focus.includes('Hyrox'))
      || (filter === 'Kondition' && workout.focus.includes('Kondition'))
      || (filter === 'Styrka' && workout.focus.includes('Styrka'))
    return matchesSearch && matchesFilter
  }), [workouts, search, filter])

  const savedCount = workouts.length
  const favoriteCount = workouts.filter((w) => w.favorite).length

  function notify(message: string) { setToast(message) }

  function createWorkout() {
    const workout = generateDemoWorkout({ focus, format, duration, difficulty, equipment, prompt })
    setSelected(workout)
    setEditName(workout.name)
    setEditNotes(workout.notes)
  }

  function saveWorkout(workout: Workout) {
    setWorkouts((current) => {
      const exists = current.some((item) => item.id === workout.id)
      return exists ? current.map((item) => item.id === workout.id ? workout : item) : [workout, ...current]
    })
    setSelected(workout)
    notify('Passet är sparat i Mina pass')
  }

  function toggleFavorite(workout: Workout) {
    const updated = { ...workout, favorite: !workout.favorite }
    setWorkouts((current) => current.some((item) => item.id === workout.id)
      ? current.map((item) => item.id === workout.id ? updated : item)
      : [updated, ...current])
    if (selected?.id === workout.id) setSelected(updated)
    notify(updated.favorite ? 'Tillagt bland favoriter' : 'Borttaget från favoriter')
  }

  function deleteWorkout(workout: Workout) {
    setWorkouts((current) => current.filter((item) => item.id !== workout.id))
    if (selected?.id === workout.id) setSelected(null)
    notify('Passet har tagits bort')
  }

  function createManualWorkout() {
    if (!manualName.trim()) { notify('Ge passet ett namn först'); return }
    const workout: Workout = {
      id: uid(), name: manualName.trim(), description: manualDescription.trim() || 'Eget träningspass',
      focus: ['Blandat'], format: 'Öppet upplägg', durationMinutes: 30, difficulty: 'Medel',
      equipment: ['Kroppsvikt'], category: 'Egna pass', favorite: false,
      createdAt: new Date().toISOString(), source: 'manual', notes: '',
      sections: [{ id: uid(), title: 'Huvudpass', format: 'Öppet upplägg', exercises: [{ id: uid(), name: 'Lägg till övningar', prescription: 'Redigera passet' }] }]
    }
    setWorkouts((current) => [workout, ...current])
    setSelected(workout)
    setEditName(workout.name)
    setEditNotes(workout.notes)
    setShowManual(false)
    setManualName('')
    setManualDescription('')
    notify('Ett nytt pass har skapats')
  }

  function saveEdits() {
    if (!selected) return
    const updated = { ...selected, name: editName.trim() || selected.name, notes: editNotes }
    setSelected(updated)
    setWorkouts((current) => {
      const exists = current.some((item) => item.id === updated.id)
      return exists ? current.map((item) => item.id === updated.id ? updated : item) : current
    })
    notify('Ändringarna är sparade')
  }

  function exportWorkout(workout: Workout) {
    const blob = new Blob([JSON.stringify(workout, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${workout.name.toLowerCase().replace(/[^a-z0-9åäö]+/gi, '-')}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    notify('Passet har exporterats')
  }

  function importWorkout(file?: File) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result)) as Workout
        if (!imported?.name || !Array.isArray(imported.sections)) throw new Error('Ogiltigt pass')
        const workout = { ...imported, id: uid(), source: 'imported' as const, category: 'Att testa', favorite: false, createdAt: new Date().toISOString() }
        setWorkouts((current) => [workout, ...current])
        setSelected(workout)
        notify('Passet har importerats')
      } catch {
        notify('Filen kunde inte läsas som ett WODmate-pass')
      }
    }
    reader.readAsText(file)
    if (fileInput.current) fileInput.current.value = ''
  }

  async function shareWorkout(workout: Workout) {
    const link = shareEncode(workout)
    try {
      await navigator.clipboard.writeText(link)
      notify('Delningslänk kopierad!')
    } catch {
      window.prompt('Kopiera delningslänken:', link)
    }
  }

  function toggleEquipment(item: Equipment) {
    setEquipment((current) => current.includes(item) ? current.filter((x) => x !== item) : [...current, item])
  }

  function openWorkout(workout: Workout) {
    setSelected(workout)
    setEditName(workout.name)
    setEditNotes(workout.notes)
  }

  const isSaved = selected ? workouts.some((w) => w.id === selected.id) : false

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Activity size={21} strokeWidth={2.7} /></div><div><strong>WODmate</strong><span>YOUR WORKOUT LAB</span></div></div>
        <div className="sidebar-label">MENY</div>
        <button className={`nav-item ${tab === 'discover' ? 'active' : ''}`} onClick={() => { setTab('discover'); setSelected(null) }}><Sparkles size={18} /> Upptäck <span className="nav-dot" /></button>
        <button className={`nav-item ${tab === 'library' ? 'active' : ''}`} onClick={() => { setTab('library'); setSelected(null) }}><Bookmark size={18} /> Mina pass <span className="nav-count">{savedCount}</span></button>
        <button className={`nav-item ${tab === 'shared' ? 'active' : ''}`} onClick={() => { setTab('shared'); setSelected(null) }}><Share2 size={18} /> Delade pass</button>
        <div className="sidebar-rule" />
        <div className="sidebar-label">SNABBFILTER</div>
        {categories.slice(1).map((category) => <button key={category} className={`nav-item subnav ${filter === category ? 'chosen' : ''}`} onClick={() => { setFilter(category); setTab('library'); setSelected(null) }}><span className={`category-dot dot-${category.toLowerCase().replace(' ', '-')}`} />{category}</button>)}
        <div className="sidebar-bottom"><div className="profile-orb">W</div><div><strong>Träningsprofil</strong><span>Personligt bibliotek</span></div><ChevronDown size={16} /></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="mobile-brand"><div className="brand-mark"><Activity size={19} /></div><strong>WODmate</strong></div>
          <div className="breadcrumb">WORKOUT LAB <span>/</span> {selected ? 'PASSDETALJER' : tab === 'discover' ? 'UPPTÄCK' : tab === 'library' ? 'MINA PASS' : 'DELADE PASS'}</div>
          <div className="top-actions"><span className="status-pill"><span /> PROTOTYP</span><button className="icon-button" title="Skapa pass manuellt" onClick={() => setShowManual(true)}><Plus size={18} /></button></div>
        </header>

        {selected ? (
          <section className="content detail-content">
            <button className="back-button" onClick={() => setSelected(null)}><ArrowLeft size={16} /> Tillbaka</button>
            <div className="detail-hero">
              <div className="detail-kicker"><span className="eyebrow">WOD / PASSDETALJER</span><span className="tag">{selected.format}</span></div>
              <h1>{selected.name}</h1>
              <p className="detail-description">{selected.description}</p>
              <div className="detail-stats">
                <div><Clock3 size={17} /><span>{selected.durationMinutes} min</span></div>
                <div><Flame size={17} /><span>{selected.difficulty}</span></div>
                <div><Dumbbell size={17} /><span>{selected.focus.join(' · ')}</span></div>
              </div>
              <div className="detail-actions">
                {!isSaved && <button className="button button-primary" onClick={() => saveWorkout(selected)}><Bookmark size={16} /> Spara pass</button>}
                <button className="button button-secondary" onClick={() => shareWorkout(selected)}><Link2 size={16} /> Dela länk</button>
                <button className={`button button-secondary ${selected.favorite ? 'favorite-on' : ''}`} onClick={() => toggleFavorite(selected)}><Heart size={16} fill={selected.favorite ? 'currentColor' : 'none'} /> Favorit</button>
                <button className="button button-secondary" onClick={() => exportWorkout(selected)}><ArrowDownToLine size={16} /> Exportera JSON</button>
              </div>
            </div>
            <div className="detail-grid">
              <div className="workout-sections">
                {selected.sections.map((section) => <section className="workout-section" key={section.id}>
                  <div className="section-heading"><div><span className="eyebrow">DEL AV PASSET</span><h2>{section.title}</h2></div><span className="tag">{section.format}</span></div>
                  {section.instructions && <p className="section-instructions">{section.instructions}</p>}
                  <div className="exercise-list">{section.exercises.map((exercise, index) => <div className="exercise-row" key={exercise.id}><span className="exercise-index">{String(index + 1).padStart(2, '0')}</span><div className="exercise-main"><strong>{exercise.name}</strong>{exercise.note && <small>{exercise.note}</small>}</div><span className="exercise-prescription">{exercise.prescription}</span></div>)}</div>
                  {section.durationMinutes && <div className="section-footer"><Clock3 size={14} /> {section.durationMinutes} min</div>}
                </section>)}
                <div className="edit-card">
                  <div className="section-heading"><div><span className="eyebrow">PERSONLIGT</span><h2>Anteckningar & namn</h2></div></div>
                  <label>Passnamn<input value={editName} onChange={(e) => setEditName(e.target.value)} /></label>
                  <label>Anteckningar<textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} placeholder="Skalning, vikter, egna tips..." /></label>
                  <button className="button button-primary" onClick={saveEdits}><Check size={16} /> Spara ändringar</button>
                </div>
              </div>
              <aside className="detail-aside">
                <div className="side-card"><span className="eyebrow">UTRUSTNING</span><div className="equipment-list">{selected.equipment.map((item) => <span className="equipment-chip" key={item}>{item}</span>)}</div></div>
                <div className="side-card"><span className="eyebrow">KATEGORI</span><strong className="side-card-title">{selected.category}</strong><span className="muted-text">Skapad {new Date(selected.createdAt).toLocaleDateString('sv-SE')}</span></div>
                <div className="side-card tip-card"><div className="tip-icon"><Trophy size={18} /></div><strong>Träna smart</strong><p>Välj belastning som låter dig behålla god teknik genom hela passet. Skala vid behov.</p></div>
                {isSaved && <button className="delete-button" onClick={() => deleteWorkout(selected)}><Trash2 size={15} /> Ta bort från Mina pass</button>}
              </aside>
            </div>
          </section>
        ) : tab === 'discover' ? (
          <section className="content">
            <div className="hero-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> DIN PERSONLIGA WOD-GENERATOR</div><h1>Vad är du sugen<br />på <span>idag?</span></h1><p>Hitta nästa pass. Bygg din rutin. Dela energin.</p></div><div className="hero-stamp"><span>WOD</span><strong>01</strong><small>WORKOUT<br />OF THE DAY</small></div></div>
            <div className="generator-layout">
              <div className="generator-card">
                <div className="card-title"><div className="title-icon"><Sparkles size={19} /></div><div><h2>Skapa ditt pass</h2><p>Finjustera eller låt dig överraskas.</p></div><span className="step-label">01 / 02</span></div>
                <div className="form-block"><label className="field-label">VAD VILL DU FOKUSERA PÅ?</label><div className="focus-grid">{focuses.map((item) => <button key={item} className={`focus-option ${focus === item ? 'selected' : ''}`} onClick={() => setFocus(item)}>{item === 'Styrka' ? <Dumbbell size={17} /> : item === 'Kondition' ? <Activity size={17} /> : item === 'Hyrox' ? <Flame size={17} /> : <Trophy size={17} />}{item}</button>)}</div></div>
                <div className="form-row">
                  <div className="form-block"><label className="field-label">UPPLÄGG</label><select value={format} onChange={(e) => setFormat(e.target.value as WorkoutFormat)}>{formats.map((item) => <option key={item}>{item}</option>)}</select></div>
                  <div className="form-block"><label className="field-label">NIVÅ</label><select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>{(['Nybörjare', 'Medel', 'Avancerad'] as Difficulty[]).map((item) => <option key={item}>{item}</option>)}</select></div>
                </div>
                <div className="form-block duration-block"><div className="duration-head"><label className="field-label">HUR LÅNGT PASS?</label><strong>{duration} <small>MIN</small></strong></div><input className="range-input" type="range" min="10" max="60" step="5" value={duration} onChange={(e) => setDuration(Number(e.target.value))} /><div className="range-labels"><span>10 min</span><span>60 min</span></div></div>
                <div className="form-block"><label className="field-label">TILLGÄNGLIG UTRUSTNING</label><div className="equipment-options">{equipmentOptions.map((item) => <button key={item} className={`equipment-option ${equipment.includes(item) ? 'selected' : ''}`} onClick={() => toggleEquipment(item)}>{equipment.includes(item) && <Check size={13} />}{item}</button>)}</div></div>
                <div className="form-block"><label className="field-label">BESKRIV DITT PASS <span className="optional">VALFRITT</span></label><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} placeholder="Ex. Jag vill ha ett riktigt flåsigt pass med skivstång och box jumps, men inga burpees..." /></div>
                <button className="button button-primary generate-button" onClick={createWorkout}><Sparkles size={17} /> Generera pass <span>↗</span></button>
                <p className="demo-note">Demo-generator just nu · AI-koppling läggs till i nästa steg</p>
              </div>
              <aside className="inspiration-column">
                <div className="inspiration-title"><div><span className="eyebrow">SNABBSTART</span><h2>Behöver du inspo?</h2></div><span className="sparkle-mark">✳</span></div>
                <button className="inspiration-card orange" onClick={() => { setFocus('Kondition'); setFormat('AMRAP'); setDuration(15); setEquipment(['Kroppsvikt', 'Roddmaskin']); setPrompt('Ett kort, flåsigt pass med jämnt tempo.'); }}><div className="inspiration-card-top"><span>01 / ENGINE</span><Activity size={18} /></div><strong>Quick & Sweaty</strong><p>15 minuter · Kondition</p><span className="card-arrow">↗</span></button>
                <button className="inspiration-card lime" onClick={() => { setFocus('Olympiska lyft'); setFormat('Öppet upplägg'); setDuration(30); setEquipment(['Skivstång']); setPrompt('Fokus på teknik och explosivitet, inte maxvikt.'); }}><div className="inspiration-card-top"><span>02 / BARBELL</span><Dumbbell size={18} /></div><strong>Barbell Practice</strong><p>30 minuter · Teknik</p><span className="card-arrow">↗</span></button>
                <button className="inspiration-card dark" onClick={() => { setFocus('Hyrox'); setFormat('Intervaller'); setDuration(35); setEquipment(['Roddmaskin', 'Kroppsvikt', 'Kettlebell']); setPrompt('Hyrox-inspirerat upplägg utan löpning.'); }}><div className="inspiration-card-top"><span>03 / HYBRID</span><Flame size={18} /></div><strong>Race Ready</strong><p>35 minuter · Hybrid</p><span className="card-arrow">↗</span></button>
                <div className="mini-stat"><div className="mini-stat-icon"><Bookmark size={18} /></div><div><strong>{savedCount} sparade pass</strong><span>{favoriteCount} favoriter i ditt bibliotek</span></div><button onClick={() => { setTab('library'); setSelected(null) }} aria-label="Visa sparade pass">↗</button></div>
              </aside>
            </div>
            <section className="recent-section"><div className="section-heading"><div><span className="eyebrow">DINA SENASTE</span><h2>Plocka upp tråden</h2></div><button className="text-button" onClick={() => { setTab('library'); setSelected(null) }}>Visa alla pass <span>↗</span></button></div><div className="workout-cards">{workouts.slice(0, 3).map((workout) => <WorkoutCard key={workout.id} workout={workout} onOpen={openWorkout} onFavorite={toggleFavorite} />)}</div></section>
          </section>
        ) : (
          <section className="content">
            <div className="library-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> DITT TRÄNINGSARKIV</div><h1>{tab === 'shared' ? 'Delade <span>pass.</span>' : 'Dina <span>pass.</span>'}</h1><p>{tab === 'shared' ? 'Pass du öppnat eller importerat från andra.' : 'All inspiration samlad på ett ställe.'}</p></div><button className="button button-primary" onClick={() => setShowManual(true)}><CirclePlus size={17} /> Skapa eget pass</button></div>
            <div className="library-toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Sök pass, fokus eller utrustning..." /></div><select value={filter} onChange={(e) => setFilter(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select><button className="button button-secondary" onClick={() => fileInput.current?.click()}><ArrowUpFromLine size={16} /> Importera</button><input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={(e) => importWorkout(e.target.files?.[0])} /></div>
            <div className="library-summary"><div><strong>{visibleWorkouts.length}</strong><span>pass visas</span></div><div><strong>{favoriteCount}</strong><span>favoriter</span></div><div><strong>{new Set(workouts.map((w) => w.category)).size}</strong><span>kategorier</span></div></div>
            {visibleWorkouts.length ? <div className="workout-cards library-cards">{visibleWorkouts.map((workout) => <WorkoutCard key={workout.id} workout={workout} onOpen={openWorkout} onFavorite={toggleFavorite} onShare={shareWorkout} />)}</div> : <div className="empty-state"><div className="empty-icon"><Bookmark size={23} /></div><h2>Inga pass här ännu</h2><p>Skapa ett nytt pass eller importera en JSON-fil från en kompis.</p><button className="button button-primary" onClick={() => { setTab('discover'); setSelected(null) }}>Hitta ett pass</button></div>}
            <div className="import-hint"><Share2 size={17} /><div><strong>Få ett pass från en kompis?</strong><span>Öppna delningslänken eller importera en .json-fil så läggs passet till i ditt bibliotek.</span></div></div>
          </section>
        )}
        <footer className="footer"><span>WODmate <span className="footer-dot">•</span> BUILD YOUR NEXT WOD</span><span>TRÄNA SMART. HÅLL DIG I RÖRELSE.</span></footer>
      </main>

      {showManual && <div className="modal-backdrop" onClick={() => setShowManual(false)}><div className="modal" onClick={(e) => e.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">DITT BIBLIOTEK</span><h2>Skapa eget pass</h2></div><button className="icon-button" onClick={() => setShowManual(false)}><X size={18} /></button></div><label>Passnamn<input autoFocus value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="Ex. Friday Night Lights" /></label><label>Kort beskrivning<textarea value={manualDescription} onChange={(e) => setManualDescription(e.target.value)} placeholder="Vad är tanken med passet?" rows={3} /></label><div className="modal-actions"><button className="button button-secondary" onClick={() => setShowManual(false)}>Avbryt</button><button className="button button-primary" onClick={createManualWorkout}><Plus size={16} /> Skapa pass</button></div></div></div>}
      {toast && <div className="toast"><Check size={16} />{toast}</div>}
    </div>
  )
}

function WorkoutCard({ workout, onOpen, onFavorite, onShare }: { workout: Workout; onOpen: (workout: Workout) => void; onFavorite: (workout: Workout) => void; onShare?: (workout: Workout) => void }) {
  const tone = workout.focus.includes('Styrka') || workout.focus.includes('Olympiska lyft') ? 'card-tone-lime' : workout.focus.includes('Hyrox') ? 'card-tone-dark' : 'card-tone-orange'
  return <article className="workout-card">
    <button className={`workout-card-art ${tone}`} onClick={() => onOpen(workout)} aria-label={`Öppna ${workout.name}`}><span className="art-label">{workout.focus[0] ?? 'CrossFit'}</span><div className="art-shape"><Activity size={35} /></div><span className="art-time"><Clock3 size={13} /> {workout.durationMinutes} MIN</span></button>
    <div className="workout-card-body"><div className="card-meta"><span>{workout.format}</span><span>·</span><span>{workout.difficulty}</span></div><button className="workout-card-name" onClick={() => onOpen(workout)}>{workout.name}</button><p>{workout.description}</p><div className="card-bottom"><span className="equipment-summary">{workout.equipment.slice(0, 2).join(' · ')}</span><div className="card-buttons"><button className={`small-icon-button ${workout.favorite ? 'favorite-on' : ''}`} title="Favorit" onClick={() => onFavorite(workout)}><Heart size={16} fill={workout.favorite ? 'currentColor' : 'none'} /></button>{onShare && <button className="small-icon-button" title="Dela pass" onClick={() => onShare(workout)}><Share2 size={16} /></button>}<button className="small-icon-button open-arrow" title="Öppna pass" onClick={() => onOpen(workout)}>↗</button></div></div></div>
  </article>
}

export default App
