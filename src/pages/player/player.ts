import { Component, EventEmitter, ViewChild } from '@angular/core';
import { NavController, ActionSheetController, Searchbar, Content, LoadingController, AlertController } from 'ionic-angular';
import { AudioApiProvider } from '../../providers/audio-api/audio-api';
import { AudioFile } from '../../models/audio-file';
import { AudioDataChangeServiceProvider } from '../../providers/audio-data-change-service/audio-data-change-service';
import { AudioPlayerInfo } from '../../models/audio-player-info';
import { CommandQueueApiProvider } from '../../providers/command-queue-api/command-queue-api';
import { Commands } from '../../enums/commands.enum';
import { Toaster } from '../../utils/toaster';
import { PlayingOrder } from '../../enums/playing-order';

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
        private toaster: Toaster,
        private alertCtrl: AlertController,
        loadingCtrl: LoadingController
    ) {
        this.audioApi.addLoadingController(loadingCtrl);

        this.audioDataChangeService
            .playlistFilesChanged
            .subscribe(() => {
                this.getCurrentPlaylistFiles();
            });
    }

    ionViewWillEnter() {
        this.playerInfoChangedEvent = this.audioDataChangeService
            .audioPlayerInfoChanged
            .subscribe((playerInfo: AudioPlayerInfo) => {
                if ((!this.playerInfo.currentPlaylist && playerInfo.currentPlaylist)
                    || this.playerInfo.currentPlaylist.name != playerInfo.currentPlaylist.name) {
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
        if (event._pressed) {
            this.commandQueueApi.addCommand(Commands.ChangeVolume, event._valA);
        }
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
                        this.deleteFiles([file])
                            .then(() => {
                                this.toaster.showToast(`Deleted '${file.title}'`);
                            });
                    }
                }, {
                    text: 'Remove From Playlist',
                    icon: 'close',
                    handler: () => {
                        this.removeFromPlaylist([file])
                            .then(() => {
                                this.toaster.showToast(`Removed '${file.title}'`);
                            });
                    }
                }, {
                    text: 'Edit Mp3 Tag',
                    icon: 'pricetag',
                    handler: () => {
                        this.showChangeMp3TagForSingleFileMenu(file);
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

    private deleteFiles(files: AudioFile[]): Promise<any> {
        return new Promise(resolve => {
            this.audioApi
                .deleteFiles(files)
                .then(() => {
                    this.removeItemsFromPlaylistArrays(files);
                    resolve();
                });
        });
    }

    private removeFromPlaylist(files: AudioFile[]): Promise<any> {
        return new Promise(resolve => {
            this.audioApi
                .removeFileFromPlaylist(files, this.playerInfo.currentPlaylist)
                .then(() => {
                    this.removeItemsFromPlaylistArrays(files);
                    resolve();
                });
        });
    }

    private removeItemsFromPlaylistArrays(files: AudioFile[]): void {
        this.playlistFiles = this.playlistFiles.filter(f => {
            return files.indexOf(f) === -1;
        });
        this.displayedPlaylistFiles = this.displayedPlaylistFiles.filter(f => {
            return files.indexOf(f) === -1;
        });
    }

    public openMenu(): void {
        let menu = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Current File',
                    icon: 'musical-note',
                    handler: () => {
                        let currentFile = this.playlistFiles.find(f => f.path == this.playerInfo.path);
                        this.openSingleFileMenu(currentFile);
                    }
                },
                {
                    text: 'Select Many',
                    icon: 'checkmark-circle-outline',
                    handler: () => {
                        this.selectMany = true;
                    }
                },
                {
                    text: 'Set Playing Order',
                    icon: 'reorder',
                    handler: () => {
                        this.openSetPlayingOrderMenu();
                    }
                }
            ]
        });

        menu.present();
    }

    private openSetPlayingOrderMenu(): void {
        let setPlayingOrderMenu = this.actionSheetCtrl.create({
            title: 'Current: ' + (this.playerInfo.playingOrder == PlayingOrder.Normal ? 'Normal' : 'Random'),
            buttons: [
                {
                    text: 'Normal',
                    icon: 'arrow-forward',
                    handler: () => {
                        this.audioApi
                            .setPlayingOrder(PlayingOrder.Normal)
                            .then(() => {
                                this.toaster.showToast('Playing Order Set to Normal');
                            });
                    }
                },
                {
                    text: 'Random',
                    icon: 'shuffle',
                    handler: () => {
                        this.audioApi
                            .setPlayingOrder(PlayingOrder.Random)
                            .then(() => {
                                this.toaster.showToast('Playing Order Set to Random');
                            });
                    }
                }
            ]
        });

        setPlayingOrderMenu.present();
    }

    public selectManyMenuMore(): void {
        let multipleFileMenu = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Delete',
                    icon: 'trash',
                    handler: () => {
                        let selectedFiles = this.getSelectedItemsAndHideMenu();
                        this.deleteFiles(selectedFiles)
                            .then(() => {
                                this.toaster.showToast(`Deleted ${selectedFiles.length} files`);
                            });
                    }
                }, {
                    text: 'Remove From Playlist',
                    icon: 'close',
                    handler: () => {
                        let selectedFiles = this.getSelectedItemsAndHideMenu();
                        this.removeFromPlaylist(selectedFiles)
                            .then(() => {
                                this.toaster.showToast(`Removed ${selectedFiles.length} files`);
                            });
                    }
                }, {
                    text: 'Edit Mp3 Tags',
                    icon: 'pricetag',
                    handler: () => {
                        let selectedFiles = this.getSelectedItemsAndHideMenu();
                        selectedFiles.forEach(file => file.selected = false);
                        this.showChangeMp3TagForMultipleFilesMenu(selectedFiles);
                    }
                }
            ]
        });

        multipleFileMenu.present();
    }

    public selectManyMenuBack(): void {
        for (let i = 0; i < this.displayedPlaylistFiles.length; i++) {
            this.displayedPlaylistFiles[i].selected = false;
        }

        this.selectMany = false;
    }

    private getSelectedItemsAndHideMenu(): AudioFile[] {
        this.selectMany = false;
        return this.displayedPlaylistFiles.filter(f => f.selected);
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

        if (this.displayedPlaylistFiles.length == 0) {
            for (let i = 0; i < this.playlistFiles.length; i++) {
                let playlistFile = this.playlistFiles[i];
                if (!playlistFile.artist) {
                    continue;
                }

                if (playlistFile.artist.search(regex) !== -1) {
                    this.displayedPlaylistFiles.push(playlistFile);
                }
            }
        }
    }

    public showChangeMp3TagForSingleFileMenu(file: AudioFile): void {
        let prompt = this.alertCtrl.create({
            title: 'Change Mp3 Tag',
            subTitle: file.artist + ' - ' + file.title,
            inputs: [
                {
                    name: 'artist',
                    placeholder: 'Artist',
                    value: file.artist
                },
                {
                    name: 'title',
                    placeholder: 'Title',
                    value: file.title
                }
            ],
            buttons: [
                {
                    text: 'Change',
                    handler: data => {
                        file.artist = data.artist;
                        file.title = data.title;

                        this.audioApi
                            .changeMp3Tags([file])
                            .then(() => {
                                this.toaster.showToast('Mp3 Tag Changed');
                            });
                    }
                }
            ]
        });
        prompt.present();
    }

    public showChangeMp3TagForMultipleFilesMenu(files: AudioFile[]): void {
        let prompt = this.alertCtrl.create({
            title: 'Change Mp3 Tag',
            inputs: [
                {
                    name: 'artist',
                    placeholder: 'Artist',
                    value: files.length > 0 ? files[0].artist : ''
                }
            ],
            buttons: [
                {
                    text: 'Change',
                    handler: data => {
                        files.forEach(file => {
                            file.artist = data.artist;
                        });

                        this.audioApi
                            .changeMp3Tags(files)
                            .then(() => {
                                this.toaster.showToast('Mp3 Tag Changed');
                            });
                    }
                }
            ]
        });
        prompt.present();
    }
}
