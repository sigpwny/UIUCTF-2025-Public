import { modules } from "app/data/modules";

const InvalidModule = () => {
  return (
    <div class="h-screen bg-black text-red-400 font-mono p-4 flex flex-col items-center justify-center">
      <h1 class="text-3xl tracking-widest mb-4">ERROR: INVALID MODULE</h1>
      <p class="text-sm text-red-300 mb-6">
        The module you selected does not exist or is unavailable.
      </p>
      <a
        href="/"
        class="border border-red-400 px-4 py-2 text-red-400 transition-colors duration-150 hover:bg-red-400 hover:text-black"
      >
        Return to Home
      </a>
    </div>
  );
};

export const Module = ({
  id,
  crewMessage,
}: {
  id: number;
  crewMessage: string | null | undefined;
}) => {
  if (id < 0 || id >= modules.length) {
    return <InvalidModule />;
  }

  const module = modules[id];

  return (
    <div class="h-screen bg-black text-green-400 font-mono p-4 flex flex-col items-center">
      <header class="border-b border-green-600 pb-4 mb-6 w-full text-center">
        <h1 class="text-3xl tracking-widest">{module.name}</h1>
        <p class="text-sm text-green-300">
          Status: <span class={module.statusColor}>{module.status}</span>
        </p>
      </header>

      <div class="grid grid-cols-3 gap-6 w-full max-w-6xl">
        <section class="border border-green-700 p-4">
          <h2 class="text-lg border-b border-green-500 mb-2">
            Environmental Data
          </h2>
          <p>Pressure: {module.pressure}</p>
          <p>Temperature: {module.temperature}</p>
          <p>Power: {module.power}</p>
          <p>Humidity: {module.humidity}</p>
          <p>Oxygen Levels: {module.oxygenLevels}</p>
        </section>

        <section class="border border-green-700 p-4">
          <h2 class="text-lg border-b border-green-500 mb-2">
            Operational Status
          </h2>
          <p>
            System Integrity:{" "}
            <span class={module.statusColor}>{module.status}</span>
          </p>
          <p>Battery Health: {module.batteryHealth}</p>
          <p>Cooling System: {module.coolingSystem}</p>
          <p>Last Maintenance: 12 days ago</p>
          <p>Next Scheduled Check: 5 days</p>
        </section>

        <section class="border border-green-700 p-4">
          <h2 class="text-lg border-b border-green-500 mb-2">Control Panel</h2>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <button class="border border-green-400 px-2 py-1 transition-colors duration-150 hover:bg-green-400 hover:text-black">
              Activate
            </button>
            <button class="border border-green-400 px-2 py-1 transition-colors duration-150 hover:bg-green-400 hover:text-black">
              Deactivate
            </button>
            <button class="border border-green-400 px-2 py-1 transition-colors duration-150 hover:bg-green-400 hover:text-black">
              Reset
            </button>
            <button class="border border-green-400 px-2 py-1 transition-colors duration-150 hover:bg-green-400 hover:text-black">
              Diagnostics
            </button>
          </div>
          <form class="mt-4" method="GET">
            <label for="message" class="block text-sm mb-1">
              Crew Message:
            </label>
            <input
              id="message"
              name="message"
              type="text"
              class="w-full border border-green-400 bg-black text-green-400 px-2 py-1 text-xs"
              placeholder={
                crewMessage
                  ? `Update your message: ${crewMessage}`
                  : "Enter a message for the crew"
              }
            />
          </form>
        </section>

        <section class="col-span-3 border border-green-700 p-4">
          <h2 class="text-lg border-b border-green-500 mb-2">
            Operational Logs
          </h2>
          <div class="text-xs overflow-auto h-40 bg-gray-900 p-2 border border-green-300">
            <p>[12:01] Module initialized successfully.</p>
            <p>[12:15] Pressure stabilized at {module.pressure}.</p>
            <p>[12:30] Temperature adjusted to {module.temperature}.</p>
            <p>[12:45] Power consumption steady at {module.power}.</p>
            <p>[13:00] Routine diagnostics completed.</p>
            <p>[13:15] No anomalies detected.</p>
          </div>
        </section>

        <section class="col-span-3 border border-green-700 p-4">
          <h2 class="text-lg border-b border-green-500 mb-2">Messages</h2>
          <div class="text-xs overflow-auto h-40 bg-gray-900 p-2 border border-green-300">
            <p>[12:05] Incoming transmission from HQ.</p>
            <p>[12:10] Message: "All systems nominal. Proceed as planned."</p>
            <p>[12:20] Crew message: "Routine check completed."</p>
            <p>[12:50] HQ message: "Prepare for docking procedures."</p>
            {crewMessage && <p>[13:10] Crew message: "{crewMessage}"</p>}
          </div>
        </section>
      </div>

      <footer class="mt-6 border-t border-green-600 pt-2 text-xs text-green-300">
        <a href="/" class="underline hover:text-green-500">
          Return to Home
        </a>
      </footer>
    </div>
  );
};
