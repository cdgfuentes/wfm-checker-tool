# wfm-checker-tool

small angular app i made so I can turn syndicate standing into plat. it checks warframe.market for people buying the stuff syndicates sell, then gives you the whisper to copy paste in game.

## what it does

- one tab per syndicate (Augments, Holdfast, Cavia, The Hex)
- **best sellers**: what sold for the most in the last 48h
- **scan**: finds buyers that are online or in game
- **suggested min plat** is turned off for now (wip)
- **whisper lines**, one per buyer, with a copy button

## how it works (quick overview)

1. open a tab. it grabs recent sales for that tab's items, thats the best sellers table
2. hit scan. it asks warframe.market for the top buyers of every item, one request every 350ms (the api only allows 3 a sec)
3. buyers that are online or in game and offer at least your min plat show up, best offer first
4. every buyer gets one whisper with all their items in it. hit copy, paste it in game, done
5. results stay when you switch tabs so no need to wait again

why the `/api` ? warframe.market doesnt allow browsers to call it directly (no cors). so the app calls `/api/...` and a tiny proxy forwards it. in dev thats `proxy.conf.json`, live its the functions in `api/` (vercel). it only lets 2 routes through (order lookup and sales stats) and caches the replies for a bit.

## run it

```
npm install
npm start        # http://localhost:4200
npm test
```

- needs Node 22.12 or newer
- `.npmrc` turns on `legacy-peer-deps` cause plain `npm install` crashed on my machine (some npm `edgesOut` bug). vercel needs it too or `npm ci` says the lockfile is out of sync

## put it online (vercel)

1. push the repo to github
2. on vercel: add new project, pick the repo, leave the settings alone (`vercel.json` has the build command and output folder)
3. deploy. every push to the branch you pick redeploys

the `api/` folder turns into the proxy on its own, and `vercel.json` sends unknown urls to `index.html` so a refresh on `/hex` works.

i tried cloudflare workers first but warframe.market answers them with a 403 bot check. a normal connection is fine, so the proxy lives on vercel instead.

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
api                    the live proxy (vercel functions)
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
| hosting               | Vercel              | https://vercel.com                              | hosting + the proxy                           |

am not affiliated with or endorsed by warframe.market or DE
Warframe and everything in it belongs to Digital Extremes
