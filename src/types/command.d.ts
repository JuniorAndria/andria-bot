import { BaseGuildTextChannel, Message } from 'discord.js';

declare global {
    type Command = {
        name: string;
        cooldown: number;
        aliases: string[];
        description: string;
        execute: (
            channel: BaseGuildTextChannel,
            message: Message,
            args?: string[],
        ) => Promise<void | Message<boolean> | undefined>;
    };
}
