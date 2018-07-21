import { Component } from '@angular/core';
import { NavController, AlertController, ToastController, ActionSheetController } from 'ionic-angular';
import { AudioPlaylist } from '../../models/audio-playlist';
import { AudioApiProvider } from '../../providers/audio-api/audio-api';
import { AudioPlayerInfo } from '../../models/audio-player-info';

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
        private alertCtrl: AlertController,
        private toastCtrl: ToastController,
        private actionSheetCtrl: ActionSheetController) { }

    ionViewDidLoad() {
        this.getPlaylists();
    }

    private getPlaylists(): void {
        this.audioApi
            .getPlaylists()
            .then((playlists: AudioPlaylist[]) => {
                this.playlists = playlists;

                this.audioApi
                    .getAudioPlayerInfo()
                    .then((playerInfo: AudioPlayerInfo) => {
                        this.currentPlaylist = playerInfo.currentPlaylist;
                    });
            });
    }

    public playlistClicked(playlist: AudioPlaylist): void {
        this.currentPlaylist = playlist;
        this.audioApi.setPlaylist(playlist);
    }

    public playlistLongClick(playlist: AudioPlaylist, event: any) {
        this.openPlaylistMenu(playlist);
    }

    private openPlaylistMenu(playlist: AudioPlaylist): void {
        let playlistMenu = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Delete',
                    icon: 'trash',
                    handler: () => {
                        this.deletePlaylist(playlist);
                    }
                }
            ]
        });

        playlistMenu.present();
    }

    public showAddPlaylistMenu(): void {
        let prompt = this.alertCtrl.create({
            title: 'Add Playlist',
            inputs: [
                {
                    name: 'playlistName',
                    placeholder: 'Name'
                },
            ],
            buttons: [
                {
                    text: 'Add',
                    handler: data => {
                        this.audioApi
                            .addPlaylist(data.playlistName)
                            .then(() => {
                                this.getPlaylists();
                                this.showToast(`Added '${data.playlistName}' playlist`);
                            });
                    }
                }
            ]
        });
        prompt.present();
    }

    public deletePlaylist(playlist: AudioPlaylist): void {
        this.audioApi
            .deletePlaylist(playlist)
            .then(() => {
                this.getPlaylists();
                this.showToast(`Deleted '${playlist.name}' playlist`);
            });
    }

    private showToast(message: string): void {
        let toast = this.toastCtrl.create({
            message: message,
            duration: 2000,
            position: 'top'
        });

        toast.present();
    }
}
