import { expect, Page, test } from '@playwright/test';
import path from 'node:path';

const QA_DIR = 'C:/Users/ADMIN/.gemini/antigravity/brain/b96f4e59-7ed9-4477-a6ed-e07b752fe6ef/scratch/qa';

interface DevGameState {
  scene: string;
  activeCritter?: 'moss' | 'zippy';
  moss?: { x: number; y: number; state: string; facing: string };
  zippy?: { x: number; y: number; state: string; facing: string };
  puzzle?: {
    vineGrown: boolean;
    plateOn: boolean;
    nodeOn: boolean;
    doorOpen: boolean;
    completed: boolean;
  };
}

async function getGameState(page: Page): Promise<DevGameState> {
  return page.evaluate(() => (window as unknown as { __CC_TEST_STATE__: DevGameState }).__CC_TEST_STATE__);
}

async function tapKey(page: Page, key: string, holdMs = 70): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(holdMs);
  await page.keyboard.up(key);
  await page.waitForTimeout(40);
}

async function moveToX(page: Page, critter: 'moss' | 'zippy', targetX: number, jumpAtX?: number): Promise<void> {
  const startX = (await getGameState(page))[critter]!.x;
  const movingRight = targetX > startX;
  const key = movingRight ? 'KeyD' : 'KeyA';
  let jumped = false;

  await page.keyboard.down(key);
  try {
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline) {
      const x = (await getGameState(page))[critter]!.x;
      if (jumpAtX !== undefined && !jumped) {
        if ((movingRight && x >= jumpAtX) || (!movingRight && x <= jumpAtX)) {
          await tapKey(page, 'Space', 60);
          jumped = true;
        }
      }
      if ((movingRight && x >= targetX) || (!movingRight && x <= targetX)) break;
      await page.waitForTimeout(25);
    }
  } finally {
    await page.keyboard.up(key);
  }
}

test('Visual QA: capture key states and viewports', async ({ page }) => {
  // 1. Main Menu at 960x540
  await page.setViewportSize({ width: 960, height: 540 });
  await page.goto('/');
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.scene === 'MainMenuScene',
  );
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(QA_DIR, '01-main-menu-960x540.png') });

  // 2. Enter Gameplay at 1280x720
  await page.setViewportSize({ width: 1280, height: 720 });
  const box = await page.locator('canvas').boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width * 0.5, box!.y + box!.height * 0.62);
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.scene === 'GameplayScene',
  );
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(QA_DIR, '02-gameplay-start-1280x720.png') });

  // 3. MOSS at GrowthPoint with prompt visible -> grow vine
  await moveToX(page, 'moss', 330, 175);
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(QA_DIR, '03-moss-growth-prompt.png') });

  await tapKey(page, 'KeyE');
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(QA_DIR, '04-vine-grown.png') });

  // 4. MOSS jumps to Platform 2 and holds PressurePlate
  await moveToX(page, 'moss', 540);
  await page.keyboard.down('KeyD');
  await tapKey(page, 'Space', 60);
  await page.waitForTimeout(350);
  await page.keyboard.up('KeyD');
  await page.waitForTimeout(300);
  await moveToX(page, 'moss', 464, 580);
  await page.waitForTimeout(450);

  // 5. Switch to ZIPPY, move to ElectricNode, capture prompt & powered door open
  await tapKey(page, 'Digit2');
  await moveToX(page, 'zippy', 688, 175);
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(QA_DIR, '05-zippy-node-prompt.png') });

  await tapKey(page, 'KeyE');
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(QA_DIR, '06-door-open-gate-unlocked.png') });

  // 6. Complete level
  await moveToX(page, 'zippy', 880);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(QA_DIR, '07-level-complete-1280x720.png') });

  // 7. Check 1366x768 viewport after reset
  await page.setViewportSize({ width: 1366, height: 768 });
  await tapKey(page, 'KeyR');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(QA_DIR, '08-gameplay-1366x768.png') });
});
