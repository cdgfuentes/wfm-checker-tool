# wfm-checker-tool

small angular app i made so I can turn syndicate standing into plat. it checks warframe.market for people buying the stuff syndicates sell, then gives you the whisper to copy paste in game.

## what it does

- one tab per syndicate (Augments, Holdfast, Cavia, The Hex)
- **best sellers**: what sold for the most in the last 48h
- **scan**: finds buyers that are online or in game
- **suggested min plat** so you dont start from zero
- **whisper lines**, one per buyer, with a copy button

## how it works (quick overview)

1. open a tab. it grabs recent sales for that tab's items, thats the best sellers table and the suggested min plat
2. hit scan. it asks warframe.market for the top buyers of every item, one request every 350ms (the api only allows 3 a sec)
3. buyers that are online or in game and offer at least your min plat show up, best offer first
4. every buyer gets one whisper with all their items in it. hit copy, paste it in game, done
5. results stay when you switch tabs so no need to wait again

why the `/api` ? warframe.market doesnt allow browsers to call it directly (no cors). so the app calls `/api/...` and a tiny proxy forwards it. in dev thats `proxy.conf.json`, live its `functions/api/[[path]].ts` (a Cloudflare Pages function). it only lets 2 routes through (order lookup and sales stats) and caches the replies for a bit.

## run it

```
npm install --legacy-peer-deps
npm start        # http://localhost:4200
npm test
```

- needs Node 22.12 or newer
- `--legacy-peer-deps` cause plain `npm install` crashed on my machine (some npm `edgesOut` bug)

## put it online (cloudflare pages)

- build command: `npm run build`
- output folder: `dist/wfm-checker/browser`
- node version: `.node-version` says 22. if the build still picks an old one, add `NODE_VERSION=22` in the pages settings
- the `functions/` folder gets picked up on its own

## adding a new tab

1. put its items in `src/app/data/<name>.ts` (name, slug, group). slugs are in the warframe.market item urls
2. copy a page from `src/app/pages/` (`hex` is the simplest one)
3. add the route in `src/app/app.routes.ts` and the tab in `src/app/app.ts`

## folders structreu

```
src/app
  components/scanner   the scan ui every tab shares
  data                 item lists per syndicate
  models               types
  pages                one small page per tab
  services             api calls + per tab scan / price state
functions/api          the live proxy
```

## notes

- the best sellers table uses the old **v1** api for sales stats. warframe.market says v1 is deprecated, so that part might just stop working one day (scanning uses v2, that one is fine)
- item lists are hand picked from the wiki. if a syndicate changes its stock, update `data/`

## credits

this app is only possible because of these, tttthank you!!

| what                  | who                 | link                                            | used for                                      |
| --------------------- | ------------------- | ----------------------------------------------- | --------------------------------------------- |
| market data           | warframe.market     | https://warframe.market                         | buyer orders (v2) and sales stats (v1)        |
| api docs              | warframe.market     | https://docs.warframe.market/docs/api/overview/ | how the api works, the 3 requests a sec limit |
| what syndicates sell  | Warframe Wiki       | https://wiki.warframe.com                       | the item lists in `data/`                     |
| augment and mod names | WFCD warframe-items | https://github.com/WFCD/warframe-items          | the augment list                              |
| the game              | Digital Extremes    | https://www.warframe.com                        | Warframe itself                               |
| framework             | Angular             | https://angular.dev                             | the whole app                                 |
| hosting               | Cloudflare Pages    | https://pages.cloudflare.com                    | hosting + the proxy function                  |

am not affiliated with or endorsed by warframe.market or DE
Warframe and everything in it belongs to Digital Extremes
