import { Component, EventEmitter } from '@angular/core';
import { NavController, ActionSheetController, ActionSheet } from 'ionic-angular';
import { AudioApiProvider } from '../../providers/audio-api/audio-api';
import { AudioFile } from '../../models/audio-file';
import { AudioDataChangeServiceProvider } from '../../providers/audio-data-change-service/audio-data-change-service';
import { AudioPlayerInfo } from '../../models/audio-player-info';
import { CommandQueueApiProvider } from '../../providers/command-queue-api/command-queue-api';
import { Commands } from '../../enums/commands.enum';

@Component({
    selector: 'page-player',
    templateUrl: 'player.html'
})
export class PlayerPage {
    public playlistFiles: AudioFile[];
    public playerInfo: AudioPlayerInfo = new AudioPlayerInfo();

    private playlistFileLongClicked: boolean = false;

    private playerInfoChangedEvent: EventEmitter<AudioPlayerInfo>;

    constructor(
        public navCtrl: NavController,
        private audioApi: AudioApiProvider,
        private audioDataChangeService: AudioDataChangeServiceProvider,
        private commandQueueApi: CommandQueueApiProvider,
        private actionSheetCtrl: ActionSheetController
    ) { }

    ionViewWillEnter() {
        this.playerInfoChangedEvent = this.audioDataChangeService
            .audioPlayerInfoChanged
            .subscribe((playerInfo: AudioPlayerInfo) => {
                if (this.playerInfo.currentPlaylistName != playerInfo.currentPlaylistName) {
                    this.playlistChanged();
                }
                this.playerInfo = playerInfo;
            });
    }

    ionViewWillLeave() {
        this.playerInfoChangedEvent.unsubscribe();
    }

    private playlistChanged(): void {
        this.audioApi
            .getCurrentPlaylistFiles()
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

    public opa(): void {
        console.log('opa');
    }

    public actionSheet: ActionSheet;

    public playlistFileLongClick(file: AudioFile, event: any): void {
        this.playlistFileLongClicked = true;

        let queueText = 'Enqueue';
        if (file.queueId) {
            queueText = 'Dequeue';
        }

        this.actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: queueText,
                    icon: 'add-circle',
                    handler: () => {
                        this.audioApi
                            .addOrRemoveFromQueue(file)
                            .then(() => {
                                this.updatePlaylistWithQueueIds();
                            });
                    }
                },
                {
                    text: 'Delete',
                    icon: 'trash',
                    handler: () => {
                    }
                }, {
                    text: 'Remove From Playlist',
                    icon: 'close',
                    handler: () => {
                        console.log('Destructive clicked');
                    }
                }, {
                    text: 'Edit Mp3 Tag',
                    icon: 'pricetag',
                    handler: () => {
                        console.log('Destructive clicked');
                    }
                }
            ]
        });

        this.actionSheet.present();

    }

    private updatePlaylistWithQueueIds(): void {
        this.audioApi
            .getQueue()
            .then((files: AudioFile[]) => {
                for (let i = 0; i < this.playlistFiles.length; i++) {
                    var fileInQueue = files.find(f => f.path == this.playlistFiles[i].path);
                    if (fileInQueue) {
                        this.playlistFiles[i].queueId = fileInQueue.queueId;
                    }
                    else {
                        this.playlistFiles[i].queueId = null;
                    }
                }
            });
    }

    public playlistFileClick(file: AudioFile): void {
        if (this.playlistFileLongClicked) {
            this.playlistFileLongClicked = false;
            return;
        }

        this.audioApi.playFile(file);
    }
}
