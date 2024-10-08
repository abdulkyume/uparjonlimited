import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';

export function ErrorInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) {
  const authService = inject(AuthService);
  return next(request).pipe(
    catchError((error: any) => {
      if (error.status === 401 || error.status === 403) {
        authService.logout();
      }
      return throwError(() => error.error.message || error.statusText);
    })
  );
}
