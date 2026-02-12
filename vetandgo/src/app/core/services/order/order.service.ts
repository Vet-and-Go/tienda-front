import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderRequest, OrderResponse, OrderState, CheckoutRequest, CheckoutResponse } from '../../../models/order.models';
import { Http } from '../http/http.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: Http) { }

  createOrder(userId: number, orderRequest: OrderRequest): Observable<OrderResponse> {
    const params = new HttpParams().set('userId', userId.toString());
    console.log('[ORDER_SERVICE] createOrder called');
    console.log('[ORDER_SERVICE] URL: orders');
    console.log('[ORDER_SERVICE] Params:', params.toString());
    console.log('[ORDER_SERVICE] Request body:', orderRequest);
    return this.http.createWithParams<OrderResponse>('orders', orderRequest, params);
  }

  getAllOrders(): Observable<OrderResponse[]> {
    return this.http.getAll<OrderResponse>('orders');
  }

  getOrdersByUser(userId: number): Observable<OrderResponse[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.getAll<OrderResponse>('orders', params);
  }

  getOrderById(orderId: number): Observable<OrderResponse> {
    return this.http.getById<OrderResponse>(`orders/${orderId}`);
  }

  updateOrder(orderId: number, orderRequest: OrderRequest & { id: number }): Observable<OrderResponse> {
    return this.http.update<OrderResponse>(`orders/${orderId}`, orderRequest);
  }

  changeOrderState(orderId: number, state: OrderState): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`orders/${orderId}/state/${state}`, {});
  }

  deleteOrder(orderId: number): Observable<void> {
    return this.http.deleteById<void>(`orders/${orderId}`);
  }

  checkout(userId: number, checkoutRequest: CheckoutRequest): Observable<CheckoutResponse> {
    const params = new HttpParams().set('userId', userId.toString());
    console.log('[ORDER_SERVICE] checkout called');
    console.log('[ORDER_SERVICE] URL: orders/checkout');
    console.log('[ORDER_SERVICE] Params:', params.toString());
    console.log('[ORDER_SERVICE] Request body:', checkoutRequest);
    return this.http.createWithParams<CheckoutResponse>('orders/checkout', checkoutRequest, params);
  }
}
