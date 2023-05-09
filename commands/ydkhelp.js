const { SlashCommandBuilder } = require("discord.js");

let reply = `**Yu-Gi-Oh! Deck Bot v1.0**\nCreated by Devin Arena\n`

reply += "**Commands**\n"
reply += "*/ydkinfo* - Prints bot information\n"
reply += "*/ydkhelp* - Prints a list of commands\n"
reply += "*/ydksearch* - Grabs a card\n"
reply += "*/ydkrandom* - Grabs a random card\n"

module.exports = {
    data: new SlashCommandBuilder().setName('ydkhelp').setDescription('Prints a list of commands'),
    async execute(interaction) {
        await interaction.reply({ content: reply, ephemeral: true });
    },
};