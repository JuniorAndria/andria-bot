import { Message, BaseGuildTextChannel } from 'discord.js';
import ytdl from 'ytdl-core';
import ytSearch from 'yt-search';
import { joinVoiceChannel } from '@discordjs/voice';
import { player } from '../../include/player';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { getEmbedMessage } from '../../util/embedBuilder';
const spotifyApi = SpotifyApi.withClientCredentials(
    process.env.SPOTIFY_CLIENT_ID as string,
    process.env.SPOTIFY_CLIENT_SECRET as string,
);
export const command: Command = {
    name: 'play',
    cooldown: 5,
    aliases: ['p'],
    description: 'Tocar música em um canal de voz',
    execute: async (
        channel: BaseGuildTextChannel,
        message: Message,
        args?: string[],
    ): Promise<void | Message<boolean>> => {
        if (!message.guildId) return;
        const embed = getEmbedMessage('Adiciona Música', 'Adiciona uma música à playlist');
        if(!args) {
            embed.setDescription('Você precisa informar o nome da música ou o link dela');
            return channel.send({ embeds: [embed] });
        }
        const voiceChannel = message.member?.voice.channel;
        if (!voiceChannel) {
            embed.setDescription('Você precisa estar em um canal de voz para tocar música!');
            return channel.send({ embeds: [embed] });
        }
        const client = message.client as AndriaClient;
        const permissions = voiceChannel.permissionsFor(
            message.client.user!,
        );
        if (!permissions?.has(['Connect', 'Speak'])) {
            embed.setDescription('Preciso de permissão para conectar e falar no canal de voz!');
            return channel.send({ embeds: [embed] });
        }
        const search = args.join(' ');
        const videoYTPattern =
            /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
        const videoSPattern =
            /^(https?:\/\/)?(www\.)?(open\.)?(spotify\.com)\/.+$/gi;
        const playlistPattern = /list=/gi;
        const url = args[0];
        const urlYTValid = videoYTPattern.test(args[0]);
        const urlSValid = videoSPattern.test(args[0]);
        if (playlistPattern.test(args[0])) {
            return client.commands
                ?.get('playlist')
                ?.execute(channel, message, args);
        }

        let songInfo = null;
        let song: Song | null = null;

        if (urlYTValid) {
            try {
                songInfo = await ytdl.getInfo(url);
                song = {
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                    originalUrl: songInfo.videoDetails.video_url,
                    duration: Number(
                        songInfo.videoDetails.lengthSeconds,
                    ),
                    authorId: message.author.id,
                    authorName: message.author.username,
                    picture: songInfo.videoDetails.thumbnails[0].url,
                };
            } catch (error: any) {
                return message.reply(error.message);
            }
        } else if (urlSValid) {
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];
            try {
                const info = await spotifyApi.tracks.get(id);
                if (info.type === 'track') {
                    const { videos } = await ytSearch(info.name);
                    const video = videos[0];
                    songInfo = await ytdl.getInfo(video.url);
                    song = {
                        title: info.name,
                        url: songInfo.videoDetails.video_url,
                        originalUrl: info.uri,
                        duration: Number(
                            songInfo.videoDetails.lengthSeconds,
                        ),
                        authorId: message.author.id,
                        authorName: message.author.username,
                        picture: info.album.images[0].url,
                    };
                }
            } catch (error: any) {
                return message.reply(error.message);
            }
        } else {
            try {
                const { videos } = await ytSearch(search);
                const video = videos[0];
                songInfo = await ytdl.getInfo(video.url);
                song = {
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                    originalUrl: songInfo.videoDetails.video_url,
                    duration: Number(
                        songInfo.videoDetails.lengthSeconds,
                    ),
                    authorId: message.author.id,
                    authorName: message.author.username,
                    picture: songInfo.videoDetails.thumbnails[0].url,
                };
            } catch (error: any) {
                return message.reply(error.message);
            }
        }
        if (!song) return;
        const queue = client.queues.get(message.guildId);
        if (queue) {
            queue.songs.push(song);
            embed.setDescription(
                `✅**${song.title}** foi adicionado à playlist por **${message.author.username}**`,
            );
            return channel.send({ embeds: [embed] });
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

        queueConstruct.songs.push(song);
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
