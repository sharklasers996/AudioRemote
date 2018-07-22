import { AudioPlaylist } from "./audio-playlist";
import { PlayingOrder } from "../enums/playing-order";

export class AudioPlayerInfo {
    path: string;
    artist: string;
    track: string;
    currentPosition: number;
    duration: number;
    playingOrder: PlayingOrder;
    currentPositionString: string = '00:00';
    durationString: string = '00:00';
    isPaused: boolean;
    volume: number;
    currentPlaylist: AudioPlaylist;

    constructor() { }
}
