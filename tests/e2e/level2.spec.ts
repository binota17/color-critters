import { expect, Page, test } from '@playwright/test';

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

async function waitForGrounded(page: Page, critter: 'moss' | 'zippy'): Promise<void> {
  await page.waitForFunction(
    (c) => {
      const s = (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__;
      const st = s?.[c]?.state;
      return st === 'IDLE' || st === 'RUNNING';
    },
    critter,
  );
}

async function tapKey(page: Page, key: string, holdMs = 70): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(holdMs);
  await page.keyboard.up(key);
  await page.waitForTimeout(40);
}

async function moveToX(page: Page, critter: 'moss' | 'zippy', targetX: number): Promise<void> {
  const startX = (await getGameState(page))[critter]!.x;
  const movingRight = targetX > startX;
  const key = movingRight ? 'KeyD' : 'KeyA';

  await page.keyboard.down(key);
  try {
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline) {
      const x = (await getGameState(page))[critter]!.x;
      if ((movingRight && x >= targetX) || (!movingRight && x <= targetX)) break;
      await page.waitForTimeout(25);
    }
  } finally {
    await page.keyboard.up(key);
  }
}

async function climbCanopyEntry(page: Page, critter: 'moss' | 'zippy'): Promise<void> {
  // Approach Tier 1 (col 5..6, x=160..224, top=412)
  await moveToX(page, critter, 125);
  await page.keyboard.down('KeyD');
  await tapKey(page, 'Space', 60);
  await page.waitForTimeout(240);
  await page.keyboard.up('KeyD');
  await page.waitForTimeout(300);
  expect((await getGameState(page))[critter]!.y).toBeLessThan(415);

  // Jump onto Tier 2 (col 8..11, x=256..384, top=348)
  await moveToX(page, critter, 200);
  await page.keyboard.down('KeyD');
  await tapKey(page, 'Space', 60);
  await page.waitForTimeout(350);
  await page.keyboard.up('KeyD');
  await page.waitForTimeout(300);
  expect((await getGameState(page))[critter]!.y).toBeLessThan(352);
}

test('Level 2: The Canopy Relay — full playthrough and reset', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.scene === 'MainMenuScene',
  );

  const box = await page.locator('canvas').boundingBox();
  expect(box).not.toBeNull();
  // Click LEVEL 2 button at (50%, 76%)
  await page.mouse.click(box!.x + box!.width * 0.5, box!.y + box!.height * 0.76);
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.scene === 'GameplayScene',
  );

  // 1. Switch to ZIPPY, climb Canopy Entry, power ElectricNode (col 9, x=304)
  await tapKey(page, 'Digit2');
  expect((await getGameState(page)).activeCritter).toBe('zippy');
  await climbCanopyEntry(page, 'zippy');
  await moveToX(page, 'zippy', 304);
  await tapKey(page, 'KeyE');
  expect((await getGameState(page)).puzzle?.nodeOn).toBe(true);

  // 2. Switch to MOSS, climb Canopy Entry, activate GrowthPoint (col 11, x=368)
  await tapKey(page, 'Digit1');
  expect((await getGameState(page)).activeCritter).toBe('moss');
  await climbCanopyEntry(page, 'moss');
  await moveToX(page, 'moss', 360);
  await tapKey(page, 'KeyE');
  expect((await getGameState(page)).puzzle?.vineGrown).toBe(true);

  // 3. Switch to ZIPPY, cross High Vine Bridge -> drop to Lower Island -> drop to Right Ground (x=745)
  await tapKey(page, 'Digit2');
  await moveToX(page, 'zippy', 745);
  await page.waitForTimeout(450);

  // 4. Switch to MOSS, cross High Vine Bridge -> drop onto Lower Canopy Island -> stand on PressurePlate (col 17, x=560)
  await tapKey(page, 'Digit1');
  await moveToX(page, 'moss', 660);
  await page.waitForTimeout(350);
  await moveToX(page, 'moss', 560);
  await page.waitForTimeout(150);

  const afterPlate = await getGameState(page);
  expect(afterPlate.puzzle?.plateOn).toBe(true);
  expect(afterPlate.puzzle?.nodeOn).toBe(true);
  expect(afterPlate.puzzle?.doorOpen).toBe(true);

  // 5. Switch to ZIPPY, walk through open ElectricDoor -> jump onto Exit Perch (col 26..29, top=412) -> reach ExitGate (col 28, x=912)
  await tapKey(page, 'Digit2');
  await waitForGrounded(page, 'zippy');
  await moveToX(page, 'zippy', 795);
  await waitForGrounded(page, 'zippy');
  await page.keyboard.down('KeyD');
  await tapKey(page, 'Space', 60);
  await page.waitForFunction(
    () => {
      const s = (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__;
      return s?.zippy !== undefined && s.zippy.y < 415;
    },
    undefined,
    { timeout: 3000 },
  );
  await page.keyboard.up('KeyD');
  await waitForGrounded(page, 'zippy');
  expect((await getGameState(page)).zippy!.y).toBeLessThan(415);
  await moveToX(page, 'zippy', 912);
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.puzzle?.completed === true,
    undefined,
    { timeout: 3000 },
  );

  expect((await getGameState(page)).puzzle?.completed).toBe(true);

  // 6. Reset with R and verify clean state
  await tapKey(page, 'KeyR');
  const resetState = await getGameState(page);
  expect(resetState.puzzle?.completed).toBe(false);
  expect(resetState.puzzle?.vineGrown).toBe(false);
  expect(resetState.puzzle?.plateOn).toBe(false);
  expect(resetState.puzzle?.nodeOn).toBe(false);
  expect(resetState.puzzle?.doorOpen).toBe(false);
  expect(resetState.activeCritter).toBe('moss');
  expect(errors).toEqual([]);
});
