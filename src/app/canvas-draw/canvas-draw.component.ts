import { Component, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';

import { PhotoService } from '../services/photo.service';
import { DosimetryService } from '../services/dosimetry.service';
import { Photo } from '../models/photo.interface';
import { RGBAvaluesService } from '../services/rgbavalues.service';
import { BeamDistributionService } from '../services/beamdistribution.service';


@Component({
  selector: 'app-canvas-draw',
  templateUrl: './canvas-draw.component.html',
  styleUrls: ['./canvas-draw.component.scss'],
})
export class CanvasDrawComponent {

  @ViewChild('imageCanvas', { static: false }) canvas: any;
  canvasElement: any;

  // Pixel coordinates
  saveX: number;
  saveY: number;
 
  background = new Image(); // create new image where to put the photo
  ctx:any; //context of the canvas element
  imgdata:any; //Image data (RGBA values)

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
  brillo: number;
  rgb255: number[];
  constructor(private plt: Platform,
              private photoSvc: PhotoService,
              private dosimetryService: DosimetryService,
              private rgbavaluesService: RGBAvaluesService,
              private beamDistributionService: BeamDistributionService) {       
  }

  prueba() {
    console.log('ey que tal')
  }

  async setBackground() {
    try {

      this.canvasElement = this.canvas.nativeElement;
      
      this.background = new Image()
      this.photoShared = await this.photoSvc.getSharedPhoto()
      
      this.background.src = this.photoShared.webviewPath;
      this.ctx = this.canvasElement.getContext('2d');

      
      //////// Tamaño original, canvas y renormalizacion de la imagen
      this.imgWidth = this.background.naturalWidth;
      this.imgHeight = this.background.naturalHeight;
      const imgRatio = this.imgWidth / this.imgHeight;
      console.log('OriginalW:', this.imgWidth, 'OriginalH:', this.imgHeight, 'ratio:', imgRatio);

      this.canvasElement.width = this.plt.width() + '';
      this.canvasElement.height = this.canvasElement.width / imgRatio;
      console.log('CanvasW:', this.canvasElement.width, 'canvasH:', this.canvasElement.height);
      this.rgbavaluesService.widthCanvas = this.canvasElement.width;

      this.beamDistributionService.resizeX = this.imgWidth / this.canvasElement.width;
      this.beamDistributionService.resizeY = this.imgHeight / this.canvasElement.height;
      console.log('resizeX:', this.beamDistributionService.resizeX, 
                  'resizeY:', this.beamDistributionService.resizeY
      );
      
      // this.ctx.imageSmoothingEnabled = false;
      this.ctx.drawImage(this.background,0,0, this.canvasElement.width, this.canvasElement.height);
      // console.log('ctx:',this.ctx)

      this.imgdata = this.ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
      this.rgbavaluesService.imageData = this.imgdata;
      console.log('imgData CANVAS:', this.imgdata);
      // clear stored data
      // this.ClearAllData()

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

    var canvasPosition = this.canvasElement.getBoundingClientRect();
    let otherctx = this.canvasElement.getContext('2d'); 
    // console.log('ev:',ev)
    // console.log('ctx:', this.ctx)
    // console.log('position:', canvasPosition)

    // we get the point where we click
      //pageX and pageY depends if it is a mouse event or a touch event
    let pageX = ev.pageX? ev.pageX : ev.touches[0].pageX;
    let pageY = ev.pageY? ev.pageY : ev.touches[0].pageY;
    this.saveX = Math.trunc(pageX - canvasPosition.x);
    this.saveY = Math.trunc(pageY - canvasPosition.y);
    console.log('click:', `X: ${this.saveX}, Y:${this.saveY}`)
    
    // RGBA indexes of the selected pixel
    var colorIndices = this.rgbavaluesService.getColorIndicesForCoord(this.saveX, this.saveY, this.canvasElement.width);
    //RGBA values of the selected pixel
    this.rgba = this.rgbavaluesService.RGBAvalues(this.imgdata, colorIndices);
    console.log('RGBA:', this.rgba)

    // draw a rectangule where you click
    const w=10;
    const h= 10;
    otherctx.fillRect(this.saveX-w/2, this.saveY-h/2, w + 1, h + 1);
    otherctx.clearRect(this.saveX-0.5*w/2, this.saveY-0.5*h/2, w*0.5, h*0.5);

    // otherctx.arc(this.saveX-w/2, this.saveY-h/2, 25, 0, 2*Math.PI);
    // otherctx.fillStyle = 'red';
    // otherctx.fill();
    // otherctx.stroke();
    

    this.dosimetryService.saveXY = [this.saveX, this.saveY];
    this.dosimetryService.saveRGB = this.rgba;
    // return [this.saveX, this.saveY]
    this.brillo = (this.rgba[0] + this.rgba[1] + this.rgba[2])*255;
    this.rgb255 = [+(this.rgba[0]*255).toFixed(3) , +(this.rgba[1]*255).toFixed(3) , +(this.rgba[2]*255).toFixed(3)];
  }



  endDrawing(ev) {
    // console.log('-----END:', ev)
  }

  // // calcula los valores rgb de un rectangulo de tamañano widht*height centrado en el pixel (x,y)
  // SquarePixelsNearby(imageData, x, y, width, height) {

  //   x = Math.trunc(x - width/2) - 1;
  //   y = Math.trunc(y - height/2) - 1;

  //   let PixelsNearby_R: number[]=[];
  //   let PixelsNearby_G: number[]=[];
  //   let PixelsNearby_B: number[]=[];

  //   for (let j = y; j < (y + height); j++) {
  //     for (let i = x; i < (x + width); i++) {
        
  //       let RGBdata = this.RGBAvalues(imageData, this.getColorIndicesForCoord(i, j, width));
        
  //       PixelsNearby_R.push(RGBdata[0]);
  //       PixelsNearby_G.push(RGBdata[1]);
  //       PixelsNearby_B.push(RGBdata[2]);
  //     }
  //   }
  //   let r = this.dosimetryService.ArrayMean(PixelsNearby_R);
  //   let g = this.dosimetryService.ArrayMean(PixelsNearby_G);
  //   let b = this.dosimetryService.ArrayMean(PixelsNearby_B);
  //   console.log('Mean rgb Pixels Nearbey:', r, g, b)
  //   // console.log('RGBPixelsNearby:',RGBPixelsNearby)
  //   return [r, g, b]
  // }


  // getColorIndicesForCoord(x, y, width) {
  //   var red = y * (width * 4) + x * 4;
  //   return [red, red + 1, red + 2, red + 3];
  // }



  // RGBAvalues(ImageData,colorIndices: number[]) {

  //   // console.log('Color Indices:', colorIndices)
  
  //   var r = ImageData.data[colorIndices[0]] / 255;
  //   var g = ImageData.data[colorIndices[1]] / 255;
  //   var b = ImageData.data[colorIndices[2]] / 255;
  //   var a = ImageData.data[colorIndices[3]] / 255;

  //   var rgba = [+r.toFixed(5),+g.toFixed(5),+b.toFixed(5),+a.toFixed(5)];
  //   // console.log('r:',r,'g:',g,'b:',b);
  //   // console.log('a:',a)

  //   return rgba
  // }




  // SERVICIO PARA EL RESTO DE PAGINAS (?)
  // Save Data
  // SetOrigincoord() {
  //   this.coords0 = [Math.trunc(this.saveX), Math.trunc(this.saveY)];
  // }

  // SetXcoord() {
  //   this.coordsX = [Math.trunc(this.saveX), Math.trunc(this.saveY)];
  // }

  // SetYcoord() {
  //   this.coordsY = [Math.trunc(this.saveX), Math.trunc(this.saveY)];
  // }

  // SetDatacoord() {
  //   // this.coordsData = [Math.trunc(this.saveX), Math.trunc(this.saveY)];
  //   this.coordsData.push(Math.trunc(this.saveX), Math.trunc(this.saveY));
    
  //   this.RGBAData = this.rgba;
  //   console.log(this.coordsData)
  //   // return this.coordsData
  // }
  // ClearDatacoord() {
  //   this.coordsData = [];
  //   console.log(this.coordsData)
  // }


  // DistanceCalculus() {
  //   //Dosis
  //   // this.Results = this.dosimetryService.RacionalCalibracion(this.RGBAData[0])

  //   //Distancia entre dos puntos
  //   let CoordSist = this.dosimetryService.CoordinateSistem(this.coords0,this.coordsX,this.coordsY);
  //   this.distance = +this.dosimetryService.Distances(CoordSist[1],CoordSist[2],[this.coordsData[0],this.coordsData[1]],[this.coordsData[2],this.coordsData[3]]).toFixed(2)
  //   // console.log(distance)
  // }
  

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

  

