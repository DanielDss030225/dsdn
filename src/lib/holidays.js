// Feriados nacionais brasileiros para 2025 e 2026

export const holidays2025 = [
  {
    date: "2025-01-01",
    name: "Confraternização Universal",
    dayOfWeek: "quarta-feira"
  },
  {
    date: "2025-03-03",
    name: "Carnaval",
    dayOfWeek: "segunda-feira"
  },
  {
    date: "2025-03-04",
    name: "Carnaval",
    dayOfWeek: "terça-feira"
  },
  {
    date: "2025-04-18",
    name: "Paixão de Cristo",
    dayOfWeek: "sexta-feira"
  },
  {
    date: "2025-04-21",
    name: "Tiradentes",
    dayOfWeek: "segunda-feira"
  },
  {
    date: "2025-05-01",
    name: "Dia do Trabalho",
    dayOfWeek: "quinta-feira"
  },
  {
    date: "2025-06-19",
    name: "Corpus Christi",
    dayOfWeek: "quinta-feira"
  },
  {
    date: "2025-09-07",
    name: "Independência do Brasil",
    dayOfWeek: "domingo"
  },
  {
    date: "2025-10-12",
    name: "Nossa Sr.a Aparecida - Padroeira do Brasil",
    dayOfWeek: "domingo"
  },
  {
    date: "2025-11-02",
    name: "Finados",
    dayOfWeek: "domingo"
  },
  {
    date: "2025-11-15",
    name: "Proclamação da República",
    dayOfWeek: "sábado"
  },
  {
    date: "2025-11-20",
    name: "Dia Nacional de Zumbi e da Consciência Negra",
    dayOfWeek: "quinta-feira"
  },
  {
    date: "2025-12-25",
    name: "Natal",
    dayOfWeek: "quinta-feira"
  }
];

export const holidays2026 = [
  {
    date: "2026-01-01",
    name: "Confraternização Universal",
    dayOfWeek: "quinta-feira"
  },
  {
    date: "2026-02-16",
    name: "Carnaval",
    dayOfWeek: "segunda-feira"
  },
  {
    date: "2026-02-17",
    name: "Carnaval",
    dayOfWeek: "terça-feira"
  },
  {
    date: "2026-04-03",
    name: "Paixão de Cristo",
    dayOfWeek: "sexta-feira"
  },
  {
    date: "2026-04-21",
    name: "Tiradentes",
    dayOfWeek: "terça-feira"
  },
  {
    date: "2026-05-01",
    name: "Dia do Trabalho",
    dayOfWeek: "sexta-feira"
  },
  {
    date: "2026-06-04",
    name: "Corpus Christi",
    dayOfWeek: "quinta-feira"
  },
  {
    date: "2026-09-07",
    name: "Independência do Brasil",
    dayOfWeek: "segunda-feira"
  },
  {
    date: "2026-10-12",
    name: "Nossa Sr.a Aparecida - Padroeira do Brasil",
    dayOfWeek: "segunda-feira"
  },
  {
    date: "2026-11-02",
    name: "Finados",
    dayOfWeek: "segunda-feira"
  },
  {
    date: "2026-11-15",
    name: "Proclamação da República",
    dayOfWeek: "domingo"
  },
  {
    date: "2026-11-20",
    name: "Dia Nacional de Zumbi e da Consciência Negra",
    dayOfWeek: "sexta-feira"
  },
  {
    date: "2026-12-25",
    name: "Natal",
    dayOfWeek: "sexta-feira"
  }
];

// Função para obter todos os feriados de um ano específico
export function getHolidaysForYear(year) {
  if (year === 2025) {
    return holidays2025;
  } else if (year === 2026) {
    return holidays2026;
  } else {
    return [];
  }
}

// Função para verificar se uma data é feriado
export function isHoliday(date) {
  const year = date.getFullYear();
  const holidays = getHolidaysForYear(year);
  const dateStr = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  
  return holidays.find(holiday => holiday.date === dateStr);
}

// Função para obter o nome do feriado se a data for um feriado
export function getHolidayName(date) {
  const holiday = isHoliday(date);
  return holiday ? holiday.name : null;
}
