import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Definição da interface User (coloque esta interface em um arquivo models/user.ts
// se você ainda não o fez, e importe-o no UserService)
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

  /**
   * Obtém todos os usuários do backend.
   * @returns Um Observable de um array de objetos User.
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Obtém um usuário específico pelo seu ID.
   * @param id O ID do usuário.
   * @returns Um Observable de um objeto User.
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cria um novo usuário no backend.
   * @param user O objeto User a ser criado.
   * @returns Um Observable do objeto User criado.
   */
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  /**
   * Atualiza um usuário existente pelo seu ID.
   * @param id O ID do usuário a ser atualizado.
   * @param user O objeto User com os dados atualizados.
   * @returns Um Observable do objeto User atualizado.
   */
  updateUser(id: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  /**
   * Deleta um usuário pelo seu ID.
   * @param id O ID do usuário a ser deletado.
   * @returns Um Observable void.
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
