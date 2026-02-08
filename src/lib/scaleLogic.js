// Lógica da escala de trabalho Alfa/Bravo
// Baseado no script Python scale_logic.py

export function getScalePattern(scaleType) {
  // Padrões de escala para Alfa e Bravo
  // 0 = Folga, 1 = Trabalha
  // Semana 1 e Semana 2
  const alfaPattern = [
    [0, 1, 0, 1, 1, 0, 0], // Semana 1: Seg, Ter, Qua, Qui, Sex, Sab, Dom
    [1, 0, 1, 0, 0, 1, 1]  // Semana 2: Seg, Ter, Qua, Qui, Sex, Sab, Dom
  ];

  const bravoPattern = [
    [1, 0, 1, 0, 0, 1, 1], // Semana 1: Seg, Ter, Qua, Qui, Sex, Sab, Dom
    [0, 1, 0, 1, 1, 0, 0]  // Semana 2: Seg, Ter, Qua, Qui, Sex, Sab, Dom
  ];

  if (scaleType === 'ALFA') {
    return alfaPattern;
  } else if (scaleType === 'BRAVO') {
    return bravoPattern;
  } else {
    throw new Error("Tipo de escala inválido. Use 'ALFA' ou 'BRAVO'.");
  }
}

export function isDayOff(date, scaleType, referenceDateStr = '06/10/2025') {
  let sequence;
  let referenceDate;

  if (typeof scaleType === 'string') {
    // Escalas predefinidas (ALFA/BRAVO)
    const [refDay, refMonth, refYear] = referenceDateStr.split('/').map(Number);
    referenceDate = new Date(refYear, refMonth - 1, refDay);

    const dayOfWeekIndex = (date.getDay() + 6) % 7; 
    const deltaTime = date.getTime() - referenceDate.getTime();
    const deltaDays = Math.floor(deltaTime / (1000 * 60 * 60 * 24));
    const dayInCycle = ((deltaDays % 14) + 14) % 14;
    const weekInPattern = dayInCycle < 7 ? 0 : 1;

    const pattern = getScalePattern(scaleType);
    const status = pattern[weekInPattern][dayOfWeekIndex];
    return status === 0;
  } else if (typeof scaleType === 'object' && scaleType.sequence) {
    // Escala personalizada
    sequence = scaleType.sequence; // Array de 0s (folga) e 1s (trabalho)
    referenceDate = new Date(scaleType.referenceDate);
    
    // Normalizar datas para ignorar horas
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

    const deltaTime = targetDate.getTime() - startDate.getTime();
    const deltaDays = Math.round(deltaTime / (1000 * 60 * 60 * 24));
    
    const index = ((deltaDays % sequence.length) + sequence.length) % sequence.length;
    return sequence[index] === 0;
  }

  return false;
}

export function determineInitialScale(userIsOffToday, currentDate, referenceDateStr = '06/10/2025') {
  // Verifica o status de folga para a Escala Bravo na data atual
  const bravoOffToday = isDayOff(currentDate, 'BRAVO', referenceDateStr);

  if (userIsOffToday) {
    if (bravoOffToday) {
      return 'BRAVO';
    } else {
      return 'ALFA';
    }
  } else { // user is working today
    if (bravoOffToday) {
      return 'ALFA';
    } else {
      return 'BRAVO';
    }
  }
}

export function getWorkStatusForDate(date, scaleType) {
  const isOff = isDayOff(date, scaleType);
  return {
    isOff,
    status: isOff ? 'FOLGA' : 'TRABALHA',
    scaleType
  };
}

// Função para obter o status de trabalho para um período de datas
export function getWorkStatusForPeriod(startDate, endDate, scaleType) {
  const result = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const status = getWorkStatusForDate(new Date(currentDate), scaleType);
    result.push({
      date: new Date(currentDate),
      ...status
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
}
