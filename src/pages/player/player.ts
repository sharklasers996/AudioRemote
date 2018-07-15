import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AudioApiProvider } from '../../providers/audio-api/audio-api';
import { SettingsApiProvider } from '../../providers/settings-api/settings-api';
import { SettingsKey } from '../../Enums/settings-key.enum';
import { AudioFile } from '../../models/audio-file';
import { AudioDataChangeServiceProvider } from '../../providers/audio-data-change-service/audio-data-change-service';
import { AudioPlaylist } from '../../models/audio-playlist';
import { AudioPlayerInfo } from '../../models/audio-player-info';

@Component({
    selector: 'page-player',
    templateUrl: 'player.html'
})
export class PlayerPage {
    public playlistFiles: AudioFile[];
    public playerInfo: AudioPlayerInfo = new AudioPlayerInfo();
    public currentPlaylist: AudioPlaylist;

    constructor(
        public navCtrl: NavController,
        private audioApi: AudioApiProvider,
        private settingsApi: SettingsApiProvider,
        private audioDataChangeService: AudioDataChangeServiceProvider) { }

    ionViewDidLoad() {
        this.audioDataChangeService
            .playlistChanged
            .subscribe(playlist => this.playlistChanged(playlist));

        this.audioDataChangeService
            .audioPlayerInfoChanged
            .subscribe(playerInfo => {
                this.playerInfo = playerInfo;
            });

        this.settingsApi
            .getSettingValue(SettingsKey.LastAudioPlaylist)
            .then((playlist: AudioPlaylist) => {
                this.audioDataChangeService.onPlaylistChanged(playlist);
            })
    }

    private playlistChanged(playlist: AudioPlaylist): void {
        this.currentPlaylist = playlist;

        this.audioApi
            .getPlaylistFiles(playlist)
            .then(files => {
                this.playlistFiles = files;
            });
    }
}
