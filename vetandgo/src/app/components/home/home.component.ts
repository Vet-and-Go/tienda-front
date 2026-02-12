import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService } from '../../core/services/product/product.service';
import { CartService } from '../../core/services/cart/cart.service';
import { Product, Category } from '../../models/product.models';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
    categories: Category[] = [];
    featuredProducts: Product[] = [];
    isLoading = true;
    defaultImage = 'https://via.placeholder.com/300x300/e2e8f0/667eea?text=Producto';
    private subscriptions: Subscription[] = [];

    constructor(
        private productService: ProductService,
        private router: Router,
        private cartService: CartService
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    addToCart(event: Event, product: Product): void {
        event.stopPropagation(); 
        this.cartService.addToCart(product);
    }

    onImageError(event: any): void {
        event.target.src = this.defaultImage;
    }

    onCategoryImageError(event: any, category: any): void {
        
        const iconElement = document.createElement('i');
        iconElement.className = 'fas fa-paw';
        iconElement.style.fontSize = '3rem';
        iconElement.style.color = '#667eea';
        event.target.replaceWith(iconElement);
    }

    getProductImage(product: Product): string {
        return product.imageUrl || this.defaultImage;
    }


    hasDiscount(product: Product): boolean {
        return product.discountPercentage > 0;
    }

    loadData(): void {
        this.isLoading = true;

        
        const catSub = this.productService.getCategories().subscribe({
            next: cats => {
                this.categories = cats.slice(0, 4); 
            },
            error: err => {
                console.error(' Error al cargar categorías:', err);
                if (err.status === 0) {
                    console.error(' No se pudo conectar con el servidor.');
                } else if (err.status === 500) {
                    console.error(' Error en el servidor.');
                }
            }
        });
        this.subscriptions.push(catSub);

        const prodSub = this.productService.getProducts(1, 4).subscribe({
            next: (page) => {
                this.featuredProducts = page.data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error(' Error loading home data', err);
                if (err.status === 0) {
                    console.error(' No se pudo conectar con el servidor. Verifica tu conexión a internet.');
                } else if (err.status === 500) {
                    console.error(' Error en el servidor al cargar productos destacados.');
                } else {
                    console.error(' Error al cargar productos:', err.message);
                }
                this.isLoading = false;
            }
        });
        this.subscriptions.push(prodSub);
    }

    onCategoryClick(id: number): void {
        this.router.navigate(['/products'], { queryParams: { categoryId: id } });
    }
}
