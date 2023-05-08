const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const idURL = "https://db.ygoprodeck.com/api/v7/cardinfo.php?id=";

module.exports = {
    data: new SlashCommandBuilder().setName('ydkid').setDescription('Grabs a card by ID').addNumberOption(option => option.setName("id").setDescription("The ID of  the card to search for.").setRequired(true)),
    async execute(interaction) {
        const id = interaction.options.getNumber('id');

        fetch(idURL + id).then(response => {
            response.json().then(async json => {

                const card = json.data[0];

                const image_url = card['card_images'][0]['image_url'];

                const embed = new EmbedBuilder().setColor(0x0099FF).setImage(image_url)
                    .setTitle(card['name']).setDescription(card['desc']);

                if ("atk" in card && "def" in card) {
                    embed.addFields({ name: "Attack", value: card["atk"].toString(), inline: true }, { name: "Defense", value: card["def"].toString(), inline: true })
                }

                await interaction.reply({ embeds: [embed] });
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