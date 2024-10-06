import { Module } from "./Module";


export function bootstrap(M: typeof Module) {
  const root = document.getElementById('root')!;
  const m = new M();
  const Bootstrap = m._getBootstrap();
  const bootstrapInstance = new Bootstrap();
  bootstrapInstance._init();

  const elements = bootstrapInstance._getElements();
  elements.forEach(elem => {
    root.appendChild(elem);
  });

  bootstrapInstance.$onInit();
}
