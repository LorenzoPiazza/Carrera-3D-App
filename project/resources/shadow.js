// shadows.js

/* 
 * In questo file ho raggruppato le funzioni che predispongono il rendering delle ombre nella scena.
 * E' presente inoltre la funzione renderWithShadow, invocata nell'index.html, per la resa con ombre.
 */

/** ---------------------------------------------------------------------
 * Create a frame buffer for rendering into texture objects.
 * @param gl WebGLRenderingContext
 * @param width Number The width (in pixels) of the rendering (must be power of 2)
 * @param height Number The height (in pixels) of the rendering (must be power of 2)
 * @returns WebGLFramebuffer object
 */
function _createFrameBufferObject(gl, width, height) {
  var frame_buffer, color_buffer, depth_buffer, status;

  // STEP 1: CREATE A FRAME BUFFER OBJECT
  frame_buffer = gl.createFramebuffer();			//Questo è il frame buffer su cui verrà effettuato il primo render della scena (quello dal punto di vista della sorgente luminosa).

  // STEP 2: CREATE AND INITIALIZE A TEXTURE BUFFER TO HOLD THE COLORS.
  color_buffer = gl.createTexture();				//Creo un color buffer: Non è altro che una texture, al momento vuota, su cui andremo a disegnare in fase di render.
  gl.bindTexture(gl.TEXTURE_2D, color_buffer);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
                                  gl.RGBA, gl.UNSIGNED_BYTE, null);		//Associo null alla texture, i dati infatti verranno scritti quando faccio il render.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // STEP 3: CREATE AND INITIALIZE A TEXTURE BUFFER TO HOLD THE DEPTH VALUES.
  // Note: the WEBGL_depth_texture extension is required for this to work and for the gl.DEPTH_COMPONENT texture format to be supported.
  depth_buffer = gl.createTexture();			//Questo è lo SHADOW BUFFER: Non è altro che una texture, al momento vuota, che verrà usata come ZBuffer e quindi riempita con i depth value in fase di render. I depth value saranno nel range [0,1].
  gl.bindTexture(gl.TEXTURE_2D, depth_buffer);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0,
                                  gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // STEP 4: ATTACH THE SPECIFIC BUFFERS TO THE FRAME BUFFER.
  gl.bindFramebuffer(gl.FRAMEBUFFER, frame_buffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, color_buffer, 0);	//Associo al frame buffer il color buffer sopra creato.
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,  gl.TEXTURE_2D, depth_buffer, 0);	//Associo al frame buffer il depth buffer sopra creato.

  // STEP 5: VERIFY THAT THE FRAME BUFFER IS VALID.
  status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    console.log("The created frame buffer is invalid: " + status.toString());
  }

  // Unbind these new objects, which makes the default frame buffer the target for rendering.
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
  // Remember key properties of the frame buffer object so they can be used later.
  frame_buffer.color_buffer = color_buffer;
  frame_buffer.depth_buffer = depth_buffer;
  frame_buffer.width = width;
  frame_buffer.height = height;

  return frame_buffer;
}

/*Funzione che controlla che l'estensione 'WEBGL_depth_texture' sia disponibile*/
function isShadowAvailable(){
	var depth_texture_extension = gl.getExtension('WEBGL_depth_texture');
	if (!depth_texture_extension) {
		alert('The WebGL program to render th shadows requires the use of the ' +
		'WEBGL_depth_texture extension. This extension is not supported ' +
		'by your browser, so you cannot render shadows.');
		return false;
	}
	return true;
}

  /** ---------------------------------------------------------------------
   * Render the scene with the camera at the light source and store the
   * z-buffer into a texture map (The shadow Buffer).
   */
function renderOnShadowBuffer(){
	gl.useProgram(programList.standardProgram);		//Renderizzo usando lo standard program
	
	gl.bindFramebuffer(gl.FRAMEBUFFER,  shadow_frame_buffer);					// Setto lo shadow_frame_buffer come frame buffer su cui fare il render
	gl.viewport(0, 0, shadow_frame_buffer.width, shadow_frame_buffer.height);	// Set the size of the viewport to be the same size as the frame buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);						// Clear the entire canvas window background with the clear color
		
	// setto la projection matrix
	proj_matrix = m4.perspective(degToRad(fov), aspect, zmin, zmax);
	aspect = shadow_frame_buffer.width/shadow_frame_buffer.height;
	// setto la view matrix con posizione camera nella lightPos
	lightViewMatrix = m4.inverse(m4.lookAt(lightPos, [px-2,py+2,pz-5], up));
	
	gl.uniformMatrix4fv(standardProgramLocs._Pmatrix, false, proj_matrix);
	gl.uniformMatrix4fv(standardProgramLocs._Vmatrix, false, lightViewMatrix);
	
	if(meshes.length >= 1){	//Per ogni oggetto Mesh dentro all'array meshes, lo disegno.
		for(var i=0; i<meshes.length; i++){
			drawOnShadowBufferMesh(meshes[i]);
		}
	}	
	// Disassocio lo shadow frame buffer in modo da tornare a disegnare sul frame buffer classico.
    gl.bindFramebuffer(gl.FRAMEBUFFER,  null);
}

function renderWithShadow(){		
	/****** 1.Renderizzo sullo shadow frame buffer ******/
	// lightPos = [camera_pos[0], camera_pos[1]-3, camera_pos[2]];
	renderOnShadowBuffer();
	
	/****** 2.Renderizzo la scena vera ******/	
	// ridimensiono la canvas, se serve, per adattarla alla dimensione della finestra browser.
	webglUtils.resizeCanvasToDisplaySize(canvas);
	// setto quindi la viewport alla dimensione della canvas e aggiorno l'aspect
	gl.viewport(0.0, 0.0, canvas.width, canvas.height);
	newAspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	if(newAspect != aspect){
		//set projection matrix
		proj_matrix = m4.perspective(degToRad(fov), newAspect, zmin, zmax);
		aspect = newAspect;	
	}
	
	// setto la view matrix con posizione camera nella lightPos
	moveCamera();
	if(viewParamsChanged)
		view_matrix = m4.inverse(m4.lookAt(camera_pos, target, up));
	
	gl.enable(gl.DEPTH_TEST);
	//gl.enable(gl.CULL_FACE);
	//gl.depthFunc(gl.LEQUAL);
	gl.clearColor(0.8235, 0.9137, 0.9764, 1);	//sky color
	gl.clearDepth(1.0);	//Inizializzo il Depth Buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);		//Pulisco sia il color buffer che il depth buffer

	
	gl.useProgram(programList.shadowProgram);					//Renderizzo usando lo shadow program
	//SETUP DEGLI UNIFORM costanti nell'uso del programma. Gli uniform infatti sono a livello di programma quindi se non cambiano posso settarli una volta sola.
	gl.uniformMatrix4fv(shadowProgramLocs._Pmatrix, false, proj_matrix);
	gl.uniformMatrix4fv(shadowProgramLocs._Vmatrix, false, view_matrix);
	//Uniform relativi alla luce: Posso farli anche una sola volta fuori dalla drawLightTextureMesh.
	gl.uniform3fv(shadowProgramLocs._lightPos, lightPos);
	gl.uniform1f(shadowProgramLocs._ambientLight, ambientLight);
	gl.uniform1f(shadowProgramLocs._diffuseLight, diffuseLight);
	gl.uniform1f(shadowProgramLocs._specularLight, specularLight);
	// -- QUI -- ASSOCIO LO SHADOW BUFFER ALLA TEXTURE CHE USERO' NEL FS PER PRELEVARE I DEPTH VALUES E DETERMINARE SE IL FRAGMENT E' IN OMBRA O IN LUCE
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, shadow_frame_buffer.depth_buffer);	
	// Tell the shader to use texture unit 0
	gl.uniform1i(shadowProgramLocs._shadowBuff, 0);
	
	if(meshes.length >= 1){	//Per ogni oggetto Mesh dentro all'array meshes, lo disegno. NOTA: All'array meshes viene aggiunto un oggetto mesh solo una volta che quest'ultima è stata caricata completamente, correttamente e ha già creato i propri Buffer.	
		for(var i=0; i<meshes.length; i++){
			drawLightTextureShadowMesh(meshes[i]);
		}
	}

	//Clear the 2D "text canvas"
	  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	//and redraw
	  ctx.font = '20pt Comic Sans MS';
	  ctx.fillStyle = '#BB4430';
	  ctx.textAlign = "center";
	  ctx.fillText('CARRERA 3D WEB APP', ctx.canvas.width/2, ctx.canvas.height/4);
	
}