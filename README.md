# YDKBot
A Yu-Gi-Oh! Card Bot built for Discord.

## About
YDKBot is a simple bot for making queries to various different Yu-Gi-Oh! APIs to get data about cards and decks. Currently supported features include:
- [X] Searching for cards
- [X] Sending Embeds with card information
- [X] Caching cards to reduce API calls
- [X] Autocomplete (works for cached cards only at the moment)
- [X] Getting a random card
- [] Use links or ydke to generate decklist Embeds
- [] Search by archetype, etc. 

## Usage
When the bot is further in development, you'll be able to add it to your server. You are also welcome to use the source code as you wish (MIT License).

### Commands
- /ydkhelp - displays a help message
- /ydkinfo - displays bot and version info
- /ydksearch [random=bool|id=number|name=str|fname=str] - search for a card based on:
  - random - true|false - search for a random card
  - id - number - search for a card with the given ID
  - name - string - search for a card with the EXACT given name
  - fname - string - search for cards with text matching given text

## Images
[git-image/ex_stardust_dragon.png](stardust dragon)
