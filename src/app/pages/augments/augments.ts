import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Scanner } from '../../components/scanner/scanner';
import { AUGMENTS } from '../../data/augments';
import { SYNDICATE_NAMES, Syndicate } from '../../models/item.model';

@Component({
  selector: 'app-augments',
  imports: [FormsModule, Scanner],
  template: `
    <p class="sub">
      augments you can buy with syndicate standing. pick a syndicate or just scan all of them
    </p>
    <app-scanner sessionKey="augments" [items]="items()" [loadStats]="syndicate() !== 'all'">
      <label class="field">
        Syndicate
        <select [ngModel]="syndicate()" (ngModelChange)="syndicate.set($event)">
          <option value="all">All syndicates</option>
          @for (s of syndicateOptions; track s[0]) {
            <option [value]="s[0]">{{ s[1] }}</option>
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
export class Augments {
  protected readonly syndicateOptions = Object.entries(SYNDICATE_NAMES) as [Syndicate, string][];
  protected readonly syndicate = signal<Syndicate | 'all'>('all');

  protected readonly items = computed(() => {
    const s = this.syndicate();
    return s === 'all' ? AUGMENTS : AUGMENTS.filter((a) => a.syndicates.includes(s));
  });
}
