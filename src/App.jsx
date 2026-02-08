import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Search, Briefcase, Smartphone, Monitor, Volume2, VolumeX, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { determineInitialScale, getWorkStatusForDate } from './lib/scaleLogic.js'
import { getHolidaysForYear, isHoliday } from './lib/holidays.js'
import { useEvents } from './hooks/useEvents.js'
import { EventModal } from './components/EventModal.jsx'
import { DayDetailsModal } from './components/DayDetailsModal.jsx'
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
  const [setupStep, setSetupStep] = useState('initial') // initial, custom_sequence, today_status
  const [customSequence, setCustomSequence] = useState([]) // Array of { type: 'T' | 'F', label: string }
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
  const [showDayDetailsModal, setShowDayDetailsModal] = useState(false)

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
        const click = new Audio("/audio/click.mp3")
        const modalOpen = new Audio("/audio/modal_open.mp3")

        // Pré-carregar os áudios
        click.preload = 'auto'
        modalOpen.preload = 'auto'

        // Aguardar carregamento
        await Promise.all([
          new Promise((resolve) => {
            click.addEventListener('canplaythrough', resolve, { once: true })
            click.load()
          }),
          new Promise((resolve) => {
            modalOpen.addEventListener('canplaythrough', resolve, { once: true })
            modalOpen.load()
          })
        ])

        setClickSound(click)
        setModalOpenSound(modalOpen)
        setAudioLoaded(true)
      } catch (error) {
        console.warn('Erro ao carregar áudios:', error)
        setAudioLoaded(false)
      }
    }

    loadAudio()
  }, [])

  const playClickSound = () => {
    if (!soundsEnabled || !audioLoaded || !clickSound) return
    try {
      clickSound.currentTime = 0
      clickSound.play().catch(e => console.warn('Erro ao reproduzir som de clique:', e))
    } catch (error) {
      console.warn('Erro ao reproduzir som de clique:', error)
    }
  }

  const playModalOpenSound = () => {
    if (!soundsEnabled || !audioLoaded || !modalOpenSound) return
    try {
      modalOpenSound.currentTime = 0
      modalOpenSound.play().catch(e => console.warn('Erro ao reproduzir som de modal:', e))
    } catch (error) {
      console.warn('Erro ao reproduzir som de modal:', error)
    }
  }

  const playModalCloseSound = () => {
    if (!soundsEnabled || !audioLoaded || !modalOpenSound) return
    try {
      modalOpenSound.currentTime = 0
      modalOpenSound.play().catch(e => console.warn('Erro ao reproduzir som de modal:', e))
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
      try {
        const parsed = JSON.parse(savedScale)
        setUserScale(parsed)
      } catch (e) {
        setUserScale(savedScale)
      }
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

  const handleCustomSetup = () => {
    setSetupStep('custom_sequence')
  }

  const toggleDayInSequence = (index) => {
    playClickSound()
    let newSeq = [...customSequence]
    if (index >= newSeq.length) {
      // Preencher o gap com null (indefinido) até o dia clicado
      const gap = Array(index - newSeq.length).fill(null)
      newSeq = [...newSeq, ...gap, 'T']
    } else {
      // Alternar: null -> T -> F -> null
      const current = newSeq[index]
      if (current === 'T') newSeq[index] = 'F'
      else if (current === 'F') newSeq[index] = null
      else newSeq[index] = 'T'
    }
    setCustomSequence(newSeq)
  }

  const clearSequence = () => {
    playClickSound()
    setCustomSequence([])
  }

  const finalizeCustomSequence = () => {
    // Converter a sequência para 0 e 1, tratando null como 0 (Folga)
    const sequence = customSequence.map(type => (type === 'T' ? 1 : 0))
    const today = new Date()
    // Definir data de referência como o primeiro dia do mês ATUAL
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const scaleObj = {
      name: 'Personalizada',
      sequence: sequence,
      referenceDate: currentMonth.toISOString(),
      display: `${customSequence.filter(t => t === 'T').length}T x ${customSequence.filter(t => t === 'F').length}F`
    }

    setUserScale(scaleObj)
    setShowInitialSetup(false)
    setChangingScale(false)
    setSetupStep('initial')
    localStorage.setItem('userScale', JSON.stringify(scaleObj))
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

  // 🔹 Ajuste principal: agora abre o modal de detalhes do dia
  const handleDayClick = (date) => {
    playClickSound()
    setSelectedDate(normalizeDate(date))
    setShowDayDetailsModal(true)
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

    if (selectedEvent) updateEvent(selectedEvent.id, eventData)
    else addEvent(eventData)
  }


  const handleDeleteEvent = (eventId) => {
    const originalEvent = events.find(evt => evt.id === eventId)
    if (!originalEvent) return
    const recurrenceId = originalEvent.recurrenceId || originalEvent.id
    const eventsToRemove = events.filter(evt => (evt.recurrenceId || evt.id) === recurrenceId)
    eventsToRemove.forEach(evt => removeEvent(evt.id))
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

    const dateId = date.toISOString().split('T')[0]

    return (
      <motion.div
        key={index}
        id={`day-cell-${dateId}`}
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

        <div className="flex-1 flex flex-col justify-start space-y-1 overflow-hidden">
          {holiday && <div className="text-xs text-destructive font-medium mb-1 truncate">{holiday.name}</div>}

          {dayEvents.slice(0, 1).map((event, idx) => (
            <div
              key={idx}
              id={`day-event-${dateId}-${idx}`}
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

  const renderMonthView = (targetDate = currentDate) => {
    const days = getDaysInMonth(targetDate)
    const monthPart = targetDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').slice(0, 3)
    const yearPart = targetDate.getFullYear()
    const monthName = `${monthPart} de ${yearPart}`

    return (
      <div className="flex flex-col min-h-full space-y-4">
        {/* Cabeçalho do mês */}
        <div className="flex items-center justify-between flex-wrap">
          {/* 🔹 Agora o título é clicável */}
          <h2
            id="month-view-title"
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
            <Button id="btn-prev-month" variant="outline" size="sm" onClick={() => { playClickSound(); goToPreviousMonth() }}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button id="btn-next-month" variant="outline" size="sm" onClick={() => { playClickSound(); goToNextMonth() }}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button id="btn-go-to-today" variant="outline" size="sm" onClick={() => {
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
        <div className="pb-[40px]">
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


  const renderYearView = (targetDate = currentDate) => {
    const year = targetDate.getFullYear()
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1))

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap">
          {/* 🔹 Agora o ano é clicável e volta para o modo mês */}
          <h2
            id="year-view-title"
            className="text-2xl font-bold capitalize cursor-pointer hover:text-primary transition-colors"
            onClick={() => {
              playClickSound()
              setViewMode('month') // muda para visualização mensal
            }}
            title="Ver calendário do mês atual"
          >
            {year}
          </h2>

          <div className="flex gap-2 flex-wrap">
            <Button id="btn-prev-year" variant="outline" size="sm" onClick={() => { playClickSound(); goToPreviousYear() }}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button id="btn-next-year" variant="outline" size="sm" onClick={() => { playClickSound(); goToNextYear() }}>
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
                id={`year-view-month-${index}`}
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
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                      <div key={`${day}-${i}`} className="text-center font-medium text-muted-foreground p-1">
                        {day}
                      </div>
                    ))}
                    {days.map((dayInfo, dayIndex) => {
                      const { date, isCurrentMonth } = dayInfo
                      const isToday = date.toDateString() === new Date().toDateString()
                      const holiday = isHoliday(date)
                      const workStatus = userScale ? getWorkStatusForDate(date, userScale) : null
                      const dayEvents = getEventsForDate(date)

                      return (
                        <div
                          key={dayIndex}
                          className={`
                          text-center p-1 rounded transition-colors relative text-[10px] sm:text-xs
                          ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground opacity-30'}
                          ${isToday ? 'ring-2 ring-primary ring-offset-1 z-10' : ''}
                          ${holiday ? 'bg-orange-500/20 text-orange-700' : ''}
                          ${workStatus && isCurrentMonth ? (
                              workStatus.isOff
                                ? 'bg-green-500/20 text-green-700'
                                : 'bg-red-500/20 text-red-700'
                            ) : ''}
                        `}
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




  if (showInitialSetup) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="relative">
            <CardTitle className="text-center">{changingScale ? "Trocar Escala" : "Configuração de escala"}</CardTitle>
            <Button
              id="btn-close-setup"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-8 w-8 p-0"
              onClick={() => {
                playClickSound()
                setShowInitialSetup(false)
                setChangingScale(false)
                setSetupStep('initial')
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {setupStep === 'initial' && (
              <div className="flex flex-col gap-4 text-center">
                <p className="text-muted-foreground">
                  Para começar, você precisa definir sua escala de trabalho.
                </p>
                <Button id="btn-start-scale-setup" onClick={() => { playClickSound(); handleCustomSetup() }} className="w-full">
                  Definir Minha Escala
                </Button>
              </div>
            )}

            {setupStep === 'custom_sequence' && (
              <div className="space-y-4">
                <p className="text-center text-sm text-muted-foreground">Monte sua sequência de dias:</p>
                <div className="flex flex-col gap-2">
                  <p className="text-center text-xs text-muted-foreground">
                    Clique nos dias abaixo para montar sua sequência (1º clique = Trabalha, 2º = Folga).
                  </p>
                  <Button id="btn-clear-sequence" variant="outline" size="xs" onClick={clearSequence} className="mx-auto text-[10px] h-7">
                    Limpar Sequência
                  </Button>
                </div>

                {/* Previsão Dupla (Mês Atual e Próximo) */}
                <div className="mt-6 border-t pt-4">
                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-8 scrollbar-thin">
                    {[0, 1].map((offset) => {
                      const today = new Date()
                      const targetMonthDate = new Date(today.getFullYear(), today.getMonth() + offset, 1)
                      const monthName = targetMonthDate.toLocaleDateString('pt-BR', { month: 'long' })
                      const anchorDate = new Date(today.getFullYear(), today.getMonth(), 1)

                      return (
                        <div key={offset} className="space-y-4">
                          <p className="text-center text-[14px] font-bold uppercase tracking-wider text-muted-foreground">Previsão para {monthName}</p>
                          <div className="grid grid-cols-7 gap-1.5 max-w-[320px] mx-auto">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                              <div key={d} className="text-[14px] text-center font-bold text-muted-foreground/50">{d}</div>
                            ))}
                            {getDaysInMonth(targetMonthDate).map((dayInfo, i) => {
                              const { date, isCurrentMonth } = dayInfo

                              let bgClass = 'bg-muted/10'
                              let cursorClass = 'cursor-pointer hover:ring-2 hover:ring-primary/50'

                              // Cálculo da diferença em relação ao dia 1º do mês ATUAL
                              const deltaTime = date.getTime() - anchorDate.getTime()
                              const deltaDays = Math.round(deltaTime / (1000 * 60 * 60 * 24))
                              const onClickHandler = () => toggleDayInSequence(deltaDays)

                              if (isCurrentMonth) {
                                /**
                                 * Se o dia está dentro do tamanho da sequência e foi EXPLICITAMENTE clicado (não null),
                                 * mostra a cor sólida. Se está no gap (null) ou além, mostra a cor suave.
                                 */
                                const isExplicit = deltaDays >= 0 && deltaDays < customSequence.length && customSequence[deltaDays] !== null

                                if (isExplicit) {
                                  const status = customSequence[deltaDays]
                                  bgClass = status === 'T' ? 'bg-red-500 text-white shadow-sm' : 'bg-green-500 text-white shadow-sm'
                                } else if (customSequence.length > 0) {
                                  // Preview do que seria o padrão repetido ou o valor default do gap
                                  const index = ((deltaDays % customSequence.length) + customSequence.length) % customSequence.length
                                  const status = customSequence[index]
                                  // Tratar null no preview como 'F' (Folga)
                                  const displayStatus = status === 'T' ? 'T' : 'F'
                                  bgClass = displayStatus === 'T' ? 'bg-red-500/30 text-red-700' : 'bg-green-500/30 text-green-700'
                                }
                              } else {
                                bgClass = 'opacity-0 shadow-none border-none pointer-events-none'
                              }

                              return (
                                <div
                                  key={i}
                                  id={`setup-day-${offset}-${i}`}
                                  onClick={isCurrentMonth ? onClickHandler : null}
                                  className={`text-[14px] text-center p-2 rounded font-bold transition-all ${bgClass} ${isCurrentMonth ? cursorClass : ''}`}
                                >
                                  {isCurrentMonth ? date.getDate() : ''}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-[11px] text-center text-muted-foreground mt-4 italic font-medium">* A sequência se baseia no dia 1º do mês atual</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    id="btn-save-scale"
                    disabled={customSequence.length === 0}
                    onClick={() => finalizeCustomSequence()}
                    className="w-full"
                  >
                    Salvar Escala
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }


  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">

      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2 sm:py-3">
          {/* Main Action Bar */}
          <div className="flex items-center justify-between gap-3 mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary shrink-0" />
              <span className="font-bold text-sm tracking-tight hidden sm:inline">AgBizu</span>
            </div>

            <div className="flex items-center gap-2 flex-1 justify-end">
              <Button
                id="btn-new-event"
                size="sm"
                className="h-9 px-3 text-xs shadow-sm bg-primary hover:bg-primary/90 flex-1 sm:flex-none max-w-[110px]"
                onClick={() => handleNewEvent()}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Novo
              </Button>
              <Button
                id="btn-search-events"
                size="sm"
                variant="secondary"
                className="h-9 px-3 text-xs border flex-1 sm:flex-none max-w-[110px]"
                onClick={() => setShowSearchModal(true)}
              >
                <Search className="w-4 h-4 mr-1.5" />
                Eventos
              </Button>
              <Button
                id="btn-toggle-sounds"
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 shrink-0 border border-transparent hover:border-border"
                onClick={() => setSoundsEnabled(prev => !prev)}
              >
                {soundsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Secondary Info & Toggle Bar */}
          {userScale && (
            <div className="flex items-center justify-between gap-4 pt-2 sm:pt-3 border-t border-border/40">
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground/80 font-bold leading-none">Minha Escala</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    id="btn-scale-settings"
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 bg-primary/5 text-primary border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all font-bold text-[11px] flex items-center justify-center gap-2 shadow-sm active:scale-95 rounded-lg w-full sm:w-auto min-w-[120px]"
                    onClick={() => { playClickSound(); setShowInitialSetup(true) }}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    {typeof userScale === 'string' ? userScale : userScale.display}
                  </Button>
                  <div className="text-[10px] text-muted-foreground font-medium truncate italic opacity-80">
                    {events.length} {events.length === 1 ? 'evento' : 'eventos'}
                  </div>
                </div>
              </div>

              <div className="flex bg-muted/80 backdrop-blur-sm rounded-lg p-0.5 shrink-0 border border-border/50 shadow-inner">
                <Button
                  id="btn-switch-month-view"
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-7 px-3 text-[11px] font-semibold rounded-md transition-all ${viewMode === 'month' ? 'shadow-sm text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-transparent'}`}
                  onClick={() => { playClickSound(); setViewMode("month") }}
                >
                  <Smartphone className="w-3.5 h-3.5 mr-1.5" />
                  Mês
                </Button>
                <Button
                  id="btn-switch-year-view"
                  variant={viewMode === 'year' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-7 px-3 text-[11px] font-semibold rounded-md transition-all ${viewMode === 'year' ? 'shadow-sm text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-transparent'}`}
                  onClick={() => { playClickSound(); setViewMode("year") }}
                >
                  <Monitor className="w-3.5 h-3.5 mr-1.5" />
                  Ano
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <AnimatePresence>
            <motion.div
              key={`${viewMode}-${currentDate.getFullYear()}-${currentDate.getMonth()}`}
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipeThreshold = 50
                const swipeVelocity = 500
                if (offset.x > swipeThreshold || velocity.x > swipeVelocity) {
                  playClickSound()
                  viewMode === 'month' ? goToPreviousMonth() : goToPreviousYear()
                } else if (offset.x < -swipeThreshold || velocity.x < -swipeVelocity) {
                  playClickSound()
                  viewMode === 'month' ? goToNextMonth() : goToNextYear()
                }
              }}
              className="touch-pan-y will-change-transform relative"
            >
              {/* Ribbon of months/years */}
              <div className="flex w-full overflow-visible relative">
                {/* Previous View Preview */}
                <div className="absolute right-full w-full px-4 sm:px-6 opacity-30 pointer-events-none">
                  {viewMode === 'month'
                    ? renderMonthView(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
                    : renderYearView(new Date(currentDate.getFullYear() - 1, 0, 1))
                  }
                </div>

                {/* Current View */}
                <div className="w-full">
                  {viewMode === 'month' ? renderMonthView(currentDate) : renderYearView(currentDate)}
                </div>

                {/* Next View Preview */}
                <div className="absolute left-full w-full px-4 sm:px-6 opacity-30 pointer-events-none">
                  {viewMode === 'month'
                    ? renderMonthView(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
                    : renderYearView(new Date(currentDate.getFullYear() + 1, 0, 1))
                  }
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="h-8 sm:h-10 shrink-0" /> {/* Smaller spacer for mobile bottom area */}
        </div>
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

      <DayDetailsModal
        isOpen={showDayDetailsModal}
        onClose={() => {
          setShowDayDetailsModal(false)
          playModalCloseSound()
        }}
        date={selectedDate}
        userScale={userScale}
        events={selectedDate ? getEventsForDate(selectedDate) : []}
        onAddEvent={() => {
          setSelectedEvent(null)
          setShowDayDetailsModal(false)
          setShowEventModal(true)
          playClickSound()
        }}
        onEditEvent={(event) => {
          setSelectedEvent(event)
          setShowDayDetailsModal(false)
          setShowEventModal(true)
          playClickSound()
        }}
        onDeleteEvent={(eventId) => {
          handleDeleteEvent(eventId)
        }}
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
              <Button id="btn-close-search" size="sm" onClick={() => setShowSearchModal(false)}>Fechar</Button>
            </div>

            {/* Input de pesquisa */}
            <input
              id="input-search-events"
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
                    id={`search-result-${evt.id}`}
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