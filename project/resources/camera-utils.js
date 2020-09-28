// camera-utils.js
// @Author: Lorenzo Piazza

/* 
 * In questo file ho raggruppato le funzioni che permettono il movimento della camera all'interno della scena.
 * Si noti la necessità di introdurre la funzione realign() che permette di ricalcolare le giuste direzioni
 * degli assi Xe (qui chiamato right_versor) - Ye - Ze (qui chiamato forward_versor) in seguito alle rotazioni della camera.
 * Il loro ricalcolo ci permette di operare delle traslazioni che siano sempre coerenti con l'orientamento attuale della camera,
 * dando all'utente una sensazione di naturalezza nel movimento.
 */

var camera_pos;
var target;
var up;
var forward_versor, right_versor, ycam_axis;

function initCamera(){
 /*Inizializzo le posizioni significative*/
 camera_pos = [4, 3, 8];
 target = [-2, 2, -8];
 up = [0, 1, 0];
 /*E calcolo gli assi della camera*/
 forward_versor = m4.normalize(m4.subtractVectors(target, camera_pos, forward_versor)); 	//Ze
 right_versor = m4.normalize(m4.cross(forward_versor, up));									//Xe
 ycam_axis = m4.normalize(m4.cross(right_versor, forward_versor));							//Ye
}

/* Funzione realign() che permette di ricalcolare le giuste direzioni degli assi Xe (qui chiamato right_versor) - Ye - Ze (qui chiamato forward_versor).*/
function realign(){
	forward_versor = m4.normalize(m4.subtractVectors(target, camera_pos, forward_versor));
	right_versor = m4.normalize(m4.cross(forward_versor, up));
	ycam_axis = m4.normalize(m4.cross(right_versor, forward_versor));
	forward_versor = m4.normalize(forward_versor);
}

/*TRASLAZIONI DI CAMERA_POS E DI TARGET*/
function moveForwardCameraPos(dist){
	camera_pos[0] += dist * forward_versor[0];
	camera_pos[1] += dist * forward_versor[1];
	camera_pos[2] += dist * forward_versor[2];
}

function moveForwardTarget(dist){
	target[0] += dist * forward_versor[0];
	target[1] += dist * forward_versor[1];
	target[2] += dist * forward_versor[2];
}

function moveUpCameraPos(dist){
	camera_pos[1] += dist;
}

function moveUpTarget(dist){
	target[1] += dist;
}

function moveRightCameraPos(dist){
	camera_pos[0] += dist * right_versor[0];
	camera_pos[1] += dist * right_versor[1];
	camera_pos[2] += dist * right_versor[2];
}

function moveRightTarget(dist){
	target[0] += dist * right_versor[0];
	target[1] += dist * right_versor[1];
	target[2] += dist * right_versor[2];
}

/*ROTAZIONI*/
function rotateTargetRight(rad){
	var rightMatrix = m4.axisRotation(ycam_axis, rad);
	forward_versor = m4.transformPoint(rightMatrix, forward_versor);	//ruoto il forward_versor, considerandolo come un punto, intorno all'asse y della camera.
	target = m4.addVectors(camera_pos, forward_versor);					//aggiorno la posizione del target, sommando il nuovo forward_versor alla camera_pos.
	realign();															//riallineo gli assi della camera.
}

function rotateTargetUp(rad){
	var upMatrix = m4.axisRotation(right_versor, rad);
	forward_versor = m4.transformPoint(upMatrix, forward_versor);		//ruoto il forward_versor, considerandolo come un punto, intorno all'asse x della camera.
	target = m4.addVectors(camera_pos, forward_versor);					//aggiorno la posizione del target, sommando il nuovo forward_versor alla camera_pos.
	realign();															//riallineo gli assi della camera.
}