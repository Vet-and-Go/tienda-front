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
            this.errorMessage = 'Por favor, ingresa tu usuario y contraseña';
            return;
        }

        if (this.username.trim().length < 3) {
            this.errorMessage = 'El nombre de usuario debe tener al menos 3 caracteres';
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
                
                if (err.status === 401 || err.status === 403 || err.status === 404) {
                    this.errorMessage = 'Usuario o contraseña incorrectos. Por favor, verifica tus datos.';
                } else if (err.status === 0) {
                    this.errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
                } else if (err.status === 400) {
                    this.errorMessage = 'Datos de inicio de sesión inválidos.';
                } else {
                    this.errorMessage = 'Error al iniciar sesión. Inténtalo de nuevo más tarde.';
                }
            }
        });
    }
}
