import { URI } from "./default";
import { fromArrayBuffer, Song } from "./nbs";
import { dataToArrayBuffer } from "./util";

export class WebNBSDocument extends EventTarget {
    public song: Song;
    public container: HTMLDivElement;
    public input: HTMLInputElement;
    public button: HTMLButtonElement;
    public tickCounter: HTMLDivElement;

    public constructor() {
        super();

        this.song = fromArrayBuffer(dataToArrayBuffer(URI));

        this.container = document.createElement("div");
        this.container.id = "container";

        this.input = document.createElement("input");
        this.button = document.createElement("button");
        this.tickCounter = document.createElement("div");

        this.tickCounter.innerHTML = `Tick: ${this.song.tick} of ${this.song.length}`;

        this.input.type = "file";
        this.button.type = "button";

        this.input.accept = ".nbs";
        this.button.innerHTML = "Play / Pause";

        this.input.addEventListener(
            "change",
            (async (event) => {
                this.button.disabled = true;

                const buffer = await (
                    event.target as HTMLInputElement
                ).files[0].arrayBuffer();

                this.song = fromArrayBuffer(buffer);

                this.button.disabled = false;
                this.tickCounter.innerHTML = `Tick: ${this.song.tick} of ${this.song.length}`;

                this.dispatchEvent(new Event("songChange"));
            }).bind(this)
        );

        this.button.addEventListener(
            "click",
            (async () => {
                if (this.song.paused) this.song.play();
                else this.song.pause();

                this.dispatchEvent(new Event("stateChange"));
            }).bind(this)
        );

        document.body.appendChild(this.container);

        this.container.appendChild(this.input);
        this.container.appendChild(this.button);
        this.container.appendChild(this.tickCounter);
    }
}
