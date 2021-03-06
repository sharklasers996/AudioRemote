import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { LoadingController, Loading } from "ionic-angular";

@Injectable()
export class HttpClientWithLoader {
    public static LoadingMessage: string = 'Loading';

    private loadingCtrl: LoadingController;

    constructor(private http: HttpClient) {
    }

    public addLoadingController(loadingCtrl: LoadingController): void {
        this.loadingCtrl = loadingCtrl;
    }

    public get<T>(url: string, loadingMessage: string = null): Promise<T> {
        let loader = this.CreateAndShowLoader(loadingMessage);

        return new Promise<T>((resolve, reject) => {
            this.http.get<T>(url).subscribe(result => {
                if (loader) {
                    loader.dismiss();
                }

                resolve(result);
            }, error => {
                reject(error);
            });
        });
    }

    public post<T>(url: string, data: any, loadingMessage: string = null): Promise<T> {
        let loader = this.CreateAndShowLoader(loadingMessage);

        return new Promise<T>(resolve => {
            this.http.post<T>(url, data).subscribe(result => {
                if (loader) {
                    loader.dismiss();
                }

                resolve(result);
            });
        });
    }

    private CreateAndShowLoader(loadingMessage: string): Loading {
        if (loadingMessage
            && this.loadingCtrl) {
            let loader = this.loadingCtrl.create({
                content: loadingMessage
            });

            loader.present();

            return loader;
        }

        return null;
    }
}