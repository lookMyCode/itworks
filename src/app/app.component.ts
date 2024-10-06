import { Component } from "../core/Component";
// @ts-ignore
import template from './app.component.html';


export class AppComponent extends Component {
  counter = 0;
  
  constructor() {
    super();
  }
  
  $onInit(): void {
    
  }

  decrement() {
    --this.counter;
  }

  increment() {
    ++this.counter;
  }

  setCounter(e: InputEvent) {
    const targer = e.target as HTMLInputElement;
    this.counter = targer.value === '' 
      ? undefined as unknown as number 
      : +targer.value;
  }
}

AppComponent.setTemplate(template);
