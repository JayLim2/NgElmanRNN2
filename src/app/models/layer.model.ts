import {Matrix} from './matrix.model';
import {Constants} from "../utils/constants";

export class Layer {
  neuronsList: Matrix;
  t: Matrix;

  constructor(rowsCount: number, columnsCount: number) {
    this.neuronsList = new Matrix(rowsCount, columnsCount);
    this.t = new Matrix(rowsCount, columnsCount, Constants.LEFT, Constants.RIGHT);
  }

  public print(name: string) {
    console.log(`### ${name} ###`);
    console.log('n: ', this.neuronsList.print());
    console.log('t: ', this.t.print());
  }
}
