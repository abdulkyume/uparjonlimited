import { Injectable } from '@angular/core';

declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {

  constructor() { }

  public async init(): Promise<void> {
    const response = await fetch('assets/config/api.json');
    const config = await response.json();
    window.config = config;
  }
}
