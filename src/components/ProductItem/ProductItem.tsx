"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/services/ProductService/productService';

type ProductItemProps = {
  product: Product;
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

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
      style={{ 
        border: '1px solid rgba(234, 236, 240, 1)',
        margin: '5px 10px 5px 0',
        padding: '10px',
        height: '563px',
        width: '563px'
      }}
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative h-48 w-full bg-gray-100">
          <Image 
            src={product.imageUrl || '/placeholder.jpg'} 
            alt={product.name}
            fill
            className="object-cover"
            onError={(e) => {
              // Fallback image if imageUrl fails to load
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.jpg';
            }}
          />
        </div>
        <div className="p-4">
          {/* Category Badge */}
          <span className="inline-block bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full mb-2">
            {getCategoryName(product.categoryId)}
          </span>
          
          <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 h-10">
            {product.name}
          </h3>
          <p className="text-gray-600 text-xs line-clamp-2 mb-3">
            {product.description}
          </p>
          <p className="text-red-600 font-bold text-lg">
            {product.price.toLocaleString('vi-VN')} đ
          </p>
          
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
  );
};

export default ProductItem;
