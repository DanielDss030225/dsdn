import { useState, useEffect, useMemo, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, Clock, Repeat, Tag, Trash2, Briefcase, Home } from 'lucide-react'
import { getWorkStatusForDate } from '../lib/scaleLogic.js'
import './EventModal.css'

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event = null,
  selectedDate = null,
  eventsOfDay = [],
  userScale = null
}) {
  const dialogRef = useRef(null)

  const defaultForm = useMemo(() => {
    const defaultDate = selectedDate
      ? selectedDate.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]

    return {
      title: event?.title || '',
      description: event?.description || '',
      date: event?.date || defaultDate,
      time: event?.time || '',
      recurrence: event?.recurrence || 'none',
      type: event?.type || 'personal',
      category: event?.category || 'evento'
    }
  }, [event, selectedDate])

  const [formData, setFormData] = useState(defaultForm)
  const [errors, setErrors] = useState({})
  const [editingField, setEditingField] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setFormData(defaultForm)
      setErrors({})
      setEditingField(null)

      // Adiciona classe ao body para controle CSS
      document.body.classList.add('modal-open')

      // Remove foco de qualquer elemento ativo ao abrir o modal
      setTimeout(() => {
        if (document.activeElement && document.activeElement.blur) {
          document.activeElement.blur()
        }
        // Força o foco para o container do modal em vez dos inputs
        if (dialogRef.current) {
          dialogRef.current.focus()
        }
      }, 100)
    } else {
      // Remove classe do body ao fechar
      document.body.classList.remove('modal-open')
      setEditingField(null)
    }

    // Cleanup ao desmontar
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen, defaultForm])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório'
    if (!formData.date) newErrors.date = 'Data é obrigatória'

    if (!event && formData.date) {
      const selected = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selected < today) newErrors.date = 'Data não pode ser no passado'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return
    onSave({ ...formData, title: formData.title.trim(), description: formData.description.trim() })
    onClose()
  }

  const handleDelete = (id) => {
    if (onDelete) onDelete(id)
    onClose()
  }

  const getCategoryColor = (category) => ({
    evento: 'bg-blue-100 text-blue-800',
    aniversario: 'bg-pink-100 text-pink-800',
    trabalho: 'bg-green-100 text-green-800',
    pessoal: 'bg-purple-100 text-purple-800',
    saude: 'bg-red-100 text-red-800',
    estudo: 'bg-yellow-100 text-yellow-800'
  }[category] || 'bg-blue-100 text-blue-800')

  const getRecurrenceLabel = (recurrence) => ({
    none: 'Não se repete',
    daily: 'Diariamente',
    weekly: 'Semanalmente',
    monthly: 'Mensalmente',
    yearly: 'Anualmente'
  }[recurrence] || 'Não se repete')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        ref={dialogRef}
        restoreFocus={false}
        autoFocus={false}
        className="w-[calc(100%-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl p-4 flex flex-col mx-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        tabIndex={-1}
      >
        <DialogHeader className="flex-shrink-0">
          <div className="flex justify-between items-center w-full pr-8">
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {event ? 'Editar Evento' : 'Novo Evento'}
            </DialogTitle>

            {userScale && formData.date && (
              <div className="flex items-center gap-1">
                {(() => {
                  const date = new Date(formData.date + 'T12:00:00')
                  const status = getWorkStatusForDate(date, userScale)
                  return status ? (
                    <Badge className={`${status.isOff ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white border-0 flex items-center gap-1 py-1`}>
                      {status.isOff ? <Home className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                      {status.isOff ? 'Folga' : 'Trabalha'}
                    </Badge>
                  ) : null
                })()}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Digite o título do evento"
                className={`${errors.title ? 'border-red-500' : ''} ${editingField === 'title' ? 'editing-field' : ''}`}
                autoFocus={false}
                readOnly={false}
                onFocus={(e) => {
                  // Previne foco automático em dispositivos móveis apenas se não foi um toque intencional
                  if (window.innerWidth <= 768 && editingField !== 'title') {
                    e.target.blur()
                  }
                }}
                onTouchStart={() => {
                  // Permite edição quando o usuário toca intencionalmente
                  setEditingField('title')
                }}
                onClick={() => {
                  // Permite edição quando o usuário clica intencionalmente
                  setEditingField('title')
                }}
                onBlur={() => {
                  // Remove o estado de edição quando perde o foco
                  setTimeout(() => setEditingField(null), 100)
                }}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Digite a descrição do evento (opcional)"
                rows={3}
                className={editingField === 'description' ? 'editing-field' : ''}
                autoFocus={false}
                onFocus={(e) => {
                  // Previne foco automático em dispositivos móveis apenas se não foi um toque intencional
                  if (window.innerWidth <= 768 && editingField !== 'description') {
                    e.target.blur()
                  }
                }}
                onTouchStart={() => {
                  setEditingField('description')
                }}
                onClick={() => {
                  setEditingField('description')
                }}
                onBlur={() => {
                  setTimeout(() => setEditingField(null), 100)
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={errors.date ? 'border-red-500' : ''}
                  autoFocus={false}
                  onFocus={(e) => {
                    // Previne foco automático em dispositivos móveis
                    if (window.innerWidth <= 768) {
                      e.target.blur()
                    }
                  }}
                />
                {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="pl-10"
                    autoFocus={false}
                    onFocus={(e) => {
                      // Previne foco automático em dispositivos móveis
                      if (window.innerWidth <= 768) {
                        e.target.blur()
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <SelectValue placeholder="Selecione a categoria" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {['evento', 'aniversario', 'trabalho', 'pessoal', 'saude', 'estudo'].map(cat => (
                    <SelectItem key={cat} value={cat}>
                      <Badge className={getCategoryColor(cat)}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurrence">Recorrência</Label>
              <Select value={formData.recurrence} onValueChange={(v) => handleInputChange('recurrence', v)}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4" />
                    <SelectValue placeholder="Selecione a recorrência" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não se repete</SelectItem>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="monthly">Mensalmente</SelectItem>
                  <SelectItem value="yearly">Anualmente</SelectItem>
                </SelectContent>
              </Select>
              {formData.recurrence !== 'none' && (
                <p className="text-sm text-muted-foreground">
                  Este evento se repetirá {getRecurrenceLabel(formData.recurrence).toLowerCase()}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4 flex-shrink-0">
            <div>
              {event && onDelete && (
                <Button id="btn-delete-event" variant="destructive" size="sm" onClick={() => handleDelete(event.id)} className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />Excluir
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button id="btn-cancel-event" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button id="btn-save-event" onClick={handleSave}>{event ? 'Atualizar' : 'Salvar'}</Button>
            </div>
          </div>

          {selectedDate && eventsOfDay.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Eventos do dia</h3>
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1">
                {eventsOfDay.map(evt => (
                  <div key={evt.id} className="flex justify-between items-center bg-muted/20 px-3 py-2 rounded">
                    <div className="truncate">
                      {evt.time && <span className="font-mono mr-2">{evt.time}</span>}
                      <span className="font-medium">{evt.title}</span>
                    </div>
                    <Button id={`btn-delete-event-list-${evt.id}`} variant="destructive" size="sm" className="flex items-center gap-1" onClick={() => onDelete(evt.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
