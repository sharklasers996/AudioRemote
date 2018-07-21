import { Component, EventEmitter, ViewChild } from '@angular/core';
import { NavController, ActionSheetController, ToastController, Searchbar, Content, LoadingController } from 'ionic-angular';
import { AudioApiProvider } from '../../providers/audio-api/audio-api';
import { AudioFile } from '../../models/audio-file';
import { AudioDataChangeServiceProvider } from '../../providers/audio-data-change-service/audio-data-change-service';
import { AudioPlayerInfo } from '../../models/audio-player-info';
import { CommandQueueApiProvider } from '../../providers/command-queue-api/command-queue-api';
import { Commands } from '../../enums/commands.enum';
import { AudioPlaylist } from '../../models/audio-playlist';

@Component({
    selector: 'page-player',
    templateUrl: 'player.html'
})
export class PlayerPage {
    public playlistFiles: AudioFile[];
    public displayedPlaylistFiles: AudioFile[];
    public playerInfo: AudioPlayerInfo = new AudioPlayerInfo();

    private playlistFileLongClicked: boolean = false;

    private playerInfoChangedEvent: EventEmitter<AudioPlayerInfo>;

    public selectMany: boolean = false;


    @ViewChild('searchbar') searchBarElement: Searchbar;
    public searching: boolean = false;

    @ViewChild('content') content: Content;

    constructor(
        public navCtrl: NavController,
        private audioApi: AudioApiProvider,
        private audioDataChangeService: AudioDataChangeServiceProvider,
        private commandQueueApi: CommandQueueApiProvider,
        private actionSheetCtrl: ActionSheetController,
        private toastCtrl: ToastController,
        loadingCtrl: LoadingController
    ) {
        this.audioApi.addLoadingController(loadingCtrl);

        this.audioDataChangeService
            .playlistChanged
            .subscribe((playlist: AudioPlaylist) => {
                if (playlist.name == this.playerInfo.currentPlaylist.name) {
                    this.audioApi
                        .setPlaylist(playlist)
                        .then(() => {
                            this.getCurrentPlaylistFiles();
                        });
                }
            });
    }

    ionViewWillEnter() {
        this.playerInfoChangedEvent = this.audioDataChangeService
            .audioPlayerInfoChanged
            .subscribe((playerInfo: AudioPlayerInfo) => {
                if (!this.playerInfo.currentPlaylist
                    && playerInfo.currentPlaylist) {
                    this.getCurrentPlaylistFiles();
                }
                else if (this.playerInfo.currentPlaylist.name != playerInfo.currentPlaylist.name) {
                    this.getCurrentPlaylistFiles();
                }

                if (this.playerInfo.path !== playerInfo.path
                    && this.playlistFiles) {
                    this.updatePlaylistWithQueueIds();
                }

                this.playerInfo = playerInfo;
            });
    }

    ionViewWillLeave() {
        this.playerInfoChangedEvent.unsubscribe();
    }

    private getCurrentPlaylistFiles(): void {
        this.audioApi
            .getCurrentPlaylistFiles()
            .then(files => {
                this.playlistFiles = files;
                this.displayedPlaylistFiles = files;
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
                    let fileInQueue = files.find(f => f.path == this.playlistFiles[i].path);
                    if (fileInQueue) {
                        this.playlistFiles[i].queueId = fileInQueue.queueId;
                    }
                    else {
                        this.playlistFiles[i].queueId = null;
                    }
                }

                for (let i = 0; i < this.displayedPlaylistFiles.length; i++) {
                    let fileInQueue = files.find(f => f.path == this.displayedPlaylistFiles[i].path);
                    if (fileInQueue) {
                        this.displayedPlaylistFiles[i].queueId = fileInQueue.queueId;
                    }
                    else {
                        this.displayedPlaylistFiles[i].queueId = null;
                    }
                }
            });
    }

    private deleteFile(file: AudioFile): void {
        this.audioApi
            .deleteFiles([file])
            .then(() => {
                this.playlistFiles = this.playlistFiles.filter(f => f.path !== file.path);
                this.displayedPlaylistFiles = this.displayedPlaylistFiles.filter(f => f.path !== file.path);
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
                this.displayedPlaylistFiles = this.displayedPlaylistFiles.filter(f => {
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
                this.displayedPlaylistFiles = this.displayedPlaylistFiles.filter(f => f.path !== file.path);
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
                this.displayedPlaylistFiles = this.displayedPlaylistFiles.filter(f => {
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
                    icon: 'checkmark-circle-outline',
                    handler: () => {
                        this.selectMany = true;
                    }
                },
                {
                    text: 'Current File',
                    icon: 'musical-note',
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
        return this.displayedPlaylistFiles.filter(f => f.selected);
    }

    public selectManyMenuBack(): void {
        for (let i = 0; i < this.displayedPlaylistFiles.length; i++) {
            this.displayedPlaylistFiles[i].selected = false;
        }

        this.selectMany = false;
    }

    public toggleSearch(): void {
        this.searching = !this.searching;

        if (!this.searching) {
            this.displayedPlaylistFiles = this.playlistFiles;
            this.content.resize();
        } else {
            setTimeout(() => {
                if (!this.searchBarElement) {
                    return;
                }
                this.searchBarElement.setFocus();
            }, 300);

            this.content.resize();
            this.content.scrollToTop();
        }
    }

    public searchInputChanged(event: any) {
        if (!event.target.value) {
            this.displayedPlaylistFiles = this.playlistFiles;
            return;
        }

        this.displayedPlaylistFiles = [];

        let searchQuery = event.target.value;
        let regex = new RegExp(searchQuery, 'i');

        for (let i = 0; i < this.playlistFiles.length; i++) {
            let playlistFile = this.playlistFiles[i];
            if (!playlistFile.title) {
                continue;
            }

            if (playlistFile.title.search(regex) !== -1) {
                this.displayedPlaylistFiles.push(playlistFile);
            }
        }
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
