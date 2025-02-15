import { EventLog } from "./types";

export class EventLogger {
  private events: EventLog[] = [];
  private subscribers: Set<(event: EventLog) => void> = new Set();

  public log(event: EventLog): void {
    this.events.push(event);
    this.notifySubscribers(event);
  }

  public getEvents(): EventLog[] {
    return [...this.events];
  }

  public clearEvents(): void {
    this.events = [];
  }

  public subscribe(callback: (event: EventLog) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(event: EventLog): void {
    this.subscribers.forEach((callback) => callback(event));
  }
}
