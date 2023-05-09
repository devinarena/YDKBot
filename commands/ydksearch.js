const { SlashCommandBuilder } = require("discord.js");
const { generateEmbed } = require("../card_embed_generator");
const { saveCard, getCardById, getCardByName, fuzzySearch, getCache } = require("../card_cache");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const idURL = "https://db.ygoprodeck.com/api/v7/cardinfo.php?id=";
const nameURL = "https://db.ygoprodeck.com/api/v7/cardinfo.php?name=";
const fnameURL = "https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=";
const randomURL = "https://db.ygoprodeck.com/api/v7/randomcard.php";

const cache = getCache();

module.exports = {
    data: new SlashCommandBuilder().setName('ydksearch').setDescription('Grabs a card').
        addStringOption(option => option.setName("name").setDescription("The name of the card to search for.").setAutocomplete(true)).
        addStringOption(option => option.setName("fname").setDescription("Fuzzy search for cards containing this text.").setAutocomplete(true)).
        addIntegerOption(option => option.setName("id").setDescription("The id of the card to search for.").setAutocomplete(true)).
        addBooleanOption(option => option.setName("random").setDescription("Get a random card.")),
    async execute(interaction) {
        let url = new URL(idURL);
        let card = null;

        if (interaction.options.getString('name')) {
            const name = interaction.options.getString('name');
            url = nameURL + encodeURIComponent(name);
            card = getCardByName(name);
        } else if (interaction.options.getString('fname')) {
            const fname = interaction.options.getString('fname');
            url = fnameURL + encodeURIComponent(fname);
            // TODO: fuzzy search
        } else if (interaction.options.getInteger('id')) {
            const id = interaction.options.getInteger('id');
            url = idURL + encodeURIComponent(id);
            card = getCardById(id);
        } else if (interaction.options.getBoolean("random")) {
            fetch(randomURL).then(response => {
                response.json().then(async json => {
                    if (!json) {
                        interaction.reply({ content: "An error occurred while fetching the card. No cards found with that query.", ephemeral: true });
                        return;
                    }
                    
                    const card = json;

                    await interaction.reply({ embeds: [generateEmbed(card)] });

                    saveCard(card);
                }).catch(err => {
                    interaction.reply({ content: "An error occurred while fetching the card. Check the syntax?", ephemeral: true });
                    console.log(err);
                });
            }).catch(err => {
                interaction.reply({ content: "An error occurred while fetching the card. Check the syntax?", ephemeral: true });
                console.log(err);
            });
            return;
        } else {
            interaction.reply({ content: "You must specify a name or id to search for!", ephemeral: true });
            return;
        }

        if (card) {
            console.log("Found card in cache");
            interaction.reply({ embeds: [generateEmbed(card)] });
            return;
        }


        fetch(url).then(response => {
            response.json().then(async json => {
                if (!json || !json.data || json.data.length === 0) {
                    interaction.reply({ content: "An error occurred while fetching the card. No cards found with that query.", ephemeral: true });
                    return;
                }

                let cardsToSave = [];

                for (let i = 0; i < json.data.length; i++) {
                    const card = json.data[i];

                    cardsToSave.push(card);

                    if (i === 0)
                        await interaction.reply({ embeds: [generateEmbed(card)] });
                    else
                        await interaction.followUp({ embeds: [generateEmbed(card)] });
                }

                for (const card of cardsToSave)
                    saveCard(card);
            }).catch(err => {
                interaction.reply({ content: "An error occurred while fetching the card. Check the syntax?", ephemeral: true });
                console.log(err);
            });
        }).catch(err => {
            interaction.reply({ content: "An error occurred while fetching the card. Check the syntax?", ephemeral: true });
            console.log(err);
        });
    },
    async autocomplete(interaction) {
        const name = interaction.options.getString('name');
        const fname = interaction.options.getString('fname');
        const id = interaction.options.getInteger('id');

        let names = [];

        if (name || fname) {
            for (const card in cache) {
                names.push(card);
            }
        } else if (id) {
            for (const card in cache) {
                names.push(cache[card]);
            }
        }

        console.log(names);

        let filtered;
        if (name) {
            filtered = names.filter(choice => choice.startsWith(name));
        } else if (fname) {
            filtered = names.filter(choice => choice.includes(fname));
        } else if (id) {
            filtered = names.filter(choice => choice.toString().startsWith(id));
        } else {
            return;
        }

        console.log(filtered);

        await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
    }
};