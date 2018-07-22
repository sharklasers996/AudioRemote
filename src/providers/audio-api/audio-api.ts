import { Injectable } from '@angular/core';
import { HttpClientWithLoader } from '../../utils/http-client-with-loader';
import { LoadingController } from 'ionic-angular';
import { AudioPlaylist } from '../../models/audio-playlist';
import { AudioFile } from '../../models/audio-file';
import { AudioPlayerInfo } from '../../models/audio-player-info';
import { Environment } from '../../constants/environment';
import { MediaDirectory } from '../../models/media-directory';
import { MediaFile } from '../../models/media-file';
import { PlayingOrder } from '../../enums/playing-order';

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

  public setPlayingOrder(order: PlayingOrder): Promise<any> {
    return this.http
      .post(`${this.audioApiUrl}/SetPlayingOrder`, order);
  }

  public getPlaylists(): Promise<AudioPlaylist[]> {
    return this.http
      .get<AudioPlaylist[]>(`${this.audioApiUrl}/GetPlaylists`)
      .then(result => {
        return result;
      });
  }

  public setPlaylist(playlist: AudioPlaylist): Promise<any> {
    return this.http
      .post(`${this.audioApiUrl}/SetPlaylist`, playlist);
  }

  public addOrRemoveFromQueue(file: AudioFile): Promise<any> {
    return this.http
      .post(`${this.audioApiUrl}/AddOrRemoveFileFromAutoQueue`, file);
  }

  public getCurrentPlaylistFiles(): Promise<AudioFile[]> {
    return this.http
      .get<AudioFile[]>(`${this.audioApiUrl}/GetCurrentPlaylistFiles`, 'Getting Playlist')
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

  public deleteMediaFiles(files: MediaFile[], directories: MediaDirectory[]): Promise<any> {
    return this.http
      .post(`${this.audioApiUrl}/DeleteMediaFiles`,
        {
          files: files,
          directories: directories
        });
  }

  public addFilesToPlaylist(files: MediaFile[], directories: MediaDirectory[], playlist: AudioPlaylist): Promise<any> {
    return this.http
      .post(
        `${this.audioApiUrl}/AddFilesToPlaylist`,
        {
          playlist: playlist,
          files: files,
          directories: directories
        }, 'Adding');
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

  public addPlaylist(name: string): Promise<any> {
    return this.http
      .post(
        `${this.audioApiUrl}/AddPlaylist`,
        {
          value: name
        }
      );
  }

  public deletePlaylist(playlist: AudioPlaylist): Promise<any> {
    return this.http
      .post(`${this.audioApiUrl}/DeletePlaylist`, playlist);
  }

  public setPlaylistCombo(playlists: AudioPlaylist[]): Promise<any> {
    return this.http
      .post(
        `${this.audioApiUrl}/SetPlaylistCombo`,
        {
          value: playlists
        });
  }

  public setPlaylistComboSongCount(count: number): Promise<void> {
    return this.http
      .post(
        `${this.audioApiUrl}/SetPlaylistComboSongCount`,
        {
          value: count
        });
  }

  public getPlaylistComboSongCount(): Promise<number> {
    return this.http
      .get<number>(`${this.audioApiUrl}/GetPlaylistComboSongCount`)
      .then((count: number) => {
        return count;
      });
  }
}
