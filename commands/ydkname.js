const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const { generateEmbed } = require("../card_embed_generator");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const idURL = "https://db.ygoprodeck.com/api/v7/cardinfo.php?name=";

module.exports = {
    data: new SlashCommandBuilder().setName('ydkname').setDescription('Grabs a card by name').addStringOption(option => option.setName("name").setDescription("The name of  the card to search for.").setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('name');

        fetch(new URL(idURL + name)).then(response => {
            response.json().then(async json => {

                if (!json || !json.data || json.data.length === 0) {
                    interaction.reply({ content: "An error occurred while fetching the card. Check the name?(name's must be full matches, use /ydksearch for fuzzy searching)", ephemeral: true });
                    return;
                }

                const card = json.data[0];

                await interaction.reply({ embeds: [generateEmbed(card)] });
            }).catch(err => {
                console.log(err);
                interaction.reply({ content: "An error occurred while fetching the card. Check the name?(name's must be full matches, use /ydksearch for fuzzy searching)", ephemeral: true });
            });
        }).catch(err => {
            console.log(err);
            interaction.reply({ content: "An error occurred while fetching the card. Check the name? (name's must be full matches, use /ydksearch for fuzzy searching)", ephemeral: true });
        });
    },
};