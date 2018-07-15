import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AudioApiProvider } from '../../providers/audio-api/audio-api';
import { SettingsApiProvider } from '../../providers/settings-api/settings-api';
import { SettingsKey } from '../../Enums/settings-key.enum';
import { AudioFile } from '../../models/audio-file';
import { AudioDataChangeServiceProvider } from '../../providers/audio-data-change-service/audio-data-change-service';
import { AudioPlaylist } from '../../models/audio-playlist';
import { AudioPlayerInfo } from '../../models/audio-player-info';
import { CommandQueueApiProvider } from '../../providers/command-queue-api/command-queue-api';
import { Commands } from '../../Enums/commands.enum';

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
        private audioDataChangeService: AudioDataChangeServiceProvider,
        private commandQueueApi: CommandQueueApiProvider) { }

    ionViewDidLoad() {
        this.audioDataChangeService
            .playlistChanged
            .subscribe(playlist => this.playlistChanged(playlist));

        this.audioDataChangeService
            .audioPlayerInfoChanged
            .subscribe((playerInfo: AudioPlayerInfo) => {
                playerInfo.volume = playerInfo.volume;
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
        console.log(event._valA);
        this.commandQueueApi.addCommand(Commands.ChangeVolume, event._valA);
    }

    public timeSliderChange(event: any): void {
        if (event._pressed) {
            this.commandQueueApi.addCommand(Commands.Seek, event._valA);
        }
    }
}
