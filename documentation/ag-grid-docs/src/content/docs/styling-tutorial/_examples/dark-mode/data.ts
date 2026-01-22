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
        { productName: 'Desk Lamp LED', salesRevenue: 7400, profitMargin: 0.21, status: 'Delivered' },
        { productName: 'Ergonomic Mouse', salesRevenue: 11200, profitMargin: 0.27, status: 'Pending' },
        { productName: 'Portable SSD', salesRevenue: 28500, profitMargin: 0.19, status: 'Delivered' },
        { productName: 'Screen Protector', salesRevenue: 320, profitMargin: 0.52, status: 'Delivered' },
        { productName: 'HDMI Cable', salesRevenue: 1800, profitMargin: 0.33, status: 'Delivered' },
        { productName: 'Wireless Charger', salesRevenue: 9600, profitMargin: 0.26, status: 'Cancelled' },
        { productName: 'USB Flash Drive', salesRevenue: 2100, profitMargin: 0.29, status: 'Delivered' },
        { productName: 'Laptop Stand', salesRevenue: 14300, profitMargin: 0.23, status: 'Delivered' },
        { productName: 'Power Bank', salesRevenue: 16700, profitMargin: 0.21, status: 'Pending' },
        { productName: 'Smart Watch Band', salesRevenue: 4500, profitMargin: 0.34, status: 'Delivered' },
    ];
}
