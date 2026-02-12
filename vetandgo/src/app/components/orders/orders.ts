import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order/order.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { OrderResponse, OrderState } from '../../models/order.models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders implements OnInit {
  orders: OrderResponse[] = [];
  isLoading = false;
  error: string | null = null;
  OrderState = OrderState;

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const user = this.authService.getUser();
    
    if (!user) {
      this.error = 'Debes iniciar sesión para ver tus pedidos';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.orderService.getOrdersByUser(user.id).subscribe({
      next: (orders) => {
        this.orders = orders.sort((a, b) => 
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        if (error.status === 0) {
          this.error = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        } else if (error.status === 404) {
          this.error = 'No se encontraron pedidos para este usuario.';
        } else if (error.status === 401 || error.status === 403) {
          this.error = 'No tienes permiso para ver estos pedidos. Inicia sesión nuevamente.';
        } else {
          this.error = error.error?.message || 'Error al cargar tus pedidos. Inténtalo de nuevo más tarde.';
        }
        this.isLoading = false;
      }
    });
  }

  getStateClass(state: OrderState): string {
    switch (state) {
      case OrderState.PENDING:
        return 'orders__state--pending';
      case OrderState.PROCESSED:
        return 'orders__state--processed';
      case OrderState.DELIVERED:
        return 'orders__state--delivered';
      default:
        return '';
    }
  }

  getStateLabel(state: OrderState): string {
    switch (state) {
      case OrderState.PENDING:
        return 'Pendiente';
      case OrderState.PROCESSED:
        return 'Procesado';
      case OrderState.DELIVERED:
        return 'Entregado';
      default:
        return state;
    }
  }

  changeOrderState(orderId: number, newState: OrderState): void {
    this.orderService.changeOrderState(orderId, newState).subscribe({
      next: (updatedOrder) => {
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          this.orders[orderIndex] = updatedOrder;
        }
      },
      error: (error) => {
        if (error.status === 404) {
          this.error = 'Pedido no encontrado. Recarga la página e inténtalo de nuevo.';
        } else if (error.status === 403) {
          this.error = 'No tienes permiso para modificar este pedido.';
        } else {
          this.error = error.error?.message || 'Error al actualizar el estado del pedido. Inténtalo de nuevo.';
        }
      }
    });
  }

  confirmDelivery(orderId: number): void {
    const password = prompt('Para confirmar la recepción del pedido, ingresa tu contraseña:');
    
    if (password === null) {
      // Usuario canceló
      return;
    }
    
    if (!password || password.trim().length === 0) {
      alert('Debes ingresar tu contraseña para confirmar la recepción.');
      return;
    }
    
    if (password.length < 4) {
      alert('Contraseña inválida. Debe tener al menos 4 caracteres.');
      return;
    }
    
    // Verificar contraseña con el backend haciendo login temporal
    const user = this.authService.getUser();
    if (!user) {
      this.error = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
      return;
    }
    
    this.authService.login({ username: user.username, password: password }).subscribe({
      next: () => {
        // Contraseña correcta, cambiar estado del pedido
        this.changeOrderState(orderId, OrderState.DELIVERED);
      },
      error: () => {
        alert('Contraseña incorrecta. No se pudo confirmar la recepción del pedido.');
      }
    });
  }

  getAvailableStates(currentState: OrderState): OrderState[] {
    switch (currentState) {
      case OrderState.PENDING:
        return [OrderState.PROCESSED, OrderState.DELIVERED];
      case OrderState.PROCESSED:
        return [OrderState.DELIVERED];
      case OrderState.DELIVERED:
        return [];
      default:
        return [];
    }
  }
}
