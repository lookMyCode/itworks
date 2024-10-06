import { ComponentTree } from "../types/ComponentTree";
import { ComponentTreeBase } from "./ComponentTreeBase";
import { TagComponentAttribute } from "./TagComponentAttribute";


export interface TagComponentTree extends ComponentTreeBase {
  id: string,
  type: 'tag',
  tagName: string,
  dependencies: Set<string>,
  children: ComponentTree[],
  attributes: TagComponentAttribute[],
}
