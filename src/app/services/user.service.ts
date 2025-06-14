import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  height?: number;
  weight?: number;
  goal?: string;
  // Medidas
  ombro?: number;
  peitoral?: number;
  cintura?: number;
  quadril?: number;
  abdomem?: number;
  torax?: number;
  bracoDireito?: number;
  bracoEsquerdo?: number;
  coxaDireita?: number;
  coxaEsquerda?: number;
  panturrilhaDireita?: number;
  panturrilhaEsquerda?: number;
  abdominal?: number;
  suprailiaca?: number;
  subescapular?: number;
  triceps?: number;
  axilar?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 