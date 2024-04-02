export const formatDuration = (durationSeconds: number) => {
    const seconds = Math.floor(durationSeconds % 60);
    const minutes = Math.floor((durationSeconds / 60) % 60);
    const hours = Math.floor(durationSeconds / 3600); // Adicionando suporte para horas, se necessário

    const formattedSeconds =
        seconds < 10 ? `0${seconds}` : `${seconds}`;
    const formattedMinutes =
        minutes < 10 ? `0${minutes}` : `${minutes}`;
    // Você pode incluir horas no formato, se necessário
    const formattedHours = hours > 0 ? `${hours}:` : '';

    return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
};
