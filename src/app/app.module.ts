import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { AppComponent } from './app.component';
import { LongPressModule } from 'ionic-long-press'

import { PlayerPage } from '../pages/player/player';
import { PlaylistsPage } from '../pages/playlists/playlists';
import { BrowserPage } from '../pages/browser/browser';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SettingsApiProvider } from '../providers/settings-api/settings-api';
import { AudioApiProvider } from '../providers/audio-api/audio-api';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientWithLoader } from '../utils/http-client-with-loader';
import { AudioDataChangeServiceProvider } from '../providers/audio-data-change-service/audio-data-change-service';
import { CommandQueueApiProvider } from '../providers/command-queue-api/command-queue-api';
import { FileBrowserApiProvider } from '../providers/file-browser-api/file-browser-api';
import { Toaster } from '../utils/toaster';


@NgModule({
    declarations: [
        AppComponent,
        PlayerPage,
        PlaylistsPage,
        BrowserPage,
        TabsPage,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        LongPressModule,
        IonicModule.forRoot(AppComponent)
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        AppComponent,
        PlayerPage,
        PlaylistsPage,
        BrowserPage,
        TabsPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        HttpClientWithLoader,
        Toaster,
        SettingsApiProvider,
        AudioApiProvider,
        AudioDataChangeServiceProvider,
        CommandQueueApiProvider,
        FileBrowserApiProvider
    ]
})
export class AppModule { }
