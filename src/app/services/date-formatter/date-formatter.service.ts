// src/app/services/date-formatter.service.ts
import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root' // Torna disponível em toda a aplicação
})
export class DateFormatterService {
  constructor(private datePipe: DatePipe) {}

  formatDate(date: Date | string | null, format: string = 'yyyy-MM-ddTHH:mm:ss'): string | null {
    return this.datePipe.transform(date, format);
  }
}
