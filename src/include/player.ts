import {
    AudioPlayerStatus,
    StreamType,
    VoiceConnectionStatus,
    createAudioPlayer,
    createAudioResource,
} from '@discordjs/voice';
import {
    BaseGuildTextChannel,
    EmbedBuilder,
    Message,
} from 'discord.js';
import ytdlDiscord from 'ytdl-core-discord';
import { formatDuration } from '../util/formatDuration';
import { getEmbedMessage } from '../util/embedBuilder';

export const player = async (
    song: Song,
    message: Message,
    channel: BaseGuildTextChannel,
) => {
    const client = message.client as AndriaClient;
    const guildId = message.guild?.id;
    const embed = getEmbedMessage('Tocando agora ♪', `**${song?.title}**`);
    if (!guildId) return;
    const queue: Queue | undefined = client.queues.get(guildId);
    if (!queue) {
        return channel.send('Não há nada tocando');
    }
    if (!song) {
        client.queues.delete(message.guild.id);
        embed.setDescription('🚫 Acabou a playlist');
        await channel.send({ embeds: [embed] });
    }
    if (!queue) return;
    let stream = null;
    
    try {
        if (song.url.includes('youtube.com')) {
            stream = await ytdlDiscord(song.url, {
                highWaterMark: 1 << 25,
            });
        }
    } catch (error: any) {
        if (queue) {
            queue.songs.shift();
            module.exports.player(queue.songs[0], message);
        }
        embed.setDescription('Erro ao tocar a música');
        return channel.send({ embeds: [embed] });
    }
    embed
        .addFields(
            {
                name: 'Requisitado por',
                value: song.authorName,
                inline: true,
            }, // Nome do solicitante
            {
                name: 'Duração',
                value: formatDuration(song.duration),
                inline: true,
            }, // Duração da música
        )
        .setTimestamp(); // Opcional: adiciona um timestamp ao embed

    // Enviar a mensagem embed no canal de texto da queue
    const playingMessage = await queue.textChannel.send({
        embeds: [embed],
    });
    await playingMessage.react('⏭');
    await playingMessage.react('⏯');
    await playingMessage.react('🔁');
    await playingMessage.react('⏹');
    const collector = playingMessage.createReactionCollector();
    if (!queue.player) queue.player = createAudioPlayer();
    const resource = createAudioResource(stream!, {
        inputType: StreamType.Opus,
    });
    queue.connection.subscribe(queue.player);
    queue.player.play(resource);
    queue.player.off(AudioPlayerStatus.Idle, async () => {});
    queue.player.on(AudioPlayerStatus.Idle, async () => {
        await playingMessage.delete();
        const song = queue.songs.shift();
        if(queue.loop && song) queue.songs.push(song);
        if (collector) {
            collector.stop();
        }
        module.exports.player(queue.songs[0], message, channel);
    });
    queue.player.on('error', async () => {
        await playingMessage.delete();
        const song = queue.songs.shift();
        if(queue.loop && song) queue.songs.push(song);
        if (collector) {
            collector.stop();
        }
        module.exports.player(queue.songs[0], message, channel);
    });
    queue.connection.on(VoiceConnectionStatus.Disconnected, async () => {
        queue.songs = [];
        queue.player?.stop();
        queue.connection.destroy();
        client.queues.delete(guildId);
        await playingMessage.delete();
    });
    collector.on('collect', async (reaction, user) => {
        if (!queue?.player) return;
        if(user.bot) return;
        await reaction.users.remove(user);
        switch (reaction.emoji.name) {
            case '⏭':
                queue.player.stop();
                collector.stop();
                break;
            case '⏯':
                if (
                    queue.player.state.status ===
                    AudioPlayerStatus.Paused
                ) {
                    queue.player.unpause();
                } else {
                    queue.player.pause();
                }
                break;
            case '🔁':
                queue.loop = !queue.loop;
                
                queue.textChannel.send({ embeds: [
                    new EmbedBuilder()
                        .setColor(queue.loop ? 0x00ff00 : 0xff0000) // Verde para ligado, Vermelho para desligado
                        .setTitle('🔁 Repetição de Música')
                        .setDescription(
                            `A repetição agora está ${queue.loop ? '**Ligada**' : '**Desligada**'}`,
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Música Loop Status' })
                ] });
                break;
            case '⏹':
                collector.stop();    
                await playingMessage.delete();
                queue.songs = [];
                queue.player.stop();
                queue.connection.destroy();
                client.queues.delete(guildId);
                break;
        }
    });
    
};
