export interface Category {
    id: number;
    name: string;
    description?: string;
    icon?: string; // Frontend helper
}

export interface Product {
    id: number;
    name: string;
    category?: Category;
    basePrice: number;           // Precio original/sin descuento
    finalPrice: number;          // Precio con descuento aplicado (USAR PARA PAGOS)
    discountPercentage: number;  // Porcentaje de descuento (0 = sin descuento)
    stock: number;
    description?: string;
    imageUrl?: string;
    // Deprecated: mantener para compatibilidad temporal
    price?: number;
    discount?: number;
}

export interface Page<T> {
    data: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages?: number; // Optional helper
}
