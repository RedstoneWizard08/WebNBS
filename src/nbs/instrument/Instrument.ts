import harp from "@audio/harp.ogg";
import dbass from "@audio/dbass.ogg";
import bdrum from "@audio/bdrum.ogg";
import sdrum from "@audio/sdrum.ogg";
import click from "@audio/click.ogg";
import guitar from "@audio/guitar.ogg";
import flute from "@audio/flute.ogg";
import bell from "@audio/bell.ogg";
import chime from "@audio/chime.ogg";
import xylophone from "@audio/xylophone.ogg";
import ironXylophone from "@audio/iron_xylophone.ogg";
import cowBell from "@audio/cow_bell.ogg";
import didgeridoo from "@audio/didgeridoo.ogg";
import bit from "@audio/bit.ogg";
import banjo from "@audio/banjo.ogg";
import pling from "@audio/pling.ogg";

import { WebAudioPlayer } from "src/audio";

/**
 * Options available for an {@linkcode Instrument}.
 */
export interface InstrumentOptions {
    /**
     * The name of the instrument.
     */
    name?: string;

    /**
     * The sound file of the instrument
     *
     * @remarks
     * Just the file name, not the path).
     */
    soundFile?: string;

    /**
     * The key of the sound file.
     *
     * @remarks
     * Just like the note blocks, this ranges from 0-87.
     */
    key?: number;

    /**
     * Whether the piano should automatically press keys with this instrument when the marker passes them.
     */
    pressKey?: boolean;

    /**
     * Whether the instrument is a built-in instrument.
     */
    builtIn?: boolean;
}

/**
 * Meta information for an {@linkcode Instrument}.
 */
export interface InstrumentMeta {
    /**
     * The name of the instrument.
     */
    name: string | undefined;

    /**
     * The sound file of the instrument.
     *
     * @remarks
     * Just the file name, not the path.
     */
    soundFile: string | undefined;
}

/**
 * Default {@linkcode InstrumentOptions} values.
 */
export const defaultInstrumentOptions: InstrumentOptions = {
    name: "",
    soundFile: "",
    key: 45,
    pressKey: false,
    builtIn: false,
};

/**
 * Default {@linkcode InstrumentMeta} values.
 */
export const defaultInstrumentMeta: InstrumentMeta = {
    name: defaultInstrumentOptions.name,
    soundFile: defaultInstrumentOptions.soundFile,
};

/**
 * Represents an instrument of a {@linkcode Note}.
 */
export class Instrument {
    /**
     * The built-in instruments.
     *
     * @remarks
     * Includes harp, double bass, bass drum, snare drum, click, guitar, flute, bell, chime, xylophone, iron xylophone, cow bell, didgeridoo, bit, banjo, and pling.
     */
    public static builtIn = [
        new this(0, {
            name: "Harp",
            soundFile: harp,
            builtIn: true,
        }),
        new this(1, {
            name: "Double Bass",
            soundFile: dbass,
            builtIn: true,
        }),
        new this(2, {
            name: "Bass Drum",
            soundFile: bdrum,
            builtIn: true,
        }),
        new this(3, {
            name: "Snare Drum",
            soundFile: sdrum,
            builtIn: true,
        }),
        new this(4, {
            name: "Click",
            soundFile: click,
            builtIn: true,
        }),
        new this(5, {
            name: "Guitar",
            soundFile: guitar,
            builtIn: true,
        }),
        new this(6, {
            name: "Flute",
            soundFile: flute,
            builtIn: true,
        }),
        new this(7, {
            name: "Bell",
            soundFile: bell,
            builtIn: true,
        }),
        new this(8, {
            name: "Chime",
            soundFile: chime,
            builtIn: true,
        }),
        new this(9, {
            name: "Xylophone",
            soundFile: xylophone,
            builtIn: true,
        }),
        new this(10, {
            name: "Iron Xylophone",
            soundFile: ironXylophone,
            builtIn: true,
        }),
        new this(11, {
            name: "Cow Bell",
            soundFile: cowBell,
            builtIn: true,
        }),
        new this(12, {
            name: "Didgeridoo",
            soundFile: didgeridoo,
            builtIn: true,
        }),
        new this(13, {
            name: "Bit",
            soundFile: bit,
            builtIn: true,
        }),
        new this(14, {
            name: "Banjo",
            soundFile: banjo,
            builtIn: true,
        }),
        new this(15, {
            name: "Pling",
            soundFile: pling,
            builtIn: true,
        }),
    ];

    /**
     * ID of the instrument.
     *
     * @remarks
     * Used internally for built-in instruments.
     */
    public id: number;

    /**
     * Meta information for the instrument.
     *
     * @see {@linkcode InstrumentMeta}
     */
    public meta = { ...defaultInstrumentMeta };

    /**
     * The key of the sound file.
     *
     * @remarks
     * Just like the note blocks, this ranges from 0-87.
     */
    public key = defaultInstrumentOptions.key;

    /**
     * Whether the piano should automatically press keys with this instrument when the marker passes them.
     */
    public pressKey = defaultInstrumentOptions.pressKey;

    /**
     * Whether the instrument is a built-in instrument.
     */
    public builtIn = defaultInstrumentOptions.builtIn;

    public audio?: AudioBuffer;

    /**
     * Construct an instrument.
     *
     * @param id ID of the instrument in the song's instrument array
     * @param options Options for the instrument
     */
    public constructor(
        id: number,
        options: InstrumentOptions = defaultInstrumentOptions
    ) {
        this.id = id;

        // Parse options
        if (options) {
            this.meta.name = options.name ?? defaultInstrumentOptions.name;
            this.meta.soundFile =
                options.soundFile ?? defaultInstrumentOptions.soundFile;
            this.pressKey =
                options.pressKey ?? defaultInstrumentOptions.pressKey;
            this.key = options.key ?? defaultInstrumentOptions.key;
            this.builtIn = options.builtIn ?? defaultInstrumentOptions.builtIn;
        }
    }

    public async load() {
        const bytes = atob(this.meta.soundFile.split(",")[1]);

        const mime = this.meta.soundFile
            .split(",")[0]
            .split(":")[1]
            .split(";")[0];

        const buffer = new ArrayBuffer(bytes.length);
        const intArray = new Uint8Array(buffer);

        for (let i = 0; i < bytes.length; i++) {
            intArray[i] = bytes.charCodeAt(i);
        }

        const blob = new Blob([buffer], { type: mime });
        const arrayBuffer = await blob.arrayBuffer();
        const audioData = await WebAudioPlayer.decodeAudioData(arrayBuffer);

        this.audio = audioData;
    }
}
