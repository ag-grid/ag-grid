export interface IProduct {
    productName: string;
    salesRevenue: number;
    profitMargin: number;
    status: 'Delivered' | 'Pending' | 'Cancelled';
}

export function getData(): IProduct[] {
    return [
        { productName: 'Wireless Headphones', salesRevenue: 15420, profitMargin: 0.28, status: 'Delivered' },
        { productName: 'USB-C Hub', salesRevenue: 8750, profitMargin: 0.22, status: 'Delivered' },
        { productName: 'Mechanical Keyboard', salesRevenue: 22100, profitMargin: 0.31, status: 'Pending' },
        { productName: 'Monitor Stand', salesRevenue: 3200, profitMargin: 0.18, status: 'Delivered' },
        { productName: 'Webcam HD', salesRevenue: 12800, profitMargin: 0.25, status: 'Delivered' },
        { productName: 'Laptop Sleeve', salesRevenue: 890, profitMargin: 0.35, status: 'Cancelled' },
        { productName: 'Mouse Pad XL', salesRevenue: 450, profitMargin: 0.42, status: 'Delivered' },
        { productName: 'Bluetooth Speaker', salesRevenue: 18900, profitMargin: 0.24, status: 'Pending' },
        { productName: 'Phone Stand', salesRevenue: 1250, profitMargin: 0.38, status: 'Delivered' },
        { productName: 'Cable Organiser', salesRevenue: 680, profitMargin: 0.45, status: 'Delivered' },
    ];
}
