import { Component } from '@angular/core';
import { NavController, PopoverController } from 'ionic-angular';
import { AudioApiProvider } from '../../providers/audio-api/audio-api';
import { SettingsApiProvider } from '../../providers/settings-api/settings-api';
import { SettingsKey } from '../../enums/settings-key.enum';
import { AudioFile } from '../../models/audio-file';
import { AudioDataChangeServiceProvider } from '../../providers/audio-data-change-service/audio-data-change-service';
import { AudioPlaylist } from '../../models/audio-playlist';
import { AudioPlayerInfo } from '../../models/audio-player-info';
import { CommandQueueApiProvider } from '../../providers/command-queue-api/command-queue-api';
import { Commands } from '../../enums/commands.enum';
import { PlayerMenuComponent } from '../../components/player-menu/player-menu';

@Component({
    selector: 'page-player',
    templateUrl: 'player.html'
})
export class PlayerPage {
    public playlistFiles: AudioFile[];
    public playerInfo: AudioPlayerInfo = new AudioPlayerInfo();
    public currentPlaylist: AudioPlaylist;

    private playlistFileLongClicked: boolean = false;

    constructor(
        public navCtrl: NavController,
        private audioApi: AudioApiProvider,
        private settingsApi: SettingsApiProvider,
        private audioDataChangeService: AudioDataChangeServiceProvider,
        private commandQueueApi: CommandQueueApiProvider,
        private popoverCtrl: PopoverController) { }

    ionViewDidLoad() {
        this.audioDataChangeService
            .playlistChanged
            .subscribe(playlist => this.playlistChanged(playlist));

        this.audioDataChangeService
            .audioPlayerInfoChanged
            .subscribe((playerInfo: AudioPlayerInfo) => {
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

    public playPause(): void {
        this.commandQueueApi.addCommand(Commands.PlayPause, null);
    }

    public nextFile(): void {
        this.commandQueueApi.addCommand(Commands.NextFile, null);
    }

    public previousFile(): void {
        this.commandQueueApi.addCommand(Commands.PreviousFile, null);
    }

    public volumeSliderChange(event: any): void {
        this.commandQueueApi.addCommand(Commands.ChangeVolume, event._valA);
    }

    public timeSliderChange(event: any): void {
        if (event._pressed) {
            this.commandQueueApi.addCommand(Commands.Seek, event._valA);
        }
    }

    public playlistFileLongClick(file: AudioFile, event: any): void {
        this.playlistFileLongClicked = true;

        let popover = this.popoverCtrl.create(PlayerMenuComponent, {}, {cssClass: 'player-menu'});

        popover.present({
            ev: event
        });
    }

    public playlistFileClick(file: AudioFile): void {
        if (this.playlistFileLongClicked) {
            this.playlistFileLongClicked = false;
            return;
        }

        this.playerInfo.path = file.path;
        this.playerInfo.artist = file.artist;
        this.playerInfo.track = file.title;

        this.audioApi.updateAudioPlayerInfo(this.playerInfo);

        this.settingsApi.updateSettingValue(SettingsKey.LastAudioFile, file);

        this.commandQueueApi.addCommand(Commands.PlayFile, file);
    }
}
