const { SlashCommandBuilder } = require("discord.js");

const reply = `**Yu-Gi-Oh! Deck Bot v1.0**\nCreated by Devin Arena\nUse /help to see a list of commands!`

module.exports = {
    data: new SlashCommandBuilder().setName('ydkinfo').setDescription('Prints bot information'),
    async execute(interaction) {
        await interaction.reply({ content: reply, ephemeral: true });
    },
};