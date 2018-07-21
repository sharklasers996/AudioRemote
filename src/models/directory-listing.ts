import { MediaDirectory } from "./media-directory";
import { MediaFile } from "./media-file";

export class DirectoryListing {
    parentDirectory: string;
    directory: string;
    directories: MediaDirectory[];
    files: MediaFile[];

    get directoryName(): string {
        let lastIndexOfPath = this.directory.lastIndexOf('/');
        let dirName = this.directory.substring(lastIndexOfPath + 1, this.directory.length);
        if (dirName.length < 1) {
            dirName = this.directory;
        }

        return dirName;
    }
}