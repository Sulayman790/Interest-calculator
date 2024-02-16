import { Subscriber } from "./subscriber";

export class AdminForm {
  value!: boolean;
  name!: string;
  constructor(value: boolean, name: string) {
    this.value = value;
    this.name = name;
  }
}
