import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { ApiConfigService } from './core/service/api-config.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { JwtInterceptor } from './core/interceptor/jwt.interceptor';
import { ErrorInterceptor } from './core/interceptor/error.interceptor';

export function init_app(appLoadService: ApiConfigService) {
  return () => appLoadService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([JwtInterceptor, ErrorInterceptor])),
    ApiConfigService,
    {
        provide: APP_INITIALIZER,
        useFactory: init_app,
        deps: [ApiConfigService],
        multi: true,
    },
    provideAnimations()
]
};
