// obj-mesh-loading.js
// @Author: Lorenzo Piazza

/* 
 * In questo file ho raggruppato le funzioni che permettono...
 * 
 * 
 * 
 * 
 */
 
var meshes = [];		//Array di oggetti in cui memorizzo tutte le mesh della scena


function Mesh(meshName, meshData, initial_mo_matrix, material, texture) {
	//CREO I BUFFER per questa mesh
	this.vertexBuffer = gl.createBuffer();
	this.indexBuffer = gl.createBuffer();
	this.normalBuffer = gl.createBuffer();
	this.texBuffer = gl.createBuffer();
	
	this.meshName = meshName;
	this.meshData = meshData; 
	this.material = material;
	this.texture  = texture;
	
	this.initial_mo_matrix = initial_mo_matrix;
	this.indices = [];
	this.vertices = [];
	this.normals = [];
	this.textcoord = [];
	
	//Disegnando con la DrawArrays() mi CREO UN ARRAY JS con tutte le coordinate dei vertici, ordinati faccia per faccia.
	for (var i=1; i<=meshData.nface; i++){  //Per ogni faccia...
	  for (var j=0; j<3; j++){	//...e per ogni vertice di quella faccia...
		  this.vertices.push(meshData.vert[meshData.face[i].vert[j]].x);
		  this.vertices.push(meshData.vert[meshData.face[i].vert[j]].y);
		  this.vertices.push(meshData.vert[meshData.face[i].vert[j]].z);
		  
		  /*TO use the drawElements() */
		  //this.indices.push(meshData.face[i].vert[j]);					//...Inserisco nell'array this.indices l'indice di vertice
		  if(meshData.numtext > 0){			//Carico le coordinate texture solo se ci sono
			this.textcoord.push(meshData.textcoord[meshData.face[i].tex[j]].u);
			this.textcoord.push(1 - (meshData.textcoord[meshData.face[i].tex[j]].v));		//1- per fare il flip UV sulla Y
		  }
		  this.normals.push(meshData.norm[meshData.face[i].norm[j]].x);
		  this.normals.push(meshData.norm[meshData.face[i].norm[j]].y);
		  this.normals.push(meshData.norm[meshData.face[i].norm[j]].z);
	  }					  
	}
	// console.log(this.indices);
	// console.log(meshData.vert);
	// console.log(meshData.textcoord);
	// console.log(this.vertices);

	/*TO use the drawElements() */
	// for(var i=1; i<=meshData.nvert; i++){
		// this.vertices.push(meshData.vert[i].x);
		// this.vertices.push(meshData.vert[i].y);
		// this.vertices.push(meshData.vert[i].z);
	// }
	// for(var i=1; i<=meshData.numtext; i++){				
		// this.textcoord.push(meshData.textcoord[i].u);
		// this.textcoord.push(meshData.textcoord[i].v);
	// }
	//ASSOCIO IL BUFFER creato per questa mesh all'ARRAY_BUFFER e poi vi CARICO I DATI
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
	
	/* TO use the DrawElements() */
	//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	//gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);	
	
	if(meshData.numtext > 0 && texture != null){	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textcoord), gl.STATIC_DRAW);
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null); 
	//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}
 
 
/* loadMeshObj: Funzione di caricamento asincrono della mesh.
 * 
 * 1.Legge il file .OBJ desiderato.
 * 2.Per ogni copia richiesta per quella mesh:
 * 			-crea un oggetto Mesh. 
 * 			-lo inserisce nell'array contenente tutte le mesh della scena.
 * 
 * @param ncopies: numero di copie che voglio per quella data mesh (NOTA: Il relativo file .OBJ viene letto solo una volta per ovvi motivi di efficienza).
 * @param meshNames: array con i nomi per ciascuna copia della mesh.
 * @param filename: path del file .obj da leggere
 * @param initial_mo_matrixes: array con le matrici di posizionamento iniziale per ciascuna copia della mesh
 */
function loadMeshObj(ncopies, meshName, filename, initial_mo_matrixes, material, texture){
  //CARICAMENTO ASINCRONO DELLA RISORSA TRAMITE JQUERY AJAX
  $.get({url: filename, cache: false,
		success: function(result,status,xhr){
			console.log('Caricamento mesh ' + meshName +':');
			var meshData = new subd_mesh();
			meshData = ReadOBJ(result, meshData);		//1.Leggo il file obj
			var meshObject;
			for(var i=0; i<ncopies; i++){
				meshObject = new Mesh(meshName[i], meshData, initial_mo_matrixes[i], material, texture);	//2.Creo l'oggetto mesh
				meshes.push(meshObject);	//3.Lo inserisco nell'array contenente tutte le mesh
			}
			
		},
		error: function(xhr,status,error){
			alert("Errore nel caricamento asincrono del file "+filename);
			mesh = null;
		}
	});
}


function drawMesh(item, index, meshes){
	/*Calcolo la matrice di movimento per l'oggetto Mesh:*/
	mo_matrix = m4.identity(); //0.Resetto la mo_matrix	
	mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix); //1.Setto la posizione iniziale della Mesh
	
	//SETUP degli ATTRIBUTE
	gl.bindBuffer(gl.ARRAY_BUFFER, item.vertexBuffer);
	gl.vertexAttribPointer(standardProgramLocs._position, 3, gl.FLOAT, false,0,0);
	gl.enableVertexAttribArray(standardProgramLocs._position);
	
	//SETUP DEGLI UNIFORM
	gl.uniformMatrix4fv(standardProgramLocs._Pmatrix, false, proj_matrix);
	gl.uniformMatrix4fv(standardProgramLocs._Vmatrix, false, view_matrix);
	gl.uniformMatrix4fv(standardProgramLocs._Mmatrix, false, mo_matrix);
	
	//DISEGNO
	gl.drawArrays(gl.TRIANGLES, 0, 3*item.meshData.nface);
	
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, item.indexBuffer);
	// gl.drawElements(gl.TRIANGLES, item.indices.length-1, gl.UNSIGNED_SHORT, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null); 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	
}

function drawFotocameraTexture(item){
	/*Calcolo la matrice di movimento per l'oggetto Mesh:*/
	mo_matrix = m4.identity(); //0.Resetto la mo_matrix
	//mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix); //1.Setto la posizione iniziale della Mesh
	mo_matrix = m4.multiply(mo_matrix, m4.lookAt(fotocameraMeshPos, [px,py,pz], [0,1,0]));	//Sfrutto la matrice lookAt come matrice di movimento per far seguire alla fotocamera la macchina
	//Scommentare la prossima riga e sostituire alla riga sopra per far anche muovere la fotocameraMesh oltre ad orientarla.
	//mo_matrix = m4.multiply(mo_matrix, m4.lookAt(fotocameraMeshPos[0]+px, fotocameraMeshPos[1]+py, fotocameraMeshPos[2]+pz], [px,py,pz], [0,1,0]));
		
	//SETUP degli ATTRIBUTE
	gl.bindBuffer(gl.ARRAY_BUFFER, item.vertexBuffer);
	gl.vertexAttribPointer(textureProgramLocs._position, 3, gl.FLOAT, false,0,0);
	gl.enableVertexAttribArray(textureProgramLocs._position);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, item.texBuffer);
	gl.vertexAttribPointer(textureProgramLocs._texcoord, 2, gl.FLOAT, false,0,0);
	gl.enableVertexAttribArray(textureProgramLocs._texcoord);
	
	//SETUP DEGLI UNIFORM
	gl.uniformMatrix4fv(textureProgramLocs._Pmatrix, false, proj_matrix);
	gl.uniformMatrix4fv(textureProgramLocs._Vmatrix, false, view_matrix);
	gl.uniformMatrix4fv(textureProgramLocs._Mmatrix, false, mo_matrix);
		
	//ATTIVO LE TEXTURE
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, fotocameraTexture);
	// Tell the shader to use texture unit 0 for the sampler2D "u_texture"
    gl.uniform1i(textureProgramLocs._texture, 0);
	
	//DISEGNO
	gl.drawArrays(gl.TRIANGLES, 0, 3*item.meshData.nface);
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, item.indexBuffer);
	// gl.drawElements(gl.TRIANGLES, item.indices.length, gl.UNSIGNED_SHORT, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null); 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function drawHighwaySignTexture(item){

	/*Calcolo la matrice di movimento per l'oggetto Mesh:*/
	mo_matrix = m4.identity(); //0.Resetto la mo_matrix
	mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix); //1.Setto la posizione iniziale della Mesh
	
	
	//SETUP degli ATTRIBUTE
	gl.bindBuffer(gl.ARRAY_BUFFER, item.vertexBuffer);
	gl.vertexAttribPointer(textureProgramLocs._position, 3, gl.FLOAT, false,0,0);
	gl.enableVertexAttribArray(textureProgramLocs._position);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, item.texBuffer);
	gl.vertexAttribPointer(textureProgramLocs._texcoord, 2, gl.FLOAT, false,0,0);
	gl.enableVertexAttribArray(textureProgramLocs._texcoord);
	
	//SETUP DEGLI UNIFORM
	gl.uniformMatrix4fv(textureProgramLocs._Pmatrix, false, proj_matrix);
	gl.uniformMatrix4fv(textureProgramLocs._Vmatrix, false, view_matrix);
	gl.uniformMatrix4fv(textureProgramLocs._Mmatrix, false, mo_matrix);
	
	// Tell the shader to use texture unit 1 for the sampler2D "u_texture"
	
	//ATTIVO LE TEXTURE
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, highwaySignTexture);
    gl.uniform1i(textureProgramLocs._texture, 1);
	
	//DISEGNO
	gl.drawArrays(gl.TRIANGLES, 0, 3*item.meshData.nface);
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, item.indexBuffer);
	// gl.drawElements(gl.TRIANGLES, item.indices.length, gl.UNSIGNED_SHORT, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null); 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}
function drawCarreraTexture(item){
	/*Calcolo la matrice di movimento per l'oggetto Mesh:*/
	mo_matrix = m4.identity(); //0.Resetto la mo_matrix	
	mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix); //1.Setto la posizione iniziale della Mesh
	//2.Setto eventuali altri movimenti
	if(modalitaGara){
		mo_matrix = m4.translate(mo_matrix, px, py, pz);	//Traslazione della carrera
		mo_matrix = m4.yRotate(mo_matrix, degToRad(facing));
	}
	
	//SETUP degli ATTRIBUTE
	gl.bindBuffer(gl.ARRAY_BUFFER, item.vertexBuffer);
	gl.vertexAttribPointer(textureProgramLocs._position, 3, gl.FLOAT, false,0,0);
	gl.enableVertexAttribArray(textureProgramLocs._position);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, item.texBuffer);
	gl.vertexAttribPointer(textureProgramLocs._texcoord, 2, gl.FLOAT, false,0,0);
	gl.enableVertexAttribArray(textureProgramLocs._texcoord);
	
	//SETUP DEGLI UNIFORM
	gl.uniformMatrix4fv(textureProgramLocs._Pmatrix, false, proj_matrix);
	gl.uniformMatrix4fv(textureProgramLocs._Vmatrix, false, view_matrix);
	gl.uniformMatrix4fv(textureProgramLocs._Mmatrix, false, mo_matrix);
	
	// Tell the shader to use texture unit 2 for the sampler2D "u_texture"
	
	//ATTIVO LE TEXTURE
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, carreraTexture);
    gl.uniform1i(textureProgramLocs._texture, 2);
	
	//DISEGNO
	gl.drawArrays(gl.TRIANGLES, 0, 3*item.meshData.nface);
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, item.indexBuffer);
	// gl.drawElements(gl.TRIANGLES, item.indices.length, gl.UNSIGNED_SHORT, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null); 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function drawRightWheelTexture(item){
	/* Calcolo la matrice di movimento per l'oggetto Mesh:*/
	mo_matrix = m4.identity(); //0.Resetto la mo_matrix	
	// Per ottenere un rendering corretto delle ruote ecco l'ordine con cui vanno applicate le trasformazioni alla geometria (RICORDA che l'ordine di applicazione è inverso):
	if(modalitaGara){
		if(item.meshName == "ruotaADMesh"){
			mo_matrix = m4.translate(mo_matrix, px, py, pz);			//4. Traslazione delle ruote data dal movimento dell'auto
			mo_matrix = m4.yRotate(mo_matrix, degToRad(facing));		//3. Rotazione attorno all'asse Y dovuta al facing, per seguire il corpo della macchina	
			mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix); //2. Traslazione delle ruote (che sono definite con centro nell'origine) nella loro posizione auto corretta.
			mo_matrix = m4.yRotate(mo_matrix,degToRad(sterzo));			//1. Rotazione attorno all'asse Y dovuta dallo sterzo
			mo_matrix = m4.xRotate(mo_matrix, degToRad(mozzoP));		//0. Rotazione del mozzo delle ruote attorno all'asse X
		}
		if(item.meshName == "ruotaPDMesh"){
			mo_matrix = m4.translate(mo_matrix, px, py, pz);			//4. Traslazione delle ruote data dal movimento dell'auto
			mo_matrix = m4.yRotate(mo_matrix, degToRad(facing));		//3. Rotazione attorno all'asse Y dovuta al facing, per seguire il corpo della macchina	
			mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix); //2. Traslazione delle ruote (che sono definite con centro nell'origine) nella loro posizione auto corretta.
			mo_matrix = m4.xRotate(mo_matrix, degToRad(mozzoP));		//0. Rotazione del mozzo delle ruote attorno all'asse X
		}		
	}
	else{
		mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix);
	}
	//SETUP degli ATTRIBUTE
	gl.bindBuffer(gl.ARRAY_BUFFER, item.vertexBuffer);
	gl.vertexAttribPointer(textureProgramLocs._position, 3, gl.FLOAT, false,0,0);
	gl.enableVertexAttribArray(textureProgramLocs._position);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, item.texBuffer);
	gl.vertexAttribPointer(textureProgramLocs._texcoord, 2, gl.FLOAT, false,0,0);
	gl.enableVertexAttribArray(textureProgramLocs._texcoord);
	
	//SETUP DEGLI UNIFORM
	gl.uniformMatrix4fv(textureProgramLocs._Pmatrix, false, proj_matrix);
	gl.uniformMatrix4fv(textureProgramLocs._Vmatrix, false, view_matrix);
	gl.uniformMatrix4fv(textureProgramLocs._Mmatrix, false, mo_matrix);
	
	// Tell the shader to use texture unit 2 for the sampler2D "u_texture"
	
	//ATTIVO LE TEXTURE
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, carreraTexture);
    gl.uniform1i(textureProgramLocs._texture, 2);
	
	//DISEGNO
	gl.drawArrays(gl.TRIANGLES, 0, 3*item.meshData.nface);
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, item.indexBuffer);
	// gl.drawElements(gl.TRIANGLES, item.indices.length, gl.UNSIGNED_SHORT, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null); 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}



/**************************DRAW WITH TEXTURE AND LIGHT**************************/

function drawLightTextureMesh(item){
	/*Calcolo la matrice di movimento per l'oggetto Mesh:*/
	mo_matrix = m4.identity(); //0.Resetto la mo_matrix
		
	if(modalitaGara){
		switch (item.meshName){
			case "carreraMesh":
				mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix); //Setto la posizione iniziale della Mesh
				mo_matrix = m4.translate(mo_matrix, px, py, pz);			//Traslazione della carrera
				mo_matrix = m4.yRotate(mo_matrix, degToRad(facing));		//Orientamento in base allo sterzo
				break;	
			case "ruotaADMesh":
			case "ruotaASMesh":
				mo_matrix = m4.translate(mo_matrix, px, py, pz);			//4. Traslazione delle ruote data dal movimento dell'auto
				mo_matrix = m4.yRotate(mo_matrix, degToRad(facing));		//3. Rotazione attorno all'asse Y dovuta al facing, per seguire il corpo della macchina	
				mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix); //2. Traslazione delle ruote (che sono definite con centro nell'origine) nella loro posizione auto corretta.
				mo_matrix = m4.yRotate(mo_matrix,degToRad(sterzo));			//1. Rotazione attorno all'asse Y dovuta dallo sterzo
				mo_matrix = m4.xRotate(mo_matrix, degToRad(mozzoP));		//0. Rotazione del mozzo delle ruote attorno all'asse X
				break;
			case "ruotaPDMesh":
			case "ruotaPSMesh":
				mo_matrix = m4.translate(mo_matrix, px, py, pz);			//4. Traslazione delle ruote data dal movimento dell'auto
				mo_matrix = m4.yRotate(mo_matrix, degToRad(facing));		//3. Rotazione attorno all'asse Y dovuta al facing, per seguire il corpo della macchina	
				mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix); //2. Traslazione delle ruote (che sono definite con centro nell'origine) nella loro posizione auto corretta.
				mo_matrix = m4.xRotate(mo_matrix, degToRad(mozzoP));		//0. Rotazione del mozzo delle ruote attorno all'asse X
				break;
			case "fotocameraMesh":
				mo_matrix = m4.multiply(mo_matrix, m4.lookAt(fotocameraMeshPos, [px,py,pz], [0,1,0]));	//Sfrutto la matrice lookAt come matrice di movimento per far seguire alla fotocamera la macchina
				//Scommentare la prossima riga e sostituire alla riga sopra per far anche muovere la fotocameraMesh oltre ad orientarla.
				//mo_matrix = m4.multiply(mo_matrix, m4.lookAt(fotocameraMeshPos[0]+px, fotocameraMeshPos[1]+py, fotocameraMeshPos[2]+pz], [px,py,pz], [0,1,0]));
				break;
			default:
				mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix);
		}		
	} else{
		switch (item.meshName){
			case "soleMesh":
				//mo_matrix = m4.multiply(mo_matrix, lightMmatrix);
				mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix);
				break;
			default:
				mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix);
		}
	}
	
	//SETUP degli ATTRIBUTE
	gl.bindBuffer(gl.ARRAY_BUFFER, item.vertexBuffer);
	gl.enableVertexAttribArray(lightTextureProgramLocs._position);
	gl.vertexAttribPointer(lightTextureProgramLocs._position, 3, gl.FLOAT, false,0,0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, item.normalBuffer);
	gl.enableVertexAttribArray(lightTextureProgramLocs._normal);
	gl.vertexAttribPointer(lightTextureProgramLocs._normal, 3, gl.FLOAT, false,0,0);
	
	if(item.meshData.numtext > 0 && item.texture != null){
		gl.bindBuffer(gl.ARRAY_BUFFER, item.texBuffer);
		gl.enableVertexAttribArray(lightTextureProgramLocs._texcoord);		
		gl.vertexAttribPointer(lightTextureProgramLocs._texcoord, 2, gl.FLOAT, false,0,0);

		//ATTIVO LE TEXTURE
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, item.texture);
		// Tell the shader to use texture unit 0 for the sampler2D "u_texture"
		gl.uniform1i(lightTextureProgramLocs._texture, 0);
		gl.uniform1i(lightTextureProgramLocs._mode, 1);
	} else{
		gl.uniform1i(lightTextureProgramLocs._mode, 0);
	}	
	//SETUP DEGLI UNIFORM (qui setto solo quelli che cambiano di mesh in mesh. Quelli che restano costanti per tutto l'uso del programma li setto una volta sola nella funzione render)

	gl.uniformMatrix4fv(lightTextureProgramLocs._Mmatrix, false, mo_matrix);
	gl.uniformMatrix4fv(lightTextureProgramLocs._normalMat, false, m4.transpose(m4.inverse(mo_matrix)));	
	
	gl.uniform3fv(lightTextureProgramLocs._ka,  item.material.ka);
	gl.uniform3fv(lightTextureProgramLocs._kd,  item.material.kd);
	gl.uniform3fv(lightTextureProgramLocs._ks,  item.material.ks);
	gl.uniform1f(lightTextureProgramLocs._shininessVal, item.material.shininessVal);
	

	
	//DISEGNO
	gl.drawArrays(gl.TRIANGLES, 0, 3*item.meshData.nface);
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, item.indexBuffer);
	// gl.drawElements(gl.TRIANGLES, item.indices.length, gl.UNSIGNED_SHORT, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null); 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}


/****** DRAW ON THE SHADOW FRAME BUFFER *******/		//(E' una standard draw, senza colori, tanto mi interessano solo i depth values) 
function drawOnShadowBufferMesh(item){
	if(item.meshName == "soleMesh")
		return;
	/*Calcolo la matrice di movimento per l'oggetto Mesh:*/
	mo_matrix = m4.identity(); //0.Resetto la mo_matrix
		
	if(modalitaGara){
		switch (item.meshName){
			case "carreraMesh":
				mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix); //Setto la posizione iniziale della Mesh
				mo_matrix = m4.translate(mo_matrix, px, py, pz);			//Traslazione della carrera
				mo_matrix = m4.yRotate(mo_matrix, degToRad(facing));		//Orientamento in base allo sterzo
				break;	
			case "ruotaADMesh":
			case "ruotaASMesh":
				mo_matrix = m4.translate(mo_matrix, px, py, pz);			//4. Traslazione delle ruote data dal movimento dell'auto
				mo_matrix = m4.yRotate(mo_matrix, degToRad(facing));		//3. Rotazione attorno all'asse Y dovuta al facing, per seguire il corpo della macchina	
				mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix); //2. Traslazione delle ruote (che sono definite con centro nell'origine) nella loro posizione auto corretta.
				mo_matrix = m4.yRotate(mo_matrix,degToRad(sterzo));			//1. Rotazione attorno all'asse Y dovuta dallo sterzo
				mo_matrix = m4.xRotate(mo_matrix, degToRad(mozzoP));		//0. Rotazione del mozzo delle ruote attorno all'asse X
				break;
			case "ruotaPDMesh":
			case "ruotaPSMesh":
				mo_matrix = m4.translate(mo_matrix, px, py, pz);			//4. Traslazione delle ruote data dal movimento dell'auto
				mo_matrix = m4.yRotate(mo_matrix, degToRad(facing));		//3. Rotazione attorno all'asse Y dovuta al facing, per seguire il corpo della macchina	
				mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix); //2. Traslazione delle ruote (che sono definite con centro nell'origine) nella loro posizione auto corretta.
				mo_matrix = m4.xRotate(mo_matrix, degToRad(mozzoP));		//0. Rotazione del mozzo delle ruote attorno all'asse X
				break;
			case "fotocameraMesh":
				mo_matrix = m4.multiply(mo_matrix, m4.lookAt(fotocameraMeshPos, [px,py,pz], [0,1,0]));	//Sfrutto la matrice lookAt come matrice di movimento per far seguire alla fotocamera la macchina
				//Scommentare la prossima riga e sostituire alla riga sopra per far anche muovere la fotocameraMesh oltre ad orientarla.
				//mo_matrix = m4.multiply(mo_matrix, m4.lookAt(fotocameraMeshPos[0]+px, fotocameraMeshPos[1]+py, fotocameraMeshPos[2]+pz], [px,py,pz], [0,1,0]));
				break;
			default:
				mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix);
		}		
	} else{
			mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix);
	}
	
	//SETUP degli ATTRIBUTE
	gl.bindBuffer(gl.ARRAY_BUFFER, item.vertexBuffer);
	gl.enableVertexAttribArray(standardProgramLocs._position);
	gl.vertexAttribPointer(standardProgramLocs._position, 3, gl.FLOAT, false,0,0);
	
	//SETUP DEGLI UNIFORM (qui setto solo quelli che cambiano di mesh in mesh. Quelli che restano costanti per tutto l'uso del programma li setto una volta sola nella funzione render)
	gl.uniformMatrix4fv(standardProgramLocs._Mmatrix, false, mo_matrix);
	
	//DISEGNO
	gl.drawArrays(gl.TRIANGLES, 0, 3*item.meshData.nface);
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, item.indexBuffer);
	// gl.drawElements(gl.TRIANGLES, item.indices.length, gl.UNSIGNED_SHORT, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null); 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}


/**************************DRAW WITH TEXTURE, LIGHT AND SHADOWS**************************/
var toLightPovMatrix;
function drawLightTextureShadowMesh(item){
	/*Calcolo la matrice di movimento per l'oggetto Mesh:*/
	mo_matrix = m4.identity(); //0.Resetto la mo_matrix
		
	if(modalitaGara){
		switch (item.meshName){
			case "carreraMesh":
				mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix); //Setto la posizione iniziale della Mesh
				mo_matrix = m4.translate(mo_matrix, px, py, pz);			//Traslazione della carrera
				mo_matrix = m4.yRotate(mo_matrix, degToRad(facing));		//Orientamento in base allo sterzo
				break;	
			case "ruotaADMesh":
			case "ruotaASMesh":
				mo_matrix = m4.translate(mo_matrix, px, py, pz);			//4. Traslazione delle ruote data dal movimento dell'auto
				mo_matrix = m4.yRotate(mo_matrix, degToRad(facing));		//3. Rotazione attorno all'asse Y dovuta al facing, per seguire il corpo della macchina	
				mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix); //2. Traslazione delle ruote (che sono definite con centro nell'origine) nella loro posizione auto corretta.
				mo_matrix = m4.yRotate(mo_matrix,degToRad(sterzo));			//1. Rotazione attorno all'asse Y dovuta dallo sterzo
				mo_matrix = m4.xRotate(mo_matrix, degToRad(mozzoP));		//0. Rotazione del mozzo delle ruote attorno all'asse X
				break;
			case "ruotaPDMesh":
			case "ruotaPSMesh":
				mo_matrix = m4.translate(mo_matrix, px, py, pz);			//4. Traslazione delle ruote data dal movimento dell'auto
				mo_matrix = m4.yRotate(mo_matrix, degToRad(facing));		//3. Rotazione attorno all'asse Y dovuta al facing, per seguire il corpo della macchina	
				mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix); //2. Traslazione delle ruote (che sono definite con centro nell'origine) nella loro posizione auto corretta.
				mo_matrix = m4.xRotate(mo_matrix, degToRad(mozzoP));		//0. Rotazione del mozzo delle ruote attorno all'asse X
				break;
			case "fotocameraMesh":
				mo_matrix = m4.multiply(mo_matrix, m4.lookAt(fotocameraMeshPos, [px,py,pz], [0,1,0]));	//Sfrutto la matrice lookAt come matrice di movimento per far seguire alla fotocamera la macchina
				//Scommentare la prossima riga e sostituire alla riga sopra per far anche muovere la fotocameraMesh oltre ad orientarla.
				//mo_matrix = m4.multiply(mo_matrix, m4.lookAt(fotocameraMeshPos[0]+px, fotocameraMeshPos[1]+py, fotocameraMeshPos[2]+pz], [px,py,pz], [0,1,0]));
				break;
			default:
				mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix);
		}		
	} else{
		switch (item.meshName){
			case "soleMesh":
				//mo_matrix = m4.multiply(mo_matrix, lightMmatrix);
				mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix);
				break;
			default:
				mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix);
		}
	}
	
	//SETUP degli ATTRIBUTE
	gl.bindBuffer(gl.ARRAY_BUFFER, item.vertexBuffer);
	gl.enableVertexAttribArray(shadowProgramLocs._position);
	gl.vertexAttribPointer(shadowProgramLocs._position, 3, gl.FLOAT, false,0,0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, item.normalBuffer);
	gl.enableVertexAttribArray(shadowProgramLocs._normal);
	gl.vertexAttribPointer(shadowProgramLocs._normal, 3, gl.FLOAT, false,0,0);
	
	if(item.meshData.numtext > 0 && item.texture != null){
		gl.bindBuffer(gl.ARRAY_BUFFER, item.texBuffer);
		gl.enableVertexAttribArray(shadowProgramLocs._texcoord);		
		gl.vertexAttribPointer(shadowProgramLocs._texcoord, 2, gl.FLOAT, false,0,0);

		//ATTIVO LE TEXTURE
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, item.texture);
		// Tell the shader to use texture unit 0 for the sampler2D "u_texture"
		gl.uniform1i(shadowProgramLocs._texture, 1);
		
		gl.uniform1i(shadowProgramLocs._mode, 1);
	} else{
		gl.uniform1i(shadowProgramLocs._mode, 0);
	}	
	//SETUP DEGLI UNIFORM (qui setto solo quelli che cambiano di mesh in mesh. Quelli che restano costanti per tutto l'uso del programma li setto una volta sola nella funzione render)

	gl.uniformMatrix4fv(shadowProgramLocs._Mmatrix, false, mo_matrix);
	gl.uniformMatrix4fv(shadowProgramLocs._normalMat, false, m4.transpose(m4.inverse(mo_matrix)));	
	
	gl.uniform3fv(shadowProgramLocs._ka,  item.material.ka);
	gl.uniform3fv(shadowProgramLocs._kd,  item.material.kd);
	gl.uniform3fv(shadowProgramLocs._ks,  item.material.ks);
	gl.uniform1f(shadowProgramLocs._shininessVal, item.material.shininessVal);
	
	toLightPovMatrix = m4.identity();
	m4.multiply(lightViewMatrix, mo_matrix, toLightPovMatrix);
	m4.multiply(proj_matrix, toLightPovMatrix, toLightPovMatrix);
	gl.uniformMatrix4fv(shadowProgramLocs._toLightPovMatrix, false, toLightPovMatrix);

	
	//DISEGNO
	gl.drawArrays(gl.TRIANGLES, 0, 3*item.meshData.nface);
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, item.indexBuffer);
	// gl.drawElements(gl.TRIANGLES, item.indices.length, gl.UNSIGNED_SHORT, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null); 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

