import { expect, Page, test } from '@playwright/test';
import path from 'node:path';

const ARTIFACT_DIR = '/home/bbinota/.gemini/antigravity/brain/f25f9062-4eb6-4e08-b8d3-8e6e89b8fa03';

interface ResonanceSnapshot {
  rootConnected: boolean;
  vineVisible: boolean;
  energyTransmitting: boolean;
  relayPowered: boolean;
  gateUnlocked: boolean;
  completed: boolean;
}

interface DevGameState {
  scene: string;
  activeCritter?: 'moss' | 'zippy';
  moss?: { x: number; y: number; state: string; facing: string };
  zippy?: { x: number; y: number; state: string; facing: string };
  resonance?: ResonanceSnapshot;
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

async function loadPrototype(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.setViewportSize({ width: 960, height: 540 });
  await page.goto('/?scene=TwinResonanceScene');
  await page.waitForFunction(
    () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.scene === 'TwinResonanceScene',
  );
  return errors;
}

test.describe('CC-017 — Twin Resonance Prototype', () => {
  test('1. Initial State: Dormant root, hidden vine, unpowered relay, locked gate', async ({ page }) => {
    const errors = await loadPrototype(page);
    const state = await getGameState(page);

    expect(state.scene).toBe('TwinResonanceScene');
    expect(state.activeCritter).toBe('moss');
    expect(state.moss).toBeDefined();
    expect(state.zippy).toBeDefined();
    expect(state.resonance).toEqual({
      rootConnected: false,
      vineVisible: false,
      energyTransmitting: false,
      relayPowered: false,
      gateUnlocked: false,
      completed: false,
    });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cc017-01-dormant.png') });
    expect(errors).toEqual([]);
  });

  test('2. Invalid Relay Activation: ZIPPY cannot power Relay before Root connection', async ({ page }) => {
    const errors = await loadPrototype(page);

    await tapKey(page, 'Digit2');
    expect((await getGameState(page)).activeCritter).toBe('zippy');

    // Move ZIPPY to ResonanceRelay (col 19, x=624) without MOSS connecting Root first
    await moveToX(page, 'zippy', 624);
    await tapKey(page, 'KeyE');
    await page.waitForTimeout(100);

    const state = await getGameState(page);
    expect(state.resonance?.rootConnected).toBe(false);
    expect(state.resonance?.relayPowered).toBe(false);
    expect(state.resonance?.gateUnlocked).toBe(false);
    expect(state.resonance?.completed).toBe(false);
    expect(errors).toEqual([]);
  });

  test('3. MOSS Connection persists after switching, ZIPPY Activation & Completion, and Reset', async ({ page }) => {
    const errors = await loadPrototype(page);

    // MOSS moves to ResonanceRoot (col 9, x=304) and activates
    await moveToX(page, 'moss', 304);
    await tapKey(page, 'KeyE');

    await page.waitForFunction(
      () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.resonance?.rootConnected === true,
    );
    const connectedState = await getGameState(page);
    expect(connectedState.resonance?.vineVisible).toBe(true);
    expect(connectedState.resonance?.relayPowered).toBe(false);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cc017-02-root-connected.png') });

    // Switch to ZIPPY and verify connection persists
    await tapKey(page, 'Digit2');
    const afterSwitch = await getGameState(page);
    expect(afterSwitch.activeCritter).toBe('zippy');
    expect(afterSwitch.resonance?.rootConnected).toBe(true);
    expect(afterSwitch.resonance?.vineVisible).toBe(true);

    // ZIPPY moves to ResonanceRelay (col 19, x=624) and powers Relay
    await moveToX(page, 'zippy', 624);
    await tapKey(page, 'KeyE');

    // Energy transmission triggers Relay powered -> Gate unlocks -> Prototype completes
    await page.waitForFunction(
      () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.resonance?.completed === true,
      undefined,
      { timeout: 3000 },
    );

    const completedState = await getGameState(page);
    expect(completedState.resonance?.relayPowered).toBe(true);
    expect(completedState.resonance?.gateUnlocked).toBe(true);
    expect(completedState.resonance?.completed).toBe(true);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cc017-03-completed.png') });

    // Reset with R restores full Dormant state
    await tapKey(page, 'KeyR');
    await page.waitForFunction(
      () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.resonance?.completed === false,
    );

    const resetState = await getGameState(page);
    expect(resetState.activeCritter).toBe('moss');
    expect(resetState.moss?.x).toBe(112);
    expect(resetState.zippy?.x).toBe(176);
    expect(resetState.resonance).toEqual({
      rootConnected: false,
      vineVisible: false,
      energyTransmitting: false,
      relayPowered: false,
      gateUnlocked: false,
      completed: false,
    });

    // Prototype can be completed again after Reset
    await moveToX(page, 'moss', 304);
    await tapKey(page, 'KeyE');
    await page.waitForFunction(
      () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.resonance?.rootConnected === true,
    );
    await tapKey(page, 'Digit2');
    await moveToX(page, 'zippy', 624);
    await tapKey(page, 'KeyE');
    await page.waitForFunction(
      () => (window as unknown as { __CC_TEST_STATE__?: DevGameState }).__CC_TEST_STATE__?.resonance?.completed === true,
      undefined,
      { timeout: 3000 },
    );
    expect((await getGameState(page)).resonance?.completed).toBe(true);
    expect(errors).toEqual([]);
  });
});

