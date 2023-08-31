declare let window: any;

export class DynamicEnvironment {
  public get environment() {
    return window.config.localUrl;
    // return window.config.stageUrl;
    // return window.config.uatUrl;
    // return window.config.prodUrl;
  }
}
