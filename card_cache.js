const fs = require('fs');
const path = require('path');

let cache = {};
let idCache = {};

const getCache = async () => {
    return cache;
}

const getIdCache = async () => {
    return idCache;
}

const getCardByName = async (cardName) => {
    return cache[cardName];
}

const getCardById = async (id) => {
    return cache[idCache[id]];
}

const fuzzySearch = async (cardName) => {
    let file = fs.readFileSync(path.join(__dirname, "cards", "card_names.json"));

    if (!file) {
        console.log("Failed to read card_names.json");
        return null;
    }

    const cardNames = JSON.parse(file);

    let results = [];

    for (const name in cardNames) {
        if (name.includes(cardName)) {
            results.push(getCardByName(name));
        }
    }

    return results;
}

const cacheInsert = async (cardJson) => {
    cache[cardJson.name] = cardJson;
    idCache[cardJson.id] = cardJson.name;
}

// const saveCard = (cardJson) => {
//     fs.readFile(path.join(__dirname, "cards", "card_names.json"), (err, file) => {
//         if (!file) {
//             console.log("Failed to read card_names.json");
//             return;
//         }

//         let cardNames = JSON.parse(file);

//         cardNames[cardJson.name] = cardJson.id;

//         fs.writeFile(path.join(__dirname, "cards", "card_names.json"), JSON.stringify(cardNames), () => {
//             console.log("Updated card_names.json");
//         });

//         fs.writeFile(path.join(__dirname, "cards", cardJson.id + ".json"), JSON.stringify(cardJson), () => {
//             console.log("Updated " + cardJson.id + ".json")
//         });

//         console.log("Saving card " + cardJson.name + " with id " + cardJson.id);
//     });
// }

const loadCard = (id) => {
    let file = fs.readFileSync(path.join(__dirname, "cards", id + ".json"));

    if (!file) {
        console.log("Failed to read " + id + ".json");
        return;
    }

    let cardJson = JSON.parse(file);
    cache[cardJson.name] = cardJson;
    idCache[cardJson.id] = cardJson.name;
}

(async () => {
    if (!fs.existsSync(path.join(__dirname, "cards"))) {
        fs.mkdirSync(path.join(__dirname, "cards"));
    }
    if (!fs.existsSync(path.join(__dirname, "cards", "card_names.json"))) {
        fs.writeFileSync(path.join(__dirname, "cards", "card_names.json"), "{}");
    }
    let file = fs.readFileSync(path.join(__dirname, "cards", "card_names.json"));
    let nameCache = JSON.parse(file);
    for (const cardName in nameCache) {
        loadCard(nameCache[cardName]);
    }
})();

const dumpCache = async () => {
    let updated = false;

    for (const cardName in cache) {
        if (!fs.existsSync(path.join(__dirname, "cards", cache[cardName].id + ".json"))) {
            await fs.writeFile(path.join(__dirname, "cards", cache[cardName].id + ".json"), JSON.stringify(cache[cardName]), () => {
                console.log("Updated " + cache[cardName].id + ".json")
            });
            updated = true;
        }
    }

    if (!updated)
        return;


    let nameIdMap = {};
    for (const cardName in cache) {
        nameIdMap[cardName] = cache[cardName].id;
    }

    await fs.writeFile(path.join(__dirname, "cards", "card_names.json"), JSON.stringify(nameIdMap), () => {
        console.log("Updated card_names.json");
    });
}

// Dump the cache to files every hour
let cacheInterval = setInterval(dumpCache, 1000 * 30);


module.exports = {
    cacheInsert,
    getCache,
    getIdCache,
    // saveCard,
    getCardByName,
    getCardById,
    fuzzySearch,
    dumpCache,
    cacheInterval
}