import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { CartService, CartItem } from '../../core/services/cart/cart.service';
import { OrderService } from '../../core/services/order/order.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { CheckoutRequest } from '../../models/order.models';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
    cartItems$: Observable<CartItem[]>;
    totalPrice = 0;
    isProcessingOrder = false;
    orderSuccess = false;
    orderError: string | null = null;
    showPaymentForm = false;

    // Datos del formulario de pago
    paymentData = {
        cardNumber: '',
        expirationDate: '',
        cvc: '',
        fullName: ''
    };

    constructor(
        private cartService: CartService,
        private orderService: OrderService,
        private authService: AuthService
    ) {
        this.cartItems$ = this.cartService.cartItems$;
    }

    ngOnInit(): void {
        this.cartItems$.subscribe(items => {
            this.totalPrice = items.reduce((acc, item) => acc + (item.product.finalPrice * item.quantity), 0);
        });
    }

    removeItem(productId: number): void {
        this.cartService.removeFromCart(productId);
    }

    increaseQuantity(productId: number): void {
        this.cartService.increaseQuantity(productId);
    }

    decreaseQuantity(productId: number): void {
        this.cartService.decreaseQuantity(productId);
    }

    clearCart(): void {
        this.cartService.clearCart();
    }

    initiateCheckout(): void {
        const user = this.authService.getUser();
        
        if (!user) {
            this.orderError = 'Debes iniciar sesión para finalizar la compra. Ve a la página de inicio de sesión.';
            return;
        }

        const cartItems = this.cartService.getCartItems();
        if (cartItems.length === 0) {
            this.orderError = 'El carrito está vacío. Añade productos antes de proceder al pago.';
            return;
        }

        this.showPaymentForm = true;
        this.orderError = null;
    }

    cancelPayment(): void {
        this.showPaymentForm = false;
        this.paymentData = {
            cardNumber: '',
            expirationDate: '',
            cvc: '',
            fullName: ''
        };
    }

    getCheckoutErrorMessage(errorMsg: string): string {
        if (!errorMsg) {
            return 'Error al procesar el pago. Por favor, intenta de nuevo.';
        }

        const msg = errorMsg.toLowerCase();
        
        if (msg.includes('user not found')) {
            return ' El nombre del titular no coincide con ninguna tarjeta registrada. Verifica que sea exactamente como aparece en tu tarjeta.';
        }
        if (msg.includes('insufficient') || msg.includes('fondos') || msg.includes('saldo')) {
            return ' Fondos insuficientes en la cuenta vinculada a la tarjeta.';
        }
        if (msg.includes('card') && msg.includes('not found') || msg.includes('tarjeta') && msg.includes('encontr')) {
            return ' Tarjeta no encontrada. Verifica el número de tarjeta ingresado.';
        }
        if (msg.includes('expired') || msg.includes('expirada') || msg.includes('expiration')) {
            return ' La tarjeta ha expirado. Usa otra tarjeta para continuar.';
        }
        if (msg.includes('cvc') || msg.includes('cvv')) {
            return ' CVC incorrecto. Verifica el código de seguridad de tu tarjeta.';
        }
        if (msg.includes('name') || msg.includes('titular') || msg.includes('holder') || msg.includes('fullname') || msg.includes('full name')) {
            return ' El nombre del titular no coincide. Verifica que sea exactamente como aparece en la tarjeta.';
        }
        if (msg.includes('authentication') || msg.includes('autenticación') || msg.includes('incorrect')) {
            return ' Los datos de la tarjeta no coinciden. Verifica número, fecha, CVC y nombre del titular.';
        }
        if (msg.includes('iban') || msg.includes('account')) {
            return ' Error con la cuenta de destino. Contacta con soporte.';
        }
        if (msg.includes('timeout') || msg.includes('tiempo')) {
            return ' El pago tardó demasiado tiempo. Inténtalo de nuevo.';
        }
        if (msg.includes('connection') || msg.includes('conexión')) {
            return ' Error de conexión con el banco. Verifica tu internet e inténtalo de nuevo.';
        }
        
        return ' Error al procesar el pago: ' + errorMsg;
    }

    processPayment(): void {
        const user = this.authService.getUser();
        
        if (!user) {
            this.orderError = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
            return;
        }

        // Validar campos del formulario
        if (!this.paymentData.cardNumber || this.paymentData.cardNumber.trim().length === 0) {
            this.orderError = 'El número de tarjeta es obligatorio.';
            return;
        }

        if (!/^\d+$/.test(this.paymentData.cardNumber)) {
            this.orderError = 'El número de tarjeta solo puede contener dígitos (sin espacios ni guiones).';
            return;
        }

        if (this.paymentData.cardNumber.length !== 16) {
            this.orderError = `El número de tarjeta debe tener exactamente 16 dígitos. Has introducido ${this.paymentData.cardNumber.length} dígitos.`;
            return;
        }

        if (!this.paymentData.expirationDate || this.paymentData.expirationDate.trim().length === 0) {
            this.orderError = 'La fecha de expiración es obligatoria.';
            return;
        }

        if (!/^\d{2}\/\d{2}$/.test(this.paymentData.expirationDate)) {
            this.orderError = 'Formato de fecha incorrecto. Debe ser MM/YY (ejemplo: 12/28).';
            return;
        }

        // Validar mes válido (01-12)
        const month = parseInt(this.paymentData.expirationDate.substring(0, 2));
        if (month < 1 || month > 12) {
            this.orderError = `Mes inválido (${month}). Debe estar entre 01 y 12.`;
            return;
        }

        // Validar que no esté expirada
        const year = 2000 + parseInt(this.paymentData.expirationDate.substring(3, 5));
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; 
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            this.orderError = `Esta tarjeta ya ha expirado (${this.paymentData.expirationDate}). Usa una tarjeta válida.`;
            return;
        }

        if (!this.paymentData.cvc || this.paymentData.cvc.trim().length === 0) {
            this.orderError = 'El código CVC es obligatorio.';
            return;
        }

        if (!/^\d+$/.test(this.paymentData.cvc)) {
            this.orderError = 'El CVC solo puede contener números.';
            return;
        }

        if (this.paymentData.cvc.length !== 3 && this.paymentData.cvc.length !== 4) {
            this.orderError = `CVC inválido. Debe tener 3 o 4 dígitos (has introducido ${this.paymentData.cvc.length}).`;
            return;
        }

        if (!this.paymentData.fullName || this.paymentData.fullName.trim().length === 0) {
            this.orderError = 'El nombre del titular es obligatorio.';
            return;
        }

        if (this.paymentData.fullName.trim().length < 3) {
            this.orderError = 'El nombre del titular debe tener al menos 3 caracteres.';
            return;
        }

        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.paymentData.fullName)) {
            this.orderError = 'El nombre del titular solo puede contener letras y espacios.';
            return;
        }

        const nameParts = this.paymentData.fullName.trim().split(/\s+/);
        if (nameParts.length < 2) {
            this.orderError = 'Debes ingresar nombre y apellido del titular (ejemplo: Juan Perez).';
            return;
        }

        const cartItems = this.cartService.getCartItems();
        
        this.isProcessingOrder = true;
        this.orderError = null;
        this.orderSuccess = false;

        const checkoutRequest: CheckoutRequest = {
            items: cartItems.map((item: CartItem) => ({
                productId: item.product.id,
                quantity: item.quantity
            })),
            cardNumber: this.paymentData.cardNumber,
            expirationDate: this.paymentData.expirationDate,
            cvc: this.paymentData.cvc,
            fullName: this.paymentData.fullName,
            login: 'store_login',
            apiToken: 'store_api_token',
            concept: 'Compra en VetAndGo'
        };

        console.log('[CHECKOUT] Processing payment...');
        console.log('[CHECKOUT] User:', { id: user.id, username: user.username });
        console.log('[CHECKOUT] Cart items count:', cartItems.length);

        this.orderService.checkout(user.id, checkoutRequest).subscribe({
            next: (response) => {
                console.log('[CHECKOUT] Payment successful!');
                console.log('[CHECKOUT] Response:', response);
                
                if (response.paymentStatus === 'SUCCESS') {
                    this.orderSuccess = true;
                    this.showPaymentForm = false;
                    this.cartService.clearCart();
                    this.paymentData = {
                        cardNumber: '',
                        expirationDate: '',
                        cvc: '',
                        fullName: ''
                    };
                    setTimeout(() => this.orderSuccess = false, 5000);
                } else {
                    this.orderError = this.getCheckoutErrorMessage(response.message);
                }
                this.isProcessingOrder = false;
            },
            error: (error) => {
                console.error('[CHECKOUT] Payment failed:', error);
                this.orderError = this.getCheckoutErrorMessage(error.error?.message || error.message);
                this.isProcessingOrder = false;
            }
        });
    }
}
