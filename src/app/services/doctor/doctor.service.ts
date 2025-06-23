import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
   private baseUrl = `${environment.apiUrl}/clients`;

   constructor(private http: HttpClient) { }

   getAllDoctors() {
     return this.http.get<any[]>(`${this.baseUrl}/listAll`);
   }

    getDoctorById(id: string) {
      return this.http.get<any>(`${this.baseUrl}/getById/${id}`);
    }

    createDoctor(doctor: any) {
      return this.http.post<any>(`${this.baseUrl}/create`, doctor);
    }
    updateDoctor(doctor: any) {
      return this.http.put<any>(`${this.baseUrl}/update/${doctor.id}`, doctor);
    }
    deleteDoctor(id: string) {
      return this.http.delete<any>(`${this.baseUrl}/delete/${id}`);
    }

    getDoctorByClientId(clientId: number) {
      return this.http.get<any[]>(`${this.baseUrl}/getDoctorByClientId/${clientId}`);
    }

}
