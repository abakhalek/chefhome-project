import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, User } from 'lucide-react';

interface Message {
  id: string;
  sender: 'me' | 'client';
  senderName: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  clientName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

// Initial mock data
const initialConversations: Conversation[] = [
    {
      id: 'conv1',
      clientName: 'Sophie Martin',
      lastMessage: 'Merci pour la proposition de menu !',
      lastMessageTime: '2024-01-20T14:00:00Z',
      unreadCount: 1,
      messages: [
        { id: 'msg1', sender: 'client', senderName: 'Sophie Martin', content: 'Bonjour Chef, j\'ai hâte de découvrir votre cuisine.', timestamp: '2024-01-20T10:00:00Z' },
        { id: 'msg2', sender: 'me', senderName: 'Moi', content: 'Bonjour Sophie, je vous ai envoyé quelques propositions de menu.', timestamp: '2024-01-20T11:00:00Z' },
        { id: 'msg3', sender: 'client', senderName: 'Sophie Martin', content: 'Merci pour la proposition de menu ! Je regarde ça.', timestamp: '2024-01-20T14:00:00Z' },
      ],
    },
    {
      id: 'conv2',
      clientName: 'Pierre Dubois',
      lastMessage: 'Confirmez-vous ma réservation ?',
      lastMessageTime: '2024-01-19T10:00:00Z',
      unreadCount: 0,
      messages: [
        { id: 'msg4', sender: 'client', senderName: 'Pierre Dubois', content: 'Bonjour Chef, confirmez-vous ma réservation pour le 25 ?', timestamp: '2024-01-19T10:00:00Z' },
      ],
    },
];

const MessagesPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    setConversations(initialConversations);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      // Mark messages as read when conversation is opened
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id ? { ...conv, unreadCount: 0 } : conv
      ));
      // In a real app, call API to mark as read
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const message: Message = {
        id: Date.now().toString(),
        sender: 'me',
        senderName: 'Moi',
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };
      setSelectedConversation(prev => prev ? { ...prev, messages: [...prev.messages, message], lastMessage: message.content, lastMessageTime: message.timestamp } : null);
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id ? { ...conv, messages: [...conv.messages, message], lastMessage: message.content, lastMessageTime: message.timestamp } : conv
      ));
      setNewMessage('');
      // In a real app, call API to send message
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mes Messages</h1>
      <div className="bg-white rounded-2xl shadow-lg flex flex-col lg:flex-row min-h-[70vh]">
        {/* Conversation List */}
        <div className="lg:w-1/3 border-r border-gray-200 p-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Conversations</h2>
          <div className="space-y-3">
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${selectedConversation?.id === conv.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <User size={24} className="text-gray-500" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{conv.clientName}</h3>
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{conv.unreadCount}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Conversation avec {selectedConversation.clientName}</h2>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {selectedConversation.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender === 'me' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                      <p className="font-semibold">{msg.senderName}</p>
                      <p>{msg.content}</p>
                      <p className="text-xs mt-1 opacity-75">{new Date(msg.timestamp).toLocaleTimeString('fr-FR')}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 flex items-center space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrire un message..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg"
                />
                <button onClick={handleSendMessage} className="bg-blue-500 text-white p-3 rounded-lg">
                  <Send size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <MessageCircle size={48} className="mr-2" />
              <span>Sélectionnez une conversation pour commencer.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
