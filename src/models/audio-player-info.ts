export interface AudioPlayerInfo {
    path: string;
    artist: string;
    track: string;
    currentPosition: number;
    duration: number;
    volume: number;
    playingOrder: number;
    currentPositionString: string;
    durationString: string;
    isPaused: boolean;
}
