import { BaseGuildTextChannel, Message } from 'discord.js';
import { getEmbedMessage } from '../../util/embedBuilder';

export const command: Command = {
    name: 'resume',
    cooldown: 5,
    aliases: ['r'],
    description: 'Continuar a música atual',
    execute: async (
        channel: BaseGuildTextChannel,
        message: Message,
    ) => {
        if (message.guildId === null) return;
        const embed = getEmbedMessage(
            'Continuar',
            'Continuando a reprodução atual. Use o comando de pausa para pausar!',
        );
        const { queues } = message.client as AndriaClient;
        const queue = queues.get(message.guildId);
        if (!queue) {
            embed.setDescription(
                'Nenhuma fila atual para reproduzir',
            );
            return channel.send({ embeds: [embed] });
        }
        if (!queue.player) {
            embed.setDescription('Não estou reproduzindo nada');
            return channel.send({ embeds: [embed] });
        }
        if (queue.player.state.status !== 'paused') {
            embed.setDescription('A música já está tocando');
            return channel.send({ embeds: [embed] });
        }
        queue.player.unpause();
        message.channel.send({ embeds: [embed] });
    },
};
