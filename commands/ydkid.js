const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const { generateEmbed } = require("../card_embed_generator");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const idURL = "https://db.ygoprodeck.com/api/v7/cardinfo.php?id=";

module.exports = {
    data: new SlashCommandBuilder().setName('ydkid').setDescription('Grabs a card by ID').addNumberOption(option => option.setName("id").setDescription("The ID of  the card to search for.").setRequired(true)),
    async execute(interaction) {
        const id = interaction.options.getNumber('id');

        fetch(new URL(idURL + id)).then(response => {
            response.json().then(async json => {

                if (!json || !json.data || json.data.length === 0) {
                    interaction.reply({ content: "An error occurred while fetching the card. Check the ID?", ephemeral: true });
                    return;
                }

                const card = json.data[0];

                await interaction.reply({ embeds: [generateEmbed(card)] });
            }).catch(err => {
                console.log(err);
                interaction.reply({ content: "An error occurred while fetching the card. Check the ID?", ephemeral: true });
            });
        }).catch(err => {
            console.log(err);
            interaction.reply({ content: "An error occurred while fetching the card. Check the ID?", ephemeral: true });
        });
    },
};