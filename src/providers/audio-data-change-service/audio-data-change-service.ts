import { Injectable, Output, EventEmitter } from '@angular/core';
import { AudioPlaylist } from '../../models/audio-playlist';
import { AudioApiProvider } from '../audio-api/audio-api';
import { AudioPlayerInfo } from '../../models/audio-player-info';

@Injectable()
export class AudioDataChangeServiceProvider {
  @Output()
  public playlistChanged: EventEmitter<AudioPlaylist> = new EventEmitter();

  @Output()
  public audioPlayerInfoChanged: EventEmitter<AudioPlayerInfo> = new EventEmitter();

  constructor(private audioApi: AudioApiProvider) {
    this.monitorAudioPlayerInfo();
  }

  public onPlaylistChanged(playlist?: AudioPlaylist): void {
    this.playlistChanged.emit(playlist);
  }

  private monitorAudioPlayerInfo(): void {
    this.audioApi
      .getAudioPlayerInfo()
      .then(audioPlayerInfo => {
        this.audioPlayerInfoChanged.emit(audioPlayerInfo);

        setTimeout(() => { this.monitorAudioPlayerInfo(); }, 1000);
      });
  }
}
