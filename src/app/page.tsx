import React from 'react';
import { getProducts } from '@/services/productService/productService';
import ProductItem from '@/components/ProductItem/ProductItem';

export const revalidate = 60; // Revalidate page data every 60 seconds

export default async function HomePage() {
  // Lấy dữ liệu sản phẩm từ API
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sản phẩm nổi bật</h1>
      
      {/* Hiển thị danh sách sản phẩm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
