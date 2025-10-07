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
  // Converte a data de referência para objeto Date
  const [refDay, refMonth, refYear] = referenceDateStr.split('/').map(Number);
  const referenceDate = new Date(refYear, refMonth - 1, refDay); // Mês é 0-indexado no JavaScript

  // Calcula a diferença em dias entre a data fornecida e a data de referência
  const deltaTime = date.getTime() - referenceDate.getTime();
  const deltaDays = Math.floor(deltaTime / (1000 * 60 * 60 * 24));

  // O dia da semana da data fornecida (0=Dom, 1=Seg, ..., 6=Sab)
  // Convertemos para o formato usado no padrão (0=Seg, 1=Ter, ..., 6=Dom)
  const dayOfWeekIndex = (date.getDay() + 6) % 7; // Converte de Dom=0 para Seg=0

  // Calcula o índice do dia dentro do ciclo de 14 dias
  // Garantindo que o resultado seja sempre positivo
  const dayInCycle = ((deltaDays % 14) + 14) % 14;

  // Determina qual semana do padrão de 2 semanas (0 para Semana 1, 1 para Semana 2)
  const weekInPattern = dayInCycle < 7 ? 0 : 1;

  const pattern = getScalePattern(scaleType);
  const status = pattern[weekInPattern][dayOfWeekIndex];

  return status === 0; // Retorna true se for folga (0), false se for trabalho (1)
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
