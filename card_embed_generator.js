const { EmbedBuilder } = require("discord.js");

module.exports = {
    generateEmbed(card) {
        const image_url = card['card_images'][0]['image_url'];

        const embed = new EmbedBuilder().setColor(0x0099FF).setImage(image_url)
            .setTitle(card['name']).setDescription(card['desc']);

        if ("atk" in card && "def" in card) {
            embed.addFields({ name: "Attack", value: card["atk"].toString(), inline: true }, { name: "Defense", value: card["def"].toString(), inline: true })
        }

        return embed;
    }
}