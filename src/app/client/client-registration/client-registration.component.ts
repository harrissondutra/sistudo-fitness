import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClientService } from '../../services/client/client.service'; // Use ClientService
import { Client } from '../../models/client'; // Use Client model
import { Router } from '@angular/router';
import { Location, CommonModule } from '@angular/common'; // Import CommonModule as well if not already done

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

// NgxMaskDirective
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-client-registration', // Renamed selector
  standalone: true, // Mark as standalone
  imports: [
    CommonModule, // Added CommonModule for directives like ngIf, ngFor etc.
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCardModule,
    MatIconModule,
    NgxMaskDirective
  ],
  templateUrl: './client-registration.component.html', // Renamed template file
  styleUrls: ['./client-registration.component.scss'] // Renamed stylesheet file
})
export class ClientRegistrationComponent implements OnInit { // Renamed class
  clientForm!: FormGroup; // Renamed form group

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService, // Injected ClientService
    private router: Router,
    private snackBar: MatSnackBar,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initializes the FormGroup with all controls and validators.
   * Method separated for reuse in form reset.
   */
  private initializeForm(): void {
    this.clientForm = this.fb.group({ // Uses clientForm
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]], // CPF should be 11 digits after mask
      weight: [null, [Validators.required, Validators.min(30), Validators.max(300)]],
      height: [null, [Validators.required, Validators.min(50), Validators.max(300)]] // Height in centimeters
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid) { // Uses clientForm
      const formData = this.clientForm.value; // Uses clientForm

      // Create a new Client object with formatted data
      const newClient: Client = { // Changed to Client type
        ...formData,
        // Clean CPF, removing all non-digit characters
        cpf: formData.cpf ? String(formData.cpf).replace(/\D/g, '') : '',
        // Weight and height are numbers, direct assignment should work if input type is 'number'.
        // If input is text and uses comma, parseFloat(String(value).replace(',', '.')) is correct.
        // Assuming your backend expects weight in kg and height in cm based on form validators.
        // The previous code had `height: parseFloat(String(formData.height).replace(',', '.')) / 100` which
        // implies the backend expects meters. Let's stick to the current backend expectation.
        // If the backend expects CM, remove the / 100. Let's assume CM from the validator max(300).
        weight: formData.weight ? parseFloat(String(formData.weight).replace(',', '.')) : null,
        height: formData.height ? parseFloat(String(formData.height).replace(',', '.')) : null,
      };

      this.clientService.createClient(newClient).subscribe({ // Uses clientService.createClient
        next: (response) => {
          console.log('Cliente cadastrado com sucesso!', response);
          this.snackBar.open('Cliente cadastrado com sucesso!', 'Fechar', { duration: 3000 });
          this.initializeForm(); // Re-initialize the form to a clean state
          this.router.navigate(['/clients']); // Redirect to clients list after successful registration
        },
        error: (error) => {
          console.error('Erro ao cadastrar Cliente:', error);
          this.snackBar.open('Erro ao cadastrar Cliente. Verifique o console para mais detalhes.', 'Fechar', { duration: 5000 });
        }
      });
    } else {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios corretamente.', 'Fechar', { duration: 3000 });
      this.clientForm.markAllAsTouched(); // Uses clientForm
    }
  }

  goBack(): void {
    this.location.back();
  }
}
