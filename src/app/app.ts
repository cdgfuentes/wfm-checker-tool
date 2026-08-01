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
  protected readonly tabs = [
    { path: '/holdfast', label: 'Holdfast' },
    { path: '/hex', label: 'The Hex' },
  ];
}
