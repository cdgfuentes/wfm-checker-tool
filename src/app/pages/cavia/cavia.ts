import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Scanner } from '../../components/scanner/scanner';
import { CAVIA_ITEMS, MELEE_ARCANE, NECRAMECH_MOD } from '../../data/cavia';

@Component({
  selector: 'app-cavia',
  imports: [FormsModule, Scanner],
  template: `
    <p class="sub">melee arcanes and Necramech mods from Cavia</p>
    <app-scanner sessionKey="cavia" [items]="items()" [showRank]="true">
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
      color: #888;
      margin-top: 0;
    }
  `,
})
export class Cavia {
  protected readonly types = [MELEE_ARCANE, NECRAMECH_MOD];
  protected readonly type = signal(MELEE_ARCANE);

  protected readonly items = computed(() => CAVIA_ITEMS.filter((i) => i.group === this.type()));
}
