import { EmbedBuilder } from '@discordjs/builders';

export const getEmbedMessage = (title: string, description: string, color?: number): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setTimestamp()
        .setFooter({
            text: 'Andria Bot',
            iconURL: 'https://i.imgur.com/bX0ge78_d.webp?maxwidth=760&fidelity=grand',
        });
    if (color) {
        embed.setColor(color);
    } else {
        embed.setColor(0xc908b3);
    }
    return embed;
};