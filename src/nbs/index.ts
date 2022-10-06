import { Instrument } from "./instrument/Instrument";

export * from "./Song";
export * from "./Layer";
export * from "./Note";
export * from "./instrument/Instrument";
export * from "./instrument/SongInstrument";
export * from "./file/fromArrayBuffer";
export * from "./file/toArrayBuffer";
export * from "./util";

export const loadAllInstruments = (): Promise<void[]> => {
    return Promise.all(
        Instrument.builtIn.map((instrument) => instrument.load())
    );
};
