import index from "./index.html";
import puppeteer from "puppeteer";
import { readFileSync, existsSync } from "fs";

interface Body {
  url_part: string;
}

const mainUrl = process.env.URL ?? "http://localhost:3000";

const FLAG = existsSync("flag.txt")
  ? readFileSync("flag.txt", "utf8").trim()
  : process.env.FLAG || "uiuctf{fake_flag}";

Bun.serve({
  routes: {
    "/": {
      GET: index,
      POST: async (req) => {
        const body = (await req.json()) as Body;

        if (!body.url_part) {
          return new Response("URL part is required", { status: 400 });
        }

        const newUrl = `${mainUrl}/${body.url_part}`;

        const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox"],
        });
        try {
          const page = await browser.newPage();

          await browser.setCookie({
            name: "flag",
            value: FLAG,
            domain: new URL(mainUrl).hostname,
            httpOnly: false,
            secure: true,
          });

          await page.goto(newUrl, {
            waitUntil: "networkidle0",
            timeout: 15 * 1000,
          });
          await browser.close();

          return Response.json({
            success: true,
          });
        } catch (error) {
          console.error(error);
          await browser.close();
          return Response.json({ success: false });
        }
      },
    },
  },
  port: process.env.PORT || 3001,
});
