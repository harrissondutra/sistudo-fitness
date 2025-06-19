// src/app/core/interceptors/date-format.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DatePipe } from '@angular/common';

// Regex para detectar strings no formato DD/MM/YYYY
const DATE_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

// Função auxiliar para converter datas para o formato exato esperado pelo backend
const convertDatesToISO = (obj: any, datePipe: DatePipe): any => {
  if (!obj) return obj;

  // Se for um Date, converte para string ISO
  if (obj instanceof Date) {
    return datePipe.transform(obj, 'yyyy-MM-ddTHH:mm:ss');
  }

  // Se for uma string no formato DD/MM/YYYY, converte para ISO
  if (typeof obj === 'string' && DATE_REGEX.test(obj)) {
    // Converte DD/MM/YYYY para yyyy-MM-ddTHH:mm:ss
    const parts = obj.split('/');
    const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`;
    return isoDate;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertDatesToISO(item, datePipe));
  }

  if (typeof obj === 'object') {
    const result = { ...obj };
    Object.keys(obj).forEach(key => {
      const value = obj[key];

      if (value instanceof Date) {
        result[key] = datePipe.transform(value, 'yyyy-MM-ddTHH:mm:ss');
      } else if (typeof value === 'string' && DATE_REGEX.test(value)) {
        // Converte strings de data DD/MM/YYYY para ISO
        const parts = value.split('/');
        result[key] = `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`;
      } else if (value !== null && typeof value === 'object') {
        result[key] = convertDatesToISO(value, datePipe);
      }
    });
    return result;
  }

  return obj;
};

export const DateFormatInterceptor: HttpInterceptorFn = (req, next) => {
  const datePipe = inject(DatePipe);

  // Verifica se tem corpo e é método que envia dados
  if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    console.log('Corpo antes da transformação:', JSON.stringify(req.body));
    const processedBody = convertDatesToISO(req.body, datePipe);
    console.log('Corpo após transformação:', JSON.stringify(processedBody));
    const modifiedReq = req.clone({ body: processedBody });
    return next(modifiedReq);
  }

  return next(req);
};
