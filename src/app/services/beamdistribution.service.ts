import { Injectable } from '@angular/core';
import { CropperPosition } from 'ngx-image-cropper';

@Injectable({
  providedIn: 'root'
})
export class BeamDistributionService {

  resizeX: number;
  resizeY: number;

  constructor() { }

  ResizedPixels(imagePosition: CropperPosition) {

    let newPixel1 = [Math.trunc(imagePosition.x1 / this.resizeX), Math.trunc(imagePosition.y1 / this.resizeY)];
    let newPixel2 = [Math.trunc(imagePosition.x2 / this.resizeX), Math.trunc(imagePosition.y2 / this.resizeY)];
    console.log('NEW PIXELS:', newPixel1, newPixel2);
    return [newPixel1, newPixel2]
  }

  sumatorio(array:number[]) {
    let suma: number = 0
    for (let i = 0; i < array.length; i++) {
      suma = suma + array[i]
    }
    return suma
  }

  PowElementsArray(array:number[], power:number) {

    let arrayPowered: number[] = [];
    for (let index = 0; index < array.length; index++) {
      arrayPowered[index] = Math.pow(array[index], power);
    }
    return arrayPowered
  }

  SubsElementArray(element:number, array:number[]) {

    let arraySubstract: number[] = [];
    for (let index = 0; index < array.length; index++) {
      arraySubstract[index] = array[index] - element;
    }
    return arraySubstract
  }

  ProductElementsArray(array1:number[], array2:number[]) {

    let arrayProduct: number[] = [];
    if (array1.length == array2.length) {
      
      for (let index = 0; index < array1.length; index++) {
        arrayProduct[index] = array1[index]*array2[index];
      }
    } else {
      console.log('array1 and arra2 must have same length')
    }
    return arrayProduct
  }

  linspace(startValue: number, stopValue: number, cardinality: number, roundDecimal?: number) {

    var arr: number[] = [];
    var step: number = (stopValue - startValue) / (cardinality - 1);
    if (roundDecimal) {
      for (var i = 0; i < cardinality; i++) {
        +arr.push(startValue + (step * i)).toFixed(roundDecimal);
      }
    } else {
      for (var i = 0; i < cardinality; i++) {
        arr.push(startValue + (step * i));
      }
    }
    
    return arr;
  }

  GaussianFunction(x: number[], A: number, w: number, mu: number, y0: number, roundDecimal?: number) {

    // gaussian = y_offset + ( a / (w / sqrt(pi/2)) ) * exp( -2 * ( x_Gaussian-mu)**2/(w**2) )
    // w = 2*sigma
    // A: Area
    let gaussian: number[] = [];
    if (roundDecimal) {
      for (let i = 0; i < x.length; i++) {
        gaussian[i] = +(y0 + ( A / (w / Math.sqrt(Math.PI/2)) ) * Math.exp( -2 * ( x[i] - mu)**2/(w**2) )).toFixed(roundDecimal);
      }
    } else {
      for (let i = 0; i < x.length; i++) {
        gaussian[i] = y0 + ( A / (w / Math.sqrt(Math.PI/2)) ) * Math.exp( -2 * ( x[i] - mu)**2/(w**2) );
      }
    }
    
    return gaussian
  }


    
  GaussianFitting(x0: number[], y0: number[]) {

    let y_offset: number = Math.min(...y0)*0.99;
    let y_no_offset: number[] = this.SubsElementArray(y_offset, y0);
    let y_max: number= Math.max(...y_no_offset);
    let x: number[] = [];
    let y: number[] = [];
    for (let i = 0; i < y_no_offset.length; i++) {

      if (y_no_offset[i] > y_max*0.1) {
        y.push(y_no_offset[i]);
        x.push(x0[i]);
      }
    }

    let y_Quadratic: number[] = [];
    for (let i = 0; i < y.length; i++) {
      y_Quadratic[i] = Math.log(y[i]);
    }

    let n: number = x.length;
    let x2: number[] = this.PowElementsArray(x,2);
    let mean_x: number = this.sumatorio(x)/n;
    let mean_y: number = this.sumatorio(y_Quadratic)/n;
    let mean_x2: number = this.sumatorio(x2)/n;


    // let Sxx = this.sumatorio((x - mean_x)**2)
    // let Sxy = this.sumatorio((x-mean_x)*(y_Quadratic-mean_y))
    // let Sxx2 = this.sumatorio((x-mean_x)*(x**2-mean_x2))
    // let Sx2x2 = this.sumatorio((x**2-mean_x2)**2)
    // let Sx2y = this.sumatorio((x**2-mean_x2)*(y_Quadratic-mean_y))

    let Sxx: number = this.sumatorio( this.PowElementsArray(this.SubsElementArray(mean_x, x), 2) );
    let Sxy: number = this.sumatorio( this.ProductElementsArray(this.SubsElementArray(mean_x, x), this.SubsElementArray(mean_y, y_Quadratic)) );
    let Sxx2: number = this.sumatorio( this.ProductElementsArray(this.SubsElementArray(mean_x, x), this.SubsElementArray(mean_x2, x2)) );
    let Sx2x2: number = this.sumatorio( this.PowElementsArray(this.SubsElementArray(mean_x2, x2), 2) );
    let Sx2y: number = this.sumatorio( this.ProductElementsArray(this.SubsElementArray(mean_x2, x2), this.SubsElementArray(mean_y, y_Quadratic)));

    let B: number = ( Sxy*Sx2x2 - Sx2y*Sxx2 )/( Sxx*Sx2x2 - Sxx2**2 );
    let C: number = ( Sx2y*Sxx - Sxy*Sxx2 )/( Sxx*Sx2x2 - Sxx2**2 );
    let A: number = mean_y - B*mean_x - C*mean_x2;
    // let r = np.sqrt( 1 - ( this.sumatorio(y_Quadratic - (A+B*x+C*x**2))**2 ) / ( this.sumatorio((y_Quadratic - mean_y)**2) ) )

    console.log('x: ', x);
    console.log('x_Gaussian:', x0[0], x0[x0.length-1]);
    console.log('y: ', y);
    console.log('y_Quadratic: ', y_Quadratic);
    console.log('n: ', n);
    console.log('mean_x: ', mean_x);
    console.log('mean_y: ', mean_y);
    console.log('mean_x2: ', mean_x2);
    // # print('Sxx: ', Sxx)
    // # print('Sxy: ', Sxy)
    // # print('Sxx2: ', Sxx2)
    // # print('Sx2x2: ', Sx2x2)
    // # print('Sx2y: ', Sx2y)
    // # print('A, B, C, r: ', [A, B, C, r])

    let sigma: number = +(0.5*(Math.sqrt(-2/C))).toFixed(3);
    let w2: number = +(-2/C).toFixed(3);
    let w: number = +(Math.sqrt(-2/C)).toFixed(3);
    let mu : number= +(B*w2 / 4).toFixed(3);
    let a: number = +(Math.exp( A + 2*mu**2/w2 + Math.log(w/Math.sqrt(Math.PI/2)) )).toFixed(3);
    let FWHM: number = +(Math.sqrt(2*Math.log(2))*w2).toFixed(3);
    let yc: number = +(y_offset + a / (w * Math.sqrt(Math.PI/2))).toFixed(3);

    let x_Gaussian: number[] = this.linspace(x0[0], x0[x0.length-1], 100, 3);
    let gaussian: number[] = this.GaussianFunction(x_Gaussian, a, w, mu, y_offset, 3);
    console.log('A:', a);
    console.log('w (w = 2*sigma):', w);
    console.log('mu:', mu);
    console.log('sigma:', sigma);
    console.log('FWHM:', FWHM);

    return [x_Gaussian, gaussian, [yc, w, mu, a, FWHM]]
  }



  



}
