import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

// Angular Material & Ionic imports for standalone component
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IonicModule } from '@ionic/angular';

// Import your Doctor interface and DoctorService
import { Doctor } from '../../models/doctor';
import { DoctorService } from '../../services/doctor/doctor.service';
import { MatSelectModule } from '@angular/material/select';
import { ClientService } from '../../services/client/client.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    IonicModule,
    MatSelectModule
  ],
  templateUrl: './doctor-create.component.html',
  styleUrl: './doctor-create.component.scss'
})
export class DoctorCreateComponent implements OnInit {
  doctorForm!: FormGroup;
  isLoading = false;
  clients: any[] = [];

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private clientService: ClientService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef // Injetar corretamente o ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadClients();
  }

  // Na função initializeForm, altere a definição do campo clientId:
initializeForm(): void {
  this.doctorForm = this.fb.group({
    name: ['', Validators.required],
    crm: ['', Validators.required],
    specialty: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    clientId: ['', Validators.required] // Alterado para campo obrigatório com string vazia como valor inicial
  });
}

  onSubmit(): void {
  if (this.doctorForm.valid) {
    this.isLoading = true;

    // Criar cópia dos dados do formulário
    const formValues = this.doctorForm.value;

    // Verificar explicitamente o clientId antes de enviar
    if (!formValues.clientId) {
      this.snackBar.open('É necessário selecionar um cliente.', 'Fechar', { duration: 3000 });
      this.isLoading = false;
      return;
    }

    // Garantir que clientId seja um número inteiro válido
    const clientId = parseInt(formValues.clientId);
    if (isNaN(clientId) || clientId <= 0) {
      this.snackBar.open('ID de cliente inválido.', 'Fechar', { duration: 3000 });
      this.isLoading = false;
      return;
    }

    // Criar objeto com clientId garantidamente válido
    const newDoctor = {
      name: formValues.name,
      crm: formValues.crm,
      specialty: formValues.specialty,
      email: formValues.email,
      phone: formValues.phone || '',
      clientId: clientId // Usar o valor já convertido e validado
    };

    console.log('Enviando médico com dados:', newDoctor); // Log para debugging

    this.doctorService.createDoctor(newDoctor).subscribe({
      // resto do código permanece igual
      next: () => {
        this.snackBar.open('Médico cadastrado com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/doctors']);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao cadastrar médico:', error);
        this.snackBar.open('Erro ao cadastrar médico. Tente novamente.', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  } else {
    // resto do código permanece igual
  }
}

  onCancel(): void {
    this.router.navigate(['/doctors']);
  }

  loadClients(): void {
    console.log('Iniciando carregamento de clientes');
    // Não defina isLoading como true aqui, pois isso desativará o formulário
    // enquanto carrega os clientes
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        console.log('Clientes recebidos:', data);
        this.clients = data;
        // Força a detecção de mudanças após atualizar os dados
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
        this.snackBar.open('Erro ao carregar a lista de clientes', 'Fechar', { duration: 3000 });
      },
      complete: () => {
        console.log('Carregamento de clientes concluído');
      }
    });
  }
}
