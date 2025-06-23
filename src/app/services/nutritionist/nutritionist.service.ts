import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NutritionistService {

  private baseUrl = `${environment.apiUrl}/nutritionists`;

  constructor(private http: HttpClient) { }

  getAllNutritionists() {
    return this.http.get<any[]>(`${this.baseUrl}/listAll`);
  }

  getNutritionistById(id: string) {
    return this.http.get<any>(`${this.baseUrl}/getById/${id}`);
  }
  createNutritionist(nutritionist: any) {
    return this.http.post<any>(`${this.baseUrl}/create`, nutritionist);
  }
  updateNutritionist(nutritionist: any) {
    return this.http.put<any>(`${this.baseUrl}/update/${nutritionist.id}`, nutritionist);
  }
  deleteNutritionist(id: string) {
    return this.http.delete<any>(`${this.baseUrl}/delete/${id}`);
  }
  getNutritionistByClientId(clientId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/getNutritionistByClientId/${clientId}`);
  }
}
