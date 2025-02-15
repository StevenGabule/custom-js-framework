export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  type: "render" | "update" | "event" | "network" | "custom";
  metadata?: Record<string, any>;
}

export interface ComponentTreeNode {
  name: string;
  id: string;
  children: ComponentTreeNode[];
  props: Record<string, any>;
  state: Record<string, any>;
  metrics: PerformanceMetric[];
}

export interface StateUpdate {
  timestamp: number;
  componentId: string;
  previousState: Record<string, any>;
  nextState: Record<string, any>;
  action?: string;
}

export interface EventLog {
  timestamp: number;
  type: string;
  payload: any;
  componentId?: string;
}
