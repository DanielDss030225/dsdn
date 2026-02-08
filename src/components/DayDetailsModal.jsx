import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, Briefcase, Home, Plus, Trash2, Edit2, Clock } from 'lucide-react'
import { getWorkStatusForDate } from '../lib/scaleLogic.js'

export function DayDetailsModal({
    isOpen,
    onClose,
    date,
    userScale,
    events,
    onAddEvent,
    onEditEvent,
    onDeleteEvent
}) {
    if (!date) return null

    const formattedDate = date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    const workStatus = userScale ? getWorkStatusForDate(date, userScale) : null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl p-6 flex flex-col mx-auto">
                <DialogHeader>
                    <DialogTitle className="flex flex-col gap-1 items-start capitalize">
                        <span className="text-muted-foreground text-xs font-normal">
                            {date.toLocaleDateString('pt-BR', { weekday: 'long' })}
                        </span>
                        <span className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            {date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Status de Trabalho */}
                    <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {workStatus?.isOff ? (
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Home className="w-6 h-6 text-green-600" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <Briefcase className="w-6 h-6 text-red-600" />
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium">Sua Escala</p>
                                <p className="text-xs text-muted-foreground">
                                    {workStatus?.isOff ? 'Dia de Folga' : 'Dia de Trabalho'}
                                </p>
                            </div>
                        </div>
                        <Badge className={`${workStatus?.isOff ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white border-0`}>
                            {workStatus?.isOff ? 'Folga' : 'Trabalha'}
                        </Badge>
                    </div>

                    {/* Lista de Eventos */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            Eventos {events.length > 0 && <Badge variant="secondary" className="px-1.5 h-5">{events.length}</Badge>}
                        </h3>

                        {events.length > 0 ? (
                            <div className="space-y-2">
                                {events.map((evt) => (
                                    <div
                                        key={evt.id}
                                        className="flex items-center justify-between p-3 bg-card border rounded-lg hover:bg-accent/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                                            <div className={`w-2 h-10 rounded-full flex-shrink-0 ${evt.category === 'trabalho' ? 'bg-green-500' :
                                                evt.category === 'pessoal' ? 'bg-purple-500' :
                                                    evt.category === 'saude' ? 'bg-red-500' :
                                                        'bg-blue-500'
                                                }`} />
                                            <div className="overflow-hidden flex-1">
                                                <p className="text-sm font-semibold truncate">{evt.title}</p>
                                                {evt.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                        {evt.description}
                                                    </p>
                                                )}
                                                {evt.time && (
                                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                                                        <Clock className="w-3 h-3" />
                                                        {evt.time}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0 ml-2">
                                            <Button
                                                id={`btn-edit-event-${evt.id}`}
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => onEditEvent(evt)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                id={`btn-delete-event-${evt.id}`}
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                                onClick={() => onDeleteEvent(evt.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/10">
                                <p className="text-sm text-muted-foreground">Nenhum evento para este dia</p>
                            </div>
                        )}
                    </div>

                    {/* Botão Adicionar */}
                    <Button
                        id="btn-add-event-from-details"
                        className="w-full h-12 gap-2 text-base font-semibold"
                        onClick={onAddEvent}
                    >
                        <Plus className="w-5 h-5" />
                        Adicionar Novo Evento
                    </Button>
                </div>
            </DialogContent >
        </Dialog >
    )
}
