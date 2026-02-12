import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService } from '../../core/services/product/product.service';
import { CartService } from '../../core/services/cart/cart.service';
import { Product } from '../../models/product.models';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
    product: Product | null = null;
    isLoading = true;
    error: string | null = null;
    isAdded = false;
    private subscription?: Subscription;
    private timeoutId?: number;

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private cartService: CartService
    ) { }

    ngOnInit(): void {
        this.subscription = this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadProduct(Number(id));
            } else {
                this.error = 'Producto no especificado';
                this.isLoading = false;
            }
        });
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    loadProduct(id: number): void {
        this.isLoading = true;
        this.productService.getProductById(id).subscribe({
            next: (product) => {
                this.product = product;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading product', err);
                if (err.status === 404) {
                    this.error = 'Producto no encontrado. Puede que haya sido eliminado o el ID sea incorrecto.';
                } else if (err.status === 0) {
                    this.error = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
                } else if (err.status === 500) {
                    this.error = 'Error en el servidor al cargar el producto. Inténtalo de nuevo más tarde.';
                } else {
                    this.error = 'No se pudo cargar el producto. Por favor, inténtalo de nuevo.';
                }
                this.isLoading = false;
            }
        });
    }
    addToCart(): void {
        if (this.product) {
            this.cartService.addToCart(this.product);
            this.isAdded = true;
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
            }
            this.timeoutId = window.setTimeout(() => this.isAdded = false, 2000);
        }
    }

    hasDiscount(): boolean {
        return this.product?.discountPercentage ? this.product.discountPercentage > 0 : false;
    }

    getSavings(): number {
        if (this.product && this.hasDiscount()) {
            return this.product.basePrice - this.product.finalPrice;
        }
        return 0;
    }
}
