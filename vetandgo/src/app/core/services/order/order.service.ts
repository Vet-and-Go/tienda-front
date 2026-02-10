import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderRequest, OrderResponse, OrderState } from '../../../models/order.models';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = '/api/orders';

    constructor(private http: HttpClient) {}

    createOrder(userId: number, orderRequest: OrderRequest): Observable<OrderResponse> {
        const params = new HttpParams().set('userId', userId.toString());
        console.log('[ORDER_SERVICE] createOrder called');
        console.log('[ORDER_SERVICE] URL:', this.apiUrl);
        console.log('[ORDER_SERVICE] Params:', params.toString());
        console.log('[ORDER_SERVICE] Request body:', orderRequest);
        return this.http.post<OrderResponse>(this.apiUrl, orderRequest, { params });
    }

    getAllOrders(): Observable<OrderResponse[]> {
        return this.http.get<OrderResponse[]>(this.apiUrl);
    }

    getOrdersByUser(userId: number): Observable<OrderResponse[]> {
        const params = new HttpParams().set('userId', userId.toString());
        return this.http.get<OrderResponse[]>(this.apiUrl, { params });
    }

    getOrderById(orderId: number): Observable<OrderResponse> {
        return this.http.get<OrderResponse>(`${this.apiUrl}/${orderId}`);
    }

    updateOrder(orderId: number, orderRequest: OrderRequest & { id: number }): Observable<OrderResponse> {
        return this.http.put<OrderResponse>(`${this.apiUrl}/${orderId}`, orderRequest);
    }

    changeOrderState(orderId: number, state: OrderState): Observable<OrderResponse> {
        return this.http.patch<OrderResponse>(`${this.apiUrl}/${orderId}/state/${state}`, {});
    }

    deleteOrder(orderId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${orderId}`);
    }
}
