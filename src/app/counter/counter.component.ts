import { Component } from "../../core/Component";
// @ts-ignore
import template from './counter.component.html';

export class CounterComponent extends Component {

  constructor() {
    super();
  }
}

CounterComponent.setTemplate(template);
