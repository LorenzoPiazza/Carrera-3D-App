// touchpad.js
// @Author: Lorenzo Piazza

/* 
 * In questo file ho raggruppato le funzioni che permettono la gestione del movimento della camera tramite puntatore del mouse (o touch del dito).
 */


var point1, point2, point3, point4, dx, dy, clicked1=false, clicked2=false;

/*FUNZIONE CHE CONVERTE LE COORDINATE BROWSER DEL MOUSE ALLE COORDINATE CANVAS*/
function mouseBrowserToCanvas(canvas, x, y) {				//x,y sono le coordinate browser del puntatore del mouse
      var bbox = canvas.getBoundingClientRect();
      return { x: Math.round(x - bbox.left * (canvas.width  / bbox.width)),
               y: Math.round(y - bbox.top  * (canvas.height / bbox.height))
			};    	  
}





/*** FUNZIONI DI GESTIONE DEI CLICK DEI BOTTONI ***/
function doMouseUp(e){
  if(e.srcElement.id == "touchCanvas1"){
	  clicked1 = false;
	  ctxTouchCanvas1.clearRect(0, 0, ctxTouchCanvas1.canvas.width, ctxTouchCanvas1.canvas.height);
	  ctxTouchCanvas1.drawImage(cursorImg, -5, -5, 200, 200);
	  cameraInteraction.moveForward = false;
	  cameraInteraction.moveBackward = false;
	  cameraInteraction.moveRight = false;
	  cameraInteraction.moveLeft = false;
	  key[0] = false;
	  key[1] = false;
	  key[2] = false;
	  key[3] = false;
  }
  else{
	  clicked2 = false;
	  ctxTouchCanvas2.clearRect(0, 0, ctxTouchCanvas2.canvas.width, ctxTouchCanvas2.canvas.height);
	  ctxTouchCanvas2.drawImage(cursorImg, -5, -5, 200, 200);
	  cameraInteraction.rotateUp = false;
	  cameraInteraction.rotateDown = false;
	  cameraInteraction.rotateRight = false;
	  cameraInteraction.rotateLeft = false;
  }
}

function doMouseDown(e){
  if(e.srcElement.id == "touchCanvas1"){		//Il touch è stato fatto sulla canvas 1
	clicked1 = true;
    point1 = mouseBrowserToCanvas(touchCanvas1, e.clientX, e.clientY);
	ctxTouchCanvas1.beginPath();
	ctxTouchCanvas1.arc(point1.x, point1.y, 20, 0, 2*Math.PI);
	ctxTouchCanvas1.fill();
	ctxTouchCanvas1.closePath();
  } else{
	clicked2 = true;
	point3 = mouseBrowserToCanvas(touchCanvas2, e.clientX, e.clientY);
	ctxTouchCanvas2.beginPath();
	ctxTouchCanvas2.arc(point3.x, point3.y, 20, 0, 2*Math.PI);
	ctxTouchCanvas2.fill();
	ctxTouchCanvas2.closePath();
  }

  
}

function doMouseMove1(e){	
	if(clicked1){		//L'utente sta facendo drag sulla canvas 1: Movimento camera o macchinina (se modalita gara)
		point2 = mouseBrowserToCanvas(touchCanvas1, e.clientX, e.clientY);
		//if((point2.x >= 70 && point2.x <= 125) && (point2.y >= 70 && point2.y <= 125) ){		//Il puntatore del mouse è sopra l'immagine del cursore, disegno il cerchio di spostamento
			ctxTouchCanvas1.clearRect(0, 0, ctxTouchCanvas1.canvas.width, ctxTouchCanvas1.canvas.height);
			ctxTouchCanvas1.drawImage(cursorImg, -5, -5, 200, 200);
			ctxTouchCanvas1.beginPath();
			ctxTouchCanvas1.arc(point2.x, point2.y, 20, 0, 2*Math.PI);
			ctxTouchCanvas1.fill();
			ctxTouchCanvas1.closePath();
		//}
		dx = point1.x - point2.x;
		dy = point1.y - point2.y;

		switch (modalitaGara){
			case false:
				if(point2.x<=85){	//Movimento a sx
					cameraInteraction.moveLeft = true;
					cameraInteraction.moveRight = false;
				} else if(point2.x>=120){	//Movimento a dx
					cameraInteraction.moveLeft = false;
					cameraInteraction.moveRight = true;
				}else{
					cameraInteraction.moveLeft = false;
					cameraInteraction.moveRight = false;
				}
				
				if(point2.y<=85){
					cameraInteraction.moveForward = true;
					cameraInteraction.moveBackward = false;
				} else if(point2.y>=120){
					cameraInteraction.moveForward = false;
					cameraInteraction.moveBackward = true;
				} else{
					cameraInteraction.moveForward = false;
					cameraInteraction.moveBackward = false;
				}
				break;
			case true:
				if(point2.x<=70){	//Movimento a sx
					key[1] = true;
					key[3] = false;
				} else if(point2.x>=135){	//Movimento a dx
					key[1] = false;
					key[3] = true;
				}else{
					key[1] = false;
					key[3] = false;
				}	
				if(point2.y<=85){	//Movimento avanti
					key[0] = true;
					key[2] = false;
				} else if(point2.y>=120){	//Movimento indietro
					key[0] = false;
					key[2] = true;
				} else{
					key[0] = false;
					key[2] = false;
				}
				break;
		}
				
		//point1 = point2;
	}
}


function doMouseMove2(e){	
	if(clicked2){		//L'utente sta facendo drag sulla canvas 1: Movimento camera o macchinina (se modalita gara)
		point4 = mouseBrowserToCanvas(touchCanvas2, e.clientX, e.clientY);
		//if((point2.x >= 70 && point2.x <= 125) && (point2.y >= 70 && point2.y <= 125) ){		//Il puntatore del mouse è sopra l'immagine del cursore, disegno il cerchio di spostamento
			ctxTouchCanvas2.clearRect(0, 0, ctxTouchCanvas2.canvas.width, ctxTouchCanvas2.canvas.height);
			ctxTouchCanvas2.drawImage(cursorImg, -5, -5, 200, 200);
			ctxTouchCanvas2.beginPath();
			ctxTouchCanvas2.arc(point4.x, point4.y, 20, 0, 2*Math.PI);
			ctxTouchCanvas2.fill();
			ctxTouchCanvas2.closePath();
		//}
		dx = point3.x - point4.x;
		dy = point3.y - point4.y;


		// switch (modalitaGara){
			// case false:
				if(point4.x<=85){	//Movimento a sx
					cameraInteraction.rotateLeft = true;
					cameraInteraction.rotateRight = false;
				} else if(point4.x>=120){	//Movimento a dx
					cameraInteraction.rotateLeft = false;
					cameraInteraction.rotateRight = true;
				}else{
					cameraInteraction.rotateLeft = false;
					cameraInteraction.rotateRight = false;
				}
				
				if(point4.y<=85){
					cameraInteraction.rotateUp = true;
					cameraInteraction.rotateDown = false;
				} else if(point4.y>=120){
					cameraInteraction.rotateUp = false;
					cameraInteraction.rotateDown = true;
				} else{
					cameraInteraction.rotateUp = false;
					cameraInteraction.rotateDown = false;
				}
				//break;
		//}
				
		//point1 = point2;
	}
}
	  
