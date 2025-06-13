import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) { }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/create`, user);
  }

  // Pequena correção: Usar 'number' (minúsculo) para o tipo primitivo
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/getById/${id}`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/listAll`);
  }

   updateUser(user: User): Observable<User> {
    // Note que o user.id é usado no path da URL aqui
    return this.http.put<User>(`${this.baseUrl}/update/${user.id}`, user);
  }

}
