"use client";
// Import useState
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/services/productService/productService';

type ProductItemProps = {
  product: Product;
}

const ProductItem = ({ product }: ProductItemProps) => {
  const getCategoryName = (categoryId: string) => {
    const categoryMap: { [key: string]: string } = {
      '685cbd213f7b05b5d70b860f': 'Điện thoại',
      '6890040ea32b9f9c88809b74': 'Điện thoại',
    };
    return categoryMap[categoryId] || 'Sản phẩm';
  };

  const variants = product.variants || [];
  const defaultVariant = variants.length > 0
    ? variants.reduce((min, variant) => variant.price < min.price ? variant : min)
    : null;

  const allStorages = variants.map(v => v.storage);
  const uniqueStorages = [...new Set(allStorages)];
  
  const sortedStorages = uniqueStorages.sort((a, b) => {
    const numA = parseInt(String(a));
    const numB = parseInt(String(b));
    return numA - numB;
  });

  const initialImage = defaultVariant?.imageUrls?.[0]
    || defaultVariant?.images?.[0]
    || 'https://via.placeholder.com/180x180?text=No+Image';

  const [displayImage, setDisplayImage] = useState(initialImage);
  const [selectedStorage, setSelectedStorage] = useState(defaultVariant?.storage);
  
  const [isFading, setIsFading] = useState(false);

  const getProductUrl = () => {
    if (defaultVariant) {
      return `/products/${product.id}?color=${encodeURIComponent(defaultVariant.color)}&storage=${encodeURIComponent(defaultVariant.storage)}`;
    }
    return `/products/${product.id}`;
  };

  const displayPrice = defaultVariant?.price || 0;
  const stock = variants.reduce((total, variant) => total + (variant.stock || 0), 0);

  const handleStorageClick = (e: React.MouseEvent, storage: any) => {
    e.stopPropagation();
    e.preventDefault();
    if (storage === selectedStorage) return;

    setIsFading(true); 

    setTimeout(() => {
      const newVariant = variants.find(v => v.storage === storage);
      if (!newVariant) {
        setIsFading(false);
        return;
      }
      
      const newImage = newVariant.imageUrls?.[0] || newVariant.images?.[0];

      if (newImage) {
        setDisplayImage(newImage);
      }
      setSelectedStorage(storage);
      
      setIsFading(false);
    }, 300); 
  };

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
        <Link href={getProductUrl()}>
          {/* Image Container */}
          <div className="flex justify-center mt-4">
            
            <div
              className={`
                relative bg-gray-100 overflow-hidden rounded-lg 
                transition-all duration-300 ease-in-out 
                group-hover:scale-110 group-hover:-translate-y-2
                transition-opacity duration-300
                ${isFading ? 'opacity-0' : 'opacity-100'}
              `}
              style={{
                width: '180px',
                height: '180px',
              }}
            >
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/180x180?text=Error';
                }}
              />
            </div>
          </div>

          <div className="p-4 mt-2">
            <span className="inline-block bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full mb-2">
              {getCategoryName(product.categoryId)}
            </span>

            <h3 className="font-semibold text-lg">{product.name}</h3>

            {sortedStorages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 mb-2 pb-1">
                {sortedStorages.map(storage => (
                  <span
                    key={storage}
                    onClick={(e) => handleStorageClick(e, storage)}
                    className={`
                      border rounded-full text-xs font-medium cursor-pointer
                      px-2.5 py-1 transition-all duration-200
                      ${
                        storage === selectedStorage
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
                      }
                    `}
                  >
                    {storage}
                  </span>
                ))}
              </div>
            )}

            <p className="text-gray-600 line-clamp-1">{product.description}</p>

            <div className="mt-2">
              <p className="text-red-500 font-bold text-lg">
                {displayPrice.toLocaleString('vi-VN')} đ
              </p>
            </div>

            <div className="mt-2 flex justify-between items-center">
              <p className="text-gray-500 text-xs">
                {stock > 0 ? `Còn lại: ${stock}` : 'Hết hàng'}
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