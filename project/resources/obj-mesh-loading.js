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

function Mesh(meshName, meshData, initial_mo_matrix) {
	//CREO I BUFFER per questa mesh
	this.vertexBuffer = gl.createBuffer();
	this.indexBuffer = gl.createBuffer();
	this.normalBuffer = gl.createBuffer();
	
	this.meshName = meshName;
	this.meshData = meshData; 
	
	this.initial_mo_matrix = initial_mo_matrix;
	this.vertices = [];
	this.normals = [];
	this.textcoord = [];
	
	//Disegnando con la DrawArrays() mi CREO UN ARRAY JS con tutte le coordinate dei vertici, ordinati faccia per faccia.
	 for (var i=1; i<=meshData.nface; i++){  //Per ogni faccia...
	  for (var j=0; j<3; j++){	//Inserisco nell'array this.vertices le coord x,y e z dei vertici 0,1 e 2 di quella faccia
		  this.vertices.push(meshData.vert[meshData.face[i].vert[j]].x);
		  this.vertices.push(meshData.vert[meshData.face[i].vert[j]].y);
		  this.vertices.push(meshData.vert[meshData.face[i].vert[j]].z);
	  }					  
	}
	
	//ASSOCIO IL BUFFER creato per questa mesh all'ARRAY_BUFFER e poi vi CARICO I DATI
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
}
 
function loadMeshObj(meshName, filename, initial_mo_matrix){
  var meshData;
  //CARICAMENTO ASINCRONO DELLA RISORSA TRAMITE JQUERY AJAX
  $.get({url: filename, cache: false, 
		success: function(result,status,xhr){
			meshData = gc_openFile(result, meshName);	//1.Leggo la mesh da file .obj
			var mesh = 	new Mesh(meshName, meshData, initial_mo_matrix);	//2.Creo l'oggetto mesh
			meshes.push(mesh);	//3.Lo inserisco nell'array contenente tutte le mesh
		},
		error: function(xhr,status,error){
			alert("Errore nel caricamento asincrono del file "+filename);
			mesh = null;
		}
	});
}

//LETTURA DELLA MESH DAL FILE OBJ
function gc_openFile(data, meshName) {
	//ReadOBJ della glm_light.js
		mesh = ReadOBJ(data,mesh);
		mesh=LoadSubdivMesh(mesh);
		
		console.log('Completata la lettura della mesh ' + meshName);
		console.log('Num di vertici: ' + mesh.nvert);
		console.log('Num di facce: ' + mesh.nface);
		console.log('Num di edge: ' + mesh.nedge);
		nvert=mesh.nvert;
		nedge=mesh.nedge;
		nface=mesh.nface;

	// FOR DEBUG PURPOSE
		  //STAMPO I 3 INDICI di vertice e le rispettive coordinate per la prima faccia
		  // console.log(mesh.face[1].vert[0],mesh.face[1].vert[1],mesh.face[1].vert[2],mesh.face[1].vert[3]);
		  // console.log(mesh.vert[mesh.face[1].vert[0]], mesh.vert[mesh.face[1].vert[1]], mesh.vert[mesh.face[1].vert[2]]);
		  //STAMPO 1 3 INDICI di texture e le rispettive coordinate per la prima faccia
		  // console.log(mesh.face[1].tex[0],mesh.face[1].tex[1],mesh.face[1].tex[2],mesh.face[1].tex[3]);
		  // console.log(mesh.textcoord[mesh.face[1].tex[0]], mesh.textcoord[mesh.face[1].tex[1]], mesh.textcoord[mesh.face[1].tex[2]]);
		  //STAMPO 1 3 INDICI di normali e le rispettive coordinate per la prima faccia
		  // console.log(mesh.face[1].norm[0],mesh.face[1].norm[1],mesh.face[1].norm[2],mesh.face[1].norm[3]);
		  // console.log(mesh.norm[mesh.face[1].norm[0]], mesh.norm[mesh.face[1].norm[1]], mesh.norm[mesh.face[1].norm[2]]);
		  
		  // vertices_carrera = [];
		  
		  // for(var i=1; i<=mesh.nvert; i++){
			  // vertices_carrera.push(mesh.vert[i].x);
			  // vertices_carrera.push(mesh.vert[i].y);
			  // vertices_carrera.push(mesh.vert[i].z);
		  // }
		  //console.log(vertices_carrera.length);
		  
		return mesh;
 }

var fotocameraPos = [-4, 2, 0];

function drawMesh(item, index, meshes){
	//SETUP degli ATTRIBUTE
	gl.bindBuffer(gl.ARRAY_BUFFER, item.vertexBuffer);
	gl.vertexAttribPointer(_position, 3, gl.FLOAT, false,0,0);
	gl.enableVertexAttribArray(_position);
	
	/*Calcolo la matrice di movimento per l'oggetto Mesh:*/
	
	mo_matrix = m4.identity(); //0.Resetto la mo_matrix
	
	
	mo_matrix = m4.multiply(mo_matrix, item.initial_mo_matrix); //1.Setto la posizione iniziale della Mesh
	if(item.meshName == "fotocameraMesh"){
		// var fotocameraPos = [item.initial_mo_matrix[12], item.initial_mo_matrix[13], item.initial_mo_matrix[14] ];
		mo_matrix = m4.multiply(mo_matrix, m4.lookAt(fotocameraPos, [px,py,pz], [0,1,0]));
	}
	
	//2.Setto eventuali altri movimenti
	if(modalitaGara){
		if(item.meshName == "carreraMesh"){
			mo_matrix = m4.translate(mo_matrix, px, py, pz);	//Traslazione della carrera
			mo_matrix = m4.yRotate(mo_matrix, degToRad(facing));
		}
		if(item.meshName == "ruoteAnterioriMesh"){
			mo_matrix = m4.translate(mo_matrix, px, py, pz);		//Traslazione delle ruote
			mo_matrix = m4.yRotate(mo_matrix, degToRad(facing));
			mo_matrix = m4.yRotate(mo_matrix,degToRad(sterzo));		//Sterzo
			mo_matrix = m4.xRotate(mo_matrix, degToRad(mozzoP));	//Rotazione delle ruote
		}
		if(item.meshName == "ruotePosterioriMesh"){
			mo_matrix = m4.translate(mo_matrix, px, py, pz);		//Traslazione delle ruote
			mo_matrix = m4.yRotate(mo_matrix, degToRad(facing));
			mo_matrix = m4.xRotate(mo_matrix, degToRad(mozzoP));	//Rotazione delle ruote
		}
		
	}
	
	//SETUP DEGLI UNIFORM
	gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix);
	
	//DISEGNO
	gl.drawArrays(gl.TRIANGLES, 0, 3*item.meshData.nface);
}

function drawCarrera(){
	
}

