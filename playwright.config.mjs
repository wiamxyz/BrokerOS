import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser',expect:{timeout:15000},fullyParallel:false,workers:1,timeout:45000,
 use:{baseURL:process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:3011',launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'},trace:'retain-on-failure',screenshot:'only-on-failure',reducedMotion:'reduce'},
 projects:[{name:'desktop',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:1000}}},{name:'mobile',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}}]
});
