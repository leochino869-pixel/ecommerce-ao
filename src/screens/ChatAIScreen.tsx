// 📱 Tela Principal de Chat com IA

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAIChat } from '../hooks/useAIChat';
import { useAIStore } from '../store/aiStore';
import { ChatCategory, AIMessage } from '../types/ai';

const CATEGORIES: { id: ChatCategory; label: string; icon: string }[] = [
  { id: 'support', label: '🆘 Suporte', icon: '🆘' },
  { id: 'sales', label: '🛍️ Vendas', icon: '🛍️' },
  { id: 'recommendations', label: '⭐ Recomendações', icon: '⭐' },
  { id: 'general', label: '💬 Geral', icon: '💬' },
];

export const ChatAIScreen: React.FC = () => {
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,
    createConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
  } = useAIChat();

  const { selectedConversationId, selectConversation: storeSelect } = useAIStore();

  // Estado local
  const [messageText, setMessageText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ChatCategory>('general');
  const [showNewChat, setShowNewChat] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll para a última mensagem
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Criar nova conversa
  const handleCreateConversation = async () => {
    try {
      await createConversation(`Chat ${selectedCategory}`, selectedCategory);
      setShowNewChat(false);
      setMessageText('');
    } catch (err) {
      console.error('Erro ao criar conversa:', err);
    }
  };

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentConversation) {
      return;
    }

    const text = messageText;
    setMessageText('');

    try {
      await sendMessage(text);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  // Selecionar conversa
  const handleSelectConversation = async (conversationId: string) => {
    storeSelect(conversationId);
    await selectConversation(conversationId);
  };

  if (!currentConversation && !showNewChat) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💬 Chat IA</Text>
          <TouchableOpacity
            style={styles.newChatBtn}
            onPress={() => setShowNewChat(true)}
          >
            <Text style={styles.newChatBtnText}>+ Novo Chat</Text>
          </TouchableOpacity>
        </View>

        {conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🤖</Text>
            <Text style={styles.emptyTitle}>Nenhuma conversa</Text>
            <Text style={styles.emptySubtitle}>
              Inicie um novo chat selecionando uma categoria
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowNewChat(true)}
            >
              <Text style={styles.emptyButtonText}>Começar Chat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => handleSelectConversation(item.id)}
              >
                <View>
                  <Text style={styles.conversationTitle}>{item.title}</Text>
                  <Text style={styles.conversationSubtitle}>
                    {item.message_count} mensagens • {item.category}
                  </Text>
                  {item.last_message && (
                    <Text style={styles.conversationPreview} numberOfLines={1}>
                      {item.last_message}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => deleteConversation(item.id)}
                  style={styles.deleteBtn}
                >
                  <Text>🗑️</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.conversationsList}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              {showNewChat ? 'Novo Chat' : currentConversation?.title}
            </Text>
            {currentConversation && !showNewChat && (
              <Text style={styles.headerSubtitle}>{currentConversation.category}</Text>
            )}
          </View>
          {!showNewChat && (
            <TouchableOpacity onPress={() => setShowNewChat(true)}>
              <Text style={styles.backBtn}>← Voltar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Novo Chat - Seleção de Categoria */}
        {showNewChat ? (
          <View style={styles.categorySelector}>
            <Text style={styles.categoryTitle}>Selecione uma categoria:</Text>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat.id && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.categoryActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowNewChat(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateConversation}
              >
                <Text style={styles.createButtonText}>Criar Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Mensagens */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
            >
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              )}

              {messages.length === 0 && (
                <View style={styles.welcomeMessage}>
                  <Text style={styles.welcomeIcon}>🤖</Text>
                  <Text style={styles.welcomeTitle}>
                    Bem-vindo ao Assistente IA!
                  </Text>
                  <Text style={styles.welcomeText}>
                    Como posso ajudá-lo hoje?
                  </Text>
                </View>
              )}

              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageWrapper,
                    message.role === 'user'
                      ? styles.userMessageWrapper
                      : styles.assistantMessageWrapper,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      message.role === 'user'
                        ? styles.userMessage
                        : styles.assistantMessage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        message.role === 'user'
                          ? styles.userMessageText
                          : styles.assistantMessageText,
                      ]}
                    >
                      {message.content}
                    </Text>
                    <Text style={styles.messageTime}>
                      {new Date(message.created_at).toLocaleTimeString('pt-AO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              ))}

              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.loadingText}>Digitando...</Text>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Escreva sua mensagem..."
                placeholderTextColor="#999"
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxHeight={100}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (isLoading || !messageText.trim()) && styles.sendButtonDisabled,
                ]}
                onPress={handleSendMessage}
                disabled={isLoading || !messageText.trim()}
              >
                <Text style={styles.sendButtonText}>📤</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  newChatBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  newChatBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  backBtn: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  // Conversas
  conversationsList: {
    padding: 12,
  },
  conversationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  conversationSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  conversationPreview: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  deleteBtn: {
    padding: 8,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  // Seletor de categoria
  categorySelector: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  categoryButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  createButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  // Mensagens
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#C00',
    fontSize: 12,
  },
  welcomeMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  welcomeIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  messageWrapper: {
    marginBottom: 12,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  assistantMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  userMessage: {
    backgroundColor: '#007AFF',
  },
  assistantMessage: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFF',
  },
  assistantMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.6,
    color: '#999',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 12,
  },
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    color: '#000',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  sendButtonText: {
    fontSize: 18,
  },
});
