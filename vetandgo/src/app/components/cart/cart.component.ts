import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { CartService } from '../../core/services/cart/cart.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
    cartItems$: Observable<any[]>;
    totalPrice = 0;

    constructor(private cartService: CartService) {
        this.cartItems$ = this.cartService.cartItems$;
    }

    ngOnInit(): void {
        this.cartItems$.subscribe(items => {
            this.totalPrice = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
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
}
