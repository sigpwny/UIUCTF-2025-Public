import { modules } from "app/data/modules";

export const Home = ({ adminUrl }: { adminUrl: string }) => {
  return (
    <div class="h-screen bg-black text-green-400 font-mono p-4 overflow-hidden">
      <header class="border-b border-green-600 pb-4 mb-6 relative">
        <h1 class="text-3xl tracking-widest">ASTRA VANGUARD TERMINAL</h1>
        <p class="text-sm text-green-300">
          Version 5.91.07 | SYSTEM STATUS: STANDBY
        </p>
        <a
          href={adminUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="absolute top-0 right-0 border border-green-400 px-3 py-1 text-sm transition-colors duration-150 hover:bg-green-400 hover:text-black"
        >
          ADMIN BOT
        </a>
      </header>

      <div class="grid grid-cols-3 gap-4 h-[calc(100%-160px)]">
        <section class="border border-green-700 p-3 overflow-auto">
          <h2 class="text-lg border-b border-green-500 mb-2">
            PROPULSION MONITOR
          </h2>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>ENG-A1: 72%</div>
            <div>ENG-A2: 68%</div>
            <div>ENG-B1: 80%</div>
            <div>ENG-B2: 75%</div>
          </div>
          <div class="mt-3 grid grid-cols-4 gap-1 text-center">
            <button class="border border-green-400 px-2 py-1 transition-colors duration-150 hover:bg-green-400 hover:text-black">
              FWD
            </button>
            <button class="border border-green-400 px-2 py-1 transition-colors duration-150 hover:bg-green-400 hover:text-black">
              REV
            </button>
            <button class="border border-green-400 px-2 py-1 transition-colors duration-150 hover:bg-green-400 hover:text-black">
              YAW
            </button>
            <button class="border border-green-400 px-2 py-1 transition-colors duration-150 hover:bg-green-400 hover:text-black">
              ROLL
            </button>
          </div>
        </section>

        <section class="border border-green-700 p-3 overflow-auto">
          <h2 class="text-lg border-b border-green-500 mb-2">DOCKING STATUS</h2>
          <div class="text-xs">
            <p>[Dock Port 3]: CONNECTED</p>
            <p>[Dock Port 4]: STANDBY</p>
            <p>AIRLOCK CHECK: OK</p>
          </div>
        </section>

        <section class="flex flex-col border border-green-700 p-3 overflow-auto">
          <h2 class="text-lg border-b border-green-500 mb-2">SENSOR ARRAY</h2>
          <div class="flex-1 h-40 bg-gray-900 flex items-center justify-center border border-green-300">
            <p class="text-green-500">[SIGNAL STABLE]</p>
          </div>
        </section>

        <section class="col-span-3 border border-green-700 p-3 overflow-auto">
          <h2 class="text-lg border-b border-green-500 mb-2">
            ASTRA MAIN FRAME
          </h2>
          <div class="grid grid-cols-3 gap-4 text-xs">
            {modules.map((module) => (
              <div class="border border-green-600 p-3 flex flex-col">
                <h3 class="text-sm font-bold mb-2">{module.name}</h3>
                <p>
                  Status:{" "}
                  <span class={module.statusColor}>{module.status}</span>
                </p>
                <p>Pressure: {module.pressure}</p>
                <p>Temperature: {module.temperature}</p>
                <p>Power: {module.power}</p>
                <a
                  href={module.link}
                  class="mt-auto text-green-300 underline hover:text-green-500"
                >
                  View Details
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer class="mt-4 border-t border-green-600 pt-2 text-xs text-green-300">
        COURSE VECTOR: 122.5° AXIS | SPEED: 315 M/S | SIGNAL RANGE: 164 KM
      </footer>
    </div>
  );
};
