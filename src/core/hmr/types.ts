export interface HotModule {
  id: string;
  dependencies: string[];
  reducers?: Record<string, Function>;
  components?: Record<string, any>;
  accept?: (callback: (updatedModule: any) => void) => void;
  decline?: () => void;
}

export interface ModuleMap {
  [id: string]: HotModule;
}

export interface HMRRuntime {
  modules: ModuleMap;
  accept: (moduleId: string, callback: (module: any) => void) => void;
  decline: (moduleId: string) => void;
  apply: (moduleUpdates: Record<string, any>) => Promise<void>;
}
