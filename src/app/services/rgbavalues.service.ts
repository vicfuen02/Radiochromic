import { Injectable } from '@angular/core';
import { DosimetryService } from '../services/dosimetry.service'


@Injectable({
  providedIn: 'root'
})
export class RGBAvaluesService {

  imageData;
  widthCanvas: number;

  constructor(private dosimetryService: DosimetryService,
  ) { }

  getColorIndicesForCoord(x, y, width) {
    var red = y * (width * 4) + x * 4;
    // console.log('indices:', red);
    return [red, red + 1, red + 2, red + 3];
  }



  RGBAvalues(ImageData, colorIndices: number[]) {

    // console.log('Color Indices:', colorIndices)
  
    var r = ImageData.data[colorIndices[0]] / 255;
    var g = ImageData.data[colorIndices[1]] / 255;
    var b = ImageData.data[colorIndices[2]] / 255;
    var a = ImageData.data[colorIndices[3]] / 255;

    var rgba = [+r.toFixed(5),+g.toFixed(5),+b.toFixed(5),+a.toFixed(5)];
    // console.log('r:',r,'g:',g,'b:',b);
    // console.log('a:',a)

    return rgba
  }


  // calcula los valores rgb de un rectangulo de tamañano widht*height centrado en el pixel (x,y)
  SquarePixelsNearby(imageData, x, y, width, height) {

    // x = Math.trunc(x - width/2) - 1; // centrar pixel
    // y = Math.trunc(y - height/2) - 1;

    let PixelsNearby_R: number[]=[];
    let PixelsNearby_G: number[]=[];
    let PixelsNearby_B: number[]=[];

    for (let j = y; j < (y + height); j++) {
      for (let i = x; i < (x + width); i++) {
        
        let RGBdata = this.RGBAvalues(imageData, this.getColorIndicesForCoord(i, j, width));
        
        PixelsNearby_R.push(RGBdata[0]);
        PixelsNearby_G.push(RGBdata[1]);
        PixelsNearby_B.push(RGBdata[2]);
      }
    }
    // let r = this.dosimetryService.ArrayMean(PixelsNearby_R);
    // let g = this.dosimetryService.ArrayMean(PixelsNearby_G);
    // let b = this.dosimetryService.ArrayMean(PixelsNearby_B);
    // console.log('Mean rgb Pixels Nearby:', r, g, b)
    // // console.log('RGBPixelsNearby:',RGBPixelsNearby)
    // return [r, g, b]

    return [PixelsNearby_R, PixelsNearby_G,PixelsNearby_B]
  }

  // Return the red values of a circle in an array, each element of the array is a line of the circle
  // idem for green and blue
  //    --
  //   ------
  //  --------
  //   -----
  //    --

  circlePixelsNearby(imageData, x, y, width, height, orientation = 'vertial' || 'horizontal') {
    // console.log('x:',x);
    // console.log('y:',y);
    let PixelsNearby_R: number[][] = [];
    let PixelsNearby_G: number[][]  = [];
    let PixelsNearby_B: number[][]  =[];
    for (let i=0; i< height; i++) {
      PixelsNearby_R[i] = [];
      PixelsNearby_G[i] = [];
      PixelsNearby_B[i] = [];
    }
    // console.log('PixelsNearby_R:', PixelsNearby_R);
    // console.log('PixelsNearby_G:', PixelsNearby_G);
    // console.log('PixelsNearby_B:', PixelsNearby_B);
    const Center: number[] = [x + Math.trunc(width/2), y + Math.trunc(height/2)];
    const Radius = Math.trunc(width/2);
    // console.log('Center:', Center);
    // console.log('Radius:', Radius);
    let k: number = 0;

    for (let j = y; j < (y + height); j++) {
      for (let i = x; i < (x + width); i++) {
        // console.log('i:', i, 'j:', j)
        // console.log('Circle:', (i - Center[0])**2 + (j - Center[1])**2, Radius**2)
        if ( (i - Center[0])**2 + (j - Center[1])**2 <= Radius**2) {
          // console.log('inside the circle')
          let indices: number[];
          if (orientation == 'vertical') {
            indices= this.getColorIndicesForCoord(i, j, this.widthCanvas);
          } else {
            indices = this.getColorIndicesForCoord(j, i, this.widthCanvas);
          }
          
          let RGBdata: number[] = this.RGBAvalues(imageData, indices);
          // console.log('i:', i, 'j:', j);
          // console.log('indices:',indices);
          // console.log('RGBdata:',RGBdata);
          // console.log(k)
          PixelsNearby_R[k].push(RGBdata[0]);    
          PixelsNearby_G[k].push(RGBdata[1]);
          PixelsNearby_B[k].push(RGBdata[2]); 
        }
      }
      k +=1;
    }
    // console.log('PixelsNearby_R:', PixelsNearby_R);
    // console.log('PixelsNearby_G:', PixelsNearby_G);
    // console.log('PixelsNearby_B:', PixelsNearby_B);
    console.log('END circlePixelsNearby');
    return [PixelsNearby_R, PixelsNearby_G, PixelsNearby_B]
  }


  

  
}
