import { Injectable } from '@angular/core';
import { HttpClientWithLoader } from '../../utils/http-client-with-loader';
import { LoadingController } from 'ionic-angular/umd';
import { Environment } from '../../constants/environment';
import { DirectoryListing } from '../../models/directory-listing';
import { FileType } from '../../enums/file-type';

@Injectable()
export class FileBrowserApiProvider {
  private fileBrowserApiUrl: string = Environment.ApiUrl + '/api/FileBrowserApi'

  constructor(public http: HttpClientWithLoader) { }

  public addLoadingController(loadingCtrl: LoadingController) {
    this.http.addLoadingController(loadingCtrl);
  }

  public listDirectory(path: string): Promise<DirectoryListing> {
    return this.http
      .post<DirectoryListing>(
        `${this.fileBrowserApiUrl}/ListDirectory`,
        {
          path: path,
          fileType: FileType.Audio
        }).then((directoryListing: DirectoryListing) => {
          return directoryListing;
        });
  }
}
