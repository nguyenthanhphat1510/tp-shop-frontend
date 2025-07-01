import React from 'react'
import ProductItem from '@/components/ProductItem/ProductItem'
import { Product } from '@/services/productService/productService'

const ProductList = () => {
    // Mock data - sau này sẽ lấy từ API
    const products: Product[] = [
        { 
            id: '1', 
            name: 'iPhone 15 Pro Max', 
            price: 32990000, 
            description: 'Điện thoại thông minh cao cấp với chip A17 Pro', 
            imageUrl: '/api/placeholder/300/300',
            category: 'Điện thoại',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
        },
        { 
            id: '2', 
            name: 'MacBook Pro M3', 
            price: 45990000, 
            description: 'Laptop chuyên nghiệp với chip M3 mạnh mẽ', 
            imageUrl: '/api/placeholder/300/300',
            category: 'Laptop',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
        },
        { 
            id: '3', 
            name: 'Samsung Galaxy S24', 
            price: 22990000, 
            description: 'Flagship Android với AI tiên tiến', 
            imageUrl: '/api/placeholder/300/300',
            category: 'Điện thoại',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
        },
        { 
            id: '4', 
            name: 'Dell XPS 13', 
            price: 28990000, 
            description: 'Ultrabook premium với thiết kế sang trọng', 
            imageUrl: '/api/placeholder/300/300',
            category: 'Laptop',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
        },
        { 
            id: '5', 
            name: 'iPad Pro M2', 
            price: 25990000, 
            description: 'Tablet chuyên nghiệp cho sáng tạo', 
            imageUrl: '/api/placeholder/300/300',
            category: 'Tablet',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
        },
        { 
            id: '6', 
            name: 'Xiaomi 14 Ultra', 
            price: 24990000, 
            description: 'Camera phone hàng đầu với zoom 5x', 
            imageUrl: '/api/placeholder/300/300',
            category: 'Điện thoại',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
        },
        { 
            id: '7', 
            name: 'ASUS ROG Strix', 
            price: 42990000, 
            description: 'Gaming laptop với RTX 4070', 
            imageUrl: '/api/placeholder/300/300',
            category: 'Laptop',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
        },
        { 
            id: '8', 
            name: 'Google Pixel 8 Pro', 
            price: 21990000, 
            description: 'Pure Android với AI photography', 
            imageUrl: '/api/placeholder/300/300',
            category: 'Điện thoại',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
        },
        { 
            id: '9', 
            name: 'Surface Laptop 5', 
            price: 35990000, 
            description: 'Windows laptop với thiết kế thanh lịch', 
            imageUrl: '/api/placeholder/300/300',
            category: 'Laptop',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
        },
        { 
            id: '10', 
            name: 'OnePlus 12', 
            price: 19990000, 
            description: 'Flagship killer với sạc nhanh 100W', 
            imageUrl: '/api/placeholder/300/300',
            category: 'Điện thoại',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
        },
    ];

    return (
        <div className="w-full flex justify-center py-8">
            <div className="w-[1160px] px-4">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Sản phẩm nổi bật</h2>
                    <p className="text-gray-600">Khám phá những sản phẩm công nghệ mới nhất</p>
                </div>

                {/* Grid 5 columns */}
                <div className="grid grid-cols-5">
                    {products.map((product) => (
                        <ProductItem 
                            key={product.id} 
                            product={product}
                        />
                    ))}
                </div>

                {/* Load More Button */}
                <div className="flex justify-center mt-8">
                    <button className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium">
                        Xem thêm sản phẩm
                        <i className="fas fa-chevron-down ml-2"></i>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductList
