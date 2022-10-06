import * as fs from "fs";
import * as path from "path";
import esbuild from "esbuild";

export const build = async () => {
    await esbuild.build({
        entryPoints: ["src/index.ts"],
        bundle: true,
        outdir: "dist",
        loader: {
            ".ogg": "dataurl",
            ".png": "dataurl",
        },
        sourcemap: "external",
    });

    fs.copyFileSync(
        path.join(__dirname, "public", "index.html"),
        path.join(__dirname, "dist", "index.html")
    );
};

build();
