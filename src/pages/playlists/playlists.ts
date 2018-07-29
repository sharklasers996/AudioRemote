import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController, ActionSheetController, LoadingController, FabContainer } from 'ionic-angular';
import { AudioPlaylist } from '../../models/audio-playlist';
import { AudioApiProvider } from '../../providers/audio-api/audio-api';
import { AudioPlayerInfo } from '../../models/audio-player-info';
import { Toaster } from '../../utils/toaster';
import { DeviceFeedback } from '@ionic-native/device-feedback';

@Component({
    selector: 'page-playlists',
    templateUrl: 'playlists.html'
})
export class PlaylistsPage {
    public playlists: AudioPlaylist[];
    public currentPlaylist: AudioPlaylist;

    public playlistComboEditing: boolean = false;
    private lastToggleForSetAllInComboPlaylist: boolean = false;

    public songCountPerPlaylistInCombo: number;

    @ViewChild('playlistComboFab') playlistComboFab: FabContainer;

    constructor(
        public navCtrl: NavController,
        private audioApi: AudioApiProvider,
        private alertCtrl: AlertController,
        private toaster: Toaster,
        private actionSheetCtrl: ActionSheetController,
        private deviceFeedback: DeviceFeedback,
        loadingCtrl: LoadingController) {
        this.audioApi.addLoadingController(loadingCtrl);
    }

    ionViewDidLoad() {
        this.getPlaylists();
        this.getSongCountPerPlaylistInCombo()
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

    private getSongCountPerPlaylistInCombo(): void {
        this.audioApi
            .getPlaylistComboSongCount()
            .then((count: number) => {
                this.songCountPerPlaylistInCombo = count;
            })
    }

    public playlistClicked(playlist: AudioPlaylist): void {
        this.haptic();
        if (this.playlistComboEditing) {
            playlist.inPlaylistCombo = !playlist.inPlaylistCombo;
            return;
        }

        this.currentPlaylist = playlist;
        this.audioApi.setPlaylist(playlist);
    }

    public playlistLongClick(playlist: AudioPlaylist, event: any) {
        this.haptic();
        this.openPlaylistMenu(playlist);
    }

    private openPlaylistMenu(playlist: AudioPlaylist): void {
        let playlistMenu = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Delete',
                    icon: 'trash',
                    handler: () => {
                        this.haptic();
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
                        this.haptic();
                        this.audioApi
                            .addPlaylist(data.playlistName)
                            .then(() => {
                                this.getPlaylists();
                                this.toaster.showToast(`Added '${data.playlistName}' playlist`);
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
                this.toaster.showToast(`Deleted '${playlist.name}' playlist`);
            });
    }

    public togglePlaylistComboEditing(): void {
        this.haptic();
        if (this.playlistComboEditing) {
            this.savePlaylistCombo();
            this.playlistComboEditing = false;
            this.playlistComboFab.close();
        }
        else {
            this.playlistComboEditing = true;
        }
    }

    public closePlaylistComboFab(): void {
        this.haptic();
        this.playlistComboEditing = false;
        this.playlistComboFab.close();
    }

    public toggleSetAllInPlaylistCombo(): void {
        this.haptic();
        this.lastToggleForSetAllInComboPlaylist = !this.lastToggleForSetAllInComboPlaylist;

        this.playlists.forEach(playlist => {
            playlist.inPlaylistCombo = this.lastToggleForSetAllInComboPlaylist;
        });
    }

    public savePlaylistCombo(): void {
        let playlistsInCombo = this.playlists.filter(playlist => playlist.inPlaylistCombo);

        this.audioApi
            .setPlaylistCombo(playlistsInCombo)
            .then(() => {
                this.toaster.showToast('Playlist Combo Saved');
                this.closePlaylistComboFab();
            });
    }

    public showChangeSongCountPerPlaylistInComboMenu(): void {
        this.haptic();
        let prompt = this.alertCtrl.create({
            title: 'Change Song Count',
            subTitle: 'Current: ' + this.songCountPerPlaylistInCombo,
            inputs: [
                {
                    name: 'count',
                    placeholder: 'Count'
                },
            ],
            buttons: [
                {
                    text: 'Change',
                    handler: data => {
                        this.haptic();
                        this.songCountPerPlaylistInCombo = data.count;
                        this.audioApi
                            .setPlaylistComboSongCount(data.count)
                            .then(() => {
                                this.toaster.showToast(`Changed song count to ${data.count}`);
                                this.closePlaylistComboFab();
                            });
                    }
                }
            ]
        });
        prompt.present();
    }

    private haptic(): void {
        this.deviceFeedback.haptic(0);
    }
}
