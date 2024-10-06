import { ComponentTreeBase } from "./ComponentTreeBase";


export interface TextComponentTree extends ComponentTreeBase {
  type: 'text',
  content: string,
}
