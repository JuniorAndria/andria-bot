# AndriaBot

AndriaBot is a Discord bot written in TypeScript (TS) that allows users to listen to music.

## Features

- Play music and videos from YouTube.
- Play music from Spotify.
- Pause, resume, and skip tracks.
- Shuffle the playlist.
- Clear the playlist.
- Loop the current track or the entire playlist.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/JuniorAndria/andria-bot.git
    ```

2. Install the dependencies using either Yarn or npm:

    ```bash
    # Using Yarn
    yarn install

    # Using npm
    npm install
    ```

3. Configure the bot token:
    - Create a new Discord application and bot on the [Discord Developer Portal](https://discord.com/developers/applications).
    - Copy the bot token.
    - Add the following line to the `.env` file, replacing `<YOUR_BOT_TOKEN>` with your actual bot token:

      ```plaintext
      BOT_TOKEN=<YOUR_BOT_TOKEN>
      ```

4. Configure the YouTube API key:
    - Create a new project on the [Google Cloud Console](https://console.cloud.google.com/).
    - Enable the YouTube Data API v3 for your project.
    - Generate an API key.
    - Add the following line to the `.env` file, replacing `<YOUR_YOUTUBE_API_KEY>` with your actual API key:

      ```plaintext
      YOUTUBE_API_KEY=<YOUR_YOUTUBE_API_KEY>
      ```

5. Configure Spotify integration:
    - Create a new Spotify application on the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).
    - Copy the Client ID and Client Secret.
    - Add the following lines to the `.env` file, replacing `<YOUR_CLIENT_ID>` and `<YOUR_CLIENT_SECRET>` with your actual credentials:

      ```plaintext
      SPOTIFY_CLIENT_ID=<YOUR_CLIENT_ID>
      SPOTIFY_CLIENT_SECRET=<YOUR_CLIENT_SECRET>
      ```

6. Configure the maximum playlist size:
    - Add the following line to the `.env` file, replacing `<SIZE>` with your preferred maximum playlist size:

      ```plaintext
      MAX_PLAYLIST_SIZE=<SIZE>
      ```

7. Run the bot:
    ```bash
    # Using Yarn
    yarn start

    # Using npm
    npm start
    ```

8. Invite the bot to your Discord server:

    - Follow the steps in the Discord Developer Portal to generate an invite link with the necessary permissions.
    - Open the generated invite link in your web browser to authorize the bot and add it to your server.

9. Use the following commands in your Discord server to interact with the bot:

    - Detailed command usage.

## Contributing

Contributions are welcome! If you have any suggestions or improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
