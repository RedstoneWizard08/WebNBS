import { WebNBSDocument } from "./dom";
import { loadAllInstruments } from "./nbs/index";
import { Renderer } from "./renderer";

const main = async () => {
    await loadAllInstruments();

    const webnbs = new WebNBSDocument();
    let renderer = new Renderer(webnbs.song);

    webnbs.addEventListener("songChange", () => {
        webnbs.song.pause();
        renderer.scene.song.pause();
        renderer.get().destroy(true);
        renderer = new Renderer(webnbs.song);
    });
};

main();
