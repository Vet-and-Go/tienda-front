import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product/product.service';
import { CartService } from '../../core/services/cart/cart.service';
import { Product } from '../../models/product.models';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    categories: any[] = [];
    featuredProducts: Product[] = [];
    isLoading = true;
    defaultImage = 'https://via.placeholder.com/300x300/e2e8f0/667eea?text=Producto';

    constructor(
        private productService: ProductService,
        private router: Router,
        private cartService: CartService
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    addToCart(event: Event, product: Product): void {
        event.stopPropagation(); // Prevent navigation to detail
        this.cartService.addToCart(product);
    }

    onImageError(event: any): void {
        event.target.src = this.defaultImage;
    }

    onCategoryImageError(event: any, category: any): void {
        // If image fails, show icon as fallback
        const iconElement = document.createElement('i');
        iconElement.className = 'fas fa-paw';
        iconElement.style.fontSize = '3rem';
        iconElement.style.color = '#667eea';
        event.target.replaceWith(iconElement);
    }

    getProductImage(product: Product): string {
        return product.imageUrl || this.defaultImage;
    }

    getFinalPrice(product: Product): number {
        if (product.discount && product.discount > 0) {
            return product.price * (1 - product.discount / 100);
        }
        return product.price;
    }

    loadData(): void {
        this.isLoading = true;

        // Load categories
        this.productService.getCategories().subscribe(cats => {
            this.categories = cats.slice(0, 4); // Show only top 4 on home
        });

        // Load some "featured" products (e.g., first page, sorted by stock or just default)
        this.productService.getProducts(1, 4).subscribe({
            next: (page) => {
                this.featuredProducts = page.data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading home data', err);
                this.isLoading = false;
            }
        });
    }

    onCategoryClick(id: number): void {
        this.router.navigate(['/products'], { queryParams: { categoryId: id } });
    }
}
