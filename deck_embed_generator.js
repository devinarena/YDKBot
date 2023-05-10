const { EmbedBuilder } = require("discord.js");
const ydke = require("ydke");
const { getIdCache, cacheInsert } = require("./card_cache");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const url = "https://db.ygoprodeck.com/api/v7/cardinfo.php?id=";

const getCardName = async (id) => {
    let id_cache = await getIdCache();

    if (id in id_cache) {
        return id_cache[id];
    }

    let res = await fetch(url + id);
    let json = await res.json();

    if (!json || !json.data || json.data.length === 0) {
        return null;
    }

    const card = json.data[0];

    cacheInsert.push(card);

    return card.name;
}

// ydke://Pua6Aj7mugL18XgF9fF4BfXxeAVlfO4EZXzuBKLEfgSixH4EosR+BOL3PwXMF+wCzBfsAtlTrgHZU64B2VOuAa8j3gCvI94AryPeAGC26AJgtugCKVfDAClXwwD63BQBb3bvAG927wBeo8ABXqPAASHrwwEh68MBN2PhATdj4QGg/yUEoP8lBL/2cQS/9nEEv/ZxBOvlfATr5XwEWJfFAViXxQFg6TMC!3cIZAN3CGQCIXIUDCVpjAAlaYwC18AEF/WccAFI63wJSOt8Cy4gOAMuIDgC7pGMEu6RjBLukYwQ=!!
module.exports = {
    async generateDeckEmbed(ydkeString, deckName) {
        const embed = new EmbedBuilder().setColor("#000000")
            .setTitle(`${deckName} Deck Profile:`);

        let deck = ydke.parseURL(ydkeString);

        if (!deck) {
            embed.setDescription("Invalid YDKE string");
            return embed;
        }

        let mainMap = {};
        for (let i = 0; i < deck.main.length; i++) {
            if (mainMap[deck.main[i]]) {
                mainMap[deck.main[i]] += 1;
            } else {
                mainMap[deck.main[i]] = 1;
            }
        }
        let extraMap = {};
        for (let i = 0; i < deck.extra.length; i++) {
            if (extraMap[deck.extra[i]]) {
                extraMap[deck.extra[i]] += 1;
            } else {
                extraMap[deck.extra[i]] = 1;
            }
        }
        let sideMap = {};
        for (let i = 0; i < deck.side.length; i++) {
            if (sideMap[deck.side[i]]) {
                sideMap[deck.side[i]] += 1;
            } else {
                sideMap[deck.side[i]] = 1;
            }
        }

        for (const id in mainMap) {
            const name = await getCardName(id);
            console.log(name);
            mainMap[name] = mainMap[id];
            delete mainMap[id];
        }

        let main = "";
        let extra = "";
        let side = "";

        let mainCounter = 1;
        let extraCounter = 1;
        let sideCounter = 1;

        for (const name in mainMap) {
            const str = name + ": " + mainMap[name] + "\n";
            if (main.length + str.length > 1024) {
                embed.addFields({ name: "Main (" + mainCounter + ")", value: main });
                mainCounter++;
                main = "";
            }
            main += str;
        }
        for (const name in extraMap) {
            const str = name + ": " + extraMap[name] + "\n";
            if (extra.length + str.length > 1024) {
                embed.addFields({ name: "Extra (" + extraCounter + ")", value: extra });
                extraCounter++;
                extra = "";
            }
            extra += str;
        }
        for (const name in sideMap) {
            const str = name + ": " + sideMap[name] + "\n";
            if (side.length + str.length > 1024) {
                embed.addFields({ name: "Side (" + sideCounter + ")", value: side });
                sideCounter++;
                side = "";
            }
            side += str;
        }

        if (main.length > 0)
            embed.addFields({ name: "Main (" + mainCounter + ")", value: main });
        if (extra.length > 0)
            embed.addFields({ name: "Extra (" + extraCounter + ")", value: extra });
        if (side.length > 0)
            embed.addFields({ name: "Side (" + sideCounter + ")", value: side });

        return embed;
    }
}