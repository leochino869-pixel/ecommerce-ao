# 📚 Guia de Configuração - Sistema de Chat com IA

## 🎯 Visão Geral

Este documento descreve como configurar e usar o sistema de chat com IA (ChatGPT 5.5 Advanced) integrado no seu aplicativo de e-commerce.

## 🚀 Configuração Inicial

### 1. Instalação de Dependências

```bash
npm install openai axios zustand
# ou
yarn add openai axios zustand
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha com suas credenciais:

```bash
cp .env.example .env
```

**Variáveis obrigatórias:**

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima

# OpenAI
OPENAI_API_KEY=sk-sua-chave-da-openai
OPENAI_MODEL=gpt-4-turbo
```

### 3. Executar Script SQL no Supabase

1. Acesse o dashboard do Supabase
2. Vá para **SQL Editor**
3. Cole o conteúdo de `supabase/ai_schema.sql`
4. Execute o script

**Tabelas criadas:**
- `ai_conversations` - Conversas
- `ai_messages` - Mensagens
- `ai_analytics` - Análises
- `ai_prompts` - Prompts do sistema
- `ai_feedback` - Feedback dos usuários

### 4. Inicializar o Serviço de IA

No arquivo de entrada da sua aplicação (ex: `App.tsx`):

```typescript
import { initializeAIService } from './src/services/aiService';

// Na inicialização
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
initializeAIService(OPENAI_API_KEY);
```

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/
├── types/
│   └── ai.ts                 # Tipos TypeScript para IA
├── services/
│   └── aiService.ts          # Serviço OpenAI
├── hooks/
│   └── useAIChat.ts          # Hook para gerenciar chat
├── store/
│   └── aiStore.ts            # Store Zustand
├── screens/
│   └── ChatAIScreen.tsx       # Tela principal
└── components/
    ├── ChatMessage.tsx        # Componente de mensagem
    ├── ChatInput.tsx          # Componente de entrada
    └── ConversationList.tsx   # Lista de conversas

supabase/
└── ai_schema.sql             # Schema do banco de dados
```

## 📱 Componentes Principais

### 1. **AIService** (`src/services/aiService.ts`)

Gerencia comunicação com OpenAI API.

```typescript
import { getAIService } from './services/aiService';

const aiService = getAIService();

// Gerar resposta
const response = await aiService.generateResponse(
  userMessage,
  conversationHistory,
  contextData,
  systemPrompt
);
```

### 2. **useAIChat Hook** (`src/hooks/useAIChat.ts`)

Hook principal para gerenciar chat.

```typescript
import { useAIChat } from './hooks/useAIChat';

function MyComponent() {
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    createConversation,
    sendMessage,
  } = useAIChat();

  // Usar no componente
}
```

### 3. **useAIStore** (`src/store/aiStore.ts`)

Store Zustand para estado global.

```typescript
import { useAIStore } from './store/aiStore';

const conversations = useAIStore((state) => state.conversations);
const updateSettings = useAIStore((state) => state.updateSettings);
```

### 4. **ChatAIScreen** (`src/screens/ChatAIScreen.tsx`)

Tela completa de chat com IA.

## 💡 Funcionalidades

### ✅ Categorias de Chat

1. **Suporte** 🆘
   - Ajuda com pedidos
   - Devoluções
   - Problemas e reclamações

2. **Vendas** 🛍️
   - Recomendações de produtos
   - Informações de preço
   - Frete e prazos

3. **Recomendações** ⭐
   - Sugestões personalizadas
   - Produtos relacionados
   - Tendências

4. **Geral** 💬
   - Perguntas gerais
   - Como usar a plataforma
   - Políticas

### ✅ Recursos

- **Histórico persistente** - Conversas salvas no Supabase
- **Contexto inteligente** - IA usa dados do usuário para melhor resposta
- **Múltiplas conversas** - Gerenciar vários chats
- **Rating de mensagens** - Feedback de utilidade (👍/👎)
- **Análises** - Rastrear uso e satisfação
- **RLS (Row Level Security)** - Dados seguros e privados
- **Suporte multi-idioma** - Português (Angola), Brasil, Inglês

## 🔒 Segurança

### Row Level Security (RLS)

Políticas de segurança implementadas:

```sql
-- Usuários só veem suas próprias conversas
CREATE POLICY "Usuários podem ver suas próprias conversas"
  ON ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

-- Apenas criar mensagens em suas conversas
CREATE POLICY "Usuários podem inserir mensagens em suas conversas"
  ON ai_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE id = conversation_id
      AND user_id = auth.uid()
    )
  );
```

## 📊 Exemplo de Uso

### Criar Conversa e Enviar Mensagem

```typescript
import { useAIChat } from './hooks/useAIChat';

function ChatExample() {
  const {
    currentConversation,
    messages,
    isLoading,
    createConversation,
    sendMessage,
  } = useAIChat();

  const handleStartChat = async () => {
    // 1. Criar conversa
    await createConversation('Suporte ao cliente', 'support');
  };

  const handleSendMessage = async () => {
    // 2. Enviar mensagem
    await sendMessage('Qual é o status do meu pedido?');
  };

  return (
    <View>
      <Button onPress={handleStartChat} title="Iniciar Chat" />
      <Button onPress={handleSendMessage} title="Enviar Mensagem" />
      
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <Text>{item.role}: {item.content}</Text>
        )}
      />
    </View>
  );
}
```

## 🔍 Debugging

### Verificar Logs

```typescript
// Habilitar debug mode
import { getAIService } from './services/aiService';

const aiService = getAIService();

// Ver configuração
console.log('AI Service configurado');
```

### Verificar Conversas no Supabase

```sql
-- Ver conversas do usuário
SELECT * FROM ai_conversations WHERE user_id = 'user-uuid';

-- Ver mensagens de uma conversa
SELECT * FROM ai_messages 
WHERE conversation_id = 'conv-uuid'
ORDER BY created_at ASC;

-- Ver feedback
SELECT * FROM ai_feedback ORDER BY created_at DESC;
```

## 🚨 Troubleshooting

### Erro: "API key inválida"

**Solução:**
- Verificar se `OPENAI_API_KEY` está correto no `.env`
- Regenerar chave em [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Garantir que a chave tenha permissões adequadas

### Erro: "Conversa não inicializada"

**Solução:**
- Sempre criar uma conversa antes de enviar mensagens
- Verificar se usuário está autenticado (`useAuth()`)
- Checar RLS policies no Supabase

### Mensagens não persistem

**Solução:**
- Verificar se schema SQL foi executado
- Checar políticas RLS
- Verificar `user_id` nos inserts

### IA responde genérica

**Solução:**
- Verificar se contexto está sendo enviado corretamente
- Aumentar `temperature` no `AIService` para respostas mais criativas
- Verificar se `systemPrompt` está adequado para a categoria

## 📈 Performance

### Otimizações Implementadas

1. **Limitar histórico** - Últimas 10 mensagens apenas
2. **Índices no BD** - Criados para queries rápidas
3. **Compressão de tokens** - Resumir contexto quando necessário
4. **Cache** - Zustand com persist no localStorage

### Dicas de Performance

```typescript
// Carregar apenas conversas ativas
const activeConversations = conversations.filter(
  (c) => c.isActive
);

// Paginar mensagens em conversas grandes
const PAGE_SIZE = 20;
const paginatedMessages = messages.slice(-PAGE_SIZE);
```

## 🎓 Próximos Passos

1. **Integrações avançadas**
   - Buscar produtos da loja
   - Rastrear status de pedidos
   - Gerar respostas de comissões

2. **Analytics**
   - Tempo médio de resposta
   - Taxa de satisfação
   - Palavras-chave mais comuns

3. **Melhorias de UX**
   - Typing indicator
   - Reações às mensagens
   - Voice input/output

4. **Admin Dashboard**
   - Monitorar conversas
   - Gerenciar prompts
   - Ver analytics

## 📞 Suporte

Para dúvidas ou problemas, abra uma **issue** no GitHub com:
- Descrição do problema
- Stack trace completo
- Passos para reproduzir
- Versão do React Native

---

**Última atualização:** 2026-05-18
**Versão:** 1.0.0
