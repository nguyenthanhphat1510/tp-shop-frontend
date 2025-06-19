import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/services/productService/productService';

type ProductItemProps = {
  product: Product;
}

const ProductItem = ({ product }: ProductItemProps) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.id}`}>
        <div className="relative h-48 w-full">
          {/* <Image 
            src={product.imageUrl || '/placeholder.jpg'} 
            alt={product.name}
            fill
            className="object-cover"
          /> */}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <p className="text-gray-600 line-clamp-2">{product.description}</p>
          <p className="text-red-500 font-bold mt-2">{product.price.toLocaleString('vi-VN')} đ</p>
        </div>
      </Link>
    </div>
  );
};

export default ProductItem;
