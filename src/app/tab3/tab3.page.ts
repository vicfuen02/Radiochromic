import { Component, OnInit, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { CanvasDrawComponent } from '../canvas-draw/canvas-draw.component';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  @ViewChild("CanvasComponent") CanvasComponent: CanvasDrawComponent;
  constructor(private platform: Platform,
              private photoSvc: PhotoService) {}


  ionViewDidEnter() {

    this.CanvasComponent.setBackground()
    // addEventListener(this.photoSvc.SharedEvent + "", () => {
    //   this.CanvasComponent.setBackground()
    // })

  }




}
