"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SearchBar = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    // ✅ DANH SÁCH PLACEHOLDER XOAY VÒNG
    const placeholders = [
        'Bạn muốn tìm gì...',
        'Điện thoại di động...',
        'Laptop...',
        'iPhone 16 Pro Max...',
        'Samsung Galaxy S24...',
        'MacBook Air M3...',
    ];

    // ✅ THAY ĐỔI PLACEHOLDER MỖI 3 GIÂY
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // ✅ XỬ LÝ TÌM KIẾM
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim().length >= 2) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholders[placeholderIndex]}
                className="w-full h-10 px-4 pr-10 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all"
            />
            <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-700 transition-colors"
            >
                <i className="fas fa-search text-lg"></i>
            </button>
        </form>
    );
};

export default SearchBar;