import { Component, ViewChild } from '@angular/core';
import { NavController, LoadingController, Select, ActionSheetController, Platform } from 'ionic-angular';
import { FileBrowserApiProvider } from '../../providers/file-browser-api/file-browser-api';
import { AudioApiProvider } from '../../providers/audio-api/audio-api';
import { DirectoryListing } from '../../models/directory-listing';
import { AudioPlaylist } from '../../models/audio-playlist';
import { MediaDirectory } from '../../models/media-directory';
import { MediaFile } from '../../models/media-file';
import { AudioDataChangeServiceProvider } from '../../providers/audio-data-change-service/audio-data-change-service';
import { Toaster } from '../../utils/toaster';

@Component({
    selector: 'page-browser',
    templateUrl: 'browser.html'
})
export class BrowserPage {
    public directoryListing: DirectoryListing;
    public gender: string = 'm';
    public playlists: AudioPlaylist[];
    public selectedPlaylist: AudioPlaylist;
    private selectedDirectories: MediaDirectory[] = [];
    private selectedFiles: MediaFile[] = [];
    public selectMany: boolean = false;
    public selectPlaylistOptions: any = {
        title: 'Select Playlist'
    };

    @ViewChild('selectmenu') selectPlaylistMenu: Select;

    constructor(
        public navCtrl: NavController,
        private fileBrowserApi: FileBrowserApiProvider,
        private audioApi: AudioApiProvider,
        private actionSheetCtrl: ActionSheetController,
        private toaster: Toaster,
        private audioDataChangeService: AudioDataChangeServiceProvider,
        private platform: Platform,
        loadingCtrl: LoadingController) {
        this.fileBrowserApi.addLoadingController(loadingCtrl);

        platform.registerBackButtonAction(() => {
            console.log("backPressed 1");
        }, 1);
    }

    ionViewDidLoad() {
        this.browseLocation();
    }

    ionViewWillEnter() {
        this.getPlaylists();
    }

    public browseLocation(path?: string): void {
        this.fileBrowserApi
            .listDirectory(path)
            .then(directoryListing => {
                this.directoryListing = directoryListing;
            });
    }

    private getPlaylists(): void {
        this.audioApi
            .getPlaylists()
            .then((playlists: AudioPlaylist[]) => {
                this.playlists = playlists;
            });
    }

    public directoryClick(directory: MediaDirectory): void {
        if (this.selectMany) {
            directory.selected = !directory.selected;

            if (directory.selected) {
                this.selectedDirectories.push(directory);
            } else {
                this.selectedDirectories = this.selectedDirectories.filter(d => d.path != directory.path);
            }
        } else {
            this.browseLocation(directory.path);
        }
    }

    public fileClick(file: MediaFile): void {
        if (this.selectMany) {
            file.selected = !file.selected;

            if (file.selected) {
                this.selectedFiles.push(file);
            } else {
                this.selectedFiles = this.selectedFiles.filter(f => f.path != file.path);
            }
        }
    }

    public directoryLongClick(directory: MediaDirectory): void {
        if (this.selectMany) {
            return;
        }

        this.selectedFiles = [];
        this.selectedDirectories = [directory];

        this.openMenu();
    }

    public fileLongClick(file: MediaFile): void {
        if (this.selectMany) {
            return;
        }

        this.selectedFiles = [file];
        this.selectedDirectories = [];

        this.openMenu();
    }

    public openMenu(): void {
        let menu = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Add To Playlist',
                    icon: 'add',
                    handler: () => {
                        this.openAddToPlaylistMenu();
                    }
                },
                {
                    text: 'Delete',
                    icon: 'trash',
                    handler: () => {
                        this.deleteSelection();
                    }
                }
            ]
        });

        menu.present();
    }

    public openAddToPlaylistMenu(): void {
        this.selectPlaylistMenu.open();
    }

    public playlistSelectChanged(): void {
        if (!this.selectedPlaylist) {
            return;
        }

        this.addSelectionToPlaylist();
    }

    public addSelectionToPlaylist() {
        this.audioApi
            .addFilesToPlaylist(this.selectedFiles, this.selectedDirectories, this.selectedPlaylist)
            .then(() => {
                this.audioDataChangeService.onPlaylistFilesChanged();

                this.toaster.showToast(`Added to '${this.selectedPlaylist.name}'`);
                this.getPlaylists();
                this.resetSelection();
            });
    }

    public deleteSelection(): void {
        this.audioApi
            .deleteMediaFiles(this.selectedFiles, this.selectedDirectories)
            .then(() => {
                this.audioDataChangeService.onPlaylistFilesChanged();
                this.browseLocation(this.directoryListing.directory);
                this.toaster.showToast('Deleted files');
            });
        this.resetSelection();
    }

    private resetSelection(): void {
        this.selectedDirectories = [];
        this.selectedFiles = [];
        this.selectedPlaylist = null;
        this.selectMany = false;

        this.directoryListing.directories.forEach(d => d.selected = false);
        this.directoryListing.files.forEach(f => f.selected = false);
    }

    public toggleSelectMany(): void {
        this.selectMany = !this.selectMany;

        if (!this.selectMany) {
            this.resetSelection();
        }
    }
}
