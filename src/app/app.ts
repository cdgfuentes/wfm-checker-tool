import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // new syndicate tab? add it here AND in app.routes.ts, dont forget!!
  protected readonly version = '0.1.0'; // idk if we need this??
  protected readonly tabs = [
    { path: '/augments', label: 'Augments' },
    { path: '/holdfast', label: 'Holdfast' },
    { path: '/cavia', label: 'Cavia' },
    { path: '/hex', label: 'The Hex' },
  ];
}
