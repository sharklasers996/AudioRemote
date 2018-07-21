import { Component, EventEmitter } from '@angular/core';
import { NavController, ActionSheetController, ToastController } from 'ionic-angular';
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

    public selectMany: boolean = false;

    constructor(
        public navCtrl: NavController,
        private audioApi: AudioApiProvider,
        private audioDataChangeService: AudioDataChangeServiceProvider,
        private commandQueueApi: CommandQueueApiProvider,
        private actionSheetCtrl: ActionSheetController,
        private toastCtrl: ToastController
    ) { }

    ionViewWillEnter() {
        this.playerInfoChangedEvent = this.audioDataChangeService
            .audioPlayerInfoChanged
            .subscribe((playerInfo: AudioPlayerInfo) => {
                if (!this.playerInfo.currentPlaylist
                    && playerInfo.currentPlaylist) {
                    this.playlistChanged();
                }
                else

                    if (this.playerInfo.currentPlaylist.name != playerInfo.currentPlaylist.name) {
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

    public playlistFileClick(file: AudioFile): void {
        if (this.selectMany) {
            file.selected = !file.selected;
            return;
        }

        if (this.playlistFileLongClicked) {
            this.playlistFileLongClicked = false;
            return;
        }

        this.audioApi.playFile(file);
    }

    public playlistFileLongClick(file: AudioFile, event: any): void {
        if (this.selectMany) {
            return;
        }

        this.playlistFileLongClicked = true;

        this.openSingleFileMenu(file);
    }

    private openSingleFileMenu(file: AudioFile): void {
        let queueText = 'Enqueue';
        if (file.queueId) {
            queueText = 'Dequeue';
        }

        let singleFileMenu = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: queueText,
                    icon: 'add-circle',
                    handler: () => {
                        this.addOrRemoveFromQueue(file);
                    }
                },
                {
                    text: 'Delete',
                    icon: 'trash',
                    handler: () => {
                        this.deleteFile(file);
                    }
                }, {
                    text: 'Remove From Playlist',
                    icon: 'close',
                    handler: () => {
                        this.removeFromPlaylist(file);
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

        singleFileMenu.present();
    }

    private addOrRemoveFromQueue(file: AudioFile): void {
        this.audioApi
            .addOrRemoveFromQueue(file)
            .then(() => {
                this.updatePlaylistWithQueueIds();
            });
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

    private deleteFile(file: AudioFile): void {
        this.audioApi
            .deleteFiles([file])
            .then(() => {
                this.playlistFiles = this.playlistFiles.filter(f => f.path !== file.path);
                this.showToast(`Deleted '${file.title}'`);
            });
    }

    private deleteFiles(files: AudioFile[]): void {
        this.audioApi
            .deleteFiles(files)
            .then(() => {
                this.playlistFiles = this.playlistFiles.filter(f => {
                    return files.indexOf(f) === -1;
                });
                this.showToast(`Deleted ${files.length} files`);
            });
    }

    private removeFromPlaylist(file: AudioFile): void {
        this.audioApi
            .removeFileFromPlaylist([file], this.playerInfo.currentPlaylist)
            .then(() => {
                this.playlistFiles = this.playlistFiles.filter(f => f.path !== file.path);
                this.showToast(`Removed '${file.title}'`);
            });
    }

    private removeMultipleFromPlaylist(files: AudioFile[]): void {
        this.audioApi
            .removeFileFromPlaylist(files, this.playerInfo.currentPlaylist)
            .then(() => {
                this.playlistFiles = this.playlistFiles.filter(f => {
                    return files.indexOf(f) === -1;
                });
                this.showToast(`Removed ${files.length} files`);
            });
    }

    public openMenu(): void {
        let menu = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Select Many',
                    icon: 'add-circle',
                    handler: () => {
                        this.selectMany = true;
                    }
                },
                {
                    text: 'Current File',
                    icon: 'trash',
                    handler: () => {
                        let currentFile = this.playlistFiles.find(f => f.path == this.playerInfo.path);
                        this.openSingleFileMenu(currentFile);
                    }
                }
            ]
        });

        menu.present();
    }

    public selectManyMenuMore(): void {
        let multipleFileMenu = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Delete',
                    icon: 'trash',
                    handler: () => {
                        let selectedFiles = this.getSelectedItemsAndHideMenu();
                        this.deleteFiles(selectedFiles);
                    }
                }, {
                    text: 'Remove From Playlist',
                    icon: 'close',
                    handler: () => {
                        let selectedFiles = this.getSelectedItemsAndHideMenu();
                        this.removeMultipleFromPlaylist(selectedFiles);
                    }
                }, {
                    text: 'Edit Mp3 Tags',
                    icon: 'pricetag',
                    handler: () => {
                        console.log('Destructive clicked');
                    }
                }
            ]
        });

        multipleFileMenu.present();
    }

    private getSelectedItemsAndHideMenu(): AudioFile[] {
        this.selectMany = false;
        return this.playlistFiles.filter(f => f.selected);
    }

    public selectManyMenuBack(): void {
        for (let i = 0; i < this.playlistFiles.length; i++) {
            this.playlistFiles[i].selected = false;
        }

        this.selectMany = false;
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
