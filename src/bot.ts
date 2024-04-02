import {
    ActivityType,
    BaseGuildTextChannel,
    Client,
    GatewayIntentBits
} from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import db from './database/db';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
    ],
}) as AndriaClient;

client.prefix = new Map();
client.commands = new Map();
client.queues = new Map();
const commandFiles = fs.readdirSync(
    path.join(__dirname, 'commands'),
    { withFileTypes: true },
);

for (const file of commandFiles) {
    const filePath = path.join(__dirname, 'commands', file.name);
    const fileStats = fs.lstatSync(filePath);

    if (fileStats.isDirectory()) {
        const files = fs.readdirSync(filePath);
        files.forEach((file) => {
            if (file.endsWith('.ts')) {
                const { command } = require(path.join(filePath, file));
                client.commands.set(
                    command.name,
                    command,
                );
            }
        });
    } else if (fileStats.isFile() && file.name.endsWith('.ts')) {
        const { command } = require(filePath);
        client.commands.set(command.name, command);
    }
}

client.login(process.env.BOT_TOKEN as string);

client.on('ready', async () => {
    client.user?.setActivity('', { type: ActivityType.Custom, state: 'Ajuda: !help' });
    await db.migrate.latest();
    client.guilds.cache.forEach(async (guild) => {
        const dbguild = await db
            .select('*')
            .from('Guild')
            .where('Id', guild.id)
            .first();
        if (!dbguild) {
            await db
                .insert({ id: guild.id, name: guild.name })
                .into('Guild');
            client.prefix.set(guild.id, '!');
        } else {
            client.prefix.set(guild.id, dbguild.prefix ?? '!');
        }
    });
});

client.on('messageCreate', async (message) => {
    if(message.guildId === null) return;
    if(message.author.bot) return;
    const prefix = client.prefix.get(message.guildId) ?? '!';

    if (
        !message.content.startsWith(prefix)
    ) {
        return;
    }

    const args = message.content
        .slice(prefix.length)
        .trim()
        .split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;
    const command: Command | undefined =
        client.commands.get(commandName) ||
        Array.from(client.commands.values()).find(
            (cmd) => cmd.aliases && cmd.aliases.includes(commandName),
        );
    if (!command) return;
    const { channelTextId } = await db
        .select('channelTextId')
        .from('Guild')
        .where('Id', message.guild?.id)
        .first();
    let channel: BaseGuildTextChannel =
        message.channel as BaseGuildTextChannel;
    if (
        channelTextId &&
        message.channel.id !== channelTextId.channelTextId
    ) {
        channel =
            ((await message.guild?.channels.fetch(
                channelTextId.channelTextId,
            )) as BaseGuildTextChannel) ??
            (message.channel as BaseGuildTextChannel);
        await message.delete();
    }
    try {
        command.execute(channel, message, args);
    } catch (error: unknown) {
        message.channel.send(
            'There was an error trying to execute that command!',
        );
    }
});
