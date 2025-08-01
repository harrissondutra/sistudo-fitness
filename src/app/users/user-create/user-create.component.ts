import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { USER_ROLE_OPTIONS } from '../../models/user_role';


export enum UserRole {
  ROLE_ADMIN = 'Administrador',
  ROLE_CLIENT = 'Cliente',
  ROLE_DOCTOR = 'Médico',
  ROLE_PERSONAL = 'Personal Trainer',
  ROLE_GYM = 'Administrador de Academia',
  ROLE_NUTRITIONIST = 'Nutricionista'
}

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    RouterModule
  ],
  providers: [UserService],
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss']
})
export class UserCreateComponent {
  userForm: FormGroup;
  isLoading = false;
  roles = USER_ROLE_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.snackBar.open('Preencha todos os campos obrigatórios corretamente.', 'Fechar', { duration: 3000 });
      return;
    }
    this.isLoading = true;
    const userToSend = { ...this.userForm.value, role: this.userForm.value.role.replace('ROLE_', '') };
    this.userService.createUser(userToSend).subscribe({
      next: () => {
        this.snackBar.open('Usuário cadastrado com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/user-list']);
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Erro ao cadastrar usuário.', 'Fechar', { duration: 4000 });
        this.isLoading = false;
      }
    });
  }
}
