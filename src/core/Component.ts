import { Module } from "./Module";
import { v4 as uuidv4 } from 'uuid';
import { ComponentTree } from "./models/types/ComponentTree";
import { ComponentElement } from "./models/types/ComponentElement";
import { TagComponentTree } from "./models/interfaces/TagComponentTree";
import { ComponentComponentTree } from "./models/interfaces/ComponentComponentTree";
import { TagComponentAttribute } from "./models/interfaces/TagComponentAttribute";


export class Component {
  private _componentConstructor: typeof Component;
  private _trees: ComponentTree[] = [];
  private _dependencies = new Set<string>();
  private _allDependencies = new Set<string>();
  private _elements: ComponentElement[] = [];
  private _mounted = false;

  constructor() {
    return new Proxy(this, {
      get: (target, prop) => {
        return Reflect.get(target, prop);
      },
      set: (target, prop, value) => {
        Reflect.set(target, prop, value);
        this._check(prop as string);
        return true;
      }
    });
  }

  private _check(prop: string) {
    if (!this._mounted || prop === '_mounted') return;
    if (!this._allDependencies.has(prop)) return;

    const parse = (trees: ComponentTree[]) => {
      trees.forEach(tree => {
        if (tree.type === 'tag') {
          if (tree.dependencies.has(prop)) {
            const elem = document.querySelector(`[_id="${tree.id}"]`);
            if (elem) {
              this.updateElement(tree, elem as HTMLElement);
            }
          }

          parse(tree.children);
        }
      });
    }

    parse(this._trees);
  }

  updateElement(tree: TagComponentTree, elem: HTMLElement) {
    tree.attributes
      .filter(attr => attr.type === 'variable')
      .forEach(attr => {
        const value = eval(attr.value);
        elem.setAttribute(attr.name, value);
      });

    // check text node
  }

  _init() {
    this._componentConstructor = this.constructor as typeof Component;
    const template = this._componentConstructor.getTemplate();

    const div = document.createElement('div');
    div.innerHTML = template;
    this._buildTree(div.childNodes as NodeListOf<HTMLElement>)
    this._buildElements();
    this._mounted = true;
  }

  private _buildTree(list: NodeListOf<Element>, parentTree?: TagComponentTree | ComponentComponentTree) {
    if (!list.length) return;

    const m: Module = this._componentConstructor.getModule();
    const declarations = m._getDeclarations();
    const names = declarations.map(d => d.name.toUpperCase());
    
    for (let i = 0, l = list.length; i < l; i++) {
      const x = list[i];
      let tree: ComponentTree;
      const id = uuidv4();

      if (x.nodeType === 3) {
        let textContent = (x.textContent || '').trim();
        if (!textContent) continue;

        const regex = /{{(.*?)}}/g;
        textContent.replace(regex, (_, code: string) => {
          code = code.trim();
          const matches = code.match(/this\.(\w+)/g);

          if (matches) {
            matches.forEach(match => {
              const varName = match.replace('this.', '').trim();
              this._allDependencies.add(varName);

              if (parentTree) {
                parentTree.dependencies.add(varName);
              } else {
                this._dependencies.add(varName);
              }
            });
          }

          const value = eval(code);
          return value;
        });
        
        tree = {
          type: 'text',
          content: textContent,
        }
      } else if (x.nodeType === 1) {
        const tagName = x.tagName.toUpperCase().trim();
        
        if (names.includes(tagName)) {
          tree = {
            id,
            type: 'component',
            children: [],
            dependencies: new Set(),
            tagName,
          }
        } else {
          if (x.toString() === '[object HTMLUnknownElement]') throw new Error('Unknown component');

          const dependencies = new Set<string>();
          const attributes: TagComponentAttribute[] = [];

          for (let i = 0, l = x.attributes.length; i < l; i++) {
            const attribute = x.attributes.item(i);
            if (!attribute) continue;

            const attributeName = attribute.name.trim();
            const nodeValue = attribute.nodeValue || '';

            if (/^\[.*\]$/.test(attributeName)) {
              const matches = nodeValue.match(/this\.(\w+)/g);

              if (matches) {
                matches.forEach(match => {
                  const varName = match.replace('this.', '').trim();
                  dependencies.add(varName);
                  this._allDependencies.add(varName);
                });
              }

              attributes.push({
                name: attributeName.substring(1, attributeName.length - 1),
                value: nodeValue,
                type: 'variable'
              });
            } else if (/^\(.*\)$/.test(attributeName)) {
              attributes.push({
                name: attributeName.substring(1, attributeName.length - 1),
                value: nodeValue,
                type: 'method',
              });
            } else {
              attributes.push({
                name: attributeName,
                value: nodeValue,
                type: 'static',
              });
            }
          }

          tree = {
            id,
            type: 'tag',
            children: [],
            dependencies,
            tagName,
            attributes,
          }
        }
      } else {
        continue;
      }

      if (!parentTree) {
        this._trees.push(tree);
      } else {
        parentTree.children.push(tree);
      }

      this._buildTree.call(this, x.childNodes, tree);
    }
    console.log(this._trees);
  }

  private _buildElements() {
    const elements: ComponentElement[] = [];

    const buildElements = (tree: ComponentTree, parent?: HTMLElement) => {
      if (tree.type === 'tag') {
        const elem = document.createElement(tree.tagName);
        elem.setAttribute('_id', tree.id);

        tree.attributes.forEach(attr => {
          if (attr.type === 'static') {
            elem.setAttribute(attr.name, attr.value);
          } else if (attr.type === 'variable') {
            const value = eval(attr.value);
            elem.setAttribute(attr.name, value);
          } else if (attr.type === 'method') {
            const code = attr.value.split('$event').join('__e');
            elem.addEventListener(attr.name, __e => {
              const func = new Function('__e', `return ${code}`).bind(this);
              func(__e);
            });
          }
        });

        if (parent) {
          parent.appendChild(elem);
        } else {
          elements.push(elem);
        }

        tree.children.forEach(t => {
          buildElements(t, elem);
        });
      } else if (tree.type === 'text') {
        const regex = /{{(.*?)}}/g;

        const parsedContent = tree.content.replace(regex, (match, expression) => {
          try {
            const result = eval(expression);
            return result;
          } catch (error) {
            throw new Error('Parse error');
          }
        });

        const text = document.createTextNode(parsedContent);

        if (parent) {
          parent.appendChild(text);
        } else {
          elements.push(text);
        }
      }
    }

    this._trees.forEach(tree => {
      buildElements(tree);
    });

    this._elements = elements;
  }

  _getElements() {
    return this._elements;
  }

  $onInit(): void {}

  // static

  private static _template: string;
  private static _module: Module;

  static setTemplate(template: string) {
    this._template = template;
  }

  protected static getTemplate() {
    return this._template;
  }

  static setModule(m: Module) {
    this._module = m;
  }

  static getModule() {
    return this._module;
  }
}
