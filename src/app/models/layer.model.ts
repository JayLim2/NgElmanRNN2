import {Matrix} from "./matrix.model";

export class Layer {
  neuronsList: Matrix;
  t: Matrix;

  constructor(linesCount: number, columnsCount: number) {
    let left = -0.5;
    let right = 0.5;
    this.neuronsList = new Matrix(linesCount, columnsCount);
    this.t = new Matrix(linesCount, columnsCount, left, right);
  }

  public print(name: string) {
    console.log(`### ${name} ###`)
    console.log("n: ", this.neuronsList.print());
    console.log("t: ", this.t.print());
  }
}
