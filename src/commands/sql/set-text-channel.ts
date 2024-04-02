import { BaseGuildTextChannel, ChannelType, Message } from 'discord.js';
import db from '../../database/db';

export const command: Command = {
    name: 'set-text-channel',
    description: 'Set the text channel for the bot',
    cooldown: 30,
    aliases: ['stc'],
    async execute(message: Message, args: string[], channel: BaseGuildTextChannel) {
        const author = message.author;
        if(message.guild?.members.cache.get(author.id)?.permissions.has('Administrator') === false) {
            return channel.send('You need to be an administrator to use this command!');
        }
        // Regex para verificar se args[0] é uma menção de canal
        const channelMention = args[0].match(/^<#(\d+)>$/);

        if (channelMention) {
            // Pegamos o ID do canal a partir da menção
            const channelId = channelMention[1];

            // Verificamos se o canal existe na guilda
            const mentionedChannel = message.guild?.channels.cache.get(channelId);
            if (!mentionedChannel || mentionedChannel.type !== ChannelType.GuildText) {
                return channel.send('Please mention a valid text channel!');
            }
            await db('Guild')
                .where('Id', message.guild?.id)
                .update({ channelTextId: mentionedChannel.id });
            channel.send(
                `The text channel for the bot has been set to ${channel.name}`,
            );
        } else {
            return channel.send(
                'You need to mention a text channel!',
            );
        }
        
    }
};