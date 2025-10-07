# Sistema de Agenda

Um sistema de agenda completo e responsivo desenvolvido em React, com funcionalidades avançadas para gerenciamento de eventos, feriados nacionais brasileiros e sistema de escala de trabalho Alfa/Bravo.

## 🚀 Funcionalidades

### ✨ Interface Responsiva
- **Smartphone**: Navegação por meses com gestos de arrastar (swipe) para esquerda/direita
- **Desktop**: Visualização anual completa com calendários mensais interativos
- Design moderno e profissional com Tailwind CSS e shadcn/ui

### 📅 Gerenciamento de Eventos
- Criação, edição e exclusão de eventos personalizados
- Campos completos: título, descrição, data, horário
- Sistema de categorias com cores diferenciadas:
  - 🔵 Evento (azul)
  - 🩷 Aniversário (rosa)
  - 🟢 Trabalho (verde)
  - 🟣 Pessoal (roxo)
  - 🔴 Saúde (vermelho)
  - 🟡 Estudo (amarelo)

### 🔄 Recorrência de Eventos
- Eventos únicos ou recorrentes
- Opções de recorrência:
  - Diariamente
  - Semanalmente
  - Mensalmente
  - Anualmente
- Aniversários com recorrência anual automática

### 🇧🇷 Feriados Nacionais
- Lista completa de feriados brasileiros para 2025 e 2026
- Exibição automática no calendário
- Dados atualizados e precisos

### 👥 Sistema de Escala de Trabalho
- **Escala Alfa** e **Escala Bravo** com padrões opostos
- Configuração inicial inteligente baseada na pergunta: "Você está de folga hoje?"
- Data de referência: 06/10/2025 (segunda-feira)
- Ciclo de 14 dias (2 semanas) que se repete indefinidamente
- Indicadores visuais para dias de trabalho e folga

#### Padrões das Escalas

**Escala Alfa:**
- Semana 1: Seg(Folga), Ter(Trabalha), Qua(Folga), Qui(Trabalha), Sex(Trabalha), Sáb(Folga), Dom(Folga)
- Semana 2: Seg(Trabalha), Ter(Folga), Qua(Trabalha), Qui(Folga), Sex(Folga), Sáb(Trabalha), Dom(Trabalha)

**Escala Bravo:**
- Semana 1: Seg(Trabalha), Ter(Folga), Qua(Trabalha), Qui(Folga), Sex(Folga), Sáb(Trabalha), Dom(Trabalha)
- Semana 2: Seg(Folga), Ter(Trabalha), Qua(Folga), Qui(Trabalha), Sex(Trabalha), Sáb(Folga), Dom(Folga)

### 💾 Persistência de Dados
- Armazenamento local no navegador (localStorage)
- Dados preservados entre sessões
- Sistema robusto de backup e recuperação

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework principal
- **Vite** - Build tool e servidor de desenvolvimento
- **Tailwind CSS** - Framework de estilos
- **shadcn/ui** - Componentes de interface
- **Lucide React** - Ícones
- **Framer Motion** - Animações e transições
- **JavaScript ES6+** - Linguagem de programação

## 📁 Estrutura do Projeto

```
agenda-system/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes shadcn/ui
│   │   └── EventModal.jsx   # Modal para eventos
│   ├── hooks/
│   │   └── useEvents.js     # Hook para gerenciar eventos
│   ├── lib/
│   │   ├── scaleLogic.js    # Lógica da escala de trabalho
│   │   └── holidays.js      # Dados dos feriados
│   ├── assets/              # Arquivos estáticos
│   ├── App.jsx              # Componente principal
│   ├── App.css              # Estilos principais
│   └── main.jsx             # Ponto de entrada
├── public/                  # Arquivos públicos
├── package.json             # Dependências
└── README.md               # Documentação
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou pnpm

### Instalação e Execução
```bash
# Clonar o repositório
git clone <url-do-repositorio>

# Entrar no diretório
cd agenda-system

# Instalar dependências
npm install
# ou
pnpm install

# Executar em modo de desenvolvimento
npm run dev
# ou
pnpm run dev

# Acessar no navegador
http://localhost:5173
```

### Build para Produção
```bash
# Gerar build de produção
npm run build
# ou
pnpm run build

# Preview do build
npm run preview
# ou
pnpm run preview
```

## 📱 Uso da Aplicação

### Primeira Configuração
1. Ao abrir pela primeira vez, responda à pergunta: "Você está de folga hoje?"
2. O sistema determinará automaticamente sua escala (Alfa ou Bravo)
3. A configuração será salva e aplicada a todos os dias

### Navegação
- **Mobile**: Arraste para os lados para navegar entre meses
- **Desktop**: Use os botões de navegação ou clique nos meses na vista anual

### Criando Eventos
1. Clique no botão "Evento" no cabeçalho
2. Preencha os dados do evento
3. Escolha a categoria e recorrência
4. Clique em "Salvar"

### Editando Eventos
1. Clique em um evento existente no calendário
2. Modifique os dados desejados
3. Clique em "Atualizar" ou "Excluir"

## 🎨 Design e UX

- Interface limpa e moderna
- Cores consistentes e acessíveis
- Animações suaves com Framer Motion
- Responsividade completa
- Indicadores visuais claros para diferentes tipos de eventos
- Hover states e micro-interações

## 🔧 Funcionalidades Técnicas

### Lógica da Escala de Trabalho
- Algoritmo baseado em data de referência (06/10/2025)
- Cálculo automático de dias de trabalho/folga
- Suporte a datas passadas e futuras
- Ciclo perpétuo de 14 dias

### Gerenciamento de Estado
- Hook personalizado `useEvents` para eventos
- Context API para estado global
- Persistência automática no localStorage

### Performance
- Lazy loading de componentes
- Otimização de re-renders
- Animações performáticas
- Build otimizado com Vite

## 📊 Dados e Configurações

### Feriados Incluídos (2025-2026)
- Confraternização Universal
- Carnaval (2 dias)
- Paixão de Cristo
- Tiradentes
- Dia do Trabalho
- Corpus Christi
- Independência do Brasil
- Nossa Senhora Aparecida
- Finados
- Proclamação da República
- Consciência Negra
- Natal

### Configurações Padrão
- Data de referência: 06/10/2025
- Formato de data: DD/MM/AAAA
- Idioma: Português (Brasil)
- Fuso horário: Brasília (UTC-3)

## 🤝 Contribuição

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvido por

**Manus AI** - Sistema de Agenda Inteligente

---

*Desenvolvido com ❤️ usando React e tecnologias modernas*
