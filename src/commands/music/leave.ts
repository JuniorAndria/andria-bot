import { BaseGuildTextChannel, Message } from 'discord.js';
import { getEmbedMessage } from '../../util/embedBuilder';

export const command: Command = {
    name: 'leave',
    cooldown: 5,
    aliases: ['l'],
    description: 'Sair do canal de voz',
    execute: async (
        channel: BaseGuildTextChannel,
        message: Message,
    ): Promise<void | Message<boolean>> => {
        if (message.guildId === null) return;
        const embed = getEmbedMessage(
            'Parar de tocar música',
            'Saindo do canal de voz',
        );
        const { queues } = message.client as AndriaClient;
        const queue = queues.get(message.guildId);
        if (!queue) {
            embed.setDescription('Não estou em um canal de voz');
            return channel.send({ embeds: [embed] });
        }
        queue.player?.stop();
        queue.connection.destroy();
        queues.delete(message.guildId);
        channel.send({ embeds: [embed] });
    },
};
