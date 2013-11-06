var rect, cCtx, aCtx, buffer, analyser, source, spectrumInterval, style = "fill" /* oder: 'bars', 'fill' */, strokeOpacity;
			
window.onload = function(){
    rect = document.querySelector("#can").getBoundingClientRect();
    cCtx = document.querySelector("#can").getContext("2d");
    
    document.getElementById('can').width = window.innerWidth;
    document.getElementById('can').height = window.innerHeight;
    
    if ('webkitAudioContext' in window) {
    	aCtx = new window.webkitAudioContext();
    	
    	analyser = aCtx.createAnalyser();
    	analyser.smoothingTimeConstant = .9;
    	analyser.connect(aCtx.destination);
    	    	
    	var xml = new XMLHttpRequest();
    	xml.open("GET", 'Rock.mp3', true);
    	xml.responseType = "arraybuffer";
    	xml.addEventListener("load", function(event){
    		var butt = document.getElementsByClassName("button")[0];
    		butt.className = "button";
    		butt.addEventListener("click", playPause, false);
    		butt.innerHTML = "play";
    		
    		buffer = aCtx.createBuffer(xml.response, false);
    	}, false);
    	xml.send(null);
    }
    
    for (var i in document.getElementsByClassName("button")) {
	    document.getElementsByClassName("button")[i].onmousedown = function(){
	    	console.log(this);
		    this.style.webkitAnimation = "0.6s click";
		    var $__THIS_POINTER__ = this;
		    window.onwebkitanimationend = function(){
			    $__THIS_POINTER__['style']['display'] = "none";
		    };
	    };
    }
}

function createNodes(source){
    var volume = aCtx.createGainNode();
    var panner = aCtx.createPanner();
    
    panner.setPosition(0, 0, 0);
    volume.gain.value = 1;
    
    source.connect(panner);			// not needed in the direct way
    panner.connect(volume);			// not needed in the direct way
    volume.connect(analyser);		// not needed in the direct way
    //source.connect(analyser);		// needed in the direct way
    
    return source;
}

function setStrokeAndFillOpacityDown(down){
	if (down) {
		strokeOpacity -= .03;
		cCtx.strokeStyle = "rgba(0, 0, 0, " + strokeOpacity + ")";
		if (strokeOpacity >= 0.3) {
			window.setTimeout("setStrokeAndFillOpacityDown(true)", 20);
		}
	} else {
		strokeOpacity += .03;
		cCtx.strokeStyle = "rgba(0, 0, 0, " + strokeOpacity + ")";
		if (strokeOpacity <= 1) {
			window.setTimeout("setStrokeAndFillOpacityDown(false)", 20);
		}
	}
}

function playPause(){

	var stop = document.getElementById("stop");
	
	try {
	    if (source.playbackState == 2){
		    source.noteOff(aCtx.currentTime);
		    
		    stop.removeEventListener("click", playPause, false);
		    stop.style.opacity = 0;
		    
		    var butt = document.getElementsByClassName("button")[0];
    		butt.className = "button";
    		butt.style.display = "block";
    		butt.style.webkitAnimation = null;
    		butt.innerHTML = "play";
		    
		    strokeOpacity = 1;
		    setStrokeAndFillOpacityDown(true);
		    
		    return;
	    }
    } catch(e){}
        
    stop.style.opacity = 1;
    stop.addEventListener("click", playPause, false);
    
    source = aCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source = createNodes(source);
    source.connect(aCtx.destination);
    source.noteOn(aCtx.currentTime);
    spectrumInterval = setInterval(drawSpectrum, 1000 / 25);
    
	strokeOpacity = 0.2;
	setStrokeAndFillOpacityDown(false);

    
    stop.addEventListener("click", playPause, false);
}

function drawSpectrum(){
    var dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    var barWidth = 3;
    var totalBars = Math.round(rect.width / barWidth);
    
    cCtx.clearRect(0, 0, rect.width, rect.height);
    if (style == 'fill') {
    	cCtx.beginPath();
    	cCtx.moveTo(0, rect.height);
    }
    for (var i = 0; i < totalBars; ++i) {
    	var current = dataArray[i];
    	if (style == 'bars') {
    	 	cCtx.fillRect(barWidth * i, rect.height, barWidth - 2, -current * 2.5);
    	 } else {
    		cCtx.lineTo(barWidth * i, rect.height - (current * 2));
    	 }
    }
    if (style == 'fill') {
    	cCtx.lineTo(rect.width, rect.height);
    	cCtx.closePath();
    	cCtx.stroke();
    	cCtx.fillStyle = "rgba(0, 0, 0, 0.1)";
    	cCtx.fill();
    }
    
    //cCtx.fillRect(50, 50, 20, dataArray[0]);
}