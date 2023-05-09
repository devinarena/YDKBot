const { SlashCommandBuilder } = require("discord.js");
const { generateEmbed } = require("../card_embed_generator");
const { saveCard, getCardById, getCardByName } = require("../card_cache");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const idURL = "https://db.ygoprodeck.com/api/v7/cardinfo.php?id=";
const nameURL = "https://db.ygoprodeck.com/api/v7/cardinfo.php?name=";
const fnameURL = "https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=";

module.exports = {
    data: new SlashCommandBuilder().setName('ydksearch').setDescription('Grabs a card').
        addStringOption(option => option.setName("name").setDescription("The name of the card to search for.")).
        addStringOption(option => option.setName("fname").setDescription("Fuzzy search for cards containing this text.")).
        addIntegerOption(option => option.setName("id").setDescription("The id of the card to search for.")),
    async execute(interaction) {
        let url = new URL(idURL);
        let card = null;

        if (interaction.options.getString('name')) {
            const name = interaction.options.getString('name');
            url = new URL(nameURL + name);
            card = await getCardByName(name);
        } else if (interaction.options.getString('fname')) {
            const fname = interaction.options.getString('fname');
            url = new URL(fnameURL + fname);
            // TODO: implement fuzzy searching in the cache
        } else if (interaction.options.getInteger('id')) {
            const id = interaction.options.getInteger('id');
            url = new URL(idURL + id);
            card = await getCardById(id);
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

                    saveCard(card);

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
};