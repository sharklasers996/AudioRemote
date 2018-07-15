export class AudioPlayerInfo {
    path: string;
    artist: string;
    track: string;
    currentPosition: number;
    duration: number;
    volume: number;
    playingOrder: number;
    currentPositionString: string = '00:00';
    durationString: string = '00:00';
    isPaused: boolean;
}
