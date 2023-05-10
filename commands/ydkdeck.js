const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { generateDeckEmbed } = require("../deck_embed_generator");

module.exports = {
    data: new SlashCommandBuilder().setName('ydkdeck').setDescription('Show off a deck').
        addStringOption(option => option.setName("ydke").setDescription("The YDKE URL to display")).
        addStringOption(option => option.setName("name").setDescription("The name of the deck to display")),
    async execute(interaction) {
        if (interaction.options.getString("ydke")) {

            const ydke = interaction.options.getString("ydke");
            let deckName = interaction.options.getString("name") || "My";

            await interaction.reply({ embeds: [new EmbedBuilder().setTitle("Building deck...").setDescription("This should automatically update...").setColor("#FF0000")] });

            let embed = await generateDeckEmbed(ydke, deckName);

            await interaction.editReply({ embeds: [embed] });
        } else {
            interaction.reply({ content: "An error occurred while fetching the card. Check the syntax.", ephemeral: true });
            return;
        }
    },
};