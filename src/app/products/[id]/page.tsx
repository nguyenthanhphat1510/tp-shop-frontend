import { Metadata } from 'next';
import ProductDetail from '@/components/ProductDetail/ProductDetail';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    return {
        title: `Chi tiết sản phẩm - ${id}`,
        description: `Xem chi tiết sản phẩm với ID ${id}`,
    };
}

export default async function ProductDetailPage({ params }: PageProps) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <ProductDetail productId={id} />
            </div>
        </div>
    );
}