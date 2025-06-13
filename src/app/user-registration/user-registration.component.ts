import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../services/user/user.service';
import { User } from '../models/user';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Importar os módulos do Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Importe MatSnackBar e MatSnackBarModule

// Importar NgxMaskDirective
import { NgxMaskDirective } from 'ngx-mask';


@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule, // Adicionar MatSnackBarModule
    NgxMaskDirective
  ],
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent implements OnInit {
  userForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar // Injetar MatSnackBar
  ) { }

  ngOnInit(): void {
    // Inicializa o formulário com seus controles e validadores
    this.initializeForm();
  }

  /**
   * Inicializa o FormGroup com todos os controles e validadores.
   * Método separado para ser reutilizado na redefinição do formulário.
   */
  private initializeForm(): void {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      weight: [null, [Validators.required, Validators.min(30), Validators.max(300)]],
      // Altura agora em centímetros: min 50cm, max 300cm (que é 3 metros)
      height: [null, [Validators.required, Validators.min(50), Validators.max(300)]]
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formData = this.userForm.value;

      // Cria um novo objeto User com os dados formatados
      const newUser: User = {
        ...formData,
        // Limpa o CPF, removendo todos os caracteres não-dígitos
        cpf: formData.cpf ? String(formData.cpf).replace(/\D/g, '') : '',
        // Limpa peso e altura, substituindo vírgulas por pontos para o formato Double esperado
        weight: formData.weight ? parseFloat(String(formData.weight).replace(',', '.')) : null,
        // Converte altura de centímetros para metros antes de enviar ao backend
        height: formData.height ? parseFloat(String(formData.height).replace(',', '.')) / 100 : null,
      };

      this.userService.createUser(newUser).subscribe({
        next: (response) => {
          console.log('Usuário cadastrado com sucesso!', response);
          this.snackBar.open('Usuário cadastrado com sucesso!', 'Fechar', { duration: 3000 }); // Substitui alert()
          // Em vez de apenas reset(), reinicializa o formulário para um estado limpo
          this.initializeForm();
          // Redireciona se a rota existir, senão remova esta linha ou ajuste para a rota desejada
          // this.router.navigate(['/users']);
        },
        error: (error) => {
          console.error('Erro ao cadastrar usuário:', error);
          this.snackBar.open('Erro ao cadastrar usuário. Verifique o console para mais detalhes.', 'Fechar', { duration: 5000 }); // Substitui alert()
        }
      });
    } else {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios corretamente.', 'Fechar', { duration: 3000 }); // Substitui alert()
      // Marca todos os controles como tocados para exibir mensagens de erro
      this.userForm.markAllAsTouched();
    }
  }
}
