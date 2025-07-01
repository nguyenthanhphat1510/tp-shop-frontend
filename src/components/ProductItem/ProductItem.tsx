import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/services/productService/productService';

type ProductItemProps = {
  product: Product;
}

const ProductItem = ({ product }: ProductItemProps) => {
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
      style={{ 
        border: '1px solid rgba(234, 236, 240, 1)',
        margin: '5px 10px 5px 0',
        padding: '10px',
        height: '563px'
      }}
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative h-48 w-full bg-gray-100">
          <Image 
            src={product.imageUrl || '/placeholder.jpg'} 
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          {/* Category Badge */}
          <span className="inline-block bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full mb-2">
            {product.category}
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
        </div>
      </Link>
    </div>
  );
};

export default ProductItem;
