import { WebAudioPlayer } from "./audio";
import {
    fromArrayBuffer,
    Instrument,
    loadAllInstruments,
    Song,
} from "./nbs/index";

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

let harp: HTMLImageElement | null = null;
let dbass: HTMLImageElement | null = null;
let bdrum: HTMLImageElement | null = null;
let sdrum: HTMLImageElement | null = null;
let click: HTMLImageElement | null = null;
let guitar: HTMLImageElement | null = null;
let flute: HTMLImageElement | null = null;
let bell: HTMLImageElement | null = null;
let chime: HTMLImageElement | null = null;
let xylophone: HTMLImageElement | null = null;
let ironXylophone: HTMLImageElement | null = null;
let cowBell: HTMLImageElement | null = null;
let didgeridoo: HTMLImageElement | null = null;
let bit: HTMLImageElement | null = null;
let banjo: HTMLImageElement | null = null;
let pling: HTMLImageElement | null = null;

let interval: NodeJS.Timer | null = null;
let context: CanvasRenderingContext2D | null = null;

let textureCache: { [key: string]: HTMLCanvasElement } = {};

const getInstrumentTexture = (instrument: Instrument) => {
    switch (instrument.id) {
        case 0:
            return harp;

        case 1:
            return dbass;

        case 2:
            return bdrum;

        case 3:
            return sdrum;

        case 4:
            return click;

        case 5:
            return guitar;

        case 6:
            return flute;

        case 7:
            return bell;

        case 8:
            return chime;

        case 9:
            return xylophone;

        case 10:
            return ironXylophone;

        case 11:
            return cowBell;

        case 12:
            return didgeridoo;

        case 13:
            return bit;

        case 14:
            return banjo;

        case 15:
            return pling;
    }
};

const formatKey = (key: number) => {
    const KEY_TEXT = [
        "C-",
        "C#",
        "D-",
        "D#",
        "E-",
        "F-",
        "F#",
        "G-",
        "G#",
        "A-",
        "A#",
        "B-",
    ];

    const keyText = KEY_TEXT[(key - 3) % 12];
    const octave = Math.floor((key - 3) / 12) + 1;

    return `${keyText}${octave}`;
};

const createNoteTexture = (texture: HTMLImageElement, key: number) => {
    const canvas = document.createElement("canvas");

    canvas.width = 40;
    canvas.height = 40;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(texture, 0, 0);

    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;

    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const text = formatKey(key);
    ctx.fillText(text, 40 / 2, 40 / 2);

    return canvas;
};

const renderPlayer = (song: Song) => {
    const margin = 40;
    let current = margin;

    let layers = 0;

    context.canvas.width = song.length * margin;
    context.canvas.height = song.layers.length * margin;

    context.canvas.style.width = song.length * margin + "px";
    context.canvas.style.height = song.layers.length * margin + "px";

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    while (current < window.innerHeight) {
        context.fillStyle = "white";
        context.strokeStyle = "white";

        context.fillRect(0, current, context.canvas.width, 2);

        current += margin;
        layers++;
    }

    for (
        let i = 0;
        i < (layers > song.layers.length ? song.layers.length : layers);
        i++
    ) {
        const layer = song.layers[i];

        for (let j = 0; j < layer.notes.length; j++) {
            const tick = parseInt(Object.keys(layer.notes)[j]);
            const note = layer.notes[tick];

            if (note) {
                const posX = tick * margin;
                const posY = i * margin + 2 * (i + 1);

                const textureSource = getInstrumentTexture(
                    Instrument.builtIn.find((i) => i.id == note.instrument)
                );

                context.fillStyle = "white";
                context.strokeStyle = "white";

                const noteId = `${note.instrument}-${note.key}`;

                if (!(noteId in textureCache)) {
                    const texture = createNoteTexture(textureSource, note.key);
                    textureCache[noteId] = texture;
                }

                const texture = textureCache[noteId];

                context.drawImage(texture, posX, posY);

                // context.fillRect(posX, posY, 40, 40);
            }
        }
    }

    renderProgress(song);
};

const renderProgress = (song: Song) => {
    const margin = 40;

    const posX = song.currentTick * margin;

    context.fillStyle = "white";
    context.strokeStyle = "white";

    context.fillRect(posX, 0, 2, context.canvas.height);
};

const registerEventListeners = (song: Song, tickCounter: HTMLDivElement) => {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }

    song.addEventListener("playStateChange", (event) => {
        const song = event.target as Song;

        if (song.paused) {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        } else {
            interval = setInterval(() => {
                for (const layer of song.layers) {
                    const note = layer.notes[song.currentTick];
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

                song.currentTick++;
                tickCounter.innerHTML = `Tick: ${song.tick} of ${song.length}`;

                renderProgress(song);

                if (song.currentTick >= song.length) {
                    if (song.loop) song.currentTick = 0;
                    else {
                        clearInterval(interval);
                        interval = null;

                        song.pause();
                    }
                }
            }, song.timePerTick);
        }
    });
};

const loadImages = async () => {
    harp = new Image();
    dbass = new Image();
    bdrum = new Image();
    sdrum = new Image();
    click = new Image();
    guitar = new Image();
    flute = new Image();
    bell = new Image();
    chime = new Image();
    xylophone = new Image();
    ironXylophone = new Image();
    cowBell = new Image();
    didgeridoo = new Image();
    bit = new Image();
    banjo = new Image();
    pling = new Image();

    harp.src = harpImage;
    dbass.src = dbassImage;
    bdrum.src = bdrumImage;
    sdrum.src = sdrumImage;
    click.src = clickImage;
    guitar.src = guitarImage;
    flute.src = fluteImage;
    bell.src = bellImage;
    chime.src = chimeImage;
    xylophone.src = xylophoneImage;
    ironXylophone.src = ironXylophoneImage;
    cowBell.src = cowBellImage;
    didgeridoo.src = didgeridooImage;
    bit.src = bitImage;
    banjo.src = banjoImage;
    pling.src = plingImage;

    await new Promise((r) => (harp.onload = () => r(true)));
    await new Promise((r) => (dbass.onload = () => r(true)));
    await new Promise((r) => (bdrum.onload = () => r(true)));
    await new Promise((r) => (sdrum.onload = () => r(true)));
    await new Promise((r) => (click.onload = () => r(true)));
    await new Promise((r) => (guitar.onload = () => r(true)));
    await new Promise((r) => (flute.onload = () => r(true)));
    await new Promise((r) => (bell.onload = () => r(true)));
    await new Promise((r) => (chime.onload = () => r(true)));
    await new Promise((r) => (xylophone.onload = () => r(true)));
    await new Promise((r) => (ironXylophone.onload = () => r(true)));
    await new Promise((r) => (cowBell.onload = () => r(true)));
    await new Promise((r) => (didgeridoo.onload = () => r(true)));
    await new Promise((r) => (bit.onload = () => r(true)));
    await new Promise((r) => (banjo.onload = () => r(true)));
    await new Promise((r) => (pling.onload = () => r(true)));
};

const main = async () => {
    await loadAllInstruments();
    await loadImages();

    let song = new Song();

    const element = document.createElement("div");
    element.id = "container";

    const input = document.createElement("input");
    const button = document.createElement("button");
    const tickCounter = document.createElement("div");

    const canvas = document.createElement("canvas");

    tickCounter.innerHTML = `Tick: ${song.tick} of ${song.length}`;

    registerEventListeners(song, tickCounter);

    input.type = "file";
    button.type = "button";

    input.accept = ".nbs";
    button.innerHTML = "Play / Pause";

    input.addEventListener("change", async (event) => {
        button.disabled = true;

        const buffer = await (
            event.target as HTMLInputElement
        ).files[0].arrayBuffer();

        song = fromArrayBuffer(buffer);

        registerEventListeners(song, tickCounter);

        button.disabled = false;
        tickCounter.innerHTML = `Tick: ${song.tick} of ${song.length}`;

        renderPlayer(song);
    });

    button.addEventListener("click", async () => {
        if (song.paused) song.play();
        else song.pause();
    });

    document.body.appendChild(element);

    element.appendChild(input);
    element.appendChild(button);
    element.appendChild(tickCounter);

    document.body.appendChild(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context = canvas.getContext("2d");

    renderPlayer(song);
};

main();
