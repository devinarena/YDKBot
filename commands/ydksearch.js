const { SlashCommandBuilder } = require("discord.js");
const { generateCardEmbed: generateEmbed } = require("../card_embed_generator");
const { saveCard, getCardById, getCardByName, fuzzySearch, getCache, toInsert, cacheInsert } = require("../card_cache");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const baseURL = "https://db.ygoprodeck.com/api/v7/cardinfo.php";

const idURL = baseURL + "?id=";
const nameURL = baseURL + "?name=";
const fnameURL = baseURL + "?fname=";
const archetypeURL = baseURL + "?archetype=";
const randomURL = "https://db.ygoprodeck.com/api/v7/randomcard.php";

module.exports = {
    data: new SlashCommandBuilder().setName('ydksearch').setDescription('Grabs a card').
        addStringOption(option => option.setName("name").setDescription("The name of the card to search for.").setAutocomplete(true)).
        addStringOption(option => option.setName("fname").setDescription("Fuzzy search for cards containing this text.").setAutocomplete(true)).
        addStringOption(option => option.setName("archetype").setDescription("Search for cards in this archetype.")).
        addIntegerOption(option => option.setName("id").setDescription("The id of the card to search for.").setAutocomplete(true)),
    async execute(interaction) {
        let url = new URL(idURL);
        let card = null;

        if (interaction.options.getString('name')) {
            const name = interaction.options.getString('name');
            if (name == "random") {
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
            }
            url = nameURL + encodeURIComponent(name);
            card = await getCardByName(name);
        } else if (interaction.options.getString('fname')) {
            const fname = interaction.options.getString('fname');
            url = fnameURL + encodeURIComponent(fname);
            // TODO: fuzzy search
        } else if (interaction.options.getInteger('id')) {
            const id = interaction.options.getInteger('id');
            url = idURL + encodeURIComponent(id);
            card = await getCardById(id);
        } else if (interaction.options.getString("archetype")) {
            const archetype = interaction.options.getString("archetype");
            url = archetypeURL + encodeURIComponent(archetype);
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

                for (let i = 0; i < json.data.length; i++) {
                    const card = json.data[i];

                    cacheInsert(card);
                }

                for (let i = 0; i < json.data.length; i++) {
                    const card = json.data[i];

                    if (i === 0)
                        await interaction.reply({ embeds: [generateEmbed(card)] });
                    else
                        await interaction.followUp({ embeds: [generateEmbed(card)] });
                }
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

        const cache = await getCache();

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

        await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
    }
};