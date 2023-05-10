
require('dotenv').config();

const { REST, Routes, Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const path = require('path');
const fs = require('fs');
const { dumpCache, cacheInterval } = require('./card_cache');
const { exit } = require('process');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }

    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred)
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        else
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isAutocomplete()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        await interaction.respond({ content: 'There was an error while executing this command!', ephemeral: true });
        return;
    }

    try {
        await command.autocomplete(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred)
            await interaction.respond({ content: 'There was an error while executing this command!', ephemeral: true });
        else
            await interaction.respond({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

client.login(process.env.DISCORD_TOKEN);

// Dump the cache to files on exit
process.on('exit', async () => {
    await dumpCache();
    console.log("Exiting...");
    clearInterval(cacheInterval);
    exit(0);
});
process.on('SIGINT', async () => {
    await dumpCache();
    console.log("Exiting...");
    exit(1);
});
// process.on('SIGUSR1', () => {
//     exit(1);
// });
// process.on('SIGUSR2', () => {
//     exit(1);
// });
process.on('uncaughtException', async () => {
    await dumpCache();
    console.log("Exiting...");
    exit(1);
});
// process.on('SIGTERM', () => {
//     exit(1);
// });