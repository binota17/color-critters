import { expect, Page, test } from '@playwright/test';

interface DevCritterSnapshot {
  x: number;
  y: number;
  state: 'IDLE' | 'RUNNING' | 'JUMPING' | 'FALLING';
  facing: 'left' | 'right';
}

interface DevGameState {
  scene: string;
  activeCritter?: 'moss' | 'zippy';
  moss?: DevCritterSnapshot;
  zippy?: DevCritterSnapshot;
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

async function enterGameplay(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.scene === 'MainMenuScene',
  );

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  // Click PLAY button at (50%, 62%) of the canvas
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.62);
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.scene === 'GameplayScene',
  );
}

async function moveToX(
  page: Page,
  critter: 'moss' | 'zippy',
  targetX: number,
  jumpAtX?: number,
): Promise<void> {
  const startState = await getGameState(page);
  const startX = startState[critter]!.x;
  const movingRight = targetX > startX;
  const key = movingRight ? 'KeyD' : 'KeyA';
  let jumped = false;

  await page.keyboard.down(key);
  try {
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline) {
      const state = await getGameState(page);
      const x = state[critter]!.x;

      if (jumpAtX !== undefined && !jumped) {
        if ((movingRight && x >= jumpAtX) || (!movingRight && x <= jumpAtX)) {
          await tapKey(page, 'Space', 60);
          jumped = true;
        }
      }

      if ((movingRight && x >= targetX) || (!movingRight && x <= targetX)) {
        break;
      }
      await page.waitForTimeout(25);
    }
  } finally {
    await page.keyboard.up(key);
  }
}

test.describe('COLOR CRITTERS — Smoke & Playtest', () => {
  test('1. Game initializes, displays Main Menu canvas, and PLAY enters GameplayScene', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await enterGameplay(page);

    const state = await getGameState(page);
    expect(state.scene).toBe('GameplayScene');
    expect(state.activeCritter).toBe('moss');
    expect(state.moss?.x).toBe(80);
    expect(state.zippy?.x).toBe(144);
    expect(errors).toEqual([]);
  });

  test('2. Movement, Jump, Critter Switching (Tab, 1, 2), and Repeated Reset (R)', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await enterGameplay(page);

    // Move right and jump
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(300);
    await page.keyboard.up('KeyD');
    const afterRight = await getGameState(page);
    expect(afterRight.moss!.x).toBeGreaterThan(100);
    expect(afterRight.moss!.facing).toBe('right');

    // Switch with Tab, 1, 2
    await tapKey(page, 'Tab');
    expect((await getGameState(page)).activeCritter).toBe('zippy');

    await tapKey(page, 'Digit1');
    expect((await getGameState(page)).activeCritter).toBe('moss');

    await tapKey(page, 'Digit2');
    expect((await getGameState(page)).activeCritter).toBe('zippy');

    // Repeated reset
    for (let i = 0; i < 3; i += 1) {
      await tapKey(page, 'KeyR');
    }

    const afterReset = await getGameState(page);
    expect(afterReset.activeCritter).toBe('moss');
    expect(afterReset.moss?.x).toBe(80);
    expect(afterReset.zippy?.x).toBe(144);
    expect(errors).toEqual([]);
  });

  test('3. Full Level 1 Playthrough: GrowthPoint -> Vine Bridge -> Plate -> Node -> Door -> Exit -> Reset', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await enterGameplay(page);

    // 1. Move MOSS to GrowthPoint (col 10, x=336), jumping over warmup step at col 6..7 (x~175)
    await moveToX(page, 'moss', 330, 175);
    await tapKey(page, 'KeyE');
    expect((await getGameState(page)).puzzle?.vineGrown).toBe(true);

    // 2. Walk MOSS across Vine Bridge to col 16 (x=540), clear of Platform 1
    await moveToX(page, 'moss', 540);

    // 3. Jump right onto Platform 1 (col 18..20, top=412)
    await page.keyboard.down('KeyD');
    await tapKey(page, 'Space', 60);
    await page.waitForTimeout(350);
    await page.keyboard.up('KeyD');
    await page.waitForTimeout(300);
    expect((await getGameState(page)).moss!.y).toBeLessThan(415);

    // 4. Jump left onto Platform 2 (col 13..16, x=464 for PressurePlate)
    await moveToX(page, 'moss', 464, 580);
    await page.waitForTimeout(450);
    const afterPlate = await getGameState(page);
    expect(afterPlate.puzzle?.plateOn).toBe(true);

    // 5. Switch to ZIPPY, walk across Vine Bridge to ElectricNode (col 21, x=688)
    await tapKey(page, 'Digit2');
    expect((await getGameState(page)).activeCritter).toBe('zippy');

    await moveToX(page, 'zippy', 688, 175);
    await tapKey(page, 'KeyE');
    await page.waitForTimeout(100);

    const afterNode = await getGameState(page);
    expect(afterNode.puzzle?.nodeOn).toBe(true);
    expect(afterNode.puzzle?.doorOpen).toBe(true);

    // 6. Walk ZIPPY through open door to ExitGate (col 27, x=880)
    await moveToX(page, 'zippy', 880);
    await page.waitForTimeout(150);

    const completedState = await getGameState(page);
    expect(completedState.puzzle?.completed).toBe(true);

    // 7. Reset with R and verify clean state
    await tapKey(page, 'KeyR');
    const resetState = await getGameState(page);
    expect(resetState.puzzle?.completed).toBe(false);
    expect(resetState.puzzle?.vineGrown).toBe(false);
    expect(resetState.puzzle?.plateOn).toBe(false);
    expect(resetState.puzzle?.nodeOn).toBe(false);
    expect(resetState.puzzle?.doorOpen).toBe(false);
    expect(resetState.activeCritter).toBe('moss');
    expect(resetState.moss?.x).toBe(80);
    expect(resetState.zippy?.x).toBe(144);
    expect(errors).toEqual([]);
  });
});
