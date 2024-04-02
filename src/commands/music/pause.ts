import { BaseGuildTextChannel, Message } from 'discord.js';
import { getEmbedMessage } from '../../util/embedBuilder';

export const command: Command = {
    name: 'pause',
    cooldown: 5,
    aliases: ['ps'],
    description: 'Pausa a música atual',
    execute: async (
        channel: BaseGuildTextChannel,
        message: Message,
    ): Promise<void | Message<boolean>> => {
        if (message.guildId === null) return;
        const { queues } = message.client as AndriaClient;
        const queue = queues.get(message.guildId);
        const embed = getEmbedMessage(
            'Música Pausada',
            'A música foi pausada. Use o comando de resume para continuar!',
        );

        if (!queue?.player) {
            embed.setDescription('I am not playing anything');
            return channel.send({ embeds: [embed] });
        }
        if (queue.player.state.status !== 'playing') {
            embed.setDescription('The music is already paused');
            return channel.send({ embeds: [embed] });
        }
        queue.player.pause();
        channel.send({ embeds: [embed] });
    },
};
