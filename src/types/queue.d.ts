import { AudioPlayer, VoiceConnection } from '@discordjs/voice';
import { BaseGuildTextChannel, BaseGuildVoiceChannel } from 'discord.js';

declare global {
    type Queue = {
        textChannel: BaseGuildTextChannel;
        voiceChannel: BaseGuildVoiceChannel;
        connection: VoiceConnection;
        songs: Song[];
        volume: number;
        playing: boolean;
        player?: AudioPlayer;
        loop: boolean;
    };
}
