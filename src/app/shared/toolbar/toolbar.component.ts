import { Component, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenav } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-toolbar',
    imports: [
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule
    ],
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Input() sidenav!: MatSidenav;

  showSearchInput: boolean = false;
  searchControl = new FormControl('');

  constructor(private router: Router, private snackBar: MatSnackBar) { }

  toggleSidenav(): void {
    this.sidenav.toggle();
  }

  goToHome(): void {
    this.router.navigate(['/']); // Navega para a rota raiz
  }

  /**
   * Alterna a visibilidade do campo de pesquisa.
   * Não realiza a pesquisa imediatamente.
   */
  toggleSearchInput(): void {
    this.showSearchInput = !this.showSearchInput;
    // Se o campo de pesquisa estiver sendo escondido, limpa o valor
    if (!this.showSearchInput) {
      this.searchControl.setValue('');
    }
    // Opcional: Para focar no input quando ele aparece, precisaria de @ViewChild e AfterViewInit
  }

  /**
   * Realiza a pesquisa com base no termo digitado.
   * Chamado ao pressionar Enter no input ou clicar no ícone de lupa dentro do campo.
   */
  performSearch(): void {
    const searchTerm = this.searchControl.value;
    if (searchTerm && searchTerm.trim() !== '') {
      this.router.navigate(['/search-results'], { queryParams: { q: searchTerm.trim() } });
      this.snackBar.open(`Pesquisando por: "${searchTerm.trim()}"`, 'Fechar', { duration: 2000 });
      this.showSearchInput = false; // Esconde o campo após a pesquisa
      this.searchControl.setValue(''); // Limpa o campo
    } else {
      this.snackBar.open('Por favor, digite um termo de pesquisa.', 'Fechar', { duration: 3000 });
    }
  }
}
