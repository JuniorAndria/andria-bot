import { GuildMember } from 'discord.js';

export const canModifyQueue = (member: GuildMember | null): boolean =>  {
    if(member === null) return false;
    const channel  = member.voice.channelId;
    if (!channel) {
        return false;
    }
    const meChannel = member.guild.members.me?.voice?.channelId;
    if(meChannel && channel !== meChannel) {
        return false;
    }
    return true;
};