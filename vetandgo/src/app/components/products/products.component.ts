import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product/product.service';
import { CartService } from '../../core/services/cart/cart.service';
import { Product, Page } from '../../models/product.models';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
    products: Product[] = [];
    categories: any[] = [];
    selectedCategoryId: number | null = null;
    currentPage = 1;
    pageSize = 20;
    totalElements = 0;
    currentSort = '';
    currentKeyword = '';

    isLoading = false;

    constructor(
        private productService: ProductService,
        private route: ActivatedRoute,
        private router: Router,
        private cartService: CartService
    ) { }

    ngOnInit(): void {
        this.calculatePageSize();
        
        // Load categories from backend
        this.productService.getCategories().subscribe(cats => this.categories = cats);

        // Subscribe to query params to handle navigation/filtering
        this.route.queryParams.subscribe(params => {
            this.currentPage = params['page'] ? Number(params['page']) : 1;
            this.selectedCategoryId = params['categoryId'] ? Number(params['categoryId']) : null;
            this.currentSort = params['sort'] || '';
            this.currentKeyword = params['search'] || '';

            this.loadProducts();
        });
    }

    @HostListener('window:resize')
    onResize() {
        this.calculatePageSize();
    }

    calculatePageSize(): void {
        // Fixed 4 columns per row
        const columns = 4;
        
        // Set pageSize to a multiple of columns (4 rows)
        const rows = 4;
        this.pageSize = columns * rows; // 16 products per page
    }

    addToCart(event: Event, product: Product): void {
        event.stopPropagation();
        this.cartService.addToCart(product);
    }

    loadProducts(): void {
        this.isLoading = true;
        this.productService.getProducts(
            this.currentPage,
            this.pageSize,
            this.selectedCategoryId || undefined,
            this.currentSort || undefined,
            this.currentKeyword || undefined
        ).subscribe({
            next: (page: Page<Product>) => {
                this.products = page.data;
                this.totalElements = page.totalElements; // totalElements might be needed for pagination logic
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading products', err);
                this.isLoading = false;
            }
        });
    }

    onCategorySelect(categoryId: number | null): void {
        this.selectedCategoryId = categoryId;
        this.currentPage = 1; // Reset to first page on filter change
        // Clear search when selecting a category to avoid backend total page count issues
        // and to treat category selection as a reset of the main product view context.
        this.currentKeyword = '';
        this.updateUrl();
    }

    onSortChange(sort: string): void {
        this.currentSort = sort;
        this.updateUrl();
    }

    get totalPages(): number {
        const calculatedPages = Math.ceil(this.totalElements / this.pageSize);

        // Backend might return total unfiltered count despite pagination returning filtered results.
        // Heuristic: If the current page result is smaller than page size, it implies we are on the last page.
        if (this.products.length < this.pageSize && this.products.length > 0) {
            return this.currentPage;
        }

        return calculatedPages || 0;
    }

    onPageChange(page: number): void {
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
            this.currentPage = page;
            this.updateUrl();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    updateUrl(): void {
        const queryParams: any = {
            page: this.currentPage,
        };

        if (this.selectedCategoryId) {
            queryParams.categoryId = this.selectedCategoryId;
        }

        if (this.currentSort) {
            queryParams.sort = this.currentSort;
        }

        if (this.currentKeyword) {
            queryParams.search = this.currentKeyword;
        }

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: queryParams,
        });
    }
}
