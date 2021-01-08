import { Component } from '@angular/core';
import { ActionSheetController, PopoverController } from '@ionic/angular';
import { Photo } from '../models/photo.interface';
import { PhotoService } from '../services/photo.service';
import { PopoverPage } from '../tab2-popover/tab2-popover';
import { Router } from '@angular/router';

import { ImageService } from '../services/image.service'

import { CanvasDrawComponent } from '../canvas-draw/canvas-draw.component';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public photos: Photo[]=[];
  
  constructor(private photoSvc: PhotoService, 

              private imageService: ImageService,
              private canvasDraw: CanvasDrawComponent,

              public actionSheetController: ActionSheetController,
              private router: Router,
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
          this.photoSvc.setSharedPhoto(photo);
          this.router.navigate(['/tabs/tab3']);
          // this.canvasDraw.loadImage(photo, position)
          // this.canvasDraw.photoLoad = photo;
          
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
