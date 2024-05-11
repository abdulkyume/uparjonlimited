import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { timeout } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';

export function JwtInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) {
  const router = inject(Router);
  if (router.url !== '/public/faq') {
    const authService = inject(AuthService);

    let localdata = localStorage.getItem('expires');
    let expires = new Date(localStorage.getItem('expires')!).getTime() - 10000;
    let today = new Date().getTime();

    if (localdata) {
      if (expires <= today) {
        authService.logout();
      }
    }

    const currentUser = authService.currentUserValue;
    if (currentUser && currentUser.refreshToken) {
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + currentUser.refreshToken,
        },
      });
    }
    return next(request).pipe(timeout(60000));
  }

  return next(request).pipe(timeout(60000));
}
