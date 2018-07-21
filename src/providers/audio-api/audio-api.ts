import { Injectable } from '@angular/core';
import { HttpClientWithLoader } from '../../utils/http-client-with-loader';
import { LoadingController } from 'ionic-angular/umd';
import { AudioPlaylist } from '../../models/audio-playlist';
import { AudioFile } from '../../models/audio-file';
import { AudioPlayerInfo } from '../../models/audio-player-info';
import { Environment } from '../../constants/environment';

@Injectable()
export class AudioApiProvider {
  private playerInfoTrackerApiUrl: string = Environment.ApiUrl + '/api/PlayerInfoTrackerApi';
  private audioApiUrl: string = Environment.ApiUrl + '/api/AudioApi';

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

  public setPlaylist(playlist: AudioPlaylist): void {
    this.http
      .post(`${this.audioApiUrl}/SetPlaylist`, playlist);
  }

  public addOrRemoveFromQueue(file: AudioFile): Promise<any> {
    return this.http
      .post(`${this.audioApiUrl}/AddOrRemoveFileFromAutoQueue`, file);
  }

  public getCurrentPlaylistFiles(): Promise<AudioFile[]> {
    return this.http
      .get<AudioFile[]>(`${this.audioApiUrl}/GetCurrentPlaylistFiles`)
      .then((files: AudioFile[]) => {
        return files;
      });
  }

  public playFile(file: AudioFile): void {
    this.http
      .post(`${this.audioApiUrl}/PlayFile`, file);
  }

  public getQueue(): Promise<AudioFile[]> {
    return this.http
      .get<AudioFile[]>(`${this.audioApiUrl}/GetQueue`)
      .then((files: AudioFile[]) => {
        return files;
      })
  }

  public deleteFiles(files: AudioFile[]): Promise<any> {
    return this.http
      .post(`${this.audioApiUrl}/DeleteFiles`, files);
  }

  public removeFileFromPlaylist(files: AudioFile[], playlist: AudioPlaylist): Promise<any> {
    return this.http
      .post(
        `${this.audioApiUrl}/RemoveFilesFromPlaylist`,
        {
          playlist: playlist,
          files: files
        });
  }
}
