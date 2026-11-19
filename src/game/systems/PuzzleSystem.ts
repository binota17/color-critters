export interface PuzzleConditionListener {
  onPuzzleConditionsChanged(system: PuzzleSystem): void;
  reset(): void;
}

/**
 * Manages puzzle condition flags, evaluates condition-driven listeners (doors, gates),
 * tracks completion state, and supports clean level reset.
 */
export class PuzzleSystem {
  private readonly initialConditions: Record<string, boolean>;
  private conditions: Record<string, boolean>;
  private readonly listeners: PuzzleConditionListener[] = [];
  private completed = false;
  private onCompleteCallback?: () => void;

  constructor(initialConditions: Record<string, boolean> = {}) {
    this.initialConditions = { ...initialConditions };
    this.conditions = { ...initialConditions };
  }

  registerListener(listener: PuzzleConditionListener): void {
    this.listeners.push(listener);
    listener.onPuzzleConditionsChanged(this);
  }

  onComplete(callback: () => void): void {
    this.onCompleteCallback = callback;
  }

  setCondition(key: string, value: boolean): void {
    if (this.conditions[key] === value) {
      return;
    }

    this.conditions[key] = value;
    this.notifyListeners();
  }

  getCondition(key: string): boolean {
    return Boolean(this.conditions[key]);
  }

  areConditionsMet(requiredKeys: readonly string[]): boolean {
    return requiredKeys.every((key) => this.getCondition(key));
  }

  isCompleted(): boolean {
    return this.completed;
  }

  markCompleted(): void {
    if (this.completed) {
      return;
    }
    this.completed = true;
    this.onCompleteCallback?.();
  }

  reset(): void {
    this.completed = false;
    this.conditions = { ...this.initialConditions };
    for (const listener of this.listeners) {
      listener.reset();
    }
    this.notifyListeners();
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener.onPuzzleConditionsChanged(this);
    }
  }
}
