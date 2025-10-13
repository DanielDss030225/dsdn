import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Smartphone, Monitor, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { determineInitialScale, getWorkStatusForDate } from './lib/scaleLogic.js'
import { getHolidaysForYear, isHoliday } from './lib/holidays.js'
import { useEvents } from './hooks/useEvents.js'
import { EventModal } from './components/EventModal.jsx'
import './App.css'

const normalizeDate = (date) => {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function App() {
  const handleNewEvent = () => {
  playClickSound();            // toca o som de clique
  setSelectedEvent(null);       // indica que é um novo evento
  setSelectedDate(new Date());  // define a data atual como selecionada
  setShowEventModal(true);      // abre o modal
  playModalOpenSound();         // toca som de abrir modal
};

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [userScale, setUserScale] = useState(null)
  const [showInitialSetup, setShowInitialSetup] = useState(true)
  const [changingScale, setChangingScale] = useState(false)
  const [viewMode, setViewMode] = useState('month')
  const [isMobile, setIsMobile] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [soundsEnabled, setSoundsEnabled] = useState(() => {
    const savedSoundsEnabled = localStorage.getItem("soundsEnabled")
    return savedSoundsEnabled ? JSON.parse(savedSoundsEnabled) : true
  })
const [touchStartX, setTouchStartX] = useState(null)
const [touchEndX, setTouchEndX] = useState(null)
const handleTouchStart = (e) => {
  setTouchStartX(e.changedTouches[0].clientX)
}

const handleTouchEnd = (e) => {
  if (touchStartX === null) return

  const touchEnd = e.changedTouches[0].clientX
  const deltaX = touchEnd - touchStartX
  const swipeThreshold = 300 // mínimo em pixels para considerar swipe

  if (deltaX > swipeThreshold) {
    // Swipe para a direita → mês anterior
    playClickSound()
    goToPreviousMonth()
  } else if (deltaX < -swipeThreshold) {
    // Swipe para a esquerda → próximo mês
    playClickSound()
    goToNextMonth()
  }

  setTouchStartX(null)
  setTouchEndX(null)
}

  useEffect(() => {
    localStorage.setItem("soundsEnabled", JSON.stringify(soundsEnabled))
  }, [soundsEnabled])

// Inicializar sons com tratamento de erro
  const [audioLoaded, setAudioLoaded] = useState(false)
  const [clickSound, setClickSound] = useState(null)
  const [modalOpenSound, setModalOpenSound] = useState(null)

  // Carregar sons quando o componente montar
  useEffect(() => {
    const loadAudio = async () => {
      try {
        // Tentar diferentes caminhos para os arquivos de áudio
        const audioPaths = [
          { click: "./audio/click.mp3", modal: "./audio/modal_open.mp3" },
          { click: "/audio/click.mp3", modal: "/audio/modal_open.mp3" },
          { click: "/public/audio/click.mp3", modal: "/public/audio/modal_open.mp3" }     ]
        
        let audioLoaded = false
        
        for (const paths of audioPaths) {
          try {
            const click = new Audio(paths.click)
            const modalOpen = new Audio(paths.modal)
            
            // Pré-carregar os áudios
            click.preload = 'auto'
            modalOpen.preload = 'auto'
            
            // Aguardar carregamento com timeout
            await Promise.race([
              Promise.all([
                new Promise((resolve, reject) => {
                  click.addEventListener('canplaythrough', resolve, { once: true })
                  click.addEventListener('error', reject, { once: true })
                  click.load()
                }),
                new Promise((resolve, reject) => {
                  modalOpen.addEventListener('canplaythrough', resolve, { once: true })
                  modalOpen.addEventListener('error', reject, { once: true })
                  modalOpen.load()
                })
              ]),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ])
            
            setClickSound(click)
            setModalOpenSound(modalOpen)
            setAudioLoaded(true)
            audioLoaded = true
            console.log('Áudios carregados com sucesso:', paths)
            break
          } catch (pathError) {
            console.warn('Falha ao carregar áudios do caminho:', paths, pathError)
            continue
          }
        }
        
        if (!audioLoaded) {
          console.warn('Não foi possível carregar os áudios de nenhum caminho')
          setAudioLoaded(false)
        }
      } catch (error) {
        console.warn('Erro geral ao carregar áudios:', error)
        setAudioLoaded(false)
      }
    }
    
    loadAudio()
  }, [])

  const playClickSound = () => { 
    if (!soundsEnabled || !audioLoaded || !clickSound) {
      console.log('Som de clique não reproduzido:', { soundsEnabled, audioLoaded, clickSound: !!clickSound })
      return
    }
    try {
      clickSound.currentTime = 0
      const playPromise = clickSound.play()
      if (playPromise !== undefined) {
        playPromise.catch(e => console.warn('Erro ao reproduzir som de clique:', e))
      }
    } catch (error) {
      console.warn('Erro ao reproduzir som de clique:', error)
    }
  }
  
  const playModalOpenSound = () => { 
    if (!soundsEnabled || !audioLoaded || !modalOpenSound) {
      console.log('Som de modal não reproduzido:', { soundsEnabled, audioLoaded, modalOpenSound: !!modalOpenSound })
      return
    }
    try {
      modalOpenSound.currentTime = 0
      const playPromise = modalOpenSound.play()
      if (playPromise !== undefined) {
        playPromise.catch(e => console.warn('Erro ao reproduzir som de modal:', e))
      }
    } catch (error) {
      console.warn('Erro ao reproduzir som de modal:', error)
    }
  }
  
  const playModalCloseSound = () => { 
    if (!soundsEnabled || !audioLoaded || !modalOpenSound) {
      console.log('Som de fechar modal não reproduzido:', { soundsEnabled, audioLoaded, modalOpenSound: !!modalOpenSound })
      return
    }
    try {
      modalOpenSound.currentTime = 0
      const playPromise = modalOpenSound.play()
      if (playPromise !== undefined) {
        playPromise.catch(e => console.warn('Erro ao reproduzir som de modal:', e))
      }
    } catch (error) {
      console.warn('Erro ao reproduzir som de modal:', error)
    }
  }

  const { events, addEvent, updateEvent, removeEvent, getEventsForDate } = useEvents()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const savedScale = localStorage.getItem('userScale')
    if (savedScale) {
      setUserScale(savedScale)
      setShowInitialSetup(false)
    }
  }, [])

  const handleInitialSetup = (isOffToday) => {
    const scale = determineInitialScale(isOffToday, new Date())
    setUserScale(scale)
    setShowInitialSetup(false)
    setChangingScale(false)
    localStorage.setItem('userScale', scale)
  }

  const goToPreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const goToPreviousYear = () => setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1))
  const goToNextYear = () => setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1))

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = startingDayOfWeek - 1; i >= 0; i--) days.push({ date: new Date(year, month, -i), isCurrentMonth: false })
    for (let day = 1; day <= daysInMonth; day++) days.push({ date: new Date(year, month, day), isCurrentMonth: true })
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false })
    return days
  }

  // 🔹 Ajuste principal: sempre abre modal de lista de eventos
const handleDayClick = (date) => {
  playClickSound()
  setSelectedDate(normalizeDate(date))
  setSelectedEvent(null) // Garante que nenhum evento específico esteja selecionado
  setShowEventModal(true)
  playModalOpenSound()
}

  const handleEditEvent = (event) => {
    setSelectedDate(normalizeDate(event.date))
    setSelectedEvent(event)
    setShowEventModal(true)
    playModalOpenSound()
  }

const handleSaveEvent = (eventData) => { 
  if (!eventData.date && selectedDate) {
    eventData.date = selectedDate
  }

  if(selectedEvent) updateEvent(selectedEvent.id,eventData)
  else addEvent(eventData)
}


  const handleDeleteEvent = (eventId) => {
    removeEvent(eventId)
    setSelectedEvent(null)
    setShowEventModal(false)
  }

  const getCategoryColor = (category) => ({
    evento: 'bg-blue-500', aniversario: 'bg-pink-500', trabalho: 'bg-green-500', pessoal: 'bg-purple-500', saude: 'bg-red-500', estudo: 'bg-yellow-500'
  }[category] || 'bg-blue-500')

  const filteredEvents = events.filter(evt => {
    const query = searchQuery.toLowerCase()
    const adjustedDate = new Date(evt.date)
    adjustedDate.setDate(adjustedDate.getDate() + 1)
    const dateStr = adjustedDate.toLocaleDateString('pt-BR')
    return (
      evt.title.toLowerCase().includes(query) ||
      (evt.description && evt.description.toLowerCase().includes(query)) ||
      evt.category.toLowerCase().includes(query) ||
      dateStr.includes(query)
    )
  })




  const renderDayCell = (dayInfo, index) => {
    const { date, isCurrentMonth } = dayInfo
    const isToday = date.toDateString() === new Date().toDateString()
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
    const holiday = isHoliday(date)
    const workStatus = userScale ? getWorkStatusForDate(date, userScale) : null
    const dayEvents = getEventsForDate(date)

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.01 }}
        className={`
          relative p-2 border border-border cursor-pointer transition-all duration-200
          ${isCurrentMonth ? 'bg-card' : 'bg-muted/30'}
          ${isSelected ? 'bg-accent' : ''}
          hover:bg-accent/50
          flex flex-col h-full
        `}
        style={{
          backgroundColor: workStatus ? (workStatus.isOff ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)') : undefined,
          borderWidth: isToday ? '2px' : undefined,
          borderStyle: isToday ? 'solid' : undefined,
          borderImage: isToday ? 'linear-gradient(45deg, #3b82f6, #a855f7, #10b981) 1' : undefined,
        }}
        onClick={() => { playClickSound(); handleDayClick(date) }}
      >
        <div className="flex justify-between items-start mb-2">
          <span className={`text-sm font-medium ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
            {date.getDate()}
          </span>
          <div className="flex gap-1">
            {holiday && <Badge variant="destructive" className="text-xs px-1 py-0">F</Badge>}
          </div>
        </div>

        <div  className="flex-1 flex flex-col justify-start space-y-1 overflow-hidden">
          {holiday && <div className="text-xs text-destructive font-medium mb-1 truncate">{holiday.name}</div>}

          {dayEvents.slice(0, 1).map((event, idx) => (
            <div 
              key={idx} 
              className={`text-xs text-white px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 ${getCategoryColor(event.category)}`}
              onClick={(e) => { e.stopPropagation(); handleEditEvent(event) }}
            >
              {event.time && <span className="font-mono mr-1">{event.time}</span>}
              {event.title}
            </div>
          ))}

          {dayEvents.length > 1 && (
            <div className="text-xs text-muted-foreground font-medium">+{dayEvents.length - 1} mais</div>
          )}
        </div>
      </motion.div>
    )
  }

const renderMonthView = () => {

  const days = getDaysInMonth(currentDate)

 const monthName = currentDate
  .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  .replace(/^\w/, c => c.toUpperCase()) // deixa a 1ª letra maiúscula
  .split(' ')
  .map((part, index) => (index === 0 && part.length > 6 ? part.slice(0, 3) + '…' : part))
  .join(' ')


  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Cabeçalho do mês */}
      <div className="flex items-center justify-between flex-wrap">
        {/* 🔹 Agora o título é clicável */}
        <h2
          className="text-2xl font-bold capitalize cursor-pointer hover:text-primary transition-colors"
          onClick={() => {
            playClickSound()
            setViewMode('year') // alterna para o modo de ano
          }}
          title="Ver todos os meses"
        >
          {monthName}
        </h2>

        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => { playClickSound(); goToPreviousMonth() }}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => { playClickSound(); goToNextMonth() }}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            playClickSound()
            const today = new Date()
            setCurrentDate(today)
            setSelectedDate(today)
          }}>
            Hoje
          </Button>
        </div>
      </div>

      {/* Grid do calendário */}
    <div
  className="flex-1 min-h-[600px] overflow-y-auto pb-[20px]"
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
>
  <div className="grid grid-cols-7 border border-border rounded-lg">
    {/* Dias da semana */}
    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day =>
      <div key={day} className="bg-muted text-center font-medium text-sm py-1">{day}</div>
    )}

    {/* Dias do mês */}
    {days.map((dayInfo, index) =>
      <div key={index} className="h-[120px]">
        {renderDayCell(dayInfo, index)}
      </div>
    )}
  </div>
</div>

    </div>
  )
}


 const renderYearView = () => {
  const year = currentDate.getFullYear()
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap">
        {/* 🔹 Agora o ano é clicável e volta para o modo mês */}
        <h2
          className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors"
          onClick={() => {
            playClickSound()
            setViewMode('month') // muda para visualização mensal
          }}
          title="Ver calendário do mês atual"
        >
          {year}
        </h2>

        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => { playClickSound(); goToPreviousYear() }}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => { playClickSound(); goToNextYear() }}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map((monthDate, index) => {
          const days = getDaysInMonth(monthDate)
          const monthName = monthDate.toLocaleDateString('pt-BR', { month: 'long' })
          return (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setCurrentDate(monthDate)
                setViewMode('month')
                playClickSound()
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm capitalize">{monthName}</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
                    <div key={day} className="text-center font-medium text-muted-foreground p-1">
                      {day}
                    </div>
                  ))}
                  {days.map((dayInfo, dayIndex) => {
                    const { date, isCurrentMonth } = dayInfo
                    const isToday = date.toDateString() === new Date().toDateString()
                    const holiday = isHoliday(date)
                    const workStatus = userScale ? getWorkStatusForDate(date, userScale) : null
                    const dayEvents = getEventsForDate(date)

                    // Determina a cor de fundo baseada no status de trabalho
                    let backgroundStyle = {}
                    if (workStatus && isCurrentMonth) {
                      if (workStatus.isOff) {
                        backgroundStyle.backgroundColor = 'rgba(34, 197, 94, 0.3)' // Verde transparente para folga
                      } else {
                        backgroundStyle.backgroundColor = 'rgba(239, 68, 68, 0.3)' // Vermelho transparente para trabalho
                      }
                    }

                    return (
                      <div
                        key={dayIndex}
                        className={`
                          text-center p-1 rounded transition-colors relative
                          ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                          ${isToday ? 'bg-primary text-primary-foreground' : ''}
                          ${holiday ? 'bg-destructive/20' : ''}
                        `}
                        style={isToday ? {} : backgroundStyle}
                      >
                        {date.getDate()}
                        {dayEvents.length > 0 && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}




if(showInitialSetup){
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">{changingScale?"Trocar Escala":"Configuração de escala"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">{changingScale?"Escolha sua nova escala:":"Para configurar sua escala de trabalho, responda:"}</p>
          {!changingScale && <p className="text-center font-medium">Você está de folga hoje?</p>}
          <div className="flex gap-4 justify-center">
            <Button onClick={()=>{ playClickSound(); handleInitialSetup(true) }} className="flex-1">Sim</Button>
            <Button onClick={()=>{ playClickSound(); handleInitialSetup(false) }} variant="outline" className="flex-1">Não</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


  return (
   <div className="min-h-screen bg-background pb-[100px]">

      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
 

            <div className="flex flex-wrap items-center gap-2">
               <CalendarDays className="w-6 h-6 text-primary" />
        
              <Button size="sm" onClick={()=>handleNewEvent()}> Novo Evento</Button>
              <Button size="sm" onClick={()=>setShowSearchModal(true)}>Meus Eventos</Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSoundsEnabled(prev => !prev)}
                className="ml-2"
                title={soundsEnabled ? "Desativar Sons" : "Ativar Sons"}
              >
                {soundsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          {userScale && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="cursor-pointer" onClick={()=>{ setShowInitialSetup(true) }}>
                 {userScale}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {events.length} evento{events.length !==1 ? 's' : ''}{events.length !==1 ? '' : ''}
              </span>
                  <div className="flex gap-1 flex-wrap">
                <Button variant={viewMode==='month'?'default':'outline'} size="sm" className="min-w-[70px]" onClick={()=>{ playClickSound(); setViewMode("month") }}>
                  <Smartphone className="w-4 h-4 mr-1" /> Mês
                </Button>
                <Button variant={viewMode==='year'?'default':'outline'} size="sm" className="min-w-[70px]" onClick={()=>{ playClickSound(); setViewMode("year") }}>
                  <Monitor className="w-4 h-4 mr-1" /> Ano
                </Button>
              </div></div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 flex flex-col h-[calc(100vh-100px)]">
        <AnimatePresence mode="wait" className="flex-1">
          <motion.div key={viewMode} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} transition={{ duration:0.2 }} className="flex-1 flex flex-col">
            {viewMode==='month'? renderMonthView() : renderYearView()}
          </motion.div>
        </AnimatePresence>
      </main>
{/* MODAL DE EVENTOS */}
<EventModal 
  isOpen={showEventModal} 
  onClose={() => { 
    setShowEventModal(false); 
    playModalCloseSound(); 
  }} 
  onSave={handleSaveEvent} 
  onDelete={handleDeleteEvent} 
  
  event={selectedEvent} 
  selectedDate={selectedDate}
  userScale={userScale}
  eventsOfDay={
    selectedDate 
      ? events.filter(
          evt => normalizeDate(evt.date).getTime() === normalizeDate(selectedDate).getTime()
        ) 
      : []
  }
/>

{/* MODAL DE PESQUISA */}
{showSearchModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-0">
    <div 
      className="bg-card w-full h-full flex flex-col p-4"
    >
      {/* Cabeçalho fixo */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-card z-10 pb-2 border-b border-border">
        <h2 className="text-lg font-bold">Pesquisar Eventos</h2>
        <Button size="sm" onClick={() => setShowSearchModal(false)}>Fechar</Button>
      </div>

      {/* Input de pesquisa */}
      <input
        type="text"
        className="border border-border rounded px-3 py-2 mb-4 w-full"
        placeholder="Pesquisar por título, descrição, categoria ou data"
        value={searchQuery}
        
       
        onChange={(e) => setSearchQuery(e.target.value)}
           autoFocus={false} // 👈 evita que o teclado abra no mobile
      />

      {/* Lista de resultados */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(evt => (
            <div 
              key={evt.id} 
              className="p-2 bg-muted/20 rounded cursor-pointer flex justify-between items-center hover:bg-muted/40"
              onClick={() => { 
                setSelectedEvent(evt); 
                setSelectedDate(normalizeDate(evt.date)); 
                setShowEventModal(true); 
                setShowSearchModal(false); 
              }}
            >
              <div>
                <span className="font-mono mr-2">
                  {new Date(new Date(evt.date).setDate(new Date(evt.date).getDate() + 1))
                    .toLocaleDateString('pt-BR')}
                </span>
                <span className="font-medium">{evt.title}</span>
                {evt.category && <Badge className="ml-2">{evt.category}</Badge>}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum evento encontrado.</p>
        )}
      </div>
    </div>
  </div>
)}



    </div>
  )
}

export default App