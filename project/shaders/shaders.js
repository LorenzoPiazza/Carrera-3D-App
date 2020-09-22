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

 const textureLightVS =`
						attribute vec3 position;
						attribute vec3 normal;
						attribute vec2 a_texcoord;
						
						uniform mat4 PMatrix, Vmatrix, Mmatrix, normalMat;
						
						varying vec3 fragNormalInterp;
						varying vec3 fragVertPos;
						varying vec2 v_texcoord;
						
						void main(){
							vec4 vertPos4 = Vmatrix * Mmatrix * vec4(position, 1.0);		//Ci va anche VMatrix??
							fragVertPos = vec3(vertPos4) / vertPos4.w;						//Passo la posizione del vertice al fragment shader.
							fragNormalInterp = vec3(normalMat * vec4(normal, 0.0));			//Passo la normale al vertice al fragment shader
							gl_Position = PMatrix * vertPos4;								//Moltiplico solo per PMatrix tanto vertPos4 è già stato moltiplicato per V e M							  
							v_texcoord = a_texcoord;			// Pass the texcoord to the fragment shader.
						}
						`;
					
 const textureLightFS =`
						precision mediump float;
						varying vec3 fragNormalInterp; 	// La normale al fragment, ottenuta interpolando le normali ai 3 vertici di quella faccia.
						varying vec3 fragVertPos; 		// La posizione del singolo fragment, ottenuta per interpolazione. E' il vettore V che punta verso l'osservatore
						varying vec2 v_texcoord;		// La coordinata texture del singolo fragment, ottenuta per interpolazione.
						
						uniform int mode; // Rendering mode: 0 means colored mesh, 1 means texured mesh
						
						// Material parameters
						uniform vec3 Ka; // Ambient reflection coefficient
						uniform vec3 Kd; // Diffuse reflection coefficient
						uniform vec3 Ks; // Specular reflection coefficient
						uniform float shininessVal; // Shininess: è il coefficiente n della formula del modello di Phong
						// Light Parameters
						uniform float ambientLight;
						uniform float diffuseLight;
						uniform float specularColor;
						uniform vec3 lightPos; // Light position 
						
						void main() {
							vec3 N = normalize(normalInterp);
							vec3 L = normalize(lightPos - fragVertPos);		//Vettore L ottenuto come differenza di punti
							// Calcolo il prodotto L dot N e lo tengo solo se il cos è positivo
							float lambertian = max(dot(N, L), 0.0);
							float specular = 0.0;
							if(lambertian > 0.0) {
								vec3 R = reflect(-L, N); // Reflected light vector
								vec3 V = normalize(-vertPos); // Vector to viewer
								// Compute the specular term
								float specAngle = max(dot(R, V), 0.0);
								specular = pow(specAngle, shininessVal);
							}
							float textureColor = texture2D(u_texture, v_texcoord);
							if (textureColor != 
							gl_FragColor = vec4(Ka * ambientColor * textureColor +
													Kd * lambertian * diffuseColor * textureColor +
													Ks * specular * specularColor, 1.0);
						`;

/* QUI DEFINISCO I PROGRAMMI CHE USERO' NEL PROGETTO.
 * ESSENDO VARIABILI GLOBALI, LE DEFINISCO IN QUESTO FILE MA POI LE USO ANCHE ALTROVE
 */
 
 var programList = {
	 standardProgram: null,
	 textureProgram: null
 };

 var standardProgramLocs, textureProgramLocs;

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
}
		