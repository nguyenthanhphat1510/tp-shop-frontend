"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/services/ProductService/productService';

type ProductItemProps = {
  product: Product; // 🎯 NHẬN: ProductItem nhận product từ component cha (ProductList)
}

const ProductItem = ({ product }: ProductItemProps) => {
  // Helper function to get category name (temporary until we populate category)
  const getCategoryName = (categoryId: string) => {
    // This is temporary - in real app you'd fetch category name from API
    const categoryMap: { [key: string]: string } = {
      '685cbd213f7b05b5d70b860f': 'Điện thoại',
      // Add more category mappings as needed
    };
    return categoryMap[categoryId] || 'Sản phẩm';
  };

  // Lấy ảnh đầu tiên hoặc placeholder
  const firstImage = product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls[0]
    : '/placeholder.jpg';

  return (
    <div className="rounded-lg overflow-hidden transition-shadow group">
      <div 
        className="bg-white rounded-lg overflow-hidden custom-shadow-hover transition-all duration-300"
        style={{ 
          border: '1px solid rgba(234, 236, 240, 1)',
          margin: '5px 10px 5px 0',
          padding: '20px 10px 10px 10px',
          height: '563px'
        }}
      >
        {/* 🚀 TRUYỀN: Khi user click, truyền product.id qua URL */}
        <Link href={`/products/${product.id}`}>
          {/* 
            ⭐ QUAN TRỌNG: Đây là nơi TRUYỀN dữ liệu!
            - product.id được đưa vào URL: /products/507f1f77bcf86cd799439011
            - Next.js sẽ parse ID này từ URL và truyền vào page component
          */}
          
          {/* Container có thêm space cho hover effect */}
          <div className="flex justify-center mt-4">
            <div 
              className="relative bg-gray-100 overflow-hidden rounded-lg transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:-translate-y-2" 
              style={{ 
                width: '180px', 
                height: '180px',
              }}
            >
              <Image 
                src={firstImage}
                alt={product.name}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.jpg';
                }}
              />
            </div>
          </div>
          
          <div className="p-4 mt-2">
            {/* Category Badge */}
            <span className="inline-block bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full mb-2">
              {getCategoryName(product.categoryId)}
            </span>
            
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-600 line-clamp-2">{product.description}</p>
            <p className="text-red-500 font-bold mt-2">{product.price.toLocaleString('vi-VN')} đ</p>
            
            {/* Stock info */}
            <div className="mt-2 flex justify-between items-center">
              <p className="text-gray-500 text-xs">
                {product.stock > 0 ? `Còn lại: ${product.stock}` : 'Hết hàng'}
              </p>
              <div className={`w-2 h-2 rounded-full ${product.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ProductItem;
