import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../../../models/product.models';

interface CartItem {
    product: Product;
    quantity: number;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItems = new BehaviorSubject<CartItem[]>([]);
    cartItems$ = this.cartItems.asObservable();

    private totalItems = new BehaviorSubject<number>(0);
    totalItems$ = this.totalItems.asObservable();

    constructor() {
        // Load from local storage if exists
        const savedCart = localStorage.getItem('vetandgo_cart');
        if (savedCart) {
            try {
                const items = JSON.parse(savedCart);
                this.cartItems.next(items);
                this.updateTotals(items);
            } catch (e) {
                console.error('Error parsing cart from localeStorage', e);
            }
        }
    }

    addToCart(product: Product): void {
        const currentItems = this.cartItems.value;
        const existingItem = currentItems.find(item => item.product.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
            this.cartItems.next([...currentItems]);
        } else {
            this.cartItems.next([...currentItems, { product, quantity: 1 }]);
        }

        this.updateTotals(this.cartItems.value);
        this.saveToStorage();
    }

    private updateTotals(items: CartItem[]): void {
        const count = items.reduce((acc, item) => acc + item.quantity, 0);
        this.totalItems.next(count);
    }

    private saveToStorage(): void {
        localStorage.setItem('vetandgo_cart', JSON.stringify(this.cartItems.value));
    }

    getCartCount(): number {
        return this.totalItems.value;
    }

    removeFromCart(productId: number): void {
        const currentItems = this.cartItems.value.filter(item => item.product.id !== productId);
        this.cartItems.next(currentItems);
        this.updateTotals(currentItems);
        this.saveToStorage();
    }

    increaseQuantity(productId: number): void {
        const currentItems = this.cartItems.value;
        const item = currentItems.find(i => i.product.id === productId);
        if (item) {
            item.quantity += 1;
            this.cartItems.next([...currentItems]);
            this.updateTotals(currentItems);
            this.saveToStorage();
        }
    }

    decreaseQuantity(productId: number): void {
        const currentItems = this.cartItems.value;
        const item = currentItems.find(i => i.product.id === productId);
        if (item && item.quantity > 1) {
            item.quantity -= 1;
            this.cartItems.next([...currentItems]);
            this.updateTotals(currentItems);
            this.saveToStorage();
        } else if (item && item.quantity === 1) {
            this.removeFromCart(productId);
        }
    }

    clearCart(): void {
        this.cartItems.next([]);
        this.totalItems.next(0);
        localStorage.removeItem('vetandgo_cart');
    }
}
