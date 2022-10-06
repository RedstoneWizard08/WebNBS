import puppeteer from "puppeteer";
import { blue, cyan, green, magenta, red, yellow } from "colorette";

export const testConsole = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on("console", (message) => {
        const type = message.type().substr(0, 3).toUpperCase();

        const colors = {
            LOG: (text: any) => text,
            ERR: red,
            WAR: yellow,
            INF: cyan,
        };

        const color = colors[type] || blue;
        console.log(color(`${type} ${message.text()}`));
    });

    page.on("pageerror", ({ message }) => console.log(red(message)));

    page.on("response", (response) =>
        console.log(green(`${response.status()} ${response.url()}`))
    );

    page.on("requestfailed", (request) =>
        console.log(magenta(`${request.failure().errorText} ${request.url()}`))
    );

    page.goto(
        "https://redstonewizard08-webnbs-rv9x6xwjwwqcpg49-3000.githubpreview.dev/"
    );

    await new Promise((r) => setTimeout(r, 10000000));

    await browser.close();
};

testConsole();
