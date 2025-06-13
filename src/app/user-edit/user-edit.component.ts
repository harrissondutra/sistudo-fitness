import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Para mensagens de feedback
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Para o spinner de carregamento

import { UserService } from '../services/user/user.service'; // Ajuste o caminho
import { User } from '../models/user'; // Ajuste o caminho
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { NgxMaskDirective } from 'ngx-mask'; // Para máscaras


@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    NgxMaskDirective
  ],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit {
  userId: number | null = null;
  userForm!: FormGroup;
  isLoading: boolean = true; // Para controlar o estado de carregamento

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute, // Para obter parâmetros da rota
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar // Para exibir mensagens ao usuário
  ) { }

  ngOnInit(): void {
    this.initializeForm(); // Inicializa a estrutura do formulário reativo
    this.loadUserData();   // Carrega os dados do usuário para preencher o formulário
  }

  /**
   * Inicializa o FormGroup com os controles e validadores.
   * Define os validadores de acordo com as regras de negócio para cada campo.
   */
  private initializeForm(): void {
    this.userForm = this.fb.group({
      id: [null], // O ID é mantido no formulário, mas geralmente não é editável pelo usuário
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      // Validação de CPF: 11 dígitos numéricos
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      // Peso em kg: entre 30 e 300
      weight: [null, [Validators.required, Validators.min(30), Validators.max(300)]],
      // Altura em centímetros: entre 50 e 300 cm (para representar 0.5m a 3.0m)
      height: [null, [Validators.required, Validators.min(50), Validators.max(300)]]
    });
  }

  /**
   * Carrega os dados do usuário com base no ID extraído da URL da rota.
   * Utiliza operadores RxJS para encadear a obtenção do ID e a chamada ao serviço.
   */
  private loadUserData(): void {
    this.isLoading = true; // Inicia o estado de carregamento
    this.route.paramMap.pipe(
      // Filtra para garantir que o parâmetro 'id' exista na rota
      filter(params => params.has('id')),
      // Mapeia o parâmetro 'id' para um número
      map(params => Number(params.get('id'))),
      // Armazena o ID do usuário para uso posterior (ex: no onSubmit)
      tap(id => this.userId = id),
      // Usa switchMap para trocar o Observable do ID pelo Observable da requisição do usuário
      switchMap(id => this.userService.getUserById(id).pipe(
        // Captura erros da requisição de busca do usuário
        catchError(error => {
          console.error('Erro ao buscar usuário:', error);
          this.snackBar.open('Erro ao carregar os dados do usuário. Tente novamente.', 'Fechar', { duration: 5000 });
          this.router.navigate(['/users-list']); // Redireciona para a lista em caso de erro
          return of(null); // Retorna um Observable de null para continuar a cadeia sem erro
        })
      ))
    ).subscribe(user => {
      if (user) {
        // Popula o formulário com os dados do usuário recebidos do backend.
        // O CPF deve ser formatado APENAS com números para o patchValue para que a validação funcione
        // e a máscara então o formatará para exibição.
        const cpfFormattedForPatch = user.cpf ? user.cpf.replace(/\D/g, '') : null;

        // Log adicional para verificar o CPF antes do patchValue
        console.log("CPF do usuário (original):", user.cpf);
        console.log("CPF formatado para patchValue (apenas dígitos):", cpfFormattedForPatch);


        this.userForm.patchValue({
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: cpfFormattedForPatch, // Garante que o CPF seja apenas números para o FormControl
          weight: user.weight,
          height: user.height != null ? user.height * 100 : null
        });

        // Força a revalidação e marca os campos como tocados após carregar os dados
        this.userForm.markAllAsTouched();
        this.userForm.updateValueAndValidity();


        // Adicionados logs para depuração
        console.log("Dados do usuário recebidos do backend:", user);
        console.log("Valores do formulário após patchValue:", this.userForm.value);
        console.log("Status do formulário após patchValue (depois de forçar validação):", this.userForm.status);
        console.log("Erros do formulário (se houver):", this.userForm.errors);

        // Logs detalhados para cada controle
        Object.keys(this.userForm.controls).forEach(key => {
          const control = this.userForm.get(key);
          if (control) {
            console.log(`Controle '${key}': Status=${control.status}, Valor=${control.value}, Erros=${JSON.stringify(control.errors)}`);
          }
        });

      }
      this.isLoading = false;
    });
  }

  /**
   * Lida com a submissão do formulário para atualizar os dados do usuário.
   * Formata os dados (CPF, peso, altura) antes de enviá-los ao backend.
   */
  onSubmit(): void {
    if (this.userForm.valid) {
      const formData = this.userForm.value;

      // Prepara o objeto User para envio ao backend, aplicando formatações.
      const updatedUser: User = {
        id: this.userId || formData.id,
        name: formData.name,
        email: formData.email,
        // Remove caracteres não-dígitos do CPF
        cpf: formData.cpf ? String(formData.cpf).replace(/\D/g, '') : '',
        // Substitui vírgulas por pontos no peso e converte para número
        weight: formData.weight ? parseFloat(String(formData.weight).replace(',', '.')) : null,
        // Converte altura de centímetros para metros e substitui vírgulas por pontos
        height: formData.height ? parseFloat(String(formData.height).replace(',', '.')) / 100 : null,
      };

      this.userService.updateUser(updatedUser).subscribe({
        next: (response) => {
          this.snackBar.open('Usuário atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/users-list']);
        },
        error: (error) => {
          console.error('Erro ao atualizar usuário:', error);
          this.snackBar.open('Erro ao atualizar usuário. Verifique o console para mais detalhes.', 'Fechar', { duration: 5000 });
        }
      });
    } else {
      this.snackBar.open('Por favor, preencha todos os campos corretamente.', 'Fechar', { duration: 3000 });
      this.userForm.markAllAsTouched();
    }
  }

  /**
   * Cancela a edição e retorna à lista de usuários sem salvar.
   */
  cancel(): void {
    this.router.navigate(['/users-list']);
  }
}
