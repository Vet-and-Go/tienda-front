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

        if (this.password !== this.confirmPassword) {
            this.errorMessage = 'Las contraseñas no coinciden.';
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;

        this.authService.register({ username: this.username, password: this.password }).subscribe({
            next: () => {
                this.isLoading = false;
                // Redirect to login or home, assuming login for now
                this.router.navigate(['/login']);
            },
            error: (err) => {
                this.isLoading = false;
                if (err.status === 409) {
                    this.errorMessage = 'El nombre de usuario ya existe.';
                } else if (err.status === 400) {
                    this.errorMessage = 'Datos inválidos o incompletos.';
                } else {
                    this.errorMessage = 'Ocurrió un error inesperado.';
                }
            }
        });
    }
}
