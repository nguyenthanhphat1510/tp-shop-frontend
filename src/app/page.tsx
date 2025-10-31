import React from 'react';
import ProductList from '@/components/ProductList/ProductList';
import SaleVariantsList from '@/components/SaleVariantsList/SaleVariantsList';

export default function HomePage() {
  return (
    <div>
      <SaleVariantsList />
      <ProductList />
    </div>
  );
}
