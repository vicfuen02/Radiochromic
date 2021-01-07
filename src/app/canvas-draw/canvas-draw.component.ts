import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-canvas-draw',
  templateUrl: './canvas-draw.component.html',
  styleUrls: ['./canvas-draw.component.scss'],
})
export class CanvasDrawComponent implements AfterViewInit {

  @ViewChild('imageCanvas', { static: false }) canvas: any;
  canvasElement: any;
  saveX: number;
  saveY: number;
 
  selectedColor = '#9e2956';
  colors = [ '#9e2956', '#c2281d'];
 
  drawing = false;
  lineWidth = 5;
 

  constructor(private plt: Platform) { }

  ngAfterViewInit() {
    // Set the Canvas Element and its size
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.plt.width() + '';
    this.canvasElement.height = 200;
  }

  startDrawing(ev) {
    // console.log('-----START:', ev)

    this.drawing = false;
    var canvasPosition = this.canvasElement.getBoundingClientRect();
    let ctx = this.canvasElement.getContext('2d');

    // console.log('position:', canvasPosition)

    // we get the point where we click
      //pageX and pageY depends if it is a mouseevent or a touchevent
    let pageX = ev.pageX? ev.pageX : ev.touches[0].pageX;
    let pageY = ev.pageY? ev.pageY : ev.touches[0].pageY;

    this.saveX = pageX - canvasPosition.x;
    this.saveY = pageY - canvasPosition.y;
    console.log('click:', `X: ${this.saveX}, Y:${this.saveY}` )

    // draw a rectangule where click
    const w=10;
    const h= 10;
    ctx.fillRect(this.saveX-w/2, this.saveY-h/2, w,h);
  }
  
  // moved(ev) {
  //   // console.log('-----MOVE:', ev)
  //   if (!this.drawing) return;
  //   var canvasPosition = this.canvasElement.getBoundingClientRect();
  //   let ctx = this.canvasElement.getContext('2d');

  //   let pagX = ev.touches[0].pageX;
  //   let pagY = ev.touches[0].pageY;
  //   console.log(pagX)
  
  //   let currentX = pagX - canvasPosition.x;
  //   let currentY = pagY - canvasPosition.y;

  //   console.log('move:', `X: ${currentX}, Y:${currentY}` )
  
  //   // ctx.lineJoin = 'round';
  //   // ctx.strokeStyle = this.selectedColor;
  //   // ctx.lineWidth = this.lineWidth;
  
  //   // ctx.beginPath();
  //   // ctx.moveTo(this.saveX, this.saveY);
  //   // ctx.lineTo(currentX, currentY);
  //   // ctx.closePath();
  
  //   // ctx.stroke();
  
  //   // this.saveX = currentX;
  //   // this.saveY = currentY;
  // }

  endDrawing(ev) {
    // console.log('-----END:', ev)
    this.drawing = false;
  }


  setBackground() {
    var background = new Image();
    background.src = '../../assets/icon/favicon.png';
    let ctx = this.canvasElement.getContext('2d');
 
    background.onload = () => {
      ctx.drawImage(background,0,0, this.canvasElement.width, this.canvasElement.height);   
    }
  }



}
