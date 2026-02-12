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
        this.error = error.error?.message || 'Error al cargar los pedidos';
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
        this.error = error.error?.message || 'Error al cambiar el estado del pedido';
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
