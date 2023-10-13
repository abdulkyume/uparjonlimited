declare let window: any;

export class DynamicEnvironment {
  public get environment() {
    return window.config.localUrl;
    // return window.config.prodUrl;
  }
}
