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
		