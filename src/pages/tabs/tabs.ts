import { Component } from '@angular/core';
import { PlayerPage } from '../player/player';
import { PlaylistsPage } from '../playlists/playlists';
import { BrowserPage } from '../browser/browser';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  playerPage = PlayerPage;
  playlistsPage = PlaylistsPage;
  browserPage = BrowserPage;

  constructor() {

  }
}
