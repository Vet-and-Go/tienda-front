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
    price: number;
    stock: number;
    description?: string;
    imageUrl?: string;
    discount?: number;
}

export interface Page<T> {
    data: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages?: number; // Optional helper
}
