import { useState, useEffect } from 'react'
import { db } from '../lib/firebase.js'
import { ref, onValue, set, remove } from 'firebase/database'

export function useEvents(username) {
  const [events, setEvents] = useState([])

  // Carregar eventos do Firebase quando o username mudar
  useEffect(() => {
    if (!username) {
      setEvents([])
      return
    }

    const eventsRef = ref(db, `users/${username}/events`)
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        // Converter objeto do Firebase para array se necessário (Firebase pode retornar objeto se as chaves forem IDs)
        const eventsList = Object.values(data)
        setEvents(eventsList)
      } else {
        setEvents([])
      }
    })

    return () => unsubscribe()
  }, [username])

  // Função auxiliar para salvar no Firebase
  const saveToFirebase = async (newEvents) => {
    if (!username) return
    try {
      await set(ref(db, `users/${username}/events`), newEvents)
    } catch (error) {
      console.error('Erro ao salvar no Firebase:', error)
    }
  }

  // Adicionar evento
  const addEvent = async (eventData) => {
    const newEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID único mais seguro
      ...eventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    let finalEvents = []
    if (eventData.recurrence && eventData.recurrence !== 'none') {
      const recurringEvents = generateRecurringEvents(newEvent)
      finalEvents = [...events, ...recurringEvents]
    } else {
      finalEvents = [...events, newEvent]
    }

    await saveToFirebase(finalEvents)
    return newEvent
  }

  // Atualizar evento
  const updateEvent = async (eventId, updates) => {
    const existingEvent = events.find(event => event.id === eventId);
    if (!existingEvent) return;

    const updatedEvent = { ...existingEvent, ...updates, updatedAt: new Date().toISOString() };
    const recurrenceChanged = existingEvent.recurrence !== updatedEvent.recurrence;
    const dateChanged = existingEvent.date !== updatedEvent.date;

    let finalEvents = []
    if (recurrenceChanged || dateChanged) {
      const filteredEvents = events.filter(event =>
        event.id !== eventId && event.parentEventId !== eventId
      );

      if (updatedEvent.recurrence && updatedEvent.recurrence !== 'none') {
        const newRecurringEvents = generateRecurringEvents(updatedEvent);
        finalEvents = [...filteredEvents, ...newRecurringEvents];
      } else {
        finalEvents = [...filteredEvents, updatedEvent];
      }
    } else {
      finalEvents = events.map(event =>
        event.id === eventId ? updatedEvent : event
      );
    }

    await saveToFirebase(finalEvents)
  }

  // Remover evento
  const removeEvent = async (eventId) => {
    const eventToDelete = events.find(event => event.id === eventId);
    if (!eventToDelete) return;

    let finalEvents = []
    if (eventToDelete.recurrence && eventToDelete.recurrence !== 'none') {
      finalEvents = events.filter(event => event.parentEventId !== eventId && event.id !== eventId);
    } else if (eventToDelete.parentEventId) {
      const parentId = eventToDelete.parentEventId;
      finalEvents = events.filter(event => event.parentEventId !== parentId && event.id !== parentId);
    } else {
      finalEvents = events.filter(event => event.id !== eventId);
    }

    await saveToFirebase(finalEvents)
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
    const recurringEvents = [baseEvent]
    const startDate = new Date(baseEvent.date)
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 2)

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
          return recurringEvents
      }

      if (nextDate <= endDate && nextDate.toISOString().split('T')[0] !== startDate.toISOString().split('T')[0]) {
        const recurringEvent = {
          ...baseEvent,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: nextDate.toISOString().split('T')[0],
          isRecurring: true,
          parentEventId: baseEvent.id
        }
        recurringEvents.push(recurringEvent)
      }

      currentDate = nextDate
    }

    return recurringEvents
  }

  // Limpar todos os eventos
  const clearAllEvents = async () => {
    await saveToFirebase([])
  }

  return {
    events,
    addEvent,
    updateEvent,
    removeEvent,
    getEventsForDate,
    getEventsForPeriod,
    clearAllEvents
  }
}
