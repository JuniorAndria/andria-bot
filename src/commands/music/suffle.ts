import {
    BaseGuildTextChannel,
    Message,
} from 'discord.js';
import { getEmbedMessage } from '../../util/embedBuilder';

export const command: Command = {
    name: 'suffle',
    cooldown: 5,
    aliases: ['sf'],
    description: 'Shuffle the queue',
    execute: async (
        channel: BaseGuildTextChannel,
        message: Message,
    ) => {
        if (message.guildId === null) return;
        const embed = getEmbedMessage('Fila Embaralhada', 'A fila foi embaralhada');
        const { queues } = message.client as AndriaClient;
        const queue = queues.get(message.guildId);
        if (!queue) {
            embed.setDescription('Não estou em um canal de voz');
            return channel.send({ embeds: [embed] });
        }
        const songs = queue.songs;
        if (songs.length <= 1) {
            embed.setDescription('Só há uma música na fila');
            return channel.send({ embeds: [embed] });
        }
        const currentSong = songs.shift();
        songs.sort(() => Math.random() - 0.5);
        if(currentSong) songs.unshift(currentSong);
        queue.songs = songs;
        channel.send({ embeds: [embed] });
    },
};
