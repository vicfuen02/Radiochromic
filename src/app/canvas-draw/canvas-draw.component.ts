import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';

import { PhotoService } from '../services/photo.service';
import { DosimetryService } from '../services/dosimetry.service'
import { Photo } from '../models/photo.interface';
import { FilesystemDirectory, FilesystemEncoding, Plugins } from '@capacitor/core';

const { Filesystem } = Plugins;

@Component({
  selector: 'app-canvas-draw',
  templateUrl: './canvas-draw.component.html',
  styleUrls: ['./canvas-draw.component.scss'],
})
export class CanvasDrawComponent {

  @ViewChild('imageCanvas', { static: false }) canvas: any;
  canvasElement: any;
  saveX: number;
  saveY: number;

  background = new Image();
  ctx:any;

  photoShared: Photo;
  imgWidth: number;
  imgHeight: number;

  rgba: number[];
  coords0: number[];
  coordsX: number[];
  coordsY: number[];
  coordsData: number[];
  RGBAData: number[];
  Dosis: number;
  distance;


  constructor(private plt: Platform,
              private photoSvc: PhotoService,
              private dosimetryService: DosimetryService) {  }
  
              
  // ngAfterViewInit() {
  //   // Set the Canvas Element
  //   // this.canvasElement = this.canvas.nativeElement;

    
  // }


  async setBackground() {
    try {

      // this.canvasElement = document.getElementById('canvas');
      
      this.canvasElement = this.canvas.nativeElement;
      
      this.background = new Image()
      this.photoShared = await this.photoSvc.getSharedPhoto()
      
      this.background.src = this.photoShared.webviewPath
      this.ctx = this.canvasElement.getContext('2d');
      
      // this.background.src = await '../../assets/icon/favicon.png';

      // background.addEventListener('load', () => {
      //   // once the image is loaded:
      //   this.imgWidth = background.naturalWidth;
      //   this.imgHeight = background.naturalHeight;
      //   const imgRatio = this.imgWidth / this.imgHeight;
      //   console.log('OriginalW:', this.imgWidth, 'OriginalH:', this.imgHeight, 'ratio:', imgRatio);
      //   this.canvasElement.width = this.plt.width() + '';
      //   this.canvasElement.height = this.canvasElement.width / imgRatio;
      //   console.log('CanvasW:', this.canvasElement.width, 'canvasH:', this.canvasElement.height);
      //   ctx.drawImage(background,0,0, this.canvasElement.width, this.canvasElement.height);
      // },false)

      this.imgWidth = this.background.naturalWidth;
      this.imgHeight = this.background.naturalHeight;
      const imgRatio = this.imgWidth / this.imgHeight;

      // console.log('OriginalW:', this.imgWidth, 'OriginalH:', this.imgHeight, 'ratio:', imgRatio);

      this.canvasElement.width = this.plt.width() + '';
      this.canvasElement.height = this.canvasElement.width / imgRatio;
      console.log('CanvasW:', this.canvasElement.width, 'canvasH:', this.canvasElement.height);

      // this.ctx.imageSmoothingEnabled = false;
      // this.ctx.globalCompositeOperation = "source-atop";
      this.ctx.drawImage(this.background,0,0, this.canvasElement.width, this.canvasElement.height);
      console.log('ctx:',this.ctx)
      
      // clear stored data
      this.ClearAllData()

    } catch (e) {
      console.log('no photo selected')
    }

  }


  ClearAllData() {

    this.rgba = [];
    this.coords0 = [];
    this.coordsX = [];
    this.coordsY = [];
    this.coordsData = [];
    this.saveX=0;
    this.saveY=0;

  }

  startDrawing(ev) {
    // console.log('-----START:', ev)

    var canvasPosition = this.canvasElement.getBoundingClientRect();
    let otherctx = this.canvasElement.getContext('2d'); 
    console.log('ev:',ev)
    console.log('ctx:', this.ctx)
    // console.log('position:', canvasPosition)

    // we get the point where we click
      //pageX and pageY depends if it is a mouse event or a touch event
    let pageX = ev.pageX? ev.pageX : ev.touches[0].pageX;
    let pageY = ev.pageY? ev.pageY : ev.touches[0].pageY;
    this.saveX = Math.trunc(pageX - canvasPosition.x);
    this.saveY = Math.trunc(pageY - canvasPosition.y);

    // this.saveX = this.saveX);
    // this.saveY = Math.trunc(this.saveY);
    // console.log(ev)
    console.log('click:', `X: ${this.saveX}, Y:${this.saveY}`)


    // Valores RGBA del pixel
    var colorIndices = this.getColorIndicesForCoord(this.saveX, this.saveY, this.canvasElement.width);

    // console.log('colorIndices: ',colorIndices);

    this.rgba = this.RGBAvalues(this.ctx, colorIndices, this.canvasElement.width, this.canvasElement.height);

    // draw a rectangule where you click
    const w=10;
    const h= 10;
    otherctx.fillRect(this.saveX-w/2, this.saveY-h/2, w,h);
    otherctx.clearRect(this.saveX-0.5*w/2, this.saveY-0.5*h/2, w*0.5,h*0.5);


    this.dosimetryService.saveXY = [this.saveX, this.saveY];
    this.dosimetryService.saveRGB = this.rgba;

    // return [this.saveX, this.saveY]
  }


  endDrawing(ev) {
    // console.log('-----END:', ev)
  }


  getColorIndicesForCoord(x, y, width) {

    var red = y * (width * 4) + x * 4;
    return [red, red + 1, red + 2, red + 3];
  }



  RGBAvalues(context,colorIndices,width,height) {

    var imgdata = context.getImageData(0, 0, width, height);
    console.log('IMGData:',imgdata)
    console.log('Color Indices:', colorIndices)

    console.log('elemento 0 color indices:',colorIndices[0])
    var a = imgdata.data[colorIndices[3]] / 255;

    var r = imgdata.data[colorIndices[0]] / 255;
    var g = imgdata.data[colorIndices[1]] / 255;
    var b = imgdata.data[colorIndices[2]] / 255;

    var rgba = [+r.toFixed(5),+g.toFixed(5),+b.toFixed(5),+a.toFixed(5)];
    console.log('r:',r,'g:',g,'b:',b);
    console.log('a:',a)

    return rgba
  }




  // SERVICIO PARA EL RESTO DE PAGINAS (?)
  // Save Data
  SetOrigincoord() {
    this.coords0 = [Math.trunc(this.saveX), Math.trunc(this.saveY)];
  }

  SetXcoord() {
    this.coordsX = [Math.trunc(this.saveX), Math.trunc(this.saveY)];
  }

  SetYcoord() {
    this.coordsY = [Math.trunc(this.saveX), Math.trunc(this.saveY)];
  }

  SetDatacoord() {
    // this.coordsData = [Math.trunc(this.saveX), Math.trunc(this.saveY)];
    this.coordsData.push(Math.trunc(this.saveX), Math.trunc(this.saveY));
    
    this.RGBAData = this.rgba;
    console.log(this.coordsData)
    // return this.coordsData
  }
  ClearDatacoord() {
    this.coordsData = [];
    console.log(this.coordsData)
  }



  DistanceCalculus() {
    //Dosis
    // this.Results = this.dosimetryService.RacionalCalibracion(this.RGBAData[0])

    //Distancia entre dos puntos
    let CoordSist = this.dosimetryService.CoordinateSistem(this.coords0,this.coordsX,this.coordsY);
    this.distance = +this.dosimetryService.Distances(CoordSist[1],CoordSist[2],[this.coordsData[0],this.coordsData[1]],[this.coordsData[2],this.coordsData[3]]).toFixed(2)
    // console.log(distance)

  }
  

}




  // Clear Data
  // ClearOrigincoord() {
  //   this.coords0 = [];
  // }

  // ClearXcoord() {
  //   this.coordsX = [];
  // }

  // ClearYcoord() {
  //   this.coordsY = [];
  // }

  

