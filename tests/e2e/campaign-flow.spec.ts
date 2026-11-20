import { expect, Page, test } from '@playwright/test';
import path from 'node:path';

const ARTIFACT_DIR = path.resolve('test-results/cc019');

interface DevCritterSnapshot {
  x: number;
  y: number;
  state: 'IDLE' | 'RUNNING' | 'JUMPING' | 'FALLING';
  facing: 'left' | 'right';
}

interface DevGameState {
  scene: string;
  levelId?: string;
  isPaused?: boolean;
  nextLevelId?: string | null;
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
  await page.waitForTimeout(50);
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

async function enterLevelFromMenu(page: Page, buttonYRatio = 0.62): Promise<void> {
  await page.setViewportSize({ width: 960, height: 540 });
  await page.goto('/');
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.scene === 'MainMenuScene',
  );

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * buttonYRatio);
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

async function jumpOnto(
  page: Page,
  critter: 'moss' | 'zippy',
  startX: number,
  direction: 'right' | 'left',
  landingX: number,
  maxY: number,
): Promise<void> {
  await waitForGrounded(page, critter);
  await moveToX(page, critter, startX);
  await waitForGrounded(page, critter);

  const key = direction === 'right' ? 'KeyD' : 'KeyA';
  await page.keyboard.down(key);
  await tapKey(page, 'Space', 60);
  try {
    await page.waitForFunction(
      ([c, dir, xTarget, yMax]) => {
        const s = (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__;
        const pos = s?.[c as 'moss' | 'zippy'];
        if (!pos) return false;
        const xOk = dir === 'right' ? pos.x >= (xTarget as number) : pos.x <= (xTarget as number);
        return xOk && pos.y < (yMax as number);
      },
      [critter, direction, landingX, maxY] as const,
      { timeout: 3000 },
    );
  } finally {
    await page.keyboard.up(key);
  }
  await waitForGrounded(page, critter);
}

async function completeLevel1(page: Page): Promise<void> {
  // 1. MOSS grows vine bridge at GrowthPoint (col 10, x=336)
  await moveToX(page, 'moss', 330, 175);
  await tapKey(page, 'KeyE');
  expect((await getGameState(page)).puzzle?.vineGrown).toBe(true);

  // 2. MOSS crosses bridge -> jumps onto Platform 1 (col 18..20, x=576..672, top=412) -> jumps onto Platform 2 (col 13..16, plate x=464)
  await jumpOnto(page, 'moss', 540, 'right', 610, 414);
  expect((await getGameState(page)).moss!.y).toBeLessThan(415);

  await jumpOnto(page, 'moss', 595, 'left', 495, 414);
  await moveToX(page, 'moss', 464);
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.puzzle?.plateOn === true,
    undefined,
    { timeout: 3000 },
  );

  // 3. Switch to ZIPPY, power ElectricNode (col 21, x=688), and reach ExitGate (col 27, x=880)
  await tapKey(page, 'Digit2');
  await moveToX(page, 'zippy', 688, 175);
  await tapKey(page, 'KeyE');
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.puzzle?.doorOpen === true,
    undefined,
    { timeout: 3000 },
  );

  await moveToX(page, 'zippy', 880);
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.puzzle?.completed === true,
    undefined,
    { timeout: 3000 },
  );
}

async function climbLevel2CanopyEntry(page: Page, critter: 'moss' | 'zippy'): Promise<void> {
  // Tier 1 (col 5..6, x=160..224, top=412), Tier 2 (col 8..11, x=256..384, top=348)
  await jumpOnto(page, critter, 115, 'right', 175, 414);
  expect((await getGameState(page))[critter]!.y).toBeLessThan(415);

  await jumpOnto(page, critter, 195, 'right', 272, 350);
  expect((await getGameState(page))[critter]!.y).toBeLessThan(352);
}

async function completeLevel2(page: Page): Promise<void> {
  await waitForGrounded(page, 'moss');
  await tapKey(page, 'Digit2');
  expect((await getGameState(page)).activeCritter).toBe('zippy');
  await climbLevel2CanopyEntry(page, 'zippy');
  await moveToX(page, 'zippy', 304);
  await tapKey(page, 'KeyE');
  expect((await getGameState(page)).puzzle?.nodeOn).toBe(true);

  await tapKey(page, 'Digit1');
  await climbLevel2CanopyEntry(page, 'moss');
  await moveToX(page, 'moss', 360);
  await tapKey(page, 'KeyE');
  expect((await getGameState(page)).puzzle?.vineGrown).toBe(true);

  await tapKey(page, 'Digit2');
  await moveToX(page, 'zippy', 745);
  await waitForGrounded(page, 'zippy');

  await tapKey(page, 'Digit1');
  await moveToX(page, 'moss', 660);
  await waitForGrounded(page, 'moss');
  await moveToX(page, 'moss', 560);
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.puzzle?.doorOpen === true,
    undefined,
    { timeout: 3000 },
  );

  await tapKey(page, 'Digit2');
  await jumpOnto(page, 'zippy', 775, 'right', 838, 415);
  await moveToX(page, 'zippy', 912);
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.puzzle?.completed === true,
    undefined,
    { timeout: 3000 },
  );
}

test.describe('CC-019 — Campaign Flow, Level Transition & Pause Menu', () => {
  test('1. Pause Menu Lifecycle: Esc pauses & freezes movement, Esc resumes', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await enterLevelFromMenu(page, 0.62);
    await waitForGrounded(page, 'moss');
    const initial = await getGameState(page);
    expect(initial.levelId).toBe('level-01');
    expect(initial.isPaused).toBe(false);
    expect(initial.nextLevelId).toBe('level-02');

    // Pause with Esc
    await tapKey(page, 'Escape');
    await page.waitForFunction(
      () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.isPaused === true,
    );
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cc019-pause-menu.png') });

    const pausedState = await getGameState(page);
    const frozenX = pausedState.moss!.x;

    // Attempt movement and switching while paused — must stay frozen
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(300);
    await page.keyboard.up('KeyD');
    await tapKey(page, 'Tab');
    const stillPaused = await getGameState(page);
    expect(stillPaused.isPaused).toBe(true);
    expect(stillPaused.moss!.x).toBe(frozenX);
    expect(stillPaused.activeCritter).toBe('moss');

    // Resume with Esc and verify movement works
    await tapKey(page, 'Escape');
    await page.waitForFunction(
      () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.isPaused === false,
    );

    // Pause again and resume via clicking the pixel-art RESUME button
    await tapKey(page, 'Escape');
    await page.waitForFunction(
      () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.isPaused === true,
    );
    const box = await page.locator('canvas').boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.click(box!.x + box!.width * 0.5, box!.y + box!.height * (245 / 540));
    await page.waitForFunction(
      () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.isPaused === false,
    );

    await page.keyboard.down('KeyD');
    await page.waitForTimeout(300);
    await page.keyboard.up('KeyD');
    const afterResume = await getGameState(page);
    expect(afterResume.moss!.x).toBeGreaterThan(frozenX);
    expect(errors).toEqual([]);
  });

  test('2. Pause Menu Restart (R) & Return to Main Menu (M)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await enterLevelFromMenu(page, 0.62);

    // Move MOSS away from spawn
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(300);
    await page.keyboard.up('KeyD');
    expect((await getGameState(page)).moss!.x).toBeGreaterThan(100);

    // Open Pause Menu and trigger Restart (R)
    await tapKey(page, 'Escape');
    await page.waitForFunction(
      () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.isPaused === true,
    );
    await tapKey(page, 'KeyR');
    await page.waitForFunction(
      () => {
        const s = (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__;
        return s?.isPaused === false && s?.moss?.x === 80;
      },
    );

    const afterRestart = await getGameState(page);
    expect(afterRestart.isPaused).toBe(false);
    expect(afterRestart.moss?.x).toBe(80);
    expect(afterRestart.zippy?.x).toBe(144);

    // Open Pause Menu and trigger Main Menu (M)
    await tapKey(page, 'Escape');
    await page.waitForFunction(
      () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.isPaused === true,
    );
    await tapKey(page, 'KeyM');
    await page.waitForFunction(
      () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.scene === 'MainMenuScene',
    );
    expect((await getGameState(page)).scene).toBe('MainMenuScene');
    expect(errors).toEqual([]);
  });

  test('3. Level Progression (level-01 -> level-02 -> level-03) and Replay (R)', async ({
    page,
  }) => {
    test.setTimeout(90000);
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await enterLevelFromMenu(page, 0.62);
    await completeLevel1(page);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cc019-completion-overlay.png') });

    // Verify R replay works after completion
    await tapKey(page, 'KeyR');
    await page.waitForFunction(
      () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.puzzle?.completed === false,
    );
    expect((await getGameState(page)).levelId).toBe('level-01');
    expect((await getGameState(page)).moss?.x).toBe(80);

    // Complete Level 1 again and advance via Enter to Level 2
    await completeLevel1(page);
    await tapKey(page, 'Enter');
    await page.waitForFunction(
      () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.levelId === 'level-02',
    );
    const level2State = await getGameState(page);
    expect(level2State.scene).toBe('GameplayScene');
    expect(level2State.levelId).toBe('level-02');
    expect(level2State.nextLevelId).toBe('level-03');
    expect(level2State.puzzle?.completed).toBe(false);

    // Complete Level 2 and advance via N to Level 3
    await completeLevel2(page);
    await tapKey(page, 'KeyN');
    await page.waitForFunction(
      () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.levelId === 'level-03',
    );
    const level3State = await getGameState(page);
    expect(level3State.scene).toBe('GameplayScene');
    expect(level3State.levelId).toBe('level-03');
    expect(level3State.nextLevelId).toBeNull();
    expect(errors).toEqual([]);
  });
});
