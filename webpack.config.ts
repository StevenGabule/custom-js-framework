import { webpack } from "webpack";
import { HotModule } from "./src/core/hmr/module";

class HMRPlugin {
  apply(compiler: webpack.Compiler): void {
    compiler.hooks.compilation.tap("HMRPlugin", (compilation: any) => {
      compilation.hooks.buildModule.tap("HMRPlugin", (module: any) => {
        if (module.resource && !module.hot) {
          const moduleId = module.resource;
          module.hot = new HotModule(moduleId, (window as any).__HMR__);
        }
      });
    });
  }
}
