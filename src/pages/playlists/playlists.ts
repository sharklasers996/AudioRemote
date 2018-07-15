import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AudioPlaylist } from '../../models/audio-playlist';
import { AudioApiProvider } from '../../providers/audio-api/audio-api';
import { SettingsApiProvider } from '../../providers/settings-api/settings-api';
import { SettingsKey } from '../../enums/settings-key.enum';
import { AudioDataChangeServiceProvider } from '../../providers/audio-data-change-service/audio-data-change-service';

@Component({
    selector: 'page-playlists',
    templateUrl: 'playlists.html'
})
export class PlaylistsPage {
    public playlists: AudioPlaylist[];
    public currentPlaylist: AudioPlaylist;

    constructor(
        public navCtrl: NavController,
        private audioApi: AudioApiProvider,
        private settingsApi: SettingsApiProvider,
        private audioDataChangeService: AudioDataChangeServiceProvider) { }

    ionViewDidLoad() {
        this.audioApi
            .getPlaylists()
            .then((playlists: AudioPlaylist[]) => {
                this.playlists = playlists;
            });

        this.settingsApi
            .getSettingValue(SettingsKey.LastAudioPlaylist)
            .then((playlist: AudioPlaylist) => {
                this.currentPlaylist = playlist;
            });
    }

    public playlistClicked(playlist: AudioPlaylist): void {
        this.currentPlaylist = playlist;

        this.audioDataChangeService.onPlaylistChanged(playlist);
        this.settingsApi.updateSettingValue(SettingsKey.LastAudioPlaylist, playlist);
        this.audioApi.setPlaylist(playlist);
    }
}
