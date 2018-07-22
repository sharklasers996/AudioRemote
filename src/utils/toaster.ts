import { ToastController } from "ionic-angular";
import { Injectable } from "@angular/core";

@Injectable()
export class Toaster {
    constructor(private toastCtrl: ToastController) { }

    public showToast(message: string): void {
        let toast = this.toastCtrl.create({
            message: message,
            duration: 2000,
            position: 'top'
        });

        toast.present();
    }
}