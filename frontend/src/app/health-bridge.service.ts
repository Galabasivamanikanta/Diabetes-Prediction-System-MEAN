import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class HealthBridgeService {
    private apiUrl = '/api/auth';

    // Simulated BLE Stream for Heart Rate
    private heartRateSource = new BehaviorSubject<number>(72);
    currentHeartRate$ = this.heartRateSource.asObservable();

    constructor(private http: HttpClient) { }

    private getHeaders() {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    // Update the live HR (called by WearableComponent)
    updateLiveHeartRate(bpm: number) {
        this.heartRateSource.next(bpm);
    }

    // Backend Profile Methods
    getProfile(): Observable<any> {
        return this.http.get(`${this.apiUrl}/me`, { headers: this.getHeaders() });
    }

    updateProfile(data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/profile`, data, { headers: this.getHeaders() });
    }

    // Intelligence: Calculate BMI
    calculateBMI(weight: number, heightCm: number): number {
        if (!weight || !heightCm) return 0;
        const heightM = heightCm / 100;
        return parseFloat((weight / (heightM * heightM)).toFixed(1));
    }
}
