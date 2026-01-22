import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http } from '../http/http.service';
import { Page, Product } from '../../../models/product.models';
import { HttpParams } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    constructor(private http: Http, private httpClient: HttpClient) { }

    getProducts(page: number = 1, size: number = 10, categoryId?: number, sort?: string, keyword?: string): Observable<Page<Product>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (categoryId) {
            params = params.set('categoryId', categoryId.toString());
        }

        if (sort) {
            params = params.set('sort', sort);
        }

        if (keyword) {
            params = params.set('search', keyword);
        }


        return this.httpClient.get<Page<Product>>('/api/products', { params });
    }

    getCategories(): Observable<any[]> {
        return this.httpClient.get<any[]>('/api/categories');
    }

    getProductById(id: number): Observable<Product> {
        return this.httpClient.get<Product>(`/api/products/${id}`);
    }
}
