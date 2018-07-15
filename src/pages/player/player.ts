import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AudioApiProvider } from '../../providers/audio-api/audio-api';
import { SettingsApiProvider } from '../../providers/settings-api/settings-api';
import { SettingsKey } from '../../Enums/settings-key.enum';
import { AudioFile } from '../../models/audio-file';

@Component({
    selector: 'page-player',
    templateUrl: 'player.html'
})
export class PlayerPage {
    public playlistItems: AudioFile[];

    constructor(
        public navCtrl: NavController,
        private audioApi: AudioApiProvider,
        private settingsApi: SettingsApiProvider) {

    }
}
