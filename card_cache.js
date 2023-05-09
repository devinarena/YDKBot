const fs = require('fs');
const path = require('path');

let cache = {};
const cacheInsert = [];

const getCache = async () => {
    while (cacheInsert.length > 1) continue;

    return cache;
}

const getCardByName = async (cardName) => {
    while (cacheInsert.length > 1) continue;

    let file = fs.readFileSync(path.join(__dirname, "cards", "card_names.json"));

    if (!file) {
        console.log("Failed to read card_names.json");
        return null;
    }

    const cardNames = JSON.parse(file);

    if (cardName in cardNames) {
        let cardFile = fs.readFileSync(path.join(__dirname, "cards", cardNames[cardName] + ".json"));

        if (!cardFile) {
            console.log("Failed to read " + cardNames[cardName] + ".json");
            return null;
        }

        return JSON.parse(cardFile);
    }

    return null;
}

const getCardById = async (id) => {
    while (cacheInsert.length > 1) continue;

    let cardFile = fs.readFileSync(path.join(__dirname, "cards", id + ".json"));

    if (!cardFile) {
        console.log("Failed to read " + id + ".json");
        return null;
    }

    return JSON.parse(cardFile);
}

const fuzzySearch = async (cardName) => {
    while (cacheInsert.length > 1) continue;

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

const saveCard = (cardJson) => {
    fs.readFile(path.join(__dirname, "cards", "card_names.json"), (err, file) => {
        if (!file) {
            console.log("Failed to read card_names.json");
            return;
        }

        let cardNames = JSON.parse(file);

        cardNames[cardJson.name] = cardJson.id;

        fs.writeFile(path.join(__dirname, "cards", "card_names.json"), JSON.stringify(cardNames), () => {
            console.log("Updated card_names.json");
        });

        fs.writeFile(path.join(__dirname, "cards", cardJson.id + ".json"), JSON.stringify(cardJson), () => {
            console.log("Updated " + cardJson.id + ".json")
        });

        console.log("Saving card " + cardJson.name + " with id " + cardJson.id);
    });
}

(async () => {
    cache = JSON.parse(fs.readFileSync(path.join(__dirname, "cards", "card_names.json")));
})();

setInterval(async () => {
    if (cacheInsert.length > 1) {
        fs.readFile(path.join(__dirname, "cards", "card_names.json"), (err, file) => {

            if (!file) {
                console.log("Failed to read card_names.json");
                return;
            }

            let cardNames = JSON.parse(file);

            while (cacheInsert.length > 0) {
                let cardJson = cacheInsert.pop();

                cardNames[cardJson["name"]] = cardJson["id"]
                cache[cardJson["name"]] = cardJson["id"]

                fs.writeFile(path.join(__dirname, "cards", cardJson.id + ".json"), JSON.stringify(cardJson), () => {
                    console.log("Updated " + cardJson.id + ".json")
                });
            }

            fs.writeFile(path.join(__dirname, "cards", "card_names.json"), JSON.stringify(cardNames), () => {
                console.log("Updated card_names.json");
            });
        });
    }
}, 1000);

module.exports = {
    cacheInsert,
    getCache,
    saveCard,
    getCardByName,
    getCardById,
    fuzzySearch
}