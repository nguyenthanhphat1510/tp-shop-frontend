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
  
  // State cho hiệu ứng gõ chữ lặp lại
  const [typingText, setTypingText] = useState('');
  const fullText = "👋 Xin chào quý khách! Tôi là Chatbot của TpShop, xin hỗ trợ quý khách!";
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ✅ Hiệu ứng gõ chữ lặp lại
  useEffect(() => {
    if (isOpen) return; // Không chạy khi chatbox mở

    let currentIndex = 0;
    let isTyping = true;
    let timeoutId: NodeJS.Timeout;

    const typeLoop = () => {
      if (isTyping) {
        if (currentIndex <= fullText.length) {
          setTypingText(fullText.slice(0, currentIndex));
          currentIndex++;
          timeoutId = setTimeout(typeLoop, 50); // Tốc độ gõ
        } else {
          isTyping = false;
          timeoutId = setTimeout(typeLoop, 2000); // Đợi 2s sau khi gõ xong
        }
      } else {
        // Reset để gõ lại từ đầu
        currentIndex = 0;
        isTyping = true;
        setTypingText('');
        timeoutId = setTimeout(typeLoop, 100);
      }
    };

    timeoutId = setTimeout(typeLoop, 500);

    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  // Component hiển thị sản phẩm
  const ProductCard = ({ product }: { product: any }) => {
    const handleProductClick = () => {
      router.push(`/products/${product._id}`);
    };

    return (
      <div 
        onClick={handleProductClick}
        className="flex-shrink-0 w-36 bg-white rounded-lg border border-gray-200 p-2 hover:shadow-lg transition-all duration-200 cursor-pointer group"
      >
        <div className="w-full h-24 bg-white rounded-lg overflow-hidden mb-2 flex items-center justify-center">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <i className="fas fa-image text-gray-400 text-lg"></i>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-1 h-8">
            {product.name}
          </h4>
          <p className="text-sm font-bold text-red-600 mb-1">
            {product.price?.toLocaleString('vi-VN')}đ
          </p>
          <div className="flex items-center text-xs text-red-500 group-hover:text-red-700 font-medium">
            <span>Xem chi tiết</span>
            <i className="fas fa-arrow-right ml-1 text-[10px] group-hover:translate-x-1 transition-transform"></i>
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

      if (!response.ok) throw new Error('Lỗi kết nối');

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        
        {/* ✅ TOOLTIP GÕ CHỮ LẶP LẠI */}
        {!isOpen && (
          <div className="relative bg-white px-4 py-3 rounded-2xl shadow-xl border border-red-100 max-w-[220px] min-h-[60px] flex items-center">
            <p className="text-sm text-gray-700 font-medium leading-tight">
              {typingText}
              <span className="animate-pulse">|</span>
            </p>
            {/* Mũi tên chỉ xuống */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-red-100 transform rotate-45"></div>
          </div>
        )}

        {/* ✅ NÚT GỢI Ý CÓ VIỀN BAO QUANH */}
        {!isOpen && (
          <div className="flex flex-col items-end gap-2 mb-1">
            <button
              className="px-4 py-2 rounded-full bg-white border-2 border-red-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300 shadow-md text-sm transition-all font-medium"
              onClick={() => {
                setInputValue('Tôi muốn xem điện thoại iPhone');
                handleSendMessage('Tôi muốn xem điện thoại iPhone');
                setIsOpen(true);
              }}
            >
              📱 Điện thoại iPhone
            </button>
            <button
              className="px-4 py-2 rounded-full bg-white border-2 border-red-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300 shadow-md text-sm transition-all font-medium"
              onClick={() => {
                setInputValue('Tôi muốn xem điện thoại Android');
                handleSendMessage('Tôi muốn xem điện thoại Android');
                setIsOpen(true);
              }}
            >
              🤖 Điện thoại Android
            </button>
          </div>
        )}

        {/* ✅ CHAT ICON - BỎ VIỀN ĐỎ */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center bg-transparent border-none hover:scale-105 transition-transform duration-200"
        >
          <div className="relative w-full h-full">
            <img
              src="/images/products/chatbox.png"
              alt="Chatbox"
              className="w-full h-full object-cover rounded-full bg-white" 
              style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)' }} 
            />
            {isOpen && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full backdrop-blur-[1px] animate-in fade-in duration-200">
                <i className="fas fa-times text-white text-2xl"></i>
              </div>
            )}
            {!isOpen && (
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
        </button>
      </div>

      {/* Chatbox Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-40 overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-4 flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner border-2 border-red-100">
              <img src="/images/products/chatbox.png" alt="Bot" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-lg">TpShop Assistant</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <p className="text-xs text-red-50 font-medium">Sẵn sàng hỗ trợ</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {/* ✅ TIN NHẮN USER MÀU HƠI XÁM */}
                <div className={`max-w-[85%] shadow-sm ${
                  message.sender === 'user' 
                    ? 'bg-gray-200 text-gray-800 rounded-2xl rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-none'
                  } p-3.5`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  
                  {message.products && message.products.length > 0 && (
                    <div className="mt-3 -mx-1">
                      <div className="flex gap-3 overflow-x-auto pb-3 px-1 pt-1" style={{ scrollbarWidth: 'thin' }}>
                        {message.products.map((product) => (
                          <ProductCard key={product._id} product={product} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-[10px] mt-1.5 text-gray-400">
                    {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500 ml-2">Đang trả lời...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-100 p-4">
            <div className="flex gap-2 items-end bg-gray-50 p-1.5 rounded-xl border border-gray-200 focus-within:border-red-300 focus-within:ring-2 focus-within:ring-red-100 transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 resize-none bg-transparent border-none px-3 py-2.5 text-sm focus:ring-0 max-h-32 text-gray-800 placeholder-gray-400"
                rows={1}
                style={{ minHeight: '44px' }}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="bg-red-600 text-white p-2.5 rounded-lg hover:bg-red-700 active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed mb-0.5 shadow-sm"
              >
                <i className="fas fa-paper-plane text-sm"></i>
              </button>
            </div>
            <div className="text-center mt-2">
              <p className="text-[10px] text-gray-400">Được hỗ trợ bởi TpShop AI</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbox;