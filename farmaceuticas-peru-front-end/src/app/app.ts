import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
  ],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [` 
    :host {
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
        Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji",
        "Segoe UI Emoji", "Segoe UI Symbol";
    }
  `]
})
export class App {
  authService = inject(AuthService);
}