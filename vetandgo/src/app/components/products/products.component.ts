import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductService } from '../../core/services/product/product.service';
import { CartService } from '../../core/services/cart/cart.service';
import { Product, Page, Category } from '../../models/product.models';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
    products: Product[] = [];
    categories: Category[] = [];
    selectedCategoryId: number | null = null;
    currentPage = 1;
    pageSize = 20;
    totalElements = 0;
    currentSort = '';
    currentKeyword = '';
    searchKeyword = '';

    isLoading = false;
    showNotification = false;
    
    private subscriptions: Subscription[] = [];
    private timeoutId?: number;

    constructor(
        private productService: ProductService,
        private route: ActivatedRoute,
        private router: Router,
        private cartService: CartService
    ) { }

    ngOnInit(): void {
        this.calculatePageSize();
        
        const catSub = this.productService.getCategories().subscribe(cats => this.categories = cats);
        this.subscriptions.push(catSub);

        const paramsSub = this.route.queryParams.subscribe(params => {
            this.currentPage = params['page'] ? Number(params['page']) : 1;
            this.selectedCategoryId = params['categoryId'] ? Number(params['categoryId']) : null;
            this.currentSort = params['sort'] || '';
            this.currentKeyword = params['search'] || '';
            this.searchKeyword = this.currentKeyword;

            this.loadProducts();
        });
        this.subscriptions.push(paramsSub);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    @HostListener('window:resize')
    onResize() {
        this.calculatePageSize();
    }

    calculatePageSize(): void {
        
        const columns = 4;
        
        
        const rows = 4;
        this.pageSize = columns * rows; 
    }

    addToCart(event: Event, product: Product): void {
        event.stopPropagation();
        this.cartService.addToCart(product);
        
        this.showNotification = true;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = window.setTimeout(() => {
            this.showNotification = false;
        }, 3000);
    }

    

    getResultsText(): string {
        const showing = this.products.length;
        const total = this.totalElements;
        const categoryName = this.getSelectedCategoryName();
        
        if (this.currentKeyword) {
            return `Mostrando ${showing} de ${total} resultados para "${this.currentKeyword}"`;
        }
        
        if (categoryName) {
            return `Mostrando ${showing} de ${total} productos en ${categoryName}`;
        }
        
        return `Mostrando ${showing} de ${total} productos`;
    }

    getSelectedCategoryName(): string | null {
        if (!this.selectedCategoryId) return null;
        const category = this.categories.find(cat => cat.id === this.selectedCategoryId);
        return category ? category.name : null;
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
                this.totalElements = page.totalElements; 
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading products', err);
                if (err.status === 0) {
                    console.error('\u274c No se pudo conectar con el servidor. Verifica tu conexi\u00f3n.');
                } else if (err.status === 500) {
                    console.error('\u274c Error en el servidor al cargar productos.');
                } else {
                    console.error('\u274c Error al cargar productos:', err.message);
                }
                this.isLoading = false;
            }
        });
    }

    onCategorySelect(categoryId: number | null): void {
        this.selectedCategoryId = categoryId;
        this.currentPage = 1; 
        this.currentKeyword = '';
        this.updateUrl();
    }

    onSortChange(sort: string): void {
        this.currentSort = sort;
        this.updateUrl();
    }

    get totalPages(): number {
        const calculatedPages = Math.ceil(this.totalElements / this.pageSize);

        
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

    onSearch(): void {
        this.currentKeyword = this.searchKeyword.trim();
        this.currentPage = 1;
        this.updateUrl();
    }

    onSearchInput(): void {
        if (!this.searchKeyword.trim()) {
            this.clearSearch();
        }
    }

    clearSearch(): void {
        this.searchKeyword = '';
        this.currentKeyword = '';
        this.currentPage = 1;
        this.updateUrl();
    }
}
