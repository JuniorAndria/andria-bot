declare module 'simple-youtube-api' {
    export default class YouTubeAPI {
        constructor(key: string);
        searchVideos(query: string, limit: number): Promise<any>;
    }
}