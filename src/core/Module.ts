import { Component } from "./Component";


export class Module {
  private _declarations: (typeof Component)[] = [];
  private _bootstrap!: typeof Component;

  protected setBootstrap(component: typeof Component) {
    this._bootstrap = component;
  }

  _getBootstrap() {
    return this._bootstrap;
  }

  protected setDeclarations(declarations: (typeof Component)[]) {
    this._declarations = declarations;
    this._declarations.forEach(declaration => {
      declaration.setModule(this);
    });
  }

  _getDeclarations() {
    return this._declarations;
  }

  protected setImports(imports: Module[]) {

  }
}