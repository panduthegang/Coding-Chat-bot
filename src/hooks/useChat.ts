import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, addDoc, getDocs, where, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Message, ChatState } from '../types';

export function useChat(userId: string | null) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (userId) {
      loadChatHistory();
    } else {
      setChatState(prev => ({ ...prev, messages: [] }));
    }
  }, [userId]);

  const loadChatHistory = async () => {
    if (!userId) return;

    try {
      setChatState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const chatRef = collection(db, 'chats');
      let q = query(
        chatRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'asc'),
        limit(50)
      );

      try {
        const querySnapshot = await getDocs(q);
        const messages: Message[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          messages.push({
            ...data,
            id: doc.id,
            timestamp: data.timestamp.toDate(),
          } as Message);
        });

        setChatState(prev => ({
          ...prev,
          messages,
          isLoading: false,
          error: null
        }));
      } catch (error: any) {
        if (error?.code === 'failed-precondition') {
          q = query(
            chatRef,
            where('userId', '==', userId),
            limit(50)
          );
          const fallbackSnapshot = await getDocs(q);
          const messages: Message[] = [];
          
          fallbackSnapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
              ...data,
              id: doc.id,
              timestamp: data.timestamp.toDate(),
            } as Message);
          });

          messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

          setChatState(prev => ({
            ...prev,
            messages,
            isLoading: false,
            error: null
          }));
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setChatState(prev => ({
        ...prev,
        error: 'Failed to load chat history. Please try again later.',
        isLoading: false,
      }));
    }
  };

  const saveMessage = async (message: Message) => {
    if (!userId) return;

    try {
      const chatRef = collection(db, 'chats');
      const messageToSave = {
        content: message.content,
        role: message.role,
        userId,
        timestamp: Timestamp.fromDate(message.timestamp),
      };

      if (message.code) {
        messageToSave['code'] = message.code;
      }
      if (message.language) {
        messageToSave['language'] = message.language;
      }

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }));

      await addDoc(chatRef, messageToSave);
    } catch (error) {
      console.error('Error saving message:', error);
      setChatState(prev => ({
        ...prev,
        error: 'Failed to save message'
      }));
    }
  };

  const clearChat = async () => {
    if (!userId) return;

    try {
      setChatState(prev => ({ ...prev, isLoading: true }));
      
      const chatRef = collection(db, 'chats');
      const q = query(chatRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      setChatState(prev => ({
        ...prev,
        messages: [],
        isLoading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error clearing chat:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to clear chat history'
      }));
    }
  };

  const getContextForPrompt = () => {
    const recentMessages = chatState.messages.slice(-10);
    return recentMessages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');
  };

  return {
    chatState,
    setChatState,
    saveMessage,
    clearChat,
    getContextForPrompt
  };
}