import { Component } from '@angular/core';
import { Scanner } from '../../components/scanner/scanner';
import { HEX_ITEMS } from '../../data/hex';

@Component({
  selector: 'app-hex',
  imports: [Scanner],
  template: `
    <p class="sub">arcanes from The Hex</p>
    <app-scanner sessionKey="hex" [items]="items" [showRank]="true" />
  `,
  styles: `
    .sub {
      color: #888;
      margin-top: 0;
    }
  `,
})
export class Hex {
  protected readonly items = HEX_ITEMS;
}
