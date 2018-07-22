import { Injectable, Output, EventEmitter } from '@angular/core';
import { AudioApiProvider } from '../audio-api/audio-api';
import { AudioPlayerInfo } from '../../models/audio-player-info';

@Injectable()
export class AudioDataChangeServiceProvider {
  @Output()
  public playlistFilesChanged: EventEmitter<any> = new EventEmitter();

  @Output()
  public audioPlayerInfoChanged: EventEmitter<AudioPlayerInfo> = new EventEmitter();

  constructor(private audioApi: AudioApiProvider) {
    this.monitorAudioPlayerInfo();
  }

  public onPlaylistFilesChanged(): void {
    this.playlistFilesChanged.emit();
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
