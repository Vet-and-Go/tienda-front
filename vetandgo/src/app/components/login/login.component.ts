import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    username = '';
    password = '';
    isLoading = false;
    errorMessage: string | null = null;

    constructor(private router: Router, private authService: AuthService) { }

    onSubmit(): void {
        if (!this.username || !this.password) {
            this.errorMessage = 'Please enter username and password';
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;

        this.authService.login({ username: this.username, password: this.password }).subscribe({
            next: () => {
                this.isLoading = false;
                this.router.navigate(['/home']);
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = 'Invalid credentials';
                console.error('Login failed', err);
            }
        });
    }
}
