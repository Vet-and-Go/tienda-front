import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    username = '';
    password = '';
    confirmPassword = '';
    isLoading = false;
    errorMessage: string | null = null;

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    onSubmit(): void {
        if (!this.username || !this.password || !this.confirmPassword) {
            this.errorMessage = 'Por favor, completa todos los campos.';
            return;
        }

        if (this.username.trim().length < 3) {
            this.errorMessage = 'El nombre de usuario debe tener al menos 3 caracteres.';
            return;
        }

        if (this.password.length < 4) {
            this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.errorMessage = 'Las contraseñas no coinciden. Verifica e inténtalo de nuevo.';
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;

        this.authService.register({ username: this.username, password: this.password }).subscribe({
            next: () => {
                this.isLoading = false;
                this.router.navigate(['/login']);
            },
            error: (err) => {
                this.isLoading = false;
                if (err.status === 409 || err.error?.message?.includes('Duplicate')) {
                    this.errorMessage = 'Este nombre de usuario ya está en uso. Por favor, elige otro.';
                } else if (err.status === 400) {
                    this.errorMessage = 'Los datos ingresados no son válidos. Verifica e inténtalo de nuevo.';
                } else if (err.status === 0) {
                    this.errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
                } else {
                    this.errorMessage = 'Ocurrió un error al crear tu cuenta. Inténtalo de nuevo más tarde.';
                }
            }
        });
    }
}
