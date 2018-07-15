import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { AppComponent } from './app.component';

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


@NgModule({
  declarations: [
    AppComponent,
    PlayerPage,
    PlaylistsPage,
    BrowserPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
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
    SettingsApiProvider,
    AudioApiProvider,
    AudioDataChangeServiceProvider
  ]
})
export class AppModule { }
