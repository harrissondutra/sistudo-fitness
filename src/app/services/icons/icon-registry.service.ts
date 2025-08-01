import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class IconRegistryService {

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {}

  registerCustomIcons(): void {
    // Registrar ícones personalizados
    this.registerIcon('stethoscope', 'assets/icons/stethoscope.svg');
    this.registerIcon('body_system', 'assets/icons/body-system.svg');
    this.registerIcon('body_fat', 'assets/icons/body-fat.svg');
    this.registerIcon('exercise', 'assets/icons/exercise.svg');
  }

  private registerIcon(name: string, path: string): void {
    this.matIconRegistry.addSvgIcon(
      name,
      this.domSanitizer.bypassSecurityTrustResourceUrl(path)
    );
  }
}
