# Histórico de Atualizações - Sistema de Aluguel para Festas


## 📅 Histórico de Atualizações

- **05/05/2025** – Criação do repositório inicial.
- **16/05/2025** – Adicionado sistema de cadastro de produtos.
- **20/05/2025** – Integração com banco de dados MySQL finalizada.
- **05/06/2025** – Implementado carrinho de compras com sessão por usuário.
- **06/06/2025** – Melhorias no layout da página de entrega.

## 🔧 Como usar

1. Clone o repositório:
   ```bash
   git clone https://github.com/Kaiosergio21/ml_decoracao_entrega.git

#Comando para inciar o ambiente
   npm init -y

#Comando de instalação
   npm install express mysql2 dotenv path  bcryptjs express-session

#Rodar porgarama
   node server.js


#.env fica

# Banco de dados MySQL
DB_HOST=localhost
DB_PORT=6006
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=ml_decoracao


## [1.0.0] - 06/05/2024 
### Sistema de Login
- **Implementação inicial**:
  - Autenticação baseada em sessão JWT
  - Página de login com validação em tempo real
  - Middleware de proteção de rotas
  - Redirecionamento automático pós-login
  - Tratamento de erros (credenciais inválidas, campos vazios)

## [1.1.0] - 16/05/2024  
### Módulo de Carrinho de Compras
- **Funcionalidades principais**:
  - Armazenamento local dos itens selecionados
  - Sistema de adição/remoção com atualização em tempo real
  - Cálculo automático de:
    - Subtotal por item
    - Valor total do pedido
    - Quantidade total de itens
  - Persistência durante a navegação

## [1.2.0] - 22/05/2024  
### Gerenciamento de Conta
- **Cadastro de Usuários**:
  - Formulário com validação robusta
  - Verificação de e-mail único
  - Critérios de senha forte (mínimo 8 caracteres, letras/números)
  
- **Troca de Senha**:
  - Fluxo completo de recuperação:
    1. Solicitação por e-mail
    2. Token de segurança com validade
    3. Página protegida para redefinição
  - Notificação por e-mail em cada etapa

## [1.3.0] - 05/06/2024  2023-12-10
### Finalização via WhatsApp
- **Fluxo seguro**:
  - Bloqueio do processo sem autenticação
  - Verificação em duas etapas:
    1. Reserva no banco de dados
    2. Geração do link para WhatsApp
  - Mensagem automática contendo:
    - Lista completa de itens
    - Valores formatados (R$ 0,00)
    - Dados do cliente (nome, telefone)
    - Código de reserva único

## [1.4.0] - 06/06/2025 
### Atualização de Design
- **Identidade Visual**:
  - Paleta oficial implementada:
    - `#FFC300` (Primário - Dourado)
    - `#2C2C2C` (Secundário - Grafite)
    - `#FDF5A0` (Destaque - Dourado Claro)
  - Componentes redesenhados:
    - Botões com efeitos de hover/active
    - Cards de produtos com sombras
    - Modal do carrinho com transição suave
  - Tipografia unificada (Montserrat em 3 pesos)



## Roadmap - Próximas Atualizações

### [2.0.0] - Ciclo Completo de Aluguel
- Fluxo detalhado com:
  - Seleção de datas
  - Opções de entrega/retirada
  - Termos e condições digitais
  - Confirmação por e-mail

### [2.1.0] - Painel Administrativo
- **Controle Total**:
  - CRUD completo de produtos
  - Gerenciamento de categorias
  - Relatórios de vendas
  - Controle de estoque integrado

### [2.2.0] - Dashboard de Pedidos
- Visualização por:
  - Status (pendente, confirmado, entregue)
  - Período (dia, semana, mês)
  - Cliente específico
- Exportação para Excel/PDF

### [2.3.0] - Engajamento
- **Avaliação de Produtos**:
  - Sistema de estrelas (1-5)
  - Comentários moderados
  - Fotos dos clientes
- **Favoritos**:
  - Lista persistente por usuário
  - Notificação de promoção em itens favoritados

### [2.4.0] - Autenticação Social
- Login único via:
  - Google OAuth
  - Facebook SDK
  - Possibilidade de vinculação de contas

### [2.5.0] - Experiência Mobile
- PWA (Progressive Web App)
- Notificações push
- Acesso offline ao histórico
- Pagamento por aproximação (NFC)
