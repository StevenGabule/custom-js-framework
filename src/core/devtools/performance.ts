import { PerformanceMetric } from "./types";

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();
  private subscribers: Set<(metric: PerformanceMetric) => void> = new Set();

  public mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  public measure(
    name: string,
    type: PerformanceMetric["type"] = "custom",
    metadata?: Record<string, any>
  ): void {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No mark found for: ${name}`);
      return;
    }

    const endTime = performance.now();
    const metric: PerformanceMetric = {
      name,
      startTime,
      endTime,
      duration: endTime - startTime,
      type,
      metadata,
    };

    this.metrics.push(metric);
    this.notifySubscribers(metric);
    this.marks.delete(name);
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public clearMetrics(): void {
    this.metrics = [];
    this.marks.clear();
  }

  public subscribe(callback: (metric: PerformanceMetric) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(metric: PerformanceMetric): void {
    this.subscribers.forEach((callback) => callback(metric));
  }
}
