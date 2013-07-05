///<reference path="AudioContext.d.ts"/>
/*
 * class GameAudio
 * ===============
 *
 * The sound effect manager
 *
 */
class GameAudio {
    private audioContext: AudioContext;
    private gain: GainNode;
    private oscillator: OscillatorNode;

    constructor() {
        if (window.AudioContext || window.webkitAudioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gain = this.audioContext.createGainNode();
            this.oscillator = this.audioContext.createOscillator();
            this.gain.connect(this.audioContext.destination);
            this.oscillator.connect(this.gain);
            this.gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime);
            this.oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
            this.oscillator.noteOn(this.audioContext.currentTime);
        }
    }

    public playBallOut(): void {
        if (this.audioContext) {
            this.oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
            this.oscillator.frequency.linearRampToValueAtTime(440, this.audioContext.currentTime + 0.10);
            this.oscillator.frequency.linearRampToValueAtTime(220, this.audioContext.currentTime + 0.35);
            this.gain.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.10);
            this.gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.35);
        }
    }

    public playPing(): void {
        if (this.audioContext) {
            this.oscillator.frequency.setValueAtTime(220 + Math.random() * 660, this.audioContext.currentTime);
            this.gain.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.10);
            this.gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.20);
        }
    }
}

