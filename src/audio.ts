import { Instrument } from "./nbs/index";

export class WebAudioPlayer {
    private static context: AudioContext;
    private static destination: GainNode;

    private static conditionalInit() {
        if (!this.context) this.context = new AudioContext();

        if (!this.destination) {
            this.destination = this.context.createGain();
            this.destination.connect(this.context.destination);
        }
    }

    public static async decodeAudioData(buffer: ArrayBuffer) {
        this.conditionalInit();

        return this.context.decodeAudioData(buffer);
    }

    public static playNote(
        key: number,
        instrumentId: number,
        velocity: number,
        panning: number,
        pitch: number
    ) {
        const instrument = Instrument.builtIn.find((i) => i.id == instrumentId);

        if (!instrument || !instrument.audio) return;
        this.conditionalInit();

        let source: AudioBufferSourceNode | GainNode | StereoPannerNode =
            this.context.createBufferSource();

        source.buffer = instrument.audio;
        source.start(0);

        source.playbackRate.value = 2 ** ((key + pitch / 100 - 45) / 12);

        const gainNode = this.context.createGain();
        gainNode.gain.value = velocity / 2 / 100;

        source.connect(gainNode);
        source = gainNode;

        if (panning !== 0) {
            const panningNode = this.context.createStereoPanner();
            panningNode.pan.value = panning / 100;

            source.connect(panningNode);
            source = panningNode;
        }

        source.connect(this.destination);
    }
}
