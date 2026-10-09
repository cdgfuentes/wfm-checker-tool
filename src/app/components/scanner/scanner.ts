import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Hit, TradeItem } from '../../models/item.model';
import { MarketService } from '../../services/market.service';

// the scan ui every tab uses (i think?). each tab hands in its items + extra filters, ez
// todo: split the table and whispers into their own components??? unya hmm..?
@Component({
  selector: 'app-scanner',
  imports: [FormsModule],
  templateUrl: './scanner.html',
  styleUrl: './scanner.css',
})
export class Scanner {
  // key for this tab's session so results stay when you switch tabs
  readonly sessionKey = input.required<string>();
  readonly items = input.required<TradeItem[]>();
  // only arcanes need the rank filter (I THINK?) fr fr
  readonly showRank = input(false);
  // augments 'All' is 220 items, too many to price on load
  readonly loadStats = input(true);

  private readonly market = inject(MarketService);
  protected readonly session = computed(() => this.market.session(this.sessionKey()));
  protected readonly stats = computed(() => this.market.stats(this.sessionKey()));
  protected readonly copied = signal<string | null>(null);
  protected readonly copyFailed = signal<string | null>(null);
  // protected readonly sortBy = signal<SortBy>('plat'); // sort dropdown?? someday

  // walay point showing a rank col if nobody wants a rank lol
  protected readonly hasRank = computed(() =>
    this.session()
      .hits()
      .some((h) => h.rank),
  );

  // one whisper per buyer, all their stuff in one line
  protected readonly whispers = computed(() => {
    const byBuyer = new Map<string, Hit[]>();
    for (const h of this.session().sortedHits()) {
      byBuyer.set(h.buyer, [...(byBuyer.get(h.buyer) ?? []), h]);
    }
    return [...byBuyer].map(([buyer, hits]) => {
      const names = hits.map((h) => `${h.name}${this.rankNote(h)}`).join(', ');
      const prices = hits.map((h) => `${h.platinum}p`).join(', ');
      const respectively = hits.length > 1 ? ' respectively' : '';
      return `/w ${buyer} Hi! I have ${names} for sale for ${prices}${respectively} (warframe.market)`;
    });
  });

  // temporary removed.. unstable and needs more work. so WIP
  // // follows the rank filter, unranked sells for way less so the suggestion drops too
  // protected readonly suggestedMin = computed(() =>
  //   this.loadStats()
  //     ? this.stats().suggestedMin(this.showRank() && this.session().rank() === 'unranked')
  //     : null,
  // );

  protected readonly topHasUnranked = computed(() =>
    this.stats()
      .top()
      .some((r) => r.unrankedPrice !== null),
  );

  constructor() {
    // price the items when the tab opens or the items change (wont refetch what we already have)
    effect(() => {
      const items = this.items();
      if (this.loadStats()) untracked(() => this.stats().load(items));
      else untracked(() => this.stats().cancel());
    });
  }

  protected refreshStats(): void {
    this.stats().load(this.items(), true);
  }

  private rankNote(hit: Hit): string {
    return hit.rank ? ` (rank ${hit.rank})` : '';
  }

  protected scan(): void {
    // filter is hidden for non arcanes so reset it, otherwise an old pick sticks around
    if (!this.showRank()) this.session().rank.set('any');
    this.session().scan(this.items());
  }

  // todo: button to copy every whisper at once?? maybe?
  protected async copy(line: string): Promise<void> {
    let ok = true;
    try {
      await navigator.clipboard.writeText(line);
    } catch {
      // clipboard needs https (or localhost) + permission, so try the old way
      ok = this.copyTheOldWay(line);
    }
    const flag = ok ? this.copied : this.copyFailed;
    flag.set(line);
    setTimeout(() => flag() === line && flag.set(null), 1500);
  }

  private copyTheOldWay(text: string): boolean {
    const box = document.createElement('textarea');
    box.value = text;
    box.style.position = 'fixed';
    box.style.opacity = '0';
    document.body.appendChild(box);
    box.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      box.remove();
    }
  }
}
