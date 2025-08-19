import { render } from "my_jsx";
import { App } from "app/app";
import { Home } from "app/pages/home";
import { Module } from "app/pages/module";

Bun.serve({
  routes: {
    "/": {
      GET: (req) => {
        const url = new URL(req.url);

        let adminUrl = "#";
        if (url.hostname == "localhost") {
          adminUrl = "http://localhost:3001";
        } else if (
          url.hostname.endsWith("ruler-of-the-universe.chal.uiuc.tf")
        ) {
          const currentHost = url.host;
          const instancePrefix =
            currentHost.split(`-`)[0] + `-` + currentHost.split(`-`)[1];
          adminUrl = `https://${instancePrefix}-adminbot-ruler-of-the-universe.chal.uiuc.tf/`;
        }

        return new Response(
          render(
            <App>
              <Home adminUrl={adminUrl} />
            </App>
          ),
          {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          }
        );
      },
    },
    "/module/:id": {
      GET: (req) => {
        const moduleId = parseInt(req.params.id);
        const crewMessage = new URL(req.url).searchParams.get("message");

        return new Response(
          render(
            <App>
              <Module id={moduleId} crewMessage={crewMessage} />
            </App>
          ),
          {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          }
        );
      },
    },
  },
  port: process.env.PORT || 3000,
});
