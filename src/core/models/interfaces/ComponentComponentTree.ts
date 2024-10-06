import { ComponentTree } from "../types/ComponentTree";
import { ComponentTreeBase } from "./ComponentTreeBase";


export interface ComponentComponentTree extends ComponentTreeBase {
  id: string,
  type: 'component',
  tagName: string,
  dependencies: Set<string>,
  children: ComponentTree[],
}
