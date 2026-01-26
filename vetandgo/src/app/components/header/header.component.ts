import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';
import { CartService } from '../../core/services/cart/cart.service';
import { LoginResponse } from '../../models/auth.models';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
    currentUser: any | null = null;
    searchKeyword: string = '';
    cartCount: number = 0;
    private userSub: Subscription | undefined;
    private cartSub: Subscription | undefined;

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private cartService: CartService
    ) { }

    ngOnInit(): void {
        this.userSub = this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });

        this.cartSub = this.cartService.totalItems$.subscribe(count => {
            this.cartCount = count;
        });

        // Sync search input with URL query params
        this.route.queryParams.subscribe(params => {
            if (params['search']) {
                this.searchKeyword = params['search'];
            } else {
                this.searchKeyword = '';
            }
        });
    }

    ngOnDestroy(): void {
        if (this.userSub) {
            this.userSub.unsubscribe();
        }
        if (this.cartSub) {
            this.cartSub.unsubscribe();
        }
    }

    onSearch(): void {
        const keyword = this.searchKeyword.trim();
        if (keyword) {
            this.router.navigate(['/products'], { queryParams: { search: keyword } });
        } else {
            this.router.navigate(['/products']);
        }
    }

    logout(): void {
        this.authService.logout();
    }
}
