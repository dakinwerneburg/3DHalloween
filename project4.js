//window eventlistner
window.addEventListener("load", addListeners);





var gl, canvas, rotator;  
var a_coords_loc;         
var a_normal_loc;         
var u_modelview;       
var u_projection;
var u_normalMatrix;
var u_material;     
var u_lights;       
var matrixStack = [];     
var projection = mat4.create();    
var modelview;                  
var normalMatrix = mat3.create(); 
var sphere, plane, wframe, walls, jol, coffin, 
    deadbody, table, skull, candleholder, candle, 
    flame, bat, lamp, rat;  

var currentColor = [1,1,1,1];
var cutoff = 80;
var x, y, z, x2, y2, z2, r, time;




/**
 * Draws the image, which consists of either the "world" or a closeup of the "car".
 */
function draw() {
   
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0,0, canvas.width, canvas.height);

    gl.clearColor(0, .0980 ,.2117,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
    mat4.perspective(projection, (45)*Math.PI/180, canvas.width/canvas.height, 1, 1000);
    gl.uniformMatrix4fv(u_projection, false, projection );


    modelview = rotator.getViewMatrix();
   
   
    //draw objects
    drawJackOLanterns();
    drawCoffin();
    drawTable();
    drawLamp();  
    drawCandle(u_lights[3], [-110,-65,-120]);
    drawCandle(u_lights[4], [-120,-65,-105]);
    drawCandle(u_lights[5], [-85,-65,-115]);     
    drawMoon();   
    pushMatrix();
      mat4.translate(modelview,modelview,[x,y,0]);
      mat4.rotateX(modelview,modelview,(x/6)/180*Math.PI);
      drawBats();
    popMatrix(); 
   drawRoom();  
   pushMatrix();
      mat4.translate(modelview,modelview,[x2,0,z2]);
      drawRat();
    popMatrix();    
   

}


/* Set the direction vector of a light, in eye coordinates.
 * (Note: This function sets the value of the global variable normalMatrix.)
 * @param modelview the matrix that does object-to-eye coordinate transforms
 * @param u_direction_loc the uniform variable location for the spotDirection property of the light
 * @param lightDirection a vector that points in the direction that the spotlight is pointing (a vec3)
 */
function setSpotlightDirection( u_direction_loc, modelview, lightDirection ) {
    mat3.normalFromMat4(normalMatrix,modelview);
    var transformedDirection = new Float32Array(3);
    vec3.transformMat3(transformedDirection, lightDirection, normalMatrix);
    gl.uniform3fv(u_direction_loc, transformedDirection);
}

/* Set the position of a light, in eye coordinates.
 * @param u_position_loc the uniform variable location for the position property of the light
 * @param modelview the matrix that does object-to-eye coordinate transforms
 * @param lightPosition the location of the light, in object coordinates (a vec4)
 */
function setLightPosition( u_position_loc, modelview, lightPosition ) {
    var transformedPosition = new Float32Array(4);
    vec4.transformMat4(transformedPosition, lightPosition, modelview);
    gl.uniform4fv(u_position_loc, transformedPosition);
}

/**
 * draws a moon
 */
function drawMoon(){
  
    //moonlight
    gl.uniform3f( u_lights[9].color, .5,.5,.5 );  
    setLightPosition(u_lights[9].position, modelview,[100,130,-150,0]);
    setSpotlightDirection(u_lights[9].spotDirection, modelview, [5,10,1]);

    //moon
    pushMatrix();
    mat4.translate(modelview,modelview,[100,130,-500]);
    mat4.scale(modelview,modelview,[50,50,50]);
    currentColor = [0.8823, 0.8823,0.8392,1];
    gl.uniform3f( u_material.emissiveColor,1,.9882, .7333);  
    sphere.render();
    gl.uniform3f( u_material.emissiveColor,0,0,0);  
    popMatrix();   
}

/**
 * draws a room with 4 wall, floor, and window
 */
function drawRoom(){

    //floor
    pushMatrix();
    mat4.translate(modelview,modelview,[0,-100,0]);
    mat4.scale(modelview,modelview,[5,5,5]);
    currentColor = [.3333,.2352,.1647,1];
    gl.uniform3f( u_material.specularColor, 0, 0, 0 );
    plane.render();
    popMatrix();

    //ceiling
    pushMatrix();
    mat4.translate(modelview,modelview,[0,100,0]);
    mat4.scale(modelview,modelview,[5,5,5]);
    currentColor = [1,1,1,1];
    plane.render();
    popMatrix();

    //walls
    pushMatrix();
    mat4.translate(modelview,modelview,[0,-100,0]);
    mat4.scale(modelview,modelview,[5,5,5]);
    currentColor = [0.933,.909,.666,1];
    gl.uniform3f( u_material.specularColor, .05, .05, .05 );
    //gl.uniform1f( u_material.specularExponent, .5 );
    walls.render();
    popMatrix();

    //window
    pushMatrix();
    mat4.translate(modelview,modelview,[0,-100,0]);
    mat4.scale(modelview,modelview,[5,5,5]);
    currentColor = [1,1, 1,1];
    wframe.render();
    popMatrix();
}

/**
 * draws a coffin
 */
function drawCoffin(){

    //coffin
    pushMatrix();
    mat4.translate(modelview,modelview,[-100,0,-150]);
    mat4.scale(modelview,modelview,[20,20,20]);
    mat4.rotateX(modelview,modelview,(80)/180*Math.PI);
    mat4.rotateZ(modelview,modelview,(-20)/180*Math.PI);
    currentColor = [0.01, 0.01,0.01,1];
    gl.uniform3f( u_material.specularColor, 0, 0, 0 ); 
    coffin.render();
    popMatrix();

    //deadbody
    pushMatrix();
    mat4.translate(modelview,modelview,[-80,-50,-126]);
    mat4.scale(modelview,modelview,[1.5,1.5,1.5]);
    mat4.rotateY(modelview,modelview,(215)/180*Math.PI);
    currentColor = [0.3, 0.3,0.3,1];
    deadbody.render();
    popMatrix();
}

/**
 * draws a jack O' lantern with 2 candles 
 */
function drawJackOLanterns(){
    currentColor = [1.000,.4588, .0941,1];

    drawCandle(u_lights[1], [65,-70,-149]);
    pushMatrix();
    mat4.translate(modelview,modelview,[62,-75,-149]);
    mat4.scale(modelview,modelview,[8,8,8]);
    mat4.rotateY(modelview,modelview,(-20)/180*Math.PI); 
    jol.render();
    popMatrix();


    drawCandle(u_lights[2], [-55,-70,-150]);
    pushMatrix();
    mat4.translate(modelview,modelview,[-60,-75,-150]);
    mat4.scale(modelview,modelview,[8,8,8]);
    mat4.rotateY(modelview,modelview,(20)/180*Math.PI);
    jol.render();
    popMatrix();
}

/**
 * draws a table with a skull and candle
 */
function drawTable(){ 
   
    //table
    pushMatrix();
    mat4.translate(modelview,modelview,[200,-70,-200]);
    mat4.scale(modelview,modelview,[20,25,20]);
    currentColor = [.5098,.3215, .0039,1];
    table.render();
    popMatrix();

    //skull
    pushMatrix();
    mat4.translate(modelview,modelview,[210,-25,-210]);
    mat4.scale(modelview,modelview,[7,7,7]);
    mat4.rotateY(modelview,modelview,(-40)/180*Math.PI);
    mat4.rotateX(modelview,modelview,(-15)/180*Math.PI);
    currentColor = [0.8901, 0.8549,0.7882,1];
    gl.uniform3f( u_material.specularColor, .8862,.3450,.1333 );
    gl.uniform1f( u_material.specularExponent, 20 );
    gl.uniform3f( u_material.emissiveColor,0.08901, 0.08549,0.07882); 
    skull.render();
   gl.uniform3f( u_material.emissiveColor,0, 0,0); 
    popMatrix();

    //candle with holder
    drawCandle(u_lights[7],  [172,-2,-198]);
    pushMatrix();
    mat4.translate(modelview,modelview,[172,-15,-200]);
    mat4.scale(modelview,modelview,[2,2,2]);
    currentColor = [.8039,.5843, .4588,1];
    candleholder.render();
    popMatrix();
}

/**
 * This is a factory method to create candles
 * @param {*} light  - index of light source
 * @param {*} position  - position of light
 */
function drawCandle( light, position ){

    //candle light
    gl.uniform3f( light.color,  .8862,.3450,.1333 );  
    gl.uniform1f( light.attenuation, .05 );
    setLightPosition(light.position, modelview, [position[0], position[1], position[2],1]);

    //candle wax
    pushMatrix();
    mat4.translate(modelview,modelview,position);
    mat4.scale(modelview,modelview,[2,1,2]);  
    currentColor = [.9490,.9058, .8117,1];
    candle.render();
    popMatrix();
    
    //candle flame
    pushMatrix();
    mat4.translate(modelview,modelview,position);
    mat4.scale(modelview,modelview,[2,1,2]);
    currentColor = [1,.9882, .7333,1];
    gl.uniform3f( u_material.emissiveColor,1,.9882, .7333);  
    flame.render();
    gl.uniform3f( u_material.emissiveColor, 0, 0, 0 );
    popMatrix();
}


/**
 * draws a lamp
 */
function drawLamp(){
    
    pushMatrix();
    mat4.translate(modelview,modelview,[200,100,200]);
    mat4.scale(modelview,modelview,[10,10,10]);
    currentColor = [1,1,1,1];
    lamp.render();
    popMatrix();

    gl.uniform3f( u_lights[8].color, 1, 1, 1 );  
    gl.uniform1f( u_lights[8].attenuation, 0 );
    gl.uniform1f( u_lights[8].spotExponent, 2);
    setLightPosition(u_lights[8].position, modelview, [200,90,200,1]);
    setSpotlightDirection(u_lights[8].spotDirection, modelview, [.5,-1,.5]);  
    gl.uniform1f( u_lights[8].spotCosineCutoff, Math.cos(cutoff/180 * Math.PI) ); //    which are spotlights

    pushMatrix();
    mat4.translate(modelview,modelview,[200,90,200]);
    mat4.scale(modelview,modelview,[5,5,5]);
    gl.uniform3f( u_material.emissiveColor,1,.9882, .7333);  
    currentColor = [1,1,1,1];
    sphere.render();
    gl.uniform3f( u_material.emissiveColor, 0, 0, 0 );
    popMatrix();

}

/**
 * draws a rat that moves with animation
 */
function drawRat(){
    pushMatrix();
    mat4.translate(modelview,modelview,[-10,-100,-50]);
    mat4.scale(modelview,modelview,[.25,.25,.25]);
    currentColor = [.2392,.2313,.2313,1];
    rat.render();
    popMatrix();
}

/**
 * draws bats that move with animation
 */
function drawBats(){
    currentColor = [0,0,0,1];

    pushMatrix();
    mat4.translate(modelview,modelview,[10,10,-400]);
    mat4.scale(modelview,modelview,[2,2,2]);
    mat4.rotateX(modelview,modelview,(r)/180*Math.PI); 
    bat.render();
    popMatrix();

    pushMatrix();
    mat4.translate(modelview,modelview,[0,45,-400]);
    mat4.scale(modelview,modelview,[2,2,2]);
    mat4.rotateX(modelview,modelview,(r)/180*Math.PI);
    bat.render();
    popMatrix();

    pushMatrix();
    mat4.translate(modelview,modelview,[-20,98,-450]);
    mat4.rotateX(modelview,modelview,(r)/180*Math.PI);
    mat4.scale(modelview,modelview,[2,2,2]);
    bat.render();
    popMatrix();

    pushMatrix();
    mat4.translate(modelview,modelview,[30,60,-450]);
    mat4.scale(modelview,modelview,[2,2,2]);
    mat4.rotateX(modelview,modelview,(r)/180*Math.PI);
    bat.render();
    popMatrix();

    pushMatrix();
    mat4.translate(modelview,modelview,[50,25,-400]);
    mat4.rotateX(modelview,modelview,(r)/180*Math.PI);
    mat4.scale(modelview,modelview,[2,2,2]);
    bat.render();
    popMatrix();   
}



/**
 *  Push a copy of the current modelview matrix onto the matrix stack.
 */
function pushMatrix() {
    matrixStack.push( mat4.clone(modelview) );
}


/**
 *  Restore the modelview matrix to a value popped from the matrix stack.
 */
function popMatrix() {
    modelview = matrixStack.pop();
}


/**
 *  Create one of the basic objects.  The modelData holds the data for
 *  an IFS using the structure from basic-objects-IFS.js.  This function
 *  creates VBOs to hold the coordinates, normal vectors, and indices
 *  from the IFS, and it loads the data into those buffers.  The function
 *  creates a new object whose properties are the identifies of the
 *  VBOs.  The new object also has a function, render(), that can be called to
 *  render the object, using all the data from the buffers.  That object
 *  is returned as the value of the function.  (The second parameter,
 *  xtraTranslate, is there because this program was ported from a Java
 *  version where cylinders were created in a different position, with
 *  the base on the xy-plane instead of with their center at the origin.
 *  The xtraTranslate parameter is a 3-vector that is applied as a
 *  translation to the rendered object.  It is used to move the cylinders
 *  into the position expected by the code that was ported from Java.)
 */
function createModel(modelData, xtraTranslate) {
    var model = {};
    model.coordsBuffer = gl.createBuffer();
    model.normalBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;
    if (xtraTranslate)
        model.xtraTranslate = xtraTranslate;
    else
        model.xtraTranslate = null;
    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
    model.render = function() {  
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(a_coords_loc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(a_normal_loc, 3, gl.FLOAT, false, 0, 0);
        gl.uniform4fv(u_material.diffuseColor, currentColor);
        if (this.xtraTranslate) {
            pushMatrix();
            mat4.translate(modelview,modelview,this.xtraTranslate);
        }
        gl.uniformMatrix4fv(u_modelview, false, modelview );
        mat3.normalFromMat4(normalMatrix, modelview);
        gl.uniformMatrix3fv(u_normalMatrix, false, normalMatrix);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
        if (this.xtraTranslate) {
            popMatrix();
        }
    }
    return model;
}



/* Creates a program for use in the WebGL context gl, and returns the
 * identifier for that program.  If an error occurs while compiling or
 * linking the program, an exception of type String is thrown.  The error
 * string contains the compilation or linking error.  If no error occurs,
 * the program identifier is the return value of the function.
 *    The second and third parameters are the id attributes for <script>
 * elementst that contain the source code for the vertex and fragment
 * shaders.
 */
function createProgram(gl, vertexShaderID, fragmentShaderID) {
    function getTextContent( elementID ) {
        var element = document.getElementById(elementID);
        var node = element.firstChild;
        var str = "";
        while (node) {
            if (node.nodeType == 3) // this is a text node
                str += node.textContent;
            node = node.nextSibling;
        }
        return str;
    }
    try {
        var vertexShaderSource = getTextContent( vertexShaderID );
        var fragmentShaderSource = getTextContent( fragmentShaderID );
    }
    catch (e) {
        throw "Error: Could not get shader source code from script elements.";
    }
    var vsh = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource(vsh,vertexShaderSource);
    gl.compileShader(vsh);
    if ( ! gl.getShaderParameter(vsh, gl.COMPILE_STATUS) ) {
        throw "Error in vertex shader:  " + gl.getShaderInfoLog(vsh);
     }
    var fsh = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource(fsh, fragmentShaderSource);
    gl.compileShader(fsh);
    if ( ! gl.getShaderParameter(fsh, gl.COMPILE_STATUS) ) {
       throw "Error in fragment shader:  " + gl.getShaderInfoLog(fsh);
    }
    var prog = gl.createProgram();
    gl.attachShader(prog,vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if ( ! gl.getProgramParameter( prog, gl.LINK_STATUS) ) {
       throw "Link error in program:  " + gl.getProgramInfoLog(prog);
    }
    return prog;
}



/* Initialize the WebGL context.  Called from init() */
function initGL() {
    var prog = createProgram(gl,"vshader-source","fshader-source");
    gl.useProgram(prog);
    gl.enable(gl.DEPTH_TEST);
      
    a_coords_loc =  gl.getAttribLocation(prog, "a_coords");
    a_normal_loc =  gl.getAttribLocation(prog, "a_normal");
    gl.enableVertexAttribArray(a_coords_loc);
    gl.enableVertexAttribArray(a_normal_loc);
    
    u_modelview = gl.getUniformLocation(prog, "modelview");
    u_projection = gl.getUniformLocation(prog, "projection");
    u_normalMatrix =  gl.getUniformLocation(prog, "normalMatrix");
    u_material = {
        diffuseColor: gl.getUniformLocation(prog, "material.diffuseColor"),
        specularColor: gl.getUniformLocation(prog, "material.specularColor"),
        emissiveColor: gl.getUniformLocation(prog, "material.emissiveColor"),
        specularExponent: gl.getUniformLocation(prog, "material.specularExponent")
    };
    u_lights = new Array(10);
    for (var i = 0; i < 10; i++) {
        u_lights[i] = {
            enabled: gl.getUniformLocation(prog, "lights[" + i + "].enabled"),
            position: gl.getUniformLocation(prog, "lights[" + i + "].position"),
            color: gl.getUniformLocation(prog, "lights[" + i + "].color"),
            spotDirection: gl.getUniformLocation(prog, "lights[" + i + "].spotDirection"),
            spotCosineCutoff: gl.getUniformLocation(prog, "lights[" + i + "].spotCosineCutoff"),
            spotExponent: gl.getUniformLocation(prog, "lights[" + i + "].spotExponent"),
            attenuation: gl.getUniformLocation(prog, "lights[" + i + "].attenuation")
        };
    }
    for (var i = 1; i < 10; i++) { // set defaults for lights
        gl.uniform1i( u_lights[i].enabled, 1 ); 

    }

    //ambient light - off by default
    gl.uniform4f( u_lights[0].position, 0,0,0,1 ); 
    gl.uniform3f( u_lights[0].color, 0.2,0.2,0.2 );
   
} 

//--------------------------------- animation framework -----------------------------
var animating = true;
function animate() {
    time = performance.now() / 100;
    if (animating) {

       // -50*Math.cos(angle),30,30*Math.sin(angle)

         x +=  Math.sin(time*.05);
         y += Math.cos(time*.3);
         z += Math.sin(time*.01);

         x2 +=  2*Math.sin(x*.02);
         z2 -=  1*Math.cos(z*.2);
         r += 5;    
        draw();
        requestAnimationFrame(animate);
    }
}

function setAnimating(run) {
    if (run != animating) {
        animating = run;
        if (animating)
            requestAnimationFrame(frame);
    }
}

//-------------------------------------------------------------------------

/**
 * initialization function that will be called when the page has loaded
 */
function init() {
    try {
        canvas = document.getElementById("webglcanvas");
        gl = canvas.getContext("webgl") || 
                         canvas.getContext("experimental-webgl");
        if ( ! gl ) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("message").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    try {
        initGL();  // initialize the WebGL graphics context
    }
    catch (e) {
        document.getElementById("message").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context:" + e + "</p>";
        return;
    }
    x=0; 
    y=0;
    z=0;
    r=0;

    x2=0;
    z2=0;

    
    //models
    wframe = createModel(ObjLoader.parseObjText(winFrame, true));
    plane = createModel(ObjLoader.parseObjText(plane, true));
    walls = createModel(ObjLoader.parseObjText(walls, true));
    jol = createModel(ObjLoader.parseObjText(jol, true));
    coffin = createModel(ObjLoader.parseObjText(coffin, true));
    sphere = createModel(uvSphere(1));
    deadbody = createModel(ObjLoader.parseObjText(deadbody, true));
    table = createModel(ObjLoader.parseObjText(table, true));
    skull = createModel(ObjLoader.parseObjText(skull, true));
    candleholder = createModel(ObjLoader.parseObjText(candleholder, true));
    candle = createModel(ObjLoader.parseObjText(candle, true));
    flame = createModel(ObjLoader.parseObjText(flame, true));
    bat = createModel(ObjLoader.parseObjText(bat, true));
    rat = createModel(ObjLoader.parseObjText(rat, true));
    lamp = createModel(ObjLoader.parseObjText(lamp, true));

   //controls
    rotator = new SimpleRotator(canvas,function() {          
           draw();
    },100);  
    draw();
    animate();
}


//--------------------------------- listener framework -----------------------------


/**
 * turns lights of ON/OFF based on checkbox 
 */
 function flipSwitch(){
  var id = this.id;
  if(this.checked){
   switch(id){
     case 'ambient':{
        gl.uniform1i( u_lights[0].enabled, 1 ); 
        draw(); 
     }
     break;
     case 'candles':{
        for (i = 1; i < 8; i++) {
            gl.uniform1i( u_lights[i].enabled, 1 );
            draw(); 
            gl.uniform3f( u_material.emissiveColor,0,0, 0);  
        }  
    }
    break;
    case 'moon':{
        gl.uniform1i( u_lights[9].enabled, 1 );
        draw(); 
    }
    break;
    case 'lamp':{
        gl.uniform1i( u_lights[8].enabled, 1 );
      draw(); 
    }
    break;
   }
  }else{
    switch(id){
        
        case 'ambient':{
            gl.uniform1i( u_lights[0].enabled, 0 );
            gl.uniform3f( u_material.emissiveColor, 0, 0, 0 );
            draw(); 
         }
         break;
         case 'candles':{
            for (i = 1; i < 8; i++) {
                gl.uniform1i( u_lights[i].enabled, 0 );
                gl.uniform3f( u_material.emissiveColor, 0, 0, 0 ); 
                draw(); 
            }  
        }
        break;
        case 'moon':{
            gl.uniform1i( u_lights[9].enabled, 0 );
            gl.uniform3f( u_material.emissiveColor, 0, 0, 0 );
            draw(); 
        }
        break;
        case 'lamp':{
            gl.uniform1i( u_lights[8].enabled, 0 );
            gl.uniform3f( u_material.emissiveColor, 0, 0, 0 );
          draw(); 
        }
        break;
       }
  }
}


/**
 * checkbox eventlistner for light switch
 */
function addListeners(){
    var s = document.getElementsByName("switch");
    var i;
    for (i = 0; i < s.length; i++) {
        s[i].addEventListener('click', flipSwitch);
    }
  
    //
    document.getElementById("button").onclick = function() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0,0, canvas.width, canvas.height);
      if(animating){
        animating = false;
      }else{
        animating = true;
      }
      draw();
     }
  
  
  /**
   * checkbox eventlistner for light switch
   */ 
  var s = document.getElementsByName("switch");
  var i;
  for (i = 0; i < s.length; i++) {
      s[i].addEventListener('click', flipSwitch);
  }
  
  //slider listner for the x positon of spotlight
  var p = document.getElementById('position');
   p.addEventListener('input', function(){
  cutoff = this.value;  
  });
  
  }
