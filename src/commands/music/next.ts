import { BaseGuildTextChannel, Message } from 'discord.js';
import { getEmbedMessage } from '../../util/embedBuilder';
import { canModifyQueue } from '../../util/canModifyQueue';

export const command: Command = {
    name: 'next',
    cooldown: 5,
    aliases: ['n', 'skip', 's'],
    description: 'Pular a música atual',
    execute: async (
        channel: BaseGuildTextChannel,
        message: Message,
    ): Promise<void | Message<boolean>> => {
        if (message.guildId === null) return;
        const embed = getEmbedMessage(
            'next',
            'Pulando a música atual',
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
        if(queue.songs.length <= 1) {
            embed.setDescription('Só há uma música na fila');
            return channel.send({ embeds: [embed] });
        }
        if(!queue.player) {
            embed.setDescription('Eu não estou tocando nada');
            return channel.send({ embeds: [embed] });
        }
        queue.player.stop();
        channel.send({ embeds: [embed] });
    },
};