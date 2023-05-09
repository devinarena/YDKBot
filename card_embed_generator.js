const { EmbedBuilder } = require("discord.js");

const tcgPlayerURL = "https://www.tcgplayer.com/search/yugioh/product?productLineName=yugioh&q=%QUERY%&view=grid";

module.exports = {
    generateEmbed(card) {
        const image_url = card['card_images'][0]['image_url'];

        console.log(tcgPlayerURL.replace("%QUERY%", encodeURIComponent(card["name"])));

        const url = new URL(tcgPlayerURL.replace("%QUERY%", encodeURIComponent(card["name"]))).toString();

        const embed = new EmbedBuilder().setColor(0x0099FF).setImage(image_url)
            .setTitle(card['name']).setURL(url).setDescription(card['desc']);

        let addedFields = 0;

        if ("type" in card) {
            embed.addFields({ name: "Type", value: card["type"], inline: true });
            addedFields++;
        }

        if ("attribute" in card) {
            embed.addFields({ name: "Attribute", value: card["attribute"], inline: true });
            addedFields++;
        }

        if ("race" in card) {
            embed.addFields({ name: "Type", value: card["race"], inline: true });
            addedFields++;
        }

        if ("level" in card) {
            if (card["type"].includes("XYZ")) {
                embed.addFields({ name: "Rank", value: card["level"].toString(), inline: true });
            } else
                embed.addFields({ name: "Level", value: card["level"].toString(), inline: true });
            addedFields++;
        }

        if ("linkval" in card) {
            embed.addFields({ name: "Link Rating", value: card["linkval"].toString(), inline: true });

            let output = "";
            for (const marker of card["linkmarkers"]) {
                output += marker + "\n";
            }
            embed.addFields({ name: "Link Arrows", value: output, inline: true });
            addedFields += 2;
        }

        if ("atk" in card) {
            embed.addFields({ name: "Attack", value: card["atk"].toString(), inline: true });
            addedFields++;
        }

        if ("def" in card) {
            embed.addFields({ name: "Defense", value: card["def"].toString(), inline: true });
            addedFields++;
        }

        while (addedFields % 3 !== 0) {
            embed.addFields({ name: "\u200B", value: "\u200B", inline: true });
            addedFields++;
        }

        if ("card_prices" in card) {
            let output = "";
            for (const price in card["card_prices"][0]) {
                let priceName = price.split("_")[0];
                priceName = priceName.charAt(0).toUpperCase() + priceName.slice(1);
                output += priceName + ": $" + card["card_prices"][0][price] + "\n";
            }
            embed.addFields({ name: "Prices", value: output });
            addedFields = 0;
        }

        return embed;
    }
}