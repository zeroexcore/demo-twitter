import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import { spawn, ChildProcess } from "child_process";

// Use 35xxx ports to avoid conflicts with dev servers on 5173/5174
const WEB_PORT = 35173;
const API_PORT = 38787;

interface Screenshot {
  name: string;
  path: string;
  viewport: { width: number; height: number };
  darkMode?: boolean;
}

const SCREENSHOTS: Screenshot[] = [
  // Light mode
  { name: "home", path: "/", viewport: { width: 1280, height: 800 } },
  { name: "home-mobile", path: "/", viewport: { width: 375, height: 667 } },
  { name: "login", path: "/login", viewport: { width: 1280, height: 800 } },
  { name: "register", path: "/register", viewport: { width: 1280, height: 800 } },
  // Dark mode
  { name: "home-dark", path: "/", viewport: { width: 1280, height: 800 }, darkMode: true },
  { name: "home-mobile-dark", path: "/", viewport: { width: 375, height: 667 }, darkMode: true },
  { name: "login-dark", path: "/login", viewport: { width: 1280, height: 800 }, darkMode: true },
];

function startServer(command: string, args: string[], cwd: string, port: number): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { cwd, stdio: "pipe" });
    
    const timeout = setTimeout(() => {
      reject(new Error(`Server on port ${port} failed to start`));
    }, 30000);

    proc.stdout?.on("data", (data) => {
      if (data.toString().includes(port.toString())) {
        clearTimeout(timeout);
        resolve(proc);
      }
    });

    proc.stderr?.on("data", (data) => {
      if (data.toString().includes(port.toString())) {
        clearTimeout(timeout);
        resolve(proc);
      }
    });

    proc.on("error", reject);
  });
}

async function waitForServer(url: string, maxRetries = 30): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error(`Server at ${url} not ready after ${maxRetries} seconds`);
}

async function takeScreenshots() {
  const skipServers = process.env.SKIP_SERVERS === "true";
  const baseUrl = process.env.BASE_URL || `http://localhost:${WEB_PORT}`;
  const outDir = "packages/cdn/public/screenshots";
  const procs: ChildProcess[] = [];

  await mkdir(outDir, { recursive: true });

  try {
    if (!skipServers) {
      console.log("Starting servers...");
      console.log(`  API: http://localhost:${API_PORT}`);
      console.log(`  Web: http://localhost:${WEB_PORT}\n`);

      // Start API server
      const apiProc = spawn("pnpm", ["wrangler", "dev", "--port", API_PORT.toString()], {
        cwd: "apps/api",
        stdio: "pipe",
      });
      procs.push(apiProc);

      // Start Web server  
      const webProc = spawn("pnpm", ["vite", "--port", WEB_PORT.toString()], {
        cwd: "apps/web",
        stdio: "pipe",
      });
      procs.push(webProc);

      // Wait for servers to be ready
      await waitForServer(`http://localhost:${API_PORT}`);
      console.log("  API ready");
      await waitForServer(`http://localhost:${WEB_PORT}`);
      console.log("  Web ready\n");
    }

    console.log(`Taking screenshots from ${baseUrl}...\n`);

    const browser = await chromium.launch();

    for (const shot of SCREENSHOTS) {
      const page = await browser.newPage({ viewport: shot.viewport });

      try {
        await page.goto(`${baseUrl}${shot.path}`, {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        });
        
        // Set dark mode if needed
        if (shot.darkMode) {
          await page.evaluate(() => {
            document.documentElement.classList.add("dark");
            localStorage.setItem("demo-twitter-theme", JSON.stringify({ state: { theme: "dark" }, version: 0 }));
          });
          await page.waitForTimeout(500);
        }
        
        await page.waitForTimeout(1500); // Wait for React to render

        await page.screenshot({
          path: `${outDir}/${shot.name}.png`,
          fullPage: false,
        });

        const mode = shot.darkMode ? " (dark)" : "";
        console.log(`✓ ${shot.name}.png (${shot.viewport.width}x${shot.viewport.height})${mode}`);
      } catch (err) {
        console.error(`✗ ${shot.name}: ${err}`);
      }

      await page.close();
    }

    await browser.close();
    console.log("\nDone!");
  } finally {
    // Clean up servers
    for (const proc of procs) {
      proc.kill();
    }
  }
}

takeScreenshots();
