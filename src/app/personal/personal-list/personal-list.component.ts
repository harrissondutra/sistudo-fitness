import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, map, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs'; // Importar 'of' para Observable.throw ou Observable.of

// Angular Material e Ionic Imports (Standalone)
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common'; // Necessário para ngIf, ngFor

// Importe a interface Personal e o serviço PersonalService
import { Personal } from '../../models/personal'; // Ajuste o caminho conforme a localização do seu modelo
import { PersonalService } from '../../services/personal/personal.service'; // Ajuste o caminho conforme a localização do seu serviço
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-personal-list',
  standalone: true, // Marque como standalone se for o caso
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    IonicModule,
    NgxMaskDirective,  // Adicione o diretivo
    NgxMaskPipe
  ],

  providers: [
    provideNgxMask()  // Use provideNgxMask() em vez de MaskModule.forRoot()
  ],
  templateUrl: './personal-list.component.html',
  styleUrl: './personal-list.component.scss'
})
export class PersonalListComponent implements OnInit {
  personalList$!: Observable<Personal[]>; // Observable para a lista filtrada de personal
  isLoadingResults = true; // Indica se os resultados estão sendo carregados
  searchControl = new FormControl(''); // Controle para o campo de busca

  private allPersonalSubject = new BehaviorSubject<Personal[]>([]); // Armazena todos os personal carregados
  private loadingSubject = new BehaviorSubject<boolean>(true); // Gerencia o estado de carregamento
  isLoading$ = this.loadingSubject.asObservable(); // Observable para o template

  constructor(
    private personalService: PersonalService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadPersonal(); // Carrega os profissionais ao iniciar o componente

    // Combina o campo de busca com a lista completa para fazer a filtragem
    this.personalList$ = combineLatest([
      this.allPersonalSubject.asObservable(),
      this.searchControl.valueChanges.pipe(
        startWith(''), // Emite um valor inicial vazio para carregar todos os profissionais
        debounceTime(300), // Espera 300ms após a digitação
        distinctUntilChanged() // Só emite se o valor for diferente do anterior
      )
    ]).pipe(
      map(([personals, searchTerm]) => {
        const lowerCaseSearchTerm = searchTerm?.toLowerCase() || '';
        return personals.filter(personal =>
          personal.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          personal.specialty.toLowerCase().includes(lowerCaseSearchTerm) ||
          personal.registry.toLowerCase().includes(lowerCaseSearchTerm) ||
          personal.email.toLowerCase().includes(lowerCaseSearchTerm)
        );
      })
    );
  }

  /**
   * Carrega todos os profissionais do serviço.
   */
  loadPersonal(): void {
    this.loadingSubject.next(true); // Inicia o estado de carregamento
    this.personalService.getAllPersonal().pipe(
      catchError(error => {
        console.error('Erro ao carregar profissionais:', error);
        this.snackBar.open('Erro ao carregar lista de profissionais. Tente novamente.', 'Fechar', { duration: 3000 });
        return of([]); // Retorna um Observable de array vazio em caso de erro
      }),
      finalize(() => this.loadingSubject.next(false)) // Finaliza o carregamento, independentemente do sucesso/erro
    ).subscribe(personals => {
      this.allPersonalSubject.next(personals); // Atualiza a lista completa de profissionais
    });
  }

  /**
   * Navega para a tela de criação de um novo profissional.
   */
  addNewPersonal(): void {
    this.router.navigate(['/personal-create']); // Rota para criar novo profissional
  }

  /**
 * Navega para a tela de visualização detalhada de um profissional.
 * @param id O ID do profissional a ser visualizado.
 */
  viewPersonal(id: number | undefined): void {
    if (id !== undefined) {
      this.router.navigate(['/personal-view', id]); // Rota para visualizar detalhes do personal
    } else {
      this.snackBar.open('ID do profissional não encontrado.', 'Fechar', { duration: 3000 });
    }
  }

  /**
   * Navega para a tela de edição de um profissional específico.
   * @param id O ID do profissional a ser editado.
   */
  editPersonal(id: number | undefined): void {
    if (id !== undefined) {
      this.router.navigate(['/personal-update', id]); // Rota para editar profissional
    } else {
      this.snackBar.open('ID do profissional não encontrado para edição.', 'Fechar', { duration: 3000 });
    }
  }

  /**
   * Confirma e exclui um profissional.
   * @param id O ID do profissional a ser excluído.
   */
  deletePersonal(id: number | undefined): void {
    if (id === undefined) {
      this.snackBar.open('ID do profissional não encontrado para exclusão.', 'Fechar', { duration: 3000 });
      return;
    }

    if (confirm('Tem certeza que deseja excluir este profissional?')) {
      this.isLoadingResults = true; // Ativa o spinner de carregamento específico da exclusão
      this.personalService.deletePersonal(id).pipe(
        catchError(error => {
          console.error('Erro ao excluir profissional:', error);
          this.snackBar.open('Erro ao excluir profissional. Tente novamente.', 'Fechar', { duration: 3000 });
          return of(null); // Retorna um Observable de null para não quebrar a subscription
        }),
        finalize(() => this.isLoadingResults = false) // Desativa o spinner
      ).subscribe(response => {
        if (response !== null) { // Verifica se não houve erro anterior
          this.snackBar.open('Profissional excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.loadPersonal(); // Recarrega a lista após a exclusão
        }
      });
    }
  }
}
