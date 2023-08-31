// stage environment **********************
// const url = "http://10.0.3.10:97/api/";

// uat environment **********************
// const url = "http://10.0.4.172:98/api/";

//prod environment ******************************
// const url = "https://prod-tapapi.trustaxiatapay.com/api/";

//local environment ******************************
// const url = "https://localhost:7245/api/";


import { DynamicEnvironment } from "./environment.dynamic";
class Environment extends DynamicEnvironment {
    public defaultauth: string;
    public production: boolean;
    constructor() {
      super();
      this.production = false;
      this.defaultauth = "fackbackend";
    }
  }
export const environment = new Environment();
