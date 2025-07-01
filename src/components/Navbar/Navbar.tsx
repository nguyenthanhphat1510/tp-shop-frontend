import React from 'react'

const Navbar = () => {
    return (
        <header className="w-full h-[68px] shadow-lg" style={{background: 'linear-gradient(5deg, #cb1c22 67.61%, #d9503f 95.18%)'}}>
            <div className="container mx-auto px-4 h-full flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center">
                    <h1 className="text-3xl font-bold text-white">TpShop</h1>
                </div>
                
                {/* Navigation Links */}
                <nav className="hidden md:flex items-center space-x-12">
                    <a href="/categories/phone" className="text-white hover:text-red-200 transition-colors text-lg font-medium">
                        Điện thoại
                    </a>
                    <a href="/categories/laptop" className="text-white hover:text-red-200 transition-colors text-lg font-medium">
                        Laptop
                    </a>
                </nav>
                
                {/* User Actions */}
                <div className="flex items-center space-x-8">
                    {/* Đăng nhập */}
                    <button className="flex items-center space-x-2 text-white hover:text-red-200 transition-colors">
                        <i className="fas fa-user text-xl"></i>
                        <span className="text-lg font-medium">Đăng nhập</span>
                    </button>
                    
                    {/* Giỏ hàng */}
                    <button className="flex items-center space-x-2 text-white hover:text-red-200 transition-colors relative">
                        <i className="fas fa-shopping-cart text-xl"></i>
                        <span className="text-lg font-medium">Giỏ hàng</span>
                        {/* Badge số lượng sản phẩm */}
                        <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-600 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                            0
                        </span>
                    </button>
                </div>
                
                {/* Mobile Menu Button */}
                <button className="md:hidden text-white hover:text-red-200">
                    <i className="fas fa-bars text-xl"></i>
                </button>
            </div>
        </header>
    )
}

export default Navbar