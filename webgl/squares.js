function Squares() {
	
	var squares = [];
	var starVertexPositionBuffer;
	var tilt = 90;
	var spin = 0;
	var lastTime = 0;

	this.initShaders = function() {
		//var fragmentShader = getShader(gl, "shader-fs");
		//var vertexShader = getShader(gl, "shader-vs");

		var fragmentShader = getShader(gl, "shader-fs", "./webgl/shaders/fragment.shader");
		var vertexShader = getShader(gl, "shader-vs", "./webgl/shaders/vertex.shader");
						
		shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}	

		gl.useProgram(shaderProgram);

		//SPLIT THIS INTO BOILERPLATE AND NON-BOILERPLATE
	
		shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

		// shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
		// gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

		shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
		shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
		shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "uColor");
	}

	this.initBuffers = function() {
		starVertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, starVertexPositionBuffer);
		vertices = [
			-1.0, -1.0,  0.0,
			1.0, -1.0,  0.0,
			-1.0,  1.0,  0.0,
			1.0,  1.0,  0.0
		];
		
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		starVertexPositionBuffer.itemSize = 3;
		starVertexPositionBuffer.numItems = 4;
	}

	this.initWorldObjects = function() {
	var numStars = 80;

	for (var i=0; i < numStars; i++) {
		squares.push(new Square((i / numStars) * 20.0, Math.random()));
	}
}	
	
	this.animate = function() {
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;

		for (var i in squares) {
			squares[i].animate(elapsed);
		}
	}
	lastTime = timeNow;
}

	this.drawScene = function() {
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
		
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		//gl.blendFunc(gl.ONE, gl.ZERO);
		gl.enable(gl.BLEND);

		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, [0.0, 0.0, -15]);
		//mat4.rotate(mvMatrix, degToRad(tilt), [1.0, 0.0, 0.0]);

		for (var i in squares) {
			squares[i].draw(tilt, spin, starVertexPositionBuffer);
			spin += 0.1;
		}
	}	
}
	
function Square(startingDistance, rotationSpeed) {
	this.effectiveFPMS = 60 / 1000; //bp?
	this.angle = Math.random()*360;
	this.dist = startingDistance;
	this.rotationSpeed = rotationSpeed;
	if (Math.random() > 0.5)
		this.clockwise = true;
	else
		this.clockwise = false;
		
	this.drawSquare = function(starVertexPositionBuffer) {
		gl.bindBuffer(gl.ARRAY_BUFFER, starVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, starVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, starVertexPositionBuffer.numItems);
	}
		
	this.draw = function (tilt, spin, starVertexPositionBuffer) {
		mvPushMatrix();

		// Move to the star's position
		mat4.rotate(mvMatrix, degToRad(this.angle), [0.0, 0.0, 1.0]);
		mat4.translate(mvMatrix, [this.dist, 0.0, 0.0]);

		// Rotate back so that the star is facing the viewer
		mat4.rotate(mvMatrix, degToRad(-this.angle), [0.0, 0.0, 1.0]);
		//mat4.rotate(mvMatrix, degToRad(-tilt), [1.0, 0.0, 0.0]);

		// All stars spin around the Z axis at the same rate
		//mat4.rotate(mvMatrix, degToRad(spin), [0.0, 0.0, 1.0]);

		// Draw the star in its main color
		gl.uniform3f(shaderProgram.colorUniform, this.r, this.g, this.b);
		this.drawSquare(starVertexPositionBuffer)

		mvPopMatrix();
	};

	this.animate = function (elapsedTime) {
		if (this.clockwise)
			this.angle -= this.rotationSpeed * this.effectiveFPMS * elapsedTime;
		else
			this.angle += this.rotationSpeed * this.effectiveFPMS * elapsedTime;
	
		// Decrease the distance, resetting the star to the outside of
		// the spiral if it's at the center.
		this.dist -= 0.02 * this.effectiveFPMS * elapsedTime;
		if (this.dist < 0.0) {
			this.dist += 20.0;
			this.randomiseColors();
		}
	}

	this.randomiseColors = function () {
		// Give the star a random color for normal
		// circumstances...
		this.r = Math.random() ;
		this.g = Math.random()  ;
		this.b = Math.random() ;
	};
	
	//
	// Set the colors to a starting value.
	this.randomiseColors();
}










