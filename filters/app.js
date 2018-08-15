var audioContext = undefined, song = 'Rock.mp3', source = undefined, buffer = undefined, filter, waveShape;

window.onload = function(){

  window.applicationCache.addEventListener("chached", function(){
    alert("cached!");
  }, false);
  window.applicationCache.ondownloading = function(){
    alert("downloading...");
  };

  if('webkitAudioContext' in window) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new webkitAudioContext();

    var xml = new XMLHttpRequest();
    xml.open("GET", song, true);
    xml.responseType = "arraybuffer";
    xml.addEventListener("load", function(event){

      var src = audioContext.createBufferSource();
      waveShape = audioContext.createWaveShaper();
      document.getElementById('src').innerHTML = waveShape.channelInterpretation;
      buffer = audioContext.createBuffer(xml.response, false);
      src.buffer = buffer;
      source = src;
      source.connect(audioContext.destination);

    }, false);
    xml.send(null);
  } else {
    alert("Your browser doesn't support Web Audio");
  }

}

function play(){
  /*if (!audioContext.createGain)
    audioContext.createGain = audioContext.createGainNode;
  var gainNode = audioContext.createGain();*/
  var src = audioContext.createBufferSource();
  src.buffer = buffer;

  // Connect source to a gain node
  //src.connect( audioContext.destination );

  //////////////////////////////////////////////////////////////////////
  filter = audioContext.createBiquadFilter();
  src.connect(filter);
  filter.connect(audioContext.destination);
  // Create and specify parameters for the low-pass filter.
  filter.type = 3; // low-shelf filter. See BiquadFilterNode docs
  //filter.frequency.value = 440; // Set cutoff to 440 HZ

  src.loop = true;
  if (!src.start)
    src.start = src.noteOn;
  src.start(0);
  source = src;

}

function pause(){
  source.noteOff(0);
}

function playPauseSound(){
  // 0 => nix, 2 => play, 3 => pause
  (source.playbackState == 2) ? pause() : play();
}

function synthesize(type, val){
  switch (type) {
    case "Q":
      //Quality
      filter.Q.value = val;
      break;
    case "F":
      //Frequency
      filter.frequency.value = val;
      break;
    case "D":
      //Detune
      filter.detune.value = val;
      break;
    case "G":
      //Gain
      source.gain.value = val;
      break;
    default:

      break;
  }
}

function switchSeg(el){
  var olC = document.getElementsByClassName("active")[0].className;
  /^(\S* \S*) active$/.exec(olC.toString());
  olCN = RegExp.$1;
  document.getElementsByClassName("active")[0].className = olCN;
  el.className += " active";
  filter.type = parseInt(el.innerHTML);
  if (el.innerHTML == 3){
    for (var t in document.getElementsByClassName("t")){
      var curr = document.getElementsByClassName("t")[t];
      if (!curr || curr == undefined || curr.id == "G") continue;
      curr.disabled = true;
    }
  } else {
    for (var t in document.getElementsByClassName("t")){
      var curr = document.getElementsByClassName("t")[t];
      if (!curr || curr == undefined) continue;
      curr.disabled = false;
    }
  }
}
