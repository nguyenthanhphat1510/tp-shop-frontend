"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const SearchBar = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    // State cho tính năng gợi ý
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const placeholders = [
        'Bạn muốn tìm gì...',
        'Điện thoại di động...',
        'Laptop...',
        'iPhone 16 Pro Max...',
        'Samsung Galaxy S24...',
        'MacBook Air M3...',
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Hàm gọi API
    const fetchSuggestions = async (keyword: string) => {
        if (!keyword || keyword.trim().length < 2) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/api/products/suggestions?q=${encodeURIComponent(keyword)}`);
            const data = await res.json();
            
            if (data.success) {
                setSuggestions(data.data);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Lỗi lấy gợi ý:", error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        if (value.trim().length < 1) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setShowSuggestions(true);
        setIsLoading(true);

        debounceTimeout.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);
    };

    // Xử lý khi click vào một item gợi ý
    const handleSelectSuggestion = (item: string) => {
        setSearchQuery(item);
        setShowSuggestions(false);
        router.push(`/search?q=${encodeURIComponent(item)}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (searchQuery.trim().length >= 1) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <div className="relative flex-1 max-w-2xl z-50">
            <form onSubmit={handleSearch} className="relative w-full">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => searchQuery.trim().length >= 1 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder={placeholders[placeholderIndex]}
                    // ✅ ĐÃ ĐỔI: placeholder-red-400
                    className="w-full h-10 px-4 pr-10 rounded-lg bg-white text-gray-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all shadow-sm"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-700 transition-colors p-1"
                >
                    <i className="fas fa-search text-lg"></i>
                </button>
            </form>

            {/* DROPDOWN HIỂN THỊ */}
            {showSuggestions && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {isLoading ? (
                        // TRẠNG THÁI ĐANG TẢI
                        <div className="p-3 text-gray-500 text-sm flex items-center gap-2">
                             <i className="fas fa-spinner fa-spin ml-2"></i> Đang tìm kiếm...
                        </div>
                    ) : (
                        <ul>
                            {/* 1. HIỆN CÁC GỢI Ý TỪ API (NẾU CÓ) */}
                            {suggestions.map((item, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSelectSuggestion(item)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-gray-700 text-sm border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors"
                                >
                                    <i className="fas fa-search text-gray-400 text-xs"></i>
                                    <span className="truncate font-medium">{item}</span>
                                </li>
                            ))}

                            {/* 2. LUÔN HIỆN DÒNG TÌM KIẾM THỦ CÔNG NẾU KHÔNG TRÙNG KHỚP HOÀN TOÀN */}
                            {(!suggestions.includes(searchQuery.trim())) && (
                                <li
                                    onClick={() => handleSelectSuggestion(searchQuery)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-gray-700 text-sm flex items-center gap-3 transition-colors border-t border-gray-50"
                                >
                                    <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <i className="fas fa-search text-gray-500 text-[10px]"></i>
                                    </div>
                                    <span className="truncate">
                                        Tìm kiếm cho <span className="font-semibold text-black">"{searchQuery}"</span>
                                    </span>
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;