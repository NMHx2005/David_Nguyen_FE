import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalLoadingComponent } from './components/shared/GlobalLoading/global-loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalLoadingComponent],
  template: `
    <router-outlet></router-outlet>
    <app-global-loading></app-global-loading>
  `,
  styles: []
})
export class AppComponent {
  title = 'chat-system-frontend';
}
