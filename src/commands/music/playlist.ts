import { BaseGuildTextChannel, Message } from 'discord.js';
import { getEmbedMessage } from '../../util/embedBuilder';
import { joinVoiceChannel } from '@discordjs/voice';
import { player } from '../../include/player';
import { google } from 'googleapis';
const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
});

export const command: Command = {
    name: 'playlist',
    cooldown: 5,
    aliases: ['pl'],
    description: 'Adicione uma playlist à fila',
    execute: async (
        channel: BaseGuildTextChannel,
        message: Message,
        args?: string[],
    ): Promise<void | Message<boolean>> => {
        if (!message.guildId) return;
        const client = message.client as AndriaClient;
        const embed = getEmbedMessage(
            'Adicionar Playlist à Fila',
            'Adiciona uma playlist à fila',
        );
        if (!args) {
            embed.setDescription(
                'Você precisa informar o nome da playlist ou o link dela!',
            );
            return channel.send({ embeds: [embed] });
        }
        const voiceChannel = message.member?.voice.channel;
        if (!voiceChannel) {
            embed.setDescription(
                'Você precisa estar em um canal de voz para tocar música!',
            );
            return channel.send({ embeds: [embed] });
        }
        const permissions = voiceChannel.permissionsFor(
            message.client.user!,
        );
        if (!permissions?.has(['Connect', 'Speak'])) {
            embed.setDescription(
                'Preciso de permissão para conectar e falar no canal de voz!',
            );
            return channel.send({ embeds: [embed] });
        }

        const search = args.join(' ');
        const pattern = /^.*(youtu.be\/|list=)([^#&?]*).*/gi;
        const url = args[0];
        const urlValid = pattern.test(args[0]);
        const regex = /[?&]list=([^&#]+)/;
        const match = url.match(regex);
        const playlistId = match ? match[1] : null;
        const songs: Song[] = [];
        const videos: any[] = [];
        const max_playlist_size = Number(process.env.MAX_PLAYLIST_SIZE) || 10;
        if (urlValid && playlistId) {
            try {
                const playlistItems = await youtube.playlistItems.list({
                    playlistId: playlistId,
                    part: ['snippet', 'contentDetails'],
                    maxResults: max_playlist_size,
                });
                for (const item of playlistItems.data.items || []) {
                    songs.push({
                        title: item.snippet?.title || 'Desconhecido',
                        url: `https://www.youtube.com/watch?v=${item.contentDetails?.videoId}`,
                        originalUrl: `https://www.youtube.com/watch?v=${item.contentDetails?.videoId}`,
                        duration: 0,
                        authorId: message.author.id,
                        authorName: message.author.username
                    });
                }
            } catch {
                embed.setDescription('Playlist não encontrada');
                return channel.send({ embeds: [embed] });
            }
        }
        else {
            try {
                const results = await youtube.search.list({
                    q: search,
                    part: ['snippet'],
                    type: ['playlist'],
                });
                const playlist = results.data.items?.shift();
                if (!playlist) {
                    embed.setDescription('Playlist não encontrada');
                    return channel.send({ embeds: [embed] });
                }
                const playlistId = playlist.id?.playlistId;
                if (!playlistId) {
                    embed.setDescription('Playlist não encontrada');
                    return channel.send({ embeds: [embed] });
                }
                const playlistItems = await youtube.playlistItems.list({
                    playlistId: playlistId,
                    part: ['snippet', 'contentDetails'],
                    maxResults: max_playlist_size || 10,
                });
                for (const item of playlistItems.data.items || []) {
                    songs.push({
                        title: item.snippet?.title || 'Desconhecido',
                        url: `https://www.youtube.com/watch?v=${item.contentDetails?.videoId}`,
                        originalUrl: `https://www.youtube.com/watch?v=${item.contentDetails?.videoId}`,
                        duration: 0,
                        authorId: message.author.id,
                        authorName: message.author.username
                    });
                }
            } catch (error) {
                embed.setDescription('Playlist não encontrada');
                return channel.send({ embeds: [embed] });
            }
        }
        const { queues } = message.client as AndriaClient;
        const queue = queues.get(message.guildId);
        for (
            let i = 0;
            i < videos.length && i < max_playlist_size;
            i++
        ) {
            if (i >= max_playlist_size) break;
            const video = videos[i];
            songs.push({
                title: video.title,
                url: video.url,
                originalUrl: video.url,
                duration: video.durationSeconds,
                authorId: message.author.id,
                authorName: message.author.username
            });
        }
        embed.setDescription(
            `✅**${Math.min(songs.length, max_playlist_size)}** músicas foram adicionadas à playlist por **${message.author.username}**`,
        );
        channel.send({ embeds: [embed] });
        if (queue) {
            queue.songs.push(...songs);
            return;
        }
        const queueConstruct: Queue = {
            textChannel: channel,
            voiceChannel: voiceChannel,
            connection: joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator:
                    voiceChannel.guild.voiceAdapterCreator,
                selfDeaf: true,
            }),
            songs: [],
            loop: false,
            volume: 100,
            playing: false,
        };
        queueConstruct.songs.push(...songs);
        client.queues.set(message.guildId, queueConstruct);
        try {
            queueConstruct.connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator:
                    voiceChannel.guild.voiceAdapterCreator,
                selfDeaf: true,
            });
            player(queueConstruct.songs[0], message, channel);
        } catch (error) {
            client.queues.delete(message.guildId);
            return message.channel.send(
                `Não consegui conectar ao canal: ${error}`,
            );
        }
    },
};
