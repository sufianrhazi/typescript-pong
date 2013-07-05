// This interface declaration is hopelessly incorrect

interface Window {
    AudioContext: AudioContext;
    webkitAudioContext: AudioContext;
}

declare class AudioContext {
    destination: AudioDestinationNode;
    currentTime: number;

    createGainNode: () => GainNode;
    createOscillator: () => OscillatorNode;
}

interface AudioNode {
    connect: (destination: AudioNode) => void;
}

interface AudioDestinationNode extends AudioNode {
}

interface AudioParam {
    value: number;
    setValueAtTime: (value: number, time: number) => void;
    linearRampToValueAtTime: (value: number, time: number) => void;
}

interface GainNode extends AudioNode {
    gain: AudioParam;
}

interface OscillatorNode extends AudioNode {
    frequency: AudioParam;
    noteOn: (time: number) => void;
    noteOff: (time: number) => void;
}
