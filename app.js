const kickSteps = document.querySelectorAll("#kick input");
const snareSteps =  document.querySelectorAll("#snare input");
const clapSteps =  document.querySelectorAll("#clap input");
const hatSteps =  document.querySelectorAll("#hats input");
const wobbleSteps =  document.querySelectorAll("#wobble input");
const deepSynthSteps = document.querySelectorAll("#deepsynth input")
const pads =  document.querySelectorAll("input")
const playPauseBtn = document.querySelector("#pause"); 
const noteSlider = document.querySelector("#slider");
const beatsPer = document.querySelector("#bpm");
const bpmText = document.querySelector("#bpmtext")



Tone.Transport.bpm.value = 120;

//START AUDIO
pads.forEach(pad => {
    pad.addEventListener("click", async () => {
        if (Tone.Transport.state === "stopped") { // Prevents multiple starts
            await Tone.start();
            Tone.Transport.start();
            console.log("Playback started!");
        }
    });
});


const updateBPM = () => Tone.Transport.bpm.value = beatsPer.value;


beatsPer.addEventListener("input", updateBPM)

document.querySelectorAll(".bpm-container button").forEach(btn => {
btn.addEventListener("click", () => {
    btn.textContent === "+" ? beatsPer.stepUp() : beatsPer.stepDown();
    updateBPM();
});
});



//CREATE INSTRUMENTS
//KICK

let instruments = [
  {
    name: "kick",
    synth: new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 0.01,
        oscillator: { type: "sine" },
        envelope: {
        attack: 0.01,
        decay: 0.4,
        sustain: 0.01,
        release: 1.4
        }
    })
  },

//CLAPS
  {
    name: "clap",
    synth: new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: {
            attack: 0.001,
            decay: 0.2,
            sustain: 0.01,
        }
    })
  },

//SNARE
    {
    name: "snare",
    synth: new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0,
        release: 0.05
        }
    })
  },

//HATS 
    {
    name: "hats",
    synth: new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: {
        attack: 0.001,
        decay: 0.02,
        sustain: 0,
        }
    })
    },

//WOBBLE
    {
    name: "wobble",
    synth: new Tone.MonoSynth({
        oscillator: { type: "sine" },
        filter: { type: "lowpass", frequency: 400 },
        envelope: {
            attack: 0.01,
            decay: 0.2,
            sustain: 0.8,
            release: 1,
        },
        lfo: new Tone.LFO ({
                type: "sine",
                min: 200,
                max: 600,
                frequency: "2n",
            }).start()
        })

    },

//DEEP SYNTH 
    {
     name: "piano",
     synth: new Tone.PolySynth(Tone.Synth, {
        oscillator: {
            type: "triangle"
        },
        envelope: {
            attack: 0.01,   
            decay: 0.3,     
            sustain: 0.2,    
            release: 0.5     
        },
        volume: -8 
    }
)}
];

//CONNECT INSTRUMENTS TO DESTINATION
instruments.forEach(inst => {
    inst.synth.toDestination();

    if (inst.lfo) {
        inst.lfo.connect(inst.synth.filter.frequency)
    }
});

//CHANGE WOBBLE NOTE

noteSlider.addEventListener("input", (e) => {
    let midiValue = e.target.value;
    let note = Tone.Frequency(midiValue, "midi").toNote();
    instruments[4].synth.oscillator.frequency.setValueAtTime(Tone.Frequency(note), Tone.now())
});


let stepIndex = 0; 

const loop = new Tone.Loop((time) => {
    pads.forEach(p => p.classList.remove("active"));
    
    if (kickSteps[stepIndex].checked) {
        instruments[0].synth.triggerAttackRelease("C2", "8n", time);
        kickSteps[stepIndex].classList.add("active");
        beatTrigger();
    }

    if (snareSteps[stepIndex].checked) {
        instruments[1].synth.triggerAttackRelease( "8n", time);
        snareSteps[stepIndex].classList.add("active");
        beatTrigger();
    }

    if (clapSteps[stepIndex].checked) {
        instruments[2].synth.triggerAttackRelease("8n", time);
        clapSteps[stepIndex].classList.add("active");



    }

    if(hatSteps[stepIndex].checked) {
        instruments[3].synth.triggerAttackRelease("8n", time)
        hatSteps[stepIndex].classList.add("active");
    }

    if(wobbleSteps[stepIndex].checked) {
       instruments[4].synth.triggerAttackRelease("D0", "8n", time)
        wobbleSteps[stepIndex].classList.add("active");
    }

stepIndex = (stepIndex + 1) % kickSteps.length;
}, "8n").start(0);

//"PIANO"

const keyToNote = {
    "a": "C3", "w": "C#3", "s": "D3", "e": "D#3", "d": "E3",
    "f": "F3", "t": "F#3", "g": "G3", "y": "G#3", "h": "A3",
    "u": "A#3", "j": "B3", "k": "C4", "o": "C#4", "l": "D4"
};

document.addEventListener("keydown", (e) => {
    if (keyToNote[e.key] && !e.repeat) {  
        instruments[5].synth.triggerAttackRelease(keyToNote[e.key], "8n");
    }
});




//EFFECTS 
const pingPongCtrl = document.querySelector("#pingpongctrl");
const reverbCtrl = document.querySelector("#reverbctrl");
const distortCtrl = document.querySelector("#distortctrl");

const pingpong = new Tone.PingPongDelay("4n", 0.3).toDestination();
const reverb = new Tone.Reverb(3).toDestination();
const distortion = new Tone.Distortion({
    distortion: 0.3,
     oversample: "2x",
}).toDestination();

//CONNECT EFFECTS TO INSTRUMENTS 
instruments.forEach(inst => {
    inst.synth.connect(pingpong).connect(reverb).connect(distortion);
})

//MAKE SURE VALUES START AT 0
pingpong.wet.value = 0; 
reverb.wet.value = 0;  
distortion.wet.value = 0

pingPongCtrl.addEventListener("input", (e) => {
    
    pingpong.wet.value = e.target.value;
    //console.log(`Delay level: ${pingpong.wet.value}`)
})

reverbCtrl.addEventListener("input", (e) => {
    reverb.wet.value = e.target.value;
    //console.log(`Reverb level: ${reverb.wet.value}`)
})

distortCtrl.addEventListener("input", (e) => {
    distortion.wet.value = e.target.value;
    //console.log(`Distort level: ${distortion.wet.value}`)
})


//PLAYPAUSE FUNCTIONALITY
function playPause() {
    if (Tone.Transport.state === "started") {
        Tone.Transport.pause(); 
        playPauseBtn.innerHTML = '<i class="material-icons">play_arrow</i>';
    
    } else {
        Tone.Transport.start();
        playPauseBtn.innerHTML = '<i class="material-icons">pause</i>';
       
    }
}

playPauseBtn.addEventListener("click", playPause);


//P5.JS VISUALS
let circleSize = 0; 

function setup() {
    let canvas = createCanvas(200, 100);
    canvas.parent("canvascontainer")
}

function draw() {
    background(0);
    
    // Draw the circle
    fill(255);
    noStroke();
    ellipse(width / 2, height / 2, circleSize);

 
    if (circleSize > 0) {
        circleSize -= 2;
    }
}

function beatTrigger() {
    circleSize = 100; 
};