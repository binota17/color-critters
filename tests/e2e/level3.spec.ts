import { expect, Page, test } from '@playwright/test';
import path from 'node:path';

const ARTIFACT_DIR = '/home/bbinota/.gemini/antigravity/brain/f25f9062-4eb6-4e08-b8d3-8e6e89b8fa03';

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
  resonance?: {
    rootConnected: boolean;
    vineVisible: boolean;
    energyTransmitting: boolean;
    relayPowered: boolean;
    gateUnlocked: boolean;
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

async function moveToX(page: Page, critter: 'moss' | 'zippy', targetX: number): Promise<void> {
  const startX = (await getGameState(page))[critter]!.x;
  const movingRight = targetX > startX;
  const key = movingRight ? 'KeyD' : 'KeyA';

  await page.keyboard.down(key);
  try {
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline) {
      const state = await getGameState(page);
      const x = state?.[critter]?.x;
      if (x !== undefined && ((movingRight && x >= targetX) || (!movingRight && x <= targetX))) {
        break;
      }
      await page.waitForTimeout(25);
    }
  } finally {
    await page.keyboard.up(key);
  }
}

async function jumpRightOnto(
  page: Page,
  critter: 'moss' | 'zippy',
  startX: number,
  landingX: number,
  maxY: number,
): Promise<void> {
  await waitForGrounded(page, critter);
  await moveToX(page, critter, startX);
  await waitForGrounded(page, critter);
  await page.keyboard.down('KeyD');
  await tapKey(page, 'Space', 60);
  await page.waitForFunction(
    ([c, xMin, yMax]) => {
      const s = (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__;
      const pos = s?.[c as 'moss' | 'zippy'];
      return pos !== undefined && pos.x >= (xMin as number) && pos.y < (yMax as number);
    },
    [critter, landingX, maxY] as const,
    { timeout: 3000 },
  );
  await page.keyboard.up('KeyD');
  await waitForGrounded(page, critter);
}

async function climbToRoot(page: Page, critter: 'moss' | 'zippy'): Promise<void> {
  // Warmup step (col 5..6, x=160..224, top=444) -> Root Terrace (col 7..9, x=224..320, top=412)
  await jumpRightOnto(page, critter, 130, 175, 446);
  await jumpRightOnto(page, critter, 195, 240, 414);
}

async function climbToRelay(page: Page, critter: 'moss' | 'zippy'): Promise<void> {
  // Stepping deck (col 11..13, x=352..448, top=412) -> Relay Deck (col 15..18, x=480..608, top=348)
  await jumpRightOnto(page, critter, 300, 368, 414);
  await jumpRightOnto(page, critter, 420, 496, 350);
}

async function enterLevel3(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.setViewportSize({ width: 960, height: 540 });
  await page.goto('/');
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.scene === 'MainMenuScene',
  );

  const box = await page.locator('canvas').boundingBox();
  expect(box).not.toBeNull();
  // Click LEVEL 3: RESONANT GROVE at (50%, 88%)
  await page.mouse.click(box!.x + box!.width * 0.5, box!.y + box!.height * 0.88);
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.scene === 'GameplayScene',
  );
  return errors;
}

async function completeLevel3FromStart(page: Page, captureScreenshots = false): Promise<void> {
  if (captureScreenshots) {
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cc018-01-initial.png') });
  }

  // Section A: MOSS climbs to Root Terrace (col 8, x=272) and connects Root
  await climbToRoot(page, 'moss');
  await moveToX(page, 'moss', 272);
  await tapKey(page, 'KeyE');
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.resonance?.rootConnected === true,
  );
  if (captureScreenshots) {
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cc018-02-root-connected.png') });
  }

  // Section B: Switch to ZIPPY, traverse to Relay Deck (col 16, x=528) and power Relay
  await tapKey(page, 'Digit2');
  expect((await getGameState(page)).resonance?.rootConnected).toBe(true);
  await climbToRoot(page, 'zippy');
  await climbToRelay(page, 'zippy');
  await moveToX(page, 'zippy', 528);
  await tapKey(page, 'KeyE');
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.resonance?.relayPowered === true,
    undefined,
    { timeout: 3000 },
  );
  if (captureScreenshots) {
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cc018-03-relay-powered.png') });
  }

  // Section C: Drop ZIPPY to right ground (x=660) first, then move MOSS onto PressurePlate (col 19, x=624)
  await moveToX(page, 'zippy', 660);
  await waitForGrounded(page, 'zippy');

  await tapKey(page, 'Digit1');
  await climbToRelay(page, 'moss');
  await moveToX(page, 'moss', 624);
  await waitForGrounded(page, 'moss');
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.puzzle?.doorOpen === true,
    undefined,
    { timeout: 3000 },
  );

  // Switch back to ZIPPY, walk through open ElectricDoor, jump onto Exit Sanctum (col 25..29), reach ExitGate (col 27, x=880)
  await tapKey(page, 'Digit2');
  await jumpRightOnto(page, 'zippy', 745, 816, 414);
  await moveToX(page, 'zippy', 880);
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.puzzle?.completed === true,
    undefined,
    { timeout: 3000 },
  );
  if (captureScreenshots) {
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cc018-04-completed.png') });
  }
}

test.describe('CC-018 — Level 3: The Resonant Grove', () => {
  test('1. Initial State: Dormant root, hidden vine, unpowered relay, locked exit', async ({ page }) => {
    const errors = await enterLevel3(page);
    const state = await getGameState(page);

    expect(state.scene).toBe('GameplayScene');
    expect(state.activeCritter).toBe('moss');
    expect(state.moss?.x).toBe(48);
    expect(state.zippy?.x).toBe(112);
    expect(state.resonance).toEqual({
      rootConnected: false,
      vineVisible: false,
      energyTransmitting: false,
      relayPowered: false,
      gateUnlocked: false,
      completed: false,
    });
    expect(errors).toEqual([]);
  });

  test('2. Invalid Relay Activation: ZIPPY cannot power Relay before Root connection', async ({ page }) => {
    const errors = await enterLevel3(page);

    await tapKey(page, 'Digit2');
    await climbToRoot(page, 'zippy');
    await climbToRelay(page, 'zippy');
    await moveToX(page, 'zippy', 528);
    await tapKey(page, 'KeyE');
    await page.waitForTimeout(100);

    const state = await getGameState(page);
    expect(state.resonance?.rootConnected).toBe(false);
    expect(state.resonance?.relayPowered).toBe(false);
    expect(state.puzzle?.completed).toBe(false);
    expect(errors).toEqual([]);
  });

  test('3. Full Level 3 Playthrough, Reset, and Replay', async ({ page }) => {
    test.setTimeout(60000);
    const errors = await enterLevel3(page);

    await completeLevel3FromStart(page, true);
    expect((await getGameState(page)).puzzle?.completed).toBe(true);

    // Reset with R and verify clean Dormant state
    await tapKey(page, 'KeyR');
    await page.waitForFunction(
      () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.puzzle?.completed === false,
    );

    const resetState = await getGameState(page);
    expect(resetState.activeCritter).toBe('moss');
    expect(resetState.moss?.x).toBe(48);
    expect(resetState.zippy?.x).toBe(112);
    expect(resetState.resonance).toEqual({
      rootConnected: false,
      vineVisible: false,
      energyTransmitting: false,
      relayPowered: false,
      gateUnlocked: false,
      completed: false,
    });

    // Replay Level 3 after Reset
    await completeLevel3FromStart(page, false);
    expect((await getGameState(page)).puzzle?.completed).toBe(true);
    expect(errors).toEqual([]);
  });
});

