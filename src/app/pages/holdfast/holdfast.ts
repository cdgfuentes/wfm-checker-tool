import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Scanner } from '../../components/scanner/scanner';
import { HOLDFAST_ITEMS } from '../../data/holdfast';
import { ARCANE, WEAPON } from '../../models/item.model';

@Component({
  selector: 'app-holdfast',
  imports: [FormsModule, Scanner],
  template: `
    <p class="sub">arcanes and weapon blueprints from the Holdfasts</p>
    <app-scanner sessionKey="holdfast" [items]="items()" [showRank]="type() === arcane">
      <label class="field">
        Type
        <select [ngModel]="type()" (ngModelChange)="type.set($event)">
          @for (t of types; track t) {
            <option [value]="t">{{ t }}</option>
          }
        </select>
      </label>
    </app-scanner>
  `,
  styles: `
    .sub {
      color: #666;
      margin-top: 0;
    }
  `,
})
export class Holdfast {
  protected readonly arcane = ARCANE;
  protected readonly types = [ARCANE, WEAPON];
  protected readonly type = signal(ARCANE);

  protected readonly items = computed(() => HOLDFAST_ITEMS.filter((i) => i.group === this.type()));
}
