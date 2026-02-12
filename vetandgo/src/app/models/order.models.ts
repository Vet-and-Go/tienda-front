import { Product } from './product.models';

export interface OrderItemRequest {
    productId: number;
    quantity: number;
}

export interface OrderRequest {
    items: OrderItemRequest[];
    state: OrderState;
}

export interface OrderItemResponse {
    id: number;
    product: Product;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface OrderUser {
    id: number;
    username: string;
}

export interface OrderResponse {
    id: number;
    items: OrderItemResponse[];
    state: OrderState;
    user: OrderUser;
    orderDate: string;
    totalAmount: number;
}

export enum OrderState {
    PENDING = 'PENDING',
    PROCESSED = 'PROCESSED',
    DELIVERED = 'DELIVERED'
}

export interface CheckoutRequest {
    items: OrderItemRequest[];
    cardNumber: string;
    expirationDate: string;
    cvc: string;
    fullName: string;
    login: string;
    apiToken: string;
    concept: string;
}

export interface CheckoutResponse {
    order: OrderResponse | null;
    paymentStatus: 'SUCCESS' | 'FAILED';
    message: string;
}
