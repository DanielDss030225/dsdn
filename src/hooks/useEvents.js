import { useState, useEffect } from 'react'

const STORAGE_KEY = 'agenda-events'

export function useEvents() {
  const [events, setEvents] = useState([])

  // Carregar eventos do localStorage
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem(STORAGE_KEY)
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents))
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
    }
  }, [])

  // Salvar eventos no localStorage sempre que a lista mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
    } catch (error) {
      console.error('Erro ao salvar eventos:', error)
    }
  }, [events])

  // Adicionar evento
  const addEvent = (eventData) => {
    const newEvent = {
      id: Date.now() + Math.random(), // ID único
      ...eventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Se o evento tem recorrência, gerar eventos recorrentes
    if (eventData.recurrence && eventData.recurrence !== 'none') {
      const recurringEvents = generateRecurringEvents(newEvent)
      setEvents(prev => [...prev, ...recurringEvents])
    } else {
      setEvents(prev => [...prev, newEvent])
    }

    return newEvent
  }

  // Atualizar evento
  const updateEvent = (eventId, updates) => {
    setEvents(prevEvents => {
      const existingEvent = prevEvents.find(event => event.id === eventId);
      if (!existingEvent) return prevEvents;

      const updatedEvent = { ...existingEvent, ...updates, updatedAt: new Date().toISOString() };

      // Verifica se a recorrência ou a data base (que afeta a recorrência) mudou
      const recurrenceChanged = existingEvent.recurrence !== updatedEvent.recurrence;
      const dateChanged = existingEvent.date !== updatedEvent.date;

      if (recurrenceChanged || dateChanged) {
        // Se a recorrência ou a data base mudou, precisamos remover todas as instâncias antigas
        // e gerar novas instâncias com base no evento atualizado.
        const filteredEvents = prevEvents.filter(event => 
          event.id !== eventId && event.parentEventId !== eventId
        );

        if (updatedEvent.recurrence && updatedEvent.recurrence !== 'none') {
          // Gerar novas ocorrências para o evento atualizado
          const newRecurringEvents = generateRecurringEvents(updatedEvent);
          return [...filteredEvents, ...newRecurringEvents];
        } else {
          // Se a recorrência foi removida, apenas adiciona o evento único atualizado
          return [...filteredEvents, updatedEvent];
        }
      } else {
        // Se a recorrência não mudou, apenas atualiza o evento existente (ou sua instância)
        return prevEvents.map(event => 
          event.id === eventId 
            ? updatedEvent
            : event
        );
      }
    });
  }

  // Remover evento
  const removeEvent = (eventId) => {
    setEvents(prev => {
      const eventToDelete = prev.find(event => event.id === eventId);
      if (!eventToDelete) return prev; // Evento não encontrado

      // Determina o ID do evento base para a recorrência
      const baseEventId = eventToDelete.parentEventId || eventToDelete.id;

      // Remove o evento base e todas as suas instâncias
      return prev.filter(event => event.parentEventId !== baseEventId && event.id !== baseEventId);
    });
  }

  // Obter eventos para uma data específica
  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => event.date === dateStr)
  }

  // Obter eventos para um período
  const getEventsForPeriod = (startDate, endDate) => {
    const start = startDate.toISOString().split('T')[0]
    const end = endDate.toISOString().split('T')[0]
    
    return events.filter(event => {
      return event.date >= start && event.date <= end
    })
  }

  // Gerar eventos recorrentes
  const generateRecurringEvents = (baseEvent) => {
    const events = [baseEvent]
    const startDate = new Date(baseEvent.date)
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 2) // Gerar para os próximos 2 anos

    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      let nextDate = new Date(currentDate)

      switch (baseEvent.recurrence) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1)
          break
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7)
          break
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1)
          break
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1)
          break
        default:
          return events
      }

      if (nextDate <= endDate) {
        const recurringEvent = {
          ...baseEvent,
          id: Date.now() + Math.random(),
          date: nextDate.toISOString().split('T')[0],
          isRecurring: true,
          parentEventId: baseEvent.id
        }
        events.push(recurringEvent)
      }

      currentDate = nextDate
    }

    return events
  }

  // Limpar todos os eventos
  const clearAllEvents = () => {
    setEvents([])
  }

  // Exportar eventos
  const exportEvents = () => {
    return JSON.stringify(events, null, 2)
  }

  // Importar eventos
  const importEvents = (eventsJson) => {
    try {
      const importedEvents = JSON.parse(eventsJson)
      if (Array.isArray(importedEvents)) {
        setEvents(importedEvents)
        return true
      }
      return false
    } catch (error) {
      console.error('Erro ao importar eventos:', error)
      return false
    }
  }

  return {
    events,
    addEvent,
    updateEvent,
    removeEvent,
    getEventsForDate,
    getEventsForPeriod,
    clearAllEvents,
    exportEvents,
    importEvents
  }
}
