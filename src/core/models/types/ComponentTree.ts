import { ComponentComponentTree } from "../interfaces/ComponentComponentTree";
import { TagComponentTree } from "../interfaces/TagComponentTree";
import { TextComponentTree } from "../interfaces/TextComponentTree";


export type ComponentTree = TextComponentTree | TagComponentTree | ComponentComponentTree;
