// src/app/core/interceptors/date-format.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DatePipe } from '@angular/common';

// Função auxiliar para converter datas para ISO
const convertDatesToISO = (obj: any, datePipe: DatePipe): any => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return datePipe.transform(obj, 'yyyy-MM-ddTHH:mm:ss');
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertDatesToISO(item, datePipe));
  }

  const result = { ...obj };
  Object.keys(obj).forEach(key => {
    const value = obj[key];

    if (value instanceof Date) {
      result[key] = datePipe.transform(value, 'yyyy-MM-ddTHH:mm:ss');
    } else if (value !== null && typeof value === 'object') {
      result[key] = convertDatesToISO(value, datePipe);
    }
  });

  return result;
};

// Interceptor funcional (novo estilo Angular)
export const DateFormatInterceptor: HttpInterceptorFn = (req, next) => {
  const datePipe = inject(DatePipe);

  // Somente processa requisições com corpo (POST, PUT, PATCH)
  if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const processedBody = convertDatesToISO(req.body, datePipe);
    const modifiedReq = req.clone({ body: processedBody });
    return next(modifiedReq);
  }

  return next(req);
};
