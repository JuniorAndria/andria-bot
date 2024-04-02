import { BaseGuildTextChannel, Message } from 'discord.js';
import { getEmbedMessage } from '../../util/embedBuilder';

export const command: Command = {
    name: 'help',
    cooldown: 5,
    aliases: ['h'],
    description: 'Shows help',
    execute: async (
        channel: BaseGuildTextChannel,
        message: Message,
    ): Promise<void | Message<boolean>> => {
        if (message.guildId === null) return;
        const { commands, prefix } = message.client as AndriaClient;
        const myPrefix = prefix.get(message.guildId) ?? '!';
        if (!commands) return;
        const embed = getEmbedMessage(
            'Ajuda',
            'Aqui estão os comandos disponíveis',
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [key, command] of commands) {
            embed.addFields({
                name: `**Comando:** ${prefix.get(message.guildId)}${command.name}`,
                value: `**Descrição:** ${command.description}\n**Aliases:** ${command.aliases.map((alias) => `${myPrefix}${alias}`).join(`, `)}\n**Cooldown:** ${command.cooldown} segundos`,
            });
        }
        channel.send({ embeds: [embed] });
    },
};
