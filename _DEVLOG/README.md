# Direction
- not direct competing with tradingview
- make it visualize layer between human-bot
    - semi-bot poly mkt
```md
### Top Volume Sections on Polymarket
- Politics (Highest Volume): Markets regarding elections, government actions, and geopolitical events (e.g., U.S. presidential or Federal Reserve decisions) attract the most capital over long periods.

- Major Sports Events: High-profile, short-term markets such as the Super Bowl, NBA playoffs, and top-tier soccer leagues (e.g., English Premier League) generate significant,, and often higher, volume during their respective seasons.

- Crypto & Macroeconomic Data: Fast-moving markets focused on Bitcoin/Ethereum prices, ETF approvals, and Fed rate decisions, which react quickly to news, often experience high volume.

- "Breaking News" Section: This section experiences high, volatile volume, with bets ranging from $20K to $3M depending on the event, as users react to developing news.
```

# TVJS Improvement Proposal
### [ ] 004-Icon: change icon to svg
- why do we need .png with base64 ?
### [ ] 003-script: Add alternative to script, and calculate indy value from datacube
- see [script file](../src/helpers/script_std.js), which is pretty neat
- the script will be sent to web worker to parse/ execute/ calculate value 
- while everything was nice, I didn't plan for tvjs to be another tradingview and create another pinescript
- decide if legacy script will be support or not ?
### [ ] 002-unittest: Migrate unit test from AVA to Vitest(Jest)
### [ ] 001-performance: from [20260221-update](./20260221-update.md),handle mutations with **UpLifted** state to efficiently manage a large data object with many child components responsible for both rendering and mutating specific parts
### [ ] 000-performance: Migrate all src and test to Vue3 and Vite
- [ ] upgrade **.vue** batch1 see [20260222-update](./20260222-update.md)
- apart from **mixin** and **components**, leave everything as is
- no more composable created, for now
- decoupling `dc_core.js` this.tv.$watch
- decoupling `dc_events.js ` this.tv.$refs and this.tv.$set
- decoupling `datacube.js` this.tv.$set
- update order ['computed', 'mounted', 'render', 'watch', , , 'mixin', support libs, emit, props]

