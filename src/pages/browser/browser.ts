import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { FileBrowserApiProvider } from '../../providers/file-browser-api/file-browser-api';
import { AudioApiProvider } from '../../providers/audio-api/audio-api';
import { DirectoryListing } from '../../models/directory-listing';

@Component({
    selector: 'page-browser',
    templateUrl: 'browser.html'
})
export class BrowserPage {
    public directoryListing: DirectoryListing;

    constructor(
        public navCtrl: NavController,
        private fileBrowserApi: FileBrowserApiProvider,
        private audioApi: AudioApiProvider,
        loadingCtrl: LoadingController) {
        this.fileBrowserApi.addLoadingController(loadingCtrl);
    }

    ionViewDidLoad() {

        this.browseLocation();
    }

    public browseLocation(path?: string): void {
        this.fileBrowserApi
            .listDirectory(path)
            .then(directoryListing => {
                this.directoryListing = directoryListing;
            });
    }
}
