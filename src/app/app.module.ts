import { Module } from "../core/Module";
import { AppComponent } from "./app.component";
import { CounterComponent } from "./counter/counter.component";


export class AppModule extends Module {

  constructor() {
    super();

    this.setBootstrap(AppComponent);

    this.setDeclarations([
      AppComponent,
      CounterComponent,
    ]);

    this.setImports([]);
  }
}
