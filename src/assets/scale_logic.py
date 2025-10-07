import datetime

def get_scale_pattern(scale_type):
    # Padrões de escala para Alfa e Bravo
    # 0 = Folga, 1 = Trabalha
    # Semana 1 e Semana 2
    alfa_pattern = [
        [0, 1, 0, 1, 1, 0, 0],  # Semana 1: Seg, Ter, Qua, Qui, Sex, Sab, Dom
        [1, 0, 1, 0, 0, 1, 1]   # Semana 2: Seg, Ter, Qua, Qui, Sex, Sab, Dom
    ]

    bravo_pattern = [
        [1, 0, 1, 0, 0, 1, 1],  # Semana 1: Seg, Ter, Qua, Qui, Sex, Sab, Dom
        [0, 1, 0, 1, 1, 0, 0]   # Semana 2: Seg, Ter, Qua, Qui, Sex, Sab, Dom
    ]

    if scale_type == 'ALFA':
        return alfa_pattern
    elif scale_type == 'BRAVO':
        return bravo_pattern
    else:
        raise ValueError("Tipo de escala inválido. Use 'ALFA' ou 'BRAVO'.")

def is_day_off(date, scale_type, reference_date_str='06/10/2025'):
    # Converte a data de referência para objeto datetime
    ref_day, ref_month, ref_year = map(int, reference_date_str.split('/'))
    reference_date = datetime.date(ref_year, ref_month, ref_day)

    # Calcula a diferença em dias entre a data fornecida e a data de referência
    delta_days = (date - reference_date).days

    # O dia da semana da data de referência (06/10/2025) é uma segunda-feira (weekday() retorna 0 para segunda)
    # O padrão começa na segunda-feira
    # O índice do dia da semana (0=Seg, 1=Ter, ..., 6=Dom)
    day_of_week_index = date.weekday()

    # Determina qual semana do ciclo de 2 semanas estamos
    # A cada 14 dias (2 semanas), o padrão se repete
    # A data de referência (06/10/2025) é uma segunda-feira, que é o início da Semana 1 para a Escala Alfa (Folga)
    # E o início da Semana 1 para a Escala Bravo (Trabalha)

    # A data de referência (06/10/2025) é uma segunda-feira.
    # O padrão de 2 semanas (14 dias) começa na segunda-feira.
    # O dia da semana da data de referência (06/10/2025) é uma segunda-feira (weekday() retorna 0 para segunda).
    # O ciclo de 14 dias é: Semana 1 (dias 0-6), Semana 2 (dias 7-13).

    # Calcula o número de dias desde a data de referência, ajustando para que a segunda-feira da ref_date seja o dia 0 do ciclo.
    # O dia da semana da data de referência (06/10/2025) é 0 (segunda-feira).
    # A diferença em dias é calculada a partir da data de referência.
    # Para garantir que o ciclo de 14 dias comece corretamente a partir da segunda-feira da data de referência,
    # precisamos ajustar o delta_days para que ele seja relativo ao início do ciclo de 14 dias que contém a reference_date.
    # O dia da semana da reference_date é 0 (segunda-feira).
    # Se a data atual for a reference_date, delta_days é 0.
    # Se a data atual for 07/10/2025 (terça), delta_days é 1.
    # Se a data atual for 05/10/2025 (domingo), delta_days é -1.

    # Para calcular o 'day_in_cycle' corretamente, precisamos de um 'offset' baseado na 'reference_date'.
    # A 'reference_date' (06/10/2025) é uma segunda-feira, que é o primeiro dia da Semana 1 do ciclo.
    # Então, o 'delta_days' já está alinhado com o início do ciclo.
    # Precisamos garantir que o resultado do módulo seja sempre positivo.
    day_in_cycle = (delta_days % 14 + 14) % 14

    # Determina qual semana do padrão de 2 semanas (0 para Semana 1, 1 para Semana 2)
    week_in_pattern = 0 if day_in_cycle < 7 else 1

    pattern = get_scale_pattern(scale_type)
    status = pattern[week_in_pattern][day_of_week_index]

    return status == 0 # Retorna True se for folga (0), False se for trabalho (1)

def determine_initial_scale(user_is_off_today, current_date_str, reference_date_str='06/10/2025'):
    current_day, current_month, current_year = map(int, current_date_str.split('/'))
    current_date = datetime.date(current_year, current_month, current_day)

    # Verifica o status de folga para a Escala Bravo na data atual
    bravo_off_today = is_day_off(current_date, 'BRAVO', reference_date_str)

    if user_is_off_today:
        if bravo_off_today:
            return 'BRAVO'
        else:
            return 'ALFA'
    else: # user_is_working_today
        if bravo_off_today:
            return 'ALFA'
        else:
            return 'BRAVO'

# Exemplo de uso (para testes internos)
if __name__ == '__main__':
    # Teste da função is_day_off
    # Data de referência: 06/10/2025 (Segunda-feira)
    # Escala Alfa: Segunda (Folga), Terça (Trabalha), Quarta (Folga), Quinta (Trabalha), Sexta (Trabalha), Sábado (Folga), Domingo (Folga)
    # Escala Bravo: Segunda (Trabalha), Terça (Folga), Quarta (Trabalha), Quinta (Folha), Sexta (Folga), Sábado (Trabalha), Domingo (Trabalha)

    # Teste para 06/10/2025 (Segunda-feira)
    date_test = datetime.date(2025, 10, 6)
    print(f"06/10/2025 (Segunda-feira) - Alfa é folga? {is_day_off(date_test, 'ALFA')}") # Esperado: True
    print(f"06/10/2025 (Segunda-feira) - Bravo é folga? {is_day_off(date_test, 'BRAVO')}") # Esperado: False

    # Teste para 07/10/2025 (Terça-feira)
    date_test = datetime.date(2025, 10, 7)
    print(f"07/10/2025 (Terça-feira) - Alfa é folga? {is_day_off(date_test, 'ALFA')}") # Esperado: False
    print(f"07/10/2025 (Terça-feira) - Bravo é folga? {is_day_off(date_test, 'BRAVO')}") # Esperado: True

    # Teste para 13/10/2025 (Segunda-feira da Semana 2)
    date_test = datetime.date(2025, 10, 13)
    print(f"13/10/2025 (Segunda-feira) - Alfa é folga? {is_day_off(date_test, 'ALFA')}") # Esperado: False
    print(f"13/10/2025 (Segunda-feira) - Bravo é folga? {is_day_off(date_test, 'BRAVO')}") # Esperado: True

    # Teste para 14/10/2025 (Terça-feira da Semana 2)
    date_test = datetime.date(2025, 10, 14)
    print(f"14/10/2025 (Terça-feira) - Alfa é folga? {is_day_off(date_test, 'ALFA')}") # Esperado: True
    print(f"14/10/2025 (Terça-feira) - Bravo é folga? {is_day_off(date_test, 'BRAVO')}") # Esperado: False

    # Teste da função determine_initial_scale
    # Cenário 1: Usuário está de folga hoje (04/10/2025 - Sexta-feira)
    # 04/10/2025 é uma sexta-feira. 
    # Para a Escala Alfa, 04/10/2025 é TRABALHA (Semana 1, Sexta)
    # Para a Escala Bravo, 04/10/2025 é FOLGA (Semana 1, Sexta)
    current_date_str = '04/10/2025'
    print(f"\nSe o usuário está de folga em {current_date_str}:")
    determined_scale = determine_initial_scale(True, current_date_str)
    print(f"Escala determinada: {determined_scale}") # Esperado: BRAVO

    # Cenário 2: Usuário está trabalhando hoje (04/10/2025 - Sexta-feira)
    print(f"Se o usuário está trabalhando em {current_date_str}:")
    determined_scale = determine_initial_scale(False, current_date_str)
    print(f"Escala determinada: {determined_scale}") # Esperado: ALFA

    # Cenário 3: Usuário está de folga hoje (06/10/2025 - Segunda-feira)
    current_date_str = '06/10/2025'
    print(f"\nSe o usuário está de folga em {current_date_str}:")
    determined_scale = determine_initial_scale(True, current_date_str)
    print(f"Escala determinada: {determined_scale}") # Esperado: ALFA

    # Cenário 4: Usuário está trabalhando hoje (06/10/2025 - Segunda-feira)
    print(f"Se o usuário está trabalhando em {current_date_str}:")
    determined_scale = determine_initial_scale(False, current_date_str)
    print(f"Escala determinada: {determined_scale}") # Esperado: BRAVO

