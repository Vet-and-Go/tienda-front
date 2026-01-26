import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
export class ProductDetailComponent implements OnInit {
    product: Product | null = null;
    isLoading = true;
    error: string | null = null;
    isAdded = false;

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private cartService: CartService
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadProduct(Number(id));
            } else {
                this.error = 'Producto no especificado';
                this.isLoading = false;
            }
        });
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
                this.error = 'No se pudo cargar el producto. Puede que no exista o haya un problema de conexión.';
                this.isLoading = false;
            }
        });
    }
    addToCart(): void {
        if (this.product) {
            this.cartService.addToCart(this.product);
            this.isAdded = true;
            setTimeout(() => this.isAdded = false, 2000);
        }
    }

    // Ya no es necesario calcular el precio final, viene del backend
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
