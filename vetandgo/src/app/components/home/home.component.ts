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
