import { MediaDirectory } from "./media-directory";
import { MediaFile } from "./media-file";

export class DirectoryListing {
    parentDirectory: string;
    directory: string;
    directoryName: string;
    directories: MediaDirectory[];
    files: MediaFile[];
}