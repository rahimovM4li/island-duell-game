export type OnboardingEvent = 'move' | 'loot' | 'aim' | 'cover';

export interface OnboardingStage {
  event: OnboardingEvent;
  eyebrow: string;
  title: string;
  body: string;
}

export const ONBOARDING_STAGES: readonly OnboardingStage[] = [
  { event: 'move', eyebrow: '1 / 4', title: 'In Bewegung bleiben', body: 'WASD zum Laufen, Umschalt zum Sprinten und Strg zum Schleichen.' },
  { event: 'loot', eyebrow: '2 / 4', title: 'Ausr\u00fcsten', body: 'Laufe \u00fcber Beute oder Kisten. Zwei Waffen passen in deine Slots.' },
  { event: 'aim', eyebrow: '3 / 4', title: 'Kontrolliert schie\u00dfen', body: 'Halte die rechte Maustaste zum Zielen. Kurze Feuerst\u00f6\u00dfe bleiben pr\u00e4ziser.' },
  { event: 'cover', eyebrow: '4 / 4', title: 'Sicht brechen', body: 'B\u00fcsche verdecken dich. Schleichen verursacht deutlich weniger Ger\u00e4usche.' },
] as const;

export function advanceOnboarding(index: number, event: OnboardingEvent): number {
  return ONBOARDING_STAGES[index]?.event === event ? index + 1 : index;
}

const STORAGE_KEY = 'islandDuell:onboardingComplete:v1';

/** Small, non-blocking contextual guide used only in the first practice match. */
export class OnboardingGuide {
  private index = 0;
  private active = false;

  constructor(
    private readonly root: HTMLElement,
    private readonly eyebrow: HTMLElement,
    private readonly title: HTMLElement,
    private readonly body: HTMLElement,
    private readonly storage: Storage = localStorage,
  ) {}

  start(practice: boolean): void {
    this.active = practice && this.storage.getItem(STORAGE_KEY) !== '1';
    this.index = 0;
    this.render();
  }

  signal(event: OnboardingEvent): void {
    if (!this.active) return;
    this.index = advanceOnboarding(this.index, event);
    if (this.index >= ONBOARDING_STAGES.length) {
      this.complete();
      return;
    }
    this.render();
  }

  dismiss(): void { this.complete(); }

  private complete(): void {
    this.active = false;
    this.storage.setItem(STORAGE_KEY, '1');
    this.render();
  }

  private render(): void {
    this.root.classList.toggle('visible', this.active);
    const stage = ONBOARDING_STAGES[this.index];
    if (!stage) return;
    this.eyebrow.textContent = stage.eyebrow;
    this.title.textContent = stage.title;
    this.body.textContent = stage.body;
  }
}
