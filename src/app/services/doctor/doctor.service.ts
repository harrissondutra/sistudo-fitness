import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Client } from '../../models/client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private baseUrl = `${environment.apiUrl}/doctors`;

  constructor(private http: HttpClient) { }

  getAllDoctors() {
    return this.http.get<any[]>(`${this.baseUrl}/list`);
  }

  getDoctorById(id: string) {
    return this.http.get<any>(`${this.baseUrl}/getDoctorById/${id}`);
  }

  createDoctor(doctor: any) {
    return this.http.post<any>(`${this.baseUrl}/createDoctor`, doctor);
  }
  updateDoctor(doctor: any) {
    return this.http.put<any>(`${this.baseUrl}/update/${doctor.id}`, doctor);
  }
  deleteDoctor(id: string) {
    return this.http.delete<any>(`${this.baseUrl}/delete/${id}`);
  }

  getDoctorByClientId(clientId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/getByClientId/${clientId}`);
  }

  associateDoctorToClient(clientId: number, doctorIds: number[]): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}/associateDoctor/${clientId}`, doctorIds);
  }

}
