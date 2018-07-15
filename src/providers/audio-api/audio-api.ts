import { Injectable } from '@angular/core';
import { HttpClientWithLoader } from '../../utils/http-client-with-loader';
import { LoadingController } from 'ionic-angular/umd';
import { AudioPlaylist } from '../../models/audio-playlist';
import { AudioFile } from '../../models/audio-file';
import { AudioPlayerInfo } from '../../models/audio-player-info';

@Injectable()
export class AudioApiProvider {
  private playerInfoTrackerApiUrl: string = '/api/PlayerInfoTrackerApi';
  private audioApiUrl: string = '/api/AudioApi';

  constructor(public http: HttpClientWithLoader) { }

  public addLoadingController(loadingCtrl: LoadingController) {
    this.http.addLoadingController(loadingCtrl);
  }

  public getAudioPlayerInfo(): Promise<AudioPlayerInfo> {
    return this.http
      .get<AudioPlayerInfo>(`${this.playerInfoTrackerApiUrl}/GetAudioPlayerInfo`)
      .then(playerInfo => {
        return playerInfo;
      });
  }

  public getPlaylists(): Promise<AudioPlaylist[]> {
    return this.http
      .get<AudioPlaylist[]>(`${this.audioApiUrl}/GetPlaylists`, 'Getting Playlists')
      .then(result => {
        return result;
      });
  }

  public getPlaylistFiles(playlist: AudioPlaylist): Promise<AudioFile[]> {
    return this.http
      .post<AudioFile[]>(`${this.audioApiUrl}/GetPlaylistFiles`, playlist)
      .then(files => {
        return files;
      });
  }
}
