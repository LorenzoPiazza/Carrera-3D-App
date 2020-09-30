// carrera.js
// Implementazione dei metodi che permettono il movimento della carrera.

  // STATO DELLA MACCHINA
  // (DoStep fa evolvere queste variabili nel tempo)
  var px,py,pz,facing; // posizione e orientamento
  var mozzoA, mozzoP, sterzo; // stato interno
  var vx,vy,vz; // velocita' attuale

  // queste di solito rimangono costanti
  var velSterzo, velRitornoSterzo, accMax, attrito,
        raggioRuotaA, raggioRuotaP, grip,
        attritoX, attritoY, attritoZ; // attriti
  var key;
  var incVelocitaLancio;


/*=================== CARRERA INIT: Inizializziamo le variabili utili alla fisica e al movimento della carrera ===================*/
function initCarrera(){
  // inizializzo lo stato della macchina
  px=py=pz=facing=0; // posizione e orientamento
  mozzoA=mozzoP=sterzo=0;   // stato
  vx=vy=vz=0;      // velocita' attuale
  // inizializzo la struttura di controllo
  key=[false,false,false,false];
  lancioCarrera = false;
  incVelocitaLancio = false;

  velSterzo=3.2;         // A
  velRitornoSterzo=0.84; // B, sterzo massimo = A*B / (1-B)

  accMax = 0.001;

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

/*=================== CARRERA DO STEP: facciamo un passo di fisica (a delta-t costante): Indipendente dal rendering. ===================*/
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
  px+=vx;
  py+=vy;
  pz+=vz;
  
  //TODO: Controllo collisioni
	// if(px+Math.abs(2*Math.cos(facing)) > 3 || px-Math.abs(2*Math.cos(facing)) < -3	)
		// px-=vx;
	// else
		// px+=vx;
	// py+=vy;
	// pz+=vz;
}


function lancio(){
	if(modalitaGara){	
		lancioCarrera = true;
		incVelocitaLancio = true;
	}
}
