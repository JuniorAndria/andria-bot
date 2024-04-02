import { BaseGuildTextChannel, Message } from 'discord.js';
import { canModifyQueue } from '../../util/canModifyQueue';
import { getEmbedMessage } from '../../util/embedBuilder';
export const command: Command = {
    name: 'loop',
    cooldown: 5,
    aliases: ['l'],
    description: 'Repete a música atual',
    execute: async (
        channel: BaseGuildTextChannel,
        message: Message,
    ): Promise<void | Message<boolean>> => {
        if (message.guildId === null) return;
        const embed = getEmbedMessage(
            'Repetição de música',
            'Repetindo a fila atual',
        );
        const { queues } = message.client as AndriaClient;
        const queue = queues.get(message.guildId);
        if (!queue) {
            embed.setDescription('Eu não estou em um canal de voz');
            return channel.send({ embeds: [embed] });
        }
        if (!canModifyQueue(message.member)) {
            embed.setDescription('Você precisa estar no mesmo canal de voz que eu');
            return channel.send({ embeds: [embed] });
        }
        if(!queue.player) {
            embed.setDescription('Eu não estou tocando nada');
            return channel.send({ embeds: [embed] });
        }
        queue.loop = !queue.loop;
        embed.setDescription(queue.loop ? 'Repetição ativada' : 'Repetição desativada');
    },
};
