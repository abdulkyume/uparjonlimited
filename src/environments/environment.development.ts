import { DynamicEnvironment } from "./environment.dynamic";
class Environment extends DynamicEnvironment {
  public defaultauth: string;
  public production: boolean;
  constructor() {
    super();
    this.production = true;

    this.defaultauth = "fackbackend";
  }
}
export const environment = new Environment();