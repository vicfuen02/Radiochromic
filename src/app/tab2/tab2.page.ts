import { Component } from '@angular/core';
import { ActionSheetController, PopoverController } from '@ionic/angular';
import { Photo } from '../models/photo.interface';
import { PhotoService } from '../services/photo.service';
import { PopoverPage } from '../tab2-popover/tab2-popover';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public photos: Photo[]=[];
  
  constructor(private photoSvc: PhotoService, 
              public actionSheetController: ActionSheetController,
              public popoverCtrl: PopoverController) {}

  ngOnInit(){
    this.photoSvc.loadSaved().then( () => {
      this.photos = this.photoSvc.getPhotos();
    });
  }

  public newPhoto(): void {
    this.photoSvc.TakePhotoFromCamera()
  }

  public async showActionSheet(photo: Photo, position: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [{
        text: 'Scan',
        icon: 'scan',
        handler: () => {
          this.photoSvc.Scan(photo, position);
        }
      },{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.photoSvc.deletePicture(photo, position);
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          // Nothing to do, action sheet is automatically closed
          }
      }]
    });
    await actionSheet.present();
  }
  async presentPopover(event: Event) {
    const popover = await this.popoverCtrl.create({
      component: PopoverPage,
      event
    });
    await popover.present();
  }

}
