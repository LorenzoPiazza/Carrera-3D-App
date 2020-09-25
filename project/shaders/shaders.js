/* In questo file salvo come variabili testuali i vari Vertex Shaders e Fragment Shaders che utilizzo nel progetto.
 * 
 */
 
 
 const standardVS = `
					attribute vec3 position;
					uniform mat4 Pmatrix;
					uniform mat4 Vmatrix;	
					uniform mat4 Mmatrix;
					attribute vec3 color;//the color of the point
					varying vec3 vColor;
					void main(void) { //pre-built function
					  gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);
					  vColor=color;
					}`	;
 
 const standardFS = `
					precision mediump float;
					varying vec3 vColor;
					void main(void) {
					  gl_FragColor = vec4(vColor, 1.);
					}`;
 
 
 
 const textureVS = `
					attribute vec3 position;
					attribute vec2 a_texcoord;
					uniform mat4 Pmatrix;
					uniform mat4 Vmatrix;
					uniform mat4 Mmatrix;
 
					varying vec2 v_texcoord;
 
					void main() {
					  // Multiply the position by the matrix.
					  gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);					 
					  // Pass the texcoord to the fragment shader.
					  v_texcoord = a_texcoord;
					}`;
 
 
 const textureFS = `
					 precision mediump float;
					 
					// Passed in from the vertex shader.
					varying vec2 v_texcoord;
					 
					// The texture.
					uniform sampler2D u_texture;
					 
					void main() {
					   gl_FragColor = texture2D(u_texture, v_texcoord);
					}`;

 const lightTextureVS =`
						attribute vec3 position;
						attribute vec3 normal;
						attribute vec2 a_texcoord;
						
						uniform mat4 Pmatrix, Vmatrix, Mmatrix, normalMat;
						
						varying vec3 fragNormalInterp;
						varying vec3 fragVertPos;
						varying vec2 v_texcoord;
						
						void main(){
							vec4 vertPos4 = Vmatrix * Mmatrix * vec4(position, 1.0);		//Ci va anche VMatrix per ottenere nel Fragment un vettore V corretto
							fragVertPos = vec3(vertPos4) / vertPos4.w;						//Passo la posizione del vertice al fragment shader.
							fragNormalInterp = vec3(normalMat * vec4(normal, 0.0));			//Passo la normale al vertice al fragment shader: normalMat sara' associata alla trasposta dell'inversa della mo_matrix di quell'oggetto.
							gl_Position = Pmatrix * vertPos4;								//Moltiplico solo per Pmatrix tanto vertPos4 è già stato moltiplicato per V e M							  
							v_texcoord = a_texcoord;			// Pass the texcoord to the fragment shader.
						}
						`;
					
 const lightTextureFS =`
						precision mediump float;
						varying vec3 fragNormalInterp; 	// La normale al fragment, ottenuta interpolando le normali ai 3 vertici di quella faccia.
						varying vec3 fragVertPos; 		// La posizione del singolo fragment, ottenuta per interpolazione. E' il vettore V che punta verso l'osservatore
						varying vec2 v_texcoord;		// La coordinata texture del singolo fragment, ottenuta per interpolazione.
						
						uniform int mode; // Rendering mode: 0 per mesh senza texture, 1 per mesh con texture
						
						// Material parameters
						uniform vec3 Ka; // Ambient reflection coefficient
						uniform vec3 Kd; // Diffuse reflection coefficient
						uniform vec3 Ks; // Specular reflection coefficient
						uniform float shininessVal; // Shininess: è il coefficiente n della formula del modello di Phong
						// Light Parameters
						uniform float ambientLight;
						uniform float diffuseLight;
						uniform float specularLight;
						uniform vec3 lightPos; // Light position
						// The Texture
						uniform sampler2D u_texture;						
						
						void main() {
							vec3 N = normalize(fragNormalInterp);
							vec3 L = normalize(lightPos - fragVertPos);		//Vettore L ottenuto come differenza di punti
							float lambertian = max(dot(L, N), 0.0);			// Prodotto scalare tra L e N
							float specular = 0.0;
							if(lambertian > 0.0) {	//Calcolo la componente speculare solo se lambertian è positivo, perchè altrimenti stiamo considerando un vertice in ombra (che avrà quindi componente diffusa e speculare a 0).
								vec3 R = reflect(-L, N); // Reflected light vector
								vec3 V = normalize(-fragVertPos); // Vector to viewer
								// Compute the specular term
								float specAngle = max(dot(R, V), 0.0);
								specular = pow(specAngle, shininessVal);
							}
							if (mode == 1){		//Il colore del fragment è condizionato dall'illuminazione ma anche dalla texture
								vec4 textureColor = texture2D(u_texture, v_texcoord);									
								gl_FragColor = vec4( (Ka * ambientLight + Kd * diffuseLight * lambertian) * textureColor.rgb + Ks * specularLight * specular, 1.0);
							}
							else{	//Il colore del fragment è condizionato solo dall'illuminazione
								gl_FragColor = vec4(Ka * ambientLight +
													Kd * lambertian * diffuseLight +
													Ks * specular * specularLight, 1.0);
							}
						}
						`;

/* QUI DEFINISCO I PROGRAMMI CHE USERO' NEL PROGETTO.
 * ESSENDO VARIABILI GLOBALI, LE DEFINISCO IN QUESTO FILE MA POI LE USO ANCHE ALTROVE
 */
 
 var programList = {
	 standardProgram: null,
	 textureProgram: null,
	 lightTextureProgram: null
 };

 var standardProgramLocs, textureProgramLocs, lightTextureProgramLocs;

/* In questa funzione sfrutto la libreria webgl-utils.js per automatizzare il processo di creazione dei programmi a partire dai sorgenti degli shaders che fornisco come variabili testuali.
 * La libreria, dietro alle quinte, svolge i passi di:
 * -creazione degli shaders, associazione del codice sorgente, compilazione.
 * -creazione del programma, collegarlo agli shaders appena creati e linkare il programma.
 */
function initPrograms(){
	/*======== Creo il programma =====*/
	programList.standardProgram = webglUtils.createProgramFromSources(gl, [standardVS, standardFS]);
	/*======== Memorizzo le location dei suoi attribute e uniforms =====*/
	standardProgramLocs = {
			_position 	: gl.getAttribLocation(programList.standardProgram, "position"),
			_color 		: gl.getAttribLocation(programList.standardProgram, "color"),
			_Pmatrix 	: gl.getUniformLocation(programList.standardProgram, "Pmatrix"),
			_Vmatrix 	: gl.getUniformLocation(programList.standardProgram, "Vmatrix"),
			_Mmatrix 	: gl.getUniformLocation(programList.standardProgram, "Mmatrix")
	};	
	
	/*======== Creo il programma per le Texture =====*/
	programList.textureProgram = webglUtils.createProgramFromSources(gl, [textureVS, textureFS]);
	/*======== Memorizzo le location dei suoi attribute e uniforms =====*/
	textureProgramLocs = {
			_position 	: gl.getAttribLocation(programList.textureProgram, "position"),
			_texcoord	: gl.getAttribLocation(programList.textureProgram, "a_texcoord"),
			_texture	: gl.getUniformLocation(programList.textureProgram, "u_texture"),
			_Pmatrix 	: gl.getUniformLocation(programList.textureProgram, "Pmatrix"),
			_Vmatrix 	: gl.getUniformLocation(programList.textureProgram, "Vmatrix"),
			_Mmatrix 	: gl.getUniformLocation(programList.textureProgram, "Mmatrix")
	};
	
	/*======== Creo il programma =====*/
	programList.lightTextureProgram = webglUtils.createProgramFromSources(gl, [lightTextureVS, lightTextureFS]);
	/*======== Memorizzo le location dei suoi attribute e uniforms =====*/
	lightTextureProgramLocs = {
			_position 		: gl.getAttribLocation(programList.lightTextureProgram, "position"),
			_normal 		: gl.getAttribLocation(programList.lightTextureProgram, "normal"),
			_texcoord		: gl.getAttribLocation(programList.lightTextureProgram, "a_texcoord"),
			_Pmatrix 		: gl.getUniformLocation(programList.lightTextureProgram, "Pmatrix"),
			_Vmatrix 		: gl.getUniformLocation(programList.lightTextureProgram, "Vmatrix"),
			_Mmatrix 		: gl.getUniformLocation(programList.lightTextureProgram, "Mmatrix"),
			_normalMat		: gl.getUniformLocation(programList.lightTextureProgram, "normalMat"),
			_texture		: gl.getUniformLocation(programList.lightTextureProgram, "u_texture"),
			_mode			: gl.getUniformLocation(programList.lightTextureProgram, "mode"),
			_ka				: gl.getUniformLocation(programList.lightTextureProgram, "Ka"),
			_kd				: gl.getUniformLocation(programList.lightTextureProgram, "Kd"),
			_ks				: gl.getUniformLocation(programList.lightTextureProgram, "Ks"),
			_shininessVal	: gl.getUniformLocation(programList.lightTextureProgram, "shininessVal"),
			_ambientLight	: gl.getUniformLocation(programList.lightTextureProgram, "ambientLight"),
			_diffuseLight	: gl.getUniformLocation(programList.lightTextureProgram, "diffuseLight"),
			_specularLight	: gl.getUniformLocation(programList.lightTextureProgram, "specularLight"),
			_lightPos		: gl.getUniformLocation(programList.lightTextureProgram, "lightPos")
	};
}
		