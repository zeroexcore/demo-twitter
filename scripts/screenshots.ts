import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const SCREENSHOTS = [
  { name: "home", path: "/", viewport: { width: 1280, height: 800 } },
  { name: "home-mobile", path: "/", viewport: { width: 375, height: 667 } },
  { name: "login", path: "/login", viewport: { width: 1280, height: 800 } },
  { name: "register", path: "/register", viewport: { width: 1280, height: 800 } },
];

async function takeScreenshots() {
  const browser = await chromium.launch();
  const baseUrl = process.env.BASE_URL || "http://localhost:5173";
  const outDir = "packages/cdn/public/screenshots";

  await mkdir(outDir, { recursive: true });

  console.log(`Taking screenshots from ${baseUrl}...\n`);

  for (const shot of SCREENSHOTS) {
    const page = await browser.newPage({ viewport: shot.viewport });
    
    try {
      await page.goto(`${baseUrl}${shot.path}`, { 
        waitUntil: "domcontentloaded",
        timeout: 10000 
      });
      await page.waitForTimeout(1500); // Wait for React to render
      
      await page.screenshot({
        path: `${outDir}/${shot.name}.png`,
        fullPage: false,
      });
      
      console.log(`✓ ${shot.name}.png (${shot.viewport.width}x${shot.viewport.height})`);
    } catch (err) {
      console.error(`✗ ${shot.name}: ${err}`);
    }
    
    await page.close();
  }

  await browser.close();
  console.log("\nDone!");
}

takeScreenshots();
