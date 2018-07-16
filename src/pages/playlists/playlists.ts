import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AudioPlaylist } from '../../models/audio-playlist';
import { AudioApiProvider } from '../../providers/audio-api/audio-api';
import { AudioPlayerInfo } from '../../models/audio-player-info';

@Component({
    selector: 'page-playlists',
    templateUrl: 'playlists.html'
})
export class PlaylistsPage {
    public playlists: AudioPlaylist[];
    public currentPlaylistName: string;

    constructor(
        public navCtrl: NavController,
        private audioApi: AudioApiProvider) { }

    ionViewDidLoad() {
        this.audioApi
            .getPlaylists()
            .then((playlists: AudioPlaylist[]) => {
                this.playlists = playlists;

                this.audioApi
                    .getAudioPlayerInfo()
                    .then((playerInfo: AudioPlayerInfo) => {
                        this.currentPlaylistName = playerInfo.currentPlaylistName;
                    });
            });
    }

    public playlistClicked(playlist: AudioPlaylist): void {
        this.currentPlaylistName = playlist.name;
        this.audioApi.setPlaylist(playlist);
    }
}
