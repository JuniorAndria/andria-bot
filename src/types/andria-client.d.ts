import { BaseGuildVoiceChannel, Client } from 'discord.js';

declare global {
    type AndriaClient = Client & {
        commands: Map<string, Command>;
        prefix: Map<string, string>;
        queues: Map<string, Queue>;
        channel: BaseGuildVoiceChannel;
    };
}