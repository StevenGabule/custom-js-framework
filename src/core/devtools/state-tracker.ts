import { StateUpdate } from "./types";

export class StateTracker {
  private updates: StateUpdate[] = [];
  private subscribers: Set<(update: StateUpdate) => void> = new Set();

  public trackUpdate(update: StateUpdate): void {
    this.updates.push(update);
    this.notifySubscribers(update);
  }

  public getUpdates(): StateUpdate[] {
    return [...this.updates];
  }

  public clearUpdates(): void {
    this.updates = [];
  }

  public subscribe(callback: (update: StateUpdate) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(update: StateUpdate): void {
    this.subscribers.forEach((callback) => callback(update));
  }
}
