// carrera.js
// implementazione dei metodi

  // STATO DELLA MACCHINA
  // (DoStep fa evolvere queste variabili nel tempo)
  var px,py,pz,facing; // posizione e orientamento (della carrozzeria!?)
  var mozzoA, mozzoP, sterzo; // stato interno
  var vx,vy,vz; // velocita' attuale

  // queste di solito rimangono costanti
  var velSterzo, velRitornoSterzo, accMax, attrito,
        raggioRuotaA, raggioRuotaP, grip,
        attritoX, attritoY, attritoZ; // attriti
  var key;
  var incVelocitaLancio;

// da invocare quando e' stato premuto/rilasciato il tasto numero "keycode"
function EatKey(keycode, keymap, pressed_or_released)
{
  for (var i=0; i<4; i++){
    if (keycode==keymap[i]) key[i]=pressed_or_released;
  }
}


//function drawCube(); // questa e' definita altrove (quick hack)
//void drawAxis(); // anche questa

// // disegna una ruota come due cubi intersecati a 45 gradi
 function drawWheel(){
  mo_matrix1=m4.scale(mo_matrix1,1, 1.0/Math.sqrt(2.0),  1.0/Math.sqrt(2.0));
  gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix1);
  drawCube();

  mo_matrix1=m4.xRotate(mo_matrix1, degToRad(45));
  gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix1);
  drawCube();
 }

// disegna carlinga composta da 1 cubo traslato e scalato
function drawCarlinga(model_matrix){
  // vado al frame pezzo_A
  mo_matrix1=m4.copy(model_matrix);
  mo_matrix1=m4.scale(mo_matrix1, 0.25 , 0.14 , 1);
  gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix1);
  drawCube();
}

// disegna Car
function CarRender() {
// sono nello spazio mondo

//  drawAxis(); // disegno assi spazio mondo
//  glPushMatrix();

  mo_matrix=m4.translate(mo_matrix,px,py,pz);
  mo_matrix=m4.yRotate(mo_matrix, degToRad(facing));

  // sono nello spazio MACCHINA
  // drawAxis(); // disegno assi spazio macchina

  drawCarlinga(mo_matrix);


  // ruota posteriore D
  mo_matrix1=m4.copy(mo_matrix);
  mo_matrix1=m4.translate(mo_matrix1,0.58,+raggioRuotaP-0.28,+0.8);   //traslo la ruota per staccarla dal corpo della macchina
  mo_matrix1=m4.xRotate(mo_matrix1, degToRad(mozzoP));                //ruoto la ruota attorno all'asse x reale di un angolo mozzoP. Il valore di quest'angolo lo ricavo dalla formula della velocità angolare
  mo_matrix1=m4.scale(mo_matrix1,0.1, raggioRuotaP, raggioRuotaP);    //dimensiono la ruota a partire dal cubo: RICORDA L'ORDINE DI APPLICAZIONE INVERSO DELLE MATRICI: Questa sarà la prima ad essere applicata alla nostra geometria!!
  gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix1);
//  drawCube();
  drawWheel();

  // ruota posteriore S
  mo_matrix1=m4.copy(mo_matrix);
  mo_matrix1=m4.translate(mo_matrix1,-0.58,+raggioRuotaP-0.28,+0.8);
  mo_matrix1=m4.xRotate(mo_matrix1,degToRad(mozzoP));
  mo_matrix1=m4.scale(mo_matrix1,0.1, raggioRuotaP, raggioRuotaP);
  gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix1);
//  drawCube();
  drawWheel();

  // ruota anteriore D
  mo_matrix1=m4.copy(mo_matrix);
  mo_matrix1=m4.translate(mo_matrix1,0.58,+raggioRuotaA-0.28,-0.55);
  mo_matrix1=m4.yRotate(mo_matrix1,degToRad(sterzo));
  mo_matrix1=m4.xRotate(mo_matrix1,degToRad(mozzoA));
  mo_matrix1=m4.scale(mo_matrix1,0.08, raggioRuotaA, raggioRuotaA);
  gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix1);
//  drawCube();
  drawWheel();

  // ruota anteriore S
  mo_matrix1=m4.copy(mo_matrix);
  mo_matrix1=m4.translate(mo_matrix1,-0.58,+raggioRuotaA-0.28,-0.55);
  mo_matrix1=m4.yRotate(mo_matrix1,degToRad(sterzo));
  mo_matrix1=m4.xRotate(mo_matrix1,degToRad(mozzoA));
  mo_matrix1=m4.scale(mo_matrix1,0.08, raggioRuotaA, raggioRuotaA);
  gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix1);
//  drawCube();
  drawWheel();
}


/*******************************************************/
/*CARRERA INIT: Inizializziamo le variabili utili alla fisica e al movimento della carrera*/
function CarreraInit(){
  // inizializzo lo stato della macchina
  px=py=pz=facing=0; // posizione e orientamento
  mozzoA=mozzoP=sterzo=0;   // stato
  vx=vy=vz=0;      // velocita' attuale
  // inizializzo la struttura di controllo
  key=[false,false,false,false];
  lancioCarrera = false;
  incVelocitaLancio = false;

  velSterzo=3.2;         // A
//  velSterzo=2.26;       // A
  velRitornoSterzo=0.84; // B, sterzo massimo = A*B / (1-B)

  accMax = 0.001;
  //accMax = 0.0055;

  // attriti: percentuale di velocita' che viene mantenuta
  // 1 = no attrito
  // <<1 = attrito grande
  attritoZ = 0.99;  // piccolo attrito sulla Z (nel senso di rotolamento delle ruote)
  attritoX = 0.8;  // grande attrito sulla X (per non fare slittare la macchina)
  attritoY = 1.0;  // attrito sulla y nullo

  // Nota: vel max = accMax*attritoZ / (1-attritoZ)

  raggioRuotaA = 0.2495;
  raggioRuotaP = 0.2495;

  grip = 0.35; // quanto il facing macchina si adegua velocemente allo sterzo
}
/*CARRERA DO STEP: facciamo un passo di fisica (a delta-t costante). Indipendente dal rendering.*/
function CarreraDoStep(){
  // computiamo l'evolversi della macchina

  var vxm, vym, vzm; // velocita' in spazio macchina

  // da vel frame mondo a vel frame macchina
  var cosf = Math.cos(facing*Math.PI/180.0);
  var sinf = Math.sin(facing*Math.PI/180.0);
  vxm = +cosf*vx - sinf*vz;
  vym = vy;
  vzm = +sinf*vx + cosf*vz;

  // gestione dello sterzo
  if (key[1]) sterzo+=velSterzo;
  if (key[3]) sterzo-=velSterzo;
  sterzo*=velRitornoSterzo; // ritorno a volante fermo

  if(incVelocitaLancio){
		vzm-=(accMax+0.2);
		incVelocitaLancio = false;	
  }
  else{
	  if (key[0]) vzm-=accMax; // accelerazione in avanti
	  if (key[2]) vzm+=accMax; // accelerazione indietro
  }

  // attriti (semplificando)
  vxm*=attritoX;
  vym*=attritoY;
  vzm*=attritoZ;

  // l'orientamento della macchina segue quello dello sterzo
  // (a seconda della velocita' sulla z)
  facing = facing - (vzm*grip)*sterzo;
  
  // rotazione mozzo ruote (a seconda della velocita' sull'asse z della macchina):
  var da ; //delta angolo
  da=(180.0*vzm)/(Math.PI*raggioRuotaA);    //Ricavata dalla formula della velocità angolare (vedi slide 17 pacco progetto_car)
  mozzoA+=da;
  da=(180.0*vzm)/(Math.PI*raggioRuotaP);
  mozzoP+=da;

  // ritorno a vel coord mondo
  vx = +cosf*vxm + sinf*vzm;
  vy = vym;
  vz = -sinf*vxm + cosf*vzm;

  // posizione = posizione + velocita * delta t (ma e' delta t costante = 1)
  controllaCollisioni();
  // px+=vx;
  // py+=vy;
  // pz+=vz;
	if(px+Math.abs(2*Math.cos(facing)) > 3 || px-Math.abs(2*Math.cos(facing)) < -3	)
		px-=vx;
	else
		px+=vx;
	
	py+=vy;
	pz+=vz;
	console.log(px);
  // console.log("vz: " +vz);
  // console.log("vzm: " +vzm);
}

function controllaCollisioni(){
}
