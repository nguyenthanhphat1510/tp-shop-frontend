"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  products?: any[];
}

const Chatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là trợ lý AI của TpShop. Tôi có thể giúp bạn tìm kiếm và tư vấn sản phẩm điện thoại, laptop. Bạn cần tìm gì hôm nay?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Component để hiển thị sản phẩm dạng scroll ngang
  const ProductCard = ({ product }: { product: any }) => {
    const handleProductClick = () => {
      // Chuyển đến trang chi tiết sản phẩm
      router.push(`/products/${product._id}`);
    };

    return (
      <div 
        onClick={handleProductClick}
        className="flex-shrink-0 w-40 bg-white rounded-lg border border-gray-200 p-2 hover:shadow-lg transition-all duration-200 cursor-pointer group"
      >
        {/* Hình ảnh sản phẩm */}
        <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden mb-2">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <i className="fas fa-image text-gray-400 text-lg"></i>
            </div>
          )}
        </div>

        {/* Thông tin sản phẩm */}
        <div>
          <h4 className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
            {product.name}
          </h4>
          
          <p className="text-sm font-bold text-red-600 mb-1">
            {product.price?.toLocaleString('vi-VN')}đ
          </p>

          {/* Call to action */}
          <div className="flex items-center text-xs text-blue-600 group-hover:text-blue-700">
            <span>Xem chi tiết</span>
            <i className="fas fa-arrow-right ml-1 text-xs group-hover:translate-x-1 transition-transform"></i>
          </div>
        </div>
      </div>
    );
  };

  const handleSendMessage = async (customMessage?: string) => {
    const messageText = customMessage || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText
        }),
      });

      if (!response.ok) {
        throw new Error('Lỗi kết nối với server');
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
        products: data.products || []
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg z-50 flex items-center justify-center bg-transparent border-none"
        style={{ background: 'none' }}
      >
        <img
          src="/images/products/chatbox.png"
          alt="Chatbox"
          className="w-16 h-16 object-contain rounded-full border-2 border-yellow-400"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
        />
        {isOpen && (
          <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full">
            <i className="fas fa-times text-white text-2xl"></i>
          </span>
        )}
      </button>

      {/* Nút gợi ý sản phẩm luôn hiện ngoài chatbox, ẩn khi chatbox mở */}
      {!isOpen && (
        <div className="fixed bottom-28 right-6 flex flex-col gap-2 z-50">
          <button
            className="px-4 py-2 rounded-full bg-white border text-gray-800 hover:bg-yellow-50 shadow"
            onClick={() => {
              setInputValue('Tôi muốn xem điện thoại iPhone');
              handleSendMessage('Tôi muốn xem điện thoại iPhone');
              setIsOpen(true);
            }}
          >
            Điện thoại iPhone
          </button>
          <button
            className="px-4 py-2 rounded-full bg-white border text-gray-800 hover:bg-yellow-50 shadow"
            onClick={() => {
              setInputValue('Tôi muốn xem điện thoại Android');
              handleSendMessage('Tôi muốn xem điện thoại Android');
              setIsOpen(true);
            }}
          >
            Điện thoại Android
          </button>
        </div>
      )}

      {/* Chatbox */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-40">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <i className="fas fa-robot text-sm"></i>
            </div>
            <div>
              <h3 className="font-semibold">TpShop AI Assistant</h3>
              <p className="text-xs text-blue-100">Trợ lý tư vấn sản phẩm</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-3`}>
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  
                  {/* Product Recommendations - Scroll ngang */}
                  {message.products && message.products.length > 0 && (
                    <div className="mt-4">
                      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                        {message.products.map((product) => (
                          <ProductCard key={product._id} product={product} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        ← Vuốt để xem thêm sản phẩm →
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Đang tìm kiếm sản phẩm...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <i className="fas fa-paper-plane text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbox;