import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PredictionService {
    private apiUrl = '/api';

    constructor(private http: HttpClient) { }

    private getHeaders() {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    predict(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/predict`, data, { headers: this.getHeaders() });
    }

    getHistory(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/predict/history`, { headers: this.getHeaders() });
    }

    getStats(): Observable<any> {
        return this.http.get(`${this.apiUrl}/predict/stats`, { headers: this.getHeaders() });
    }

    deletePrediction(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/predict/${id}`, { headers: this.getHeaders() });
    }

    updateNotes(id: string, notes: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/predict/${id}/notes`, { notes }, { headers: this.getHeaders() });
    }
}
