import ProductDetail from '@/components/ProductDetail/ProductDetail';

interface PageProps {
    params: {
        id: string;  // 🎯 Next.js tự động truyền ID từ URL vào đây
    };
}

export default function ProductDetailPage({ params }: PageProps) {
    console.log('📄 Page received product ID:', params.id);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* 🎯 TRUYỀN: Truyền productId cho ProductDetail component */}
                <ProductDetail productId={params.id} />
            </div>
        </div>
    );
}

// Optional: Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
    return {
        title: `Chi tiết sản phẩm - ${params.id}`,
        description: `Xem chi tiết sản phẩm với ID ${params.id}`,
    };
}