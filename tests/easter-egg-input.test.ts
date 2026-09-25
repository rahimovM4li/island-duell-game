import { afterEach, describe, expect, it, vi } from 'vitest';
import { InputState } from '../client/src/input';
import { DEFAULT_SETTINGS } from '../client/src/settings';

afterEach(() => vi.unstubAllGlobals());

describe('round Easter egg input', () => {
  it('activates on two distinct P presses during gameplay and resets for the next round', () => {
    let keydown: (event: KeyboardEvent) => void = () => {};
    vi.stubGlobal('document', {
      addEventListener(type: string, listener: (event: KeyboardEvent) => void) {
        if (type === 'keydown') keydown = listener;
      },
    });
    vi.stubGlobal('window', { addEventListener() {} });
    const input = new InputState({ addEventListener() {} } as unknown as HTMLElement, DEFAULT_SETTINGS);
    const pressP = (repeat = false) => keydown({
      code: 'KeyP', repeat, ctrlKey: false, metaKey: false, altKey: false,
      preventDefault() {},
    } as unknown as KeyboardEvent);

    pressP();
    expect(input.easterEggPressed).toBe(false);
    input.pointerLocked = true;
    pressP();
    expect(input.easterEggPressed).toBe(false);
    pressP(true);
    expect(input.easterEggPressed).toBe(false);
    pressP();
    expect(input.easterEggPressed).toBe(true);
    input.clearEdges();
    pressP();
    expect(input.easterEggPressed).toBe(false);

    input.resetEasterEgg();
    pressP();
    expect(input.easterEggPressed).toBe(false);
    pressP();
    expect(input.easterEggPressed).toBe(true);
  });
});
