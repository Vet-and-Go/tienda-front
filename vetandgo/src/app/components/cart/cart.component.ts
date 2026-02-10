import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { CartService, CartItem } from '../../core/services/cart/cart.service';
import { OrderService } from '../../core/services/order/order.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { OrderRequest, OrderState } from '../../models/order.models';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
    cartItems$: Observable<CartItem[]>;
    totalPrice = 0;
    isProcessingOrder = false;
    orderSuccess = false;
    orderError: string | null = null;

    constructor(
        private cartService: CartService,
        private orderService: OrderService,
        private authService: AuthService
    ) {
        this.cartItems$ = this.cartService.cartItems$;
    }

    ngOnInit(): void {
        this.cartItems$.subscribe(items => {
            this.totalPrice = items.reduce((acc, item) => acc + (item.product.finalPrice * item.quantity), 0);
        });
    }

    removeItem(productId: number): void {
        this.cartService.removeFromCart(productId);
    }

    increaseQuantity(productId: number): void {
        this.cartService.increaseQuantity(productId);
    }

    decreaseQuantity(productId: number): void {
        this.cartService.decreaseQuantity(productId);
    }

    clearCart(): void {
        this.cartService.clearCart();
    }

    checkout(): void {
        const user = this.authService.getUser();
        
        if (!user) {
            this.orderError = 'Debes iniciar sesión para finalizar la compra';
            return;
        }

        const cartItems = this.cartService.getCartItems();
        if (cartItems.length === 0) {
            this.orderError = 'El carrito está vacío';
            return;
        }

        this.isProcessingOrder = true;
        this.orderError = null;
        this.orderSuccess = false;

        const orderRequest: OrderRequest = {
            items: cartItems.map((item: CartItem) => ({
                productId: item.product.id,
                quantity: item.quantity
            })),
            state: OrderState.PENDING
        };

        this.orderService.createOrder(user.id, orderRequest).subscribe({
            next: (order) => {
                this.orderSuccess = true;
                this.isProcessingOrder = false;
                this.cartService.clearCart();
                setTimeout(() => this.orderSuccess = false, 5000);
            },
            error: (error) => {
                this.isProcessingOrder = false;
                this.orderError = error.error?.message || 'Error al crear la orden. Por favor, intenta de nuevo.';
            }
        });
    }
}
