import Phaser from "phaser";
import { Instrument, Song } from "./nbs";

import harpImage from "@textures/harp.png";
import dbassImage from "@textures/dbass.png";
import bdrumImage from "@textures/bdrum.png";
import sdrumImage from "@textures/sdrum.png";
import clickImage from "@textures/click.png";
import guitarImage from "@textures/guitar.png";
import fluteImage from "@textures/flute.png";
import bellImage from "@textures/bell.png";
import chimeImage from "@textures/chime.png";
import xylophoneImage from "@textures/xylophone.png";
import ironXylophoneImage from "@textures/iron_xylophone.png";
import cowBellImage from "@textures/cow_bell.png";
import didgeridooImage from "@textures/didgeridoo.png";
import bitImage from "@textures/bit.png";
import banjoImage from "@textures/banjo.png";
import plingImage from "@textures/pling.png";
import { WebAudioPlayer } from "./audio";

const getInstrumentTexture = (instrument: Instrument) => {
    switch (instrument.id) {
        case 0:
            return "harp";

        case 1:
            return "dbass";

        case 2:
            return "bdrum";

        case 3:
            return "sdrum";

        case 4:
            return "click";

        case 5:
            return "guitar";

        case 6:
            return "flute";

        case 7:
            return "bell";

        case 8:
            return "chime";

        case 9:
            return "xylophone";

        case 10:
            return "ironXylophone";

        case 11:
            return "cowBell";

        case 12:
            return "didgeridoo";

        case 13:
            return "bit";

        case 14:
            return "banjo";

        case 15:
            return "pling";
    }
};

const NOTE_SIZE = 32;
const NOTE_OFFSET = 32;

export class RendererScene extends Phaser.Scene {
    public song: Song;
    private interval: NodeJS.Timer | null = null;
    private progress?: Phaser.GameObjects.Rectangle;

    private tickms = 0;

    public constructor(song: Song) {
        super("webnbs");

        this.song = song;
    }

    public init() {
        this.song.addEventListener(
            "playStateChange",
            this.onSongUpdate.bind(this)
        );
    }

    public async preloadTextures() {
        let queue = 0;

        this.textures.addBase64("harp", harpImage);
        queue++;

        this.textures.addBase64("dbass", dbassImage);
        queue++;
        
        this.textures.addBase64("bdrum", bdrumImage);
        queue++;
        
        this.textures.addBase64("sdrum", sdrumImage);
        queue++;
        
        this.textures.addBase64("click", clickImage);
        queue++;
        
        this.textures.addBase64("guitar", guitarImage);
        queue++;
        
        this.textures.addBase64("flute", fluteImage);
        queue++;
        
        this.textures.addBase64("bell", bellImage);
        queue++;
        
        this.textures.addBase64("chime", chimeImage);
        queue++;
        
        this.textures.addBase64("xylophone", xylophoneImage);
        queue++;
        
        this.textures.addBase64("ironXylophone", ironXylophoneImage);
        queue++;
        
        this.textures.addBase64("cowBell", cowBellImage);
        queue++;
        
        this.textures.addBase64("didgeridoo", didgeridooImage);
        queue++;
        
        this.textures.addBase64("bit", bitImage);
        queue++;
        
        this.textures.addBase64("banjo", banjoImage);
        queue++;
        
        this.textures.addBase64("pling", plingImage);
        queue++;
        
        this.textures.on("onload", () => {
            queue--;
        });

        while (queue > 0)
            await new Promise((resolve) => setTimeout(resolve, 250));
    }

    public async create() {
        await this.preloadTextures();

        this.progress = this.add.rectangle(0, NOTE_OFFSET, 2, this.song.layers.length * NOTE_OFFSET, 0xffffff);

        this.cameras.main.startFollow(this.progress);
        this.cameras.main.followOffset.set((-this.cameras.main.centerX) + NOTE_OFFSET, (-this.cameras.main.centerY) + NOTE_OFFSET);

        let layers = 0;
        let current = NOTE_OFFSET;

        while (current <= this.song.layers.length * NOTE_OFFSET) {
            this.add.rectangle(
                0,
                current,
                this.song.length * NOTE_SIZE,
                2,
                0xffffff
            );

            current += NOTE_OFFSET;
            layers++;
        }

        for (
            let i = 0;
            i < (layers > this.song.layers.length ? this.song.layers.length : layers);
            i++
        ) {
            const layer = this.song.layers[i];
    
            for (let j = 0; j < layer.notes.length; j++) {
                const tick = parseInt(Object.keys(layer.notes)[j]);
                const note = layer.notes[tick];
    
                if (note) {
                    const posX = tick * NOTE_OFFSET;
                    const posY = (i + 1) * (NOTE_OFFSET + 2);
    
                    const texture = getInstrumentTexture(
                        Instrument.builtIn.find((i) => i.id == note.instrument)
                    );
    
                    const image = this.add.image(posX, posY, texture);
                    
                    // image.width = 32;
                    // image.height = 32;
                }
            }
        }
    }

    public update() {}

    private onSongUpdate() {
        if (this.song.paused) {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        } else {
            this.interval = setInterval(
                (() => {
                    for (const layer of this.song.layers) {
                        const note = layer.notes[this.song.currentTick];
                        if (note) {
                            WebAudioPlayer.playNote(
                                note.key,
                                note.instrument,
                                note.velocity,
                                note.panning,
                                note.pitch
                            );
                        }
                    }

                    this.song.currentTick++;

                    if (this.song.currentTick >= this.song.length) {
                        if (this.song.loop) this.song.currentTick = 0;
                        else {
                            clearInterval(this.interval);
                            this.interval = null;

                            this.song.pause();
                        }
                    }

                    this.progress?.setX(this.song.currentTick * NOTE_OFFSET);
                }).bind(this),
                this.song.timePerTick
            );
        }
    }
}

export class Renderer {
    private config: Phaser.Types.Core.GameConfig;
    private game: Phaser.Game;
    public scene: RendererScene;

    public constructor(song: Song) {
        this.scene = new RendererScene(song);

        this.config = {
            // type: Phaser.AUTO,

            width: window.innerWidth,
            height: window.innerHeight,

            scene: this.scene,
        };

        this.game = new Phaser.Game(this.config);
    }

    public get() {
        return this.game;
    }
}
