import {Matrix} from './matrix.model';
import {Constants} from "../utils/constants";

export class Layer {
  neurons: Matrix;
  delay: Matrix;

  constructor(rowsCount: number, columnsCount: number) {
    this.neurons = new Matrix(rowsCount, columnsCount);
    this.delay = new Matrix(rowsCount, columnsCount, Constants.LEFT, Constants.RIGHT);
  }

  public print(name: string) {
    console.log(`### ${name} ###`);
    console.log('neurons: ', this.neurons.print());
    console.log('delay: ', this.delay.print());
  }
}
