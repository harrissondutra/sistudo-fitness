import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BioimpedanciaService } from '../../../../services/bioimpedancia/bioimpedancia.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bioimpedancia-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bioimpedancia-view.component.html',
  styleUrl: './bioimpedancia-view.component.scss'
})
export class BioimpedanciaViewComponent implements OnInit {
  bioimpedancias: any[] = [];
  editingIndex: number | null = null;
  edited: any = {};

  constructor(
    private bioimpedanciaService: BioimpedanciaService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const clientIdStr = this.route.snapshot.paramMap.get('id');
    const clientId = clientIdStr ? Number(clientIdStr) : null;
    if (clientId !== null && !isNaN(clientId)) {
      this.bioimpedanciaService.getByClientId(clientId).subscribe((data: any[]) => {
        this.bioimpedancias = (data || []).map(b => ({
          ...b,
          // Converte dataMedicao array para string
          dataMedicaoStr: b.dataMedicao ? this.arrayToDateString(b.dataMedicao) : ''
        }));
      });
    }
  }

  arrayToDateString(arr: number[]): string {
    if (!arr || arr.length < 3) return '';
    // yyyy, mm, dd, hh, min
    const [y, m, d, h = 0, min = 0] = arr;
    return `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y} ${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
  }

  startEdit(index: number) {
    this.editingIndex = index;
    this.edited = { ...this.bioimpedancias[index] };
  }

  cancelEdit() {
    this.editingIndex = null;
    this.edited = {};
  }

  saveEdit(index: number) {
    // Aqui você pode chamar o service para atualizar no backend
    this.bioimpedanciaService.update(this.edited.id, this.edited).subscribe(resp => {
      this.bioimpedancias[index] = {
        ...resp,
        dataMedicaoStr: Array.isArray(resp.dataMedicao) ? this.arrayToDateString(resp.dataMedicao) : ''
      };
      this.cancelEdit();
    });
  }
}
