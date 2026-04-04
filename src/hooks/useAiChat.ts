import { useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useAiChat = () => {
  const store = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!store.chatInput.trim()) return;
    
    // Logic for sending message to AI service
    const userMsg = { role: 'user', content: store.chatInput } as const;
    store.setChatMessages(prev => [...prev, userMsg]);
    store.setChatInput('');
    
    // Auto scroll
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const removeAttachment = (index: number) => {
    store.setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Basic file reading logic
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          store.setAttachedFiles(prev => [...prev, {
            name: file.name,
            type: file.type,
            data: ev.target?.result as string,
            content: ev.target?.result as string
          }]);
        };
        reader.readAsText(file);
      });
    }
  };

  return {
    ...store,
    fileInputRef,
    chatEndRef,
    handleSendMessage,
    removeAttachment,
    handleFileUpload
  };
};
