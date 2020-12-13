import {Matrix} from "./matrix.model";
import {Layer} from "./layer.model";

export class Network {
  resW1: Matrix;
  resW2: Matrix;
  contextSet: Matrix;

  //индексы
  private static readonly CONTEXT = 0;
  private static readonly HIDDEN = 1;
  private static readonly OUTPUT = 2;

  private static readonly LAYERS_COUNT = 3;

  layers: Layer[] = Array(Network.LAYERS_COUNT);

  train(input: Matrix, e: number, alpha: number, maxStepsCount: number) {
    let x: number[];
    let yReal: number, y: number, outError: number, Ej: number;
    let Sh: Matrix, Sy: Matrix;

    let inputRowsCount = input.rows;
    let inputColumnsCount = input.columns;
    let inputCount = inputColumnsCount - 1;

    let hiddenCount = inputCount / 2;
    if (hiddenCount < 2) {
      hiddenCount = 2;
    }

    let stepsCount = 0;

    let left = 0;
    let right = 1;

    this.layers[Network.CONTEXT] = new Layer(1, inputCount + hiddenCount);
    this.contextSet = new Matrix(inputRowsCount, hiddenCount, left, right);
    let w1: Matrix = new Matrix(inputCount + hiddenCount, hiddenCount, left, right);

    this.layers[Network.HIDDEN] = new Layer(1, hiddenCount);
    this.layers[Network.OUTPUT] = new Layer(1, 1);
    let w2: Matrix = new Matrix(hiddenCount, 1, left, right);

    let context: number[];
    let E: number;
    let isRunning: boolean = true;

    do {
      E = 0;

      //Прямой проход: для каждого вектора последовательности вычисляем состояния скрытого слоя
      for (let i = 0; i < inputRowsCount; i++) {
        x = input.getLinePart(i, 0, inputCount);

        yReal = input.data[i][inputCount];
        context = this.contextSet.getLine(i);

        this.layers[Network.CONTEXT].neuronsList.setLine(0, 0, inputCount, x);
        this.layers[Network.CONTEXT].neuronsList.setLine(0, inputCount, hiddenCount, context);

        Sh = this.layers[Network.CONTEXT].neuronsList.times(w1).minus(this.layers[Network.HIDDEN].t);
        this.layers[Network.HIDDEN].neuronsList = this.activate(Sh);

        Sy = this.layers[Network.HIDDEN].neuronsList.times(w2).minus(this.layers[Network.OUTPUT].t);
        this.layers[Network.OUTPUT].neuronsList = this.activate(Sy);

        y = this.layers[Network.OUTPUT].neuronsList.data[0][0];

        // (3)
        outError = y - yReal;

        let hiddenErrors: number[] = Array(hiddenCount);
        let dFSy: number = this.derivativeActivationFunction(Sy.data[0][0]);
        for (let wI = 0; wI < hiddenCount; wI++) {
          w2.data[wI][0] = w2.data[wI][0] - alpha * outError * dFSy * this.layers[Network.HIDDEN].neuronsList.data[0][wI];
        }
        this.layers[Network.OUTPUT].t.data[0][0] = this.layers[Network.OUTPUT].t.data[0][0] + alpha * outError * dFSy;

        let dFSh: Matrix = new Matrix(1, hiddenCount);
        for (let j = 0; j < hiddenCount; j++) {
          dFSh.data[0][j] = this.derivativeActivationFunction(Sh.data[0][j]);
          hiddenErrors[j] = outError * dFSh.data[0][j] * w2.data[j][0];
        }

        for (let wI = 0; wI < inputCount + hiddenCount; wI++) {
          for (let wJ = 0; wJ < hiddenCount; wJ++) {
            w1.data[wI][wJ] = w1.data[wI][wJ] - alpha * hiddenErrors[wJ] * dFSh.data[0][wJ] * this.layers[Network.CONTEXT].neuronsList.data[0][wI];
          }
        }

        for (let j = 0; j < hiddenCount; j++) {
          this.layers[Network.HIDDEN].t.data[0][j] = this.layers[Network.HIDDEN].t.data[0][j] + alpha * hiddenErrors[j] * dFSh.data[0][j];
        }
        this.contextSet.setLine(0, 0, hiddenCount, this.layers[Network.HIDDEN].neuronsList.getLine(0));
      }

      // Обратный проход: вычисляем ошибку выходного слоя
      // вычисляем ошибку скрытого слоя в конечном состоянии
      // вычисляем ошибки скрытого слоя в промежуточных состояниях
      for (let i = 0; i < inputRowsCount; i++) {
        x = input.getLinePart(i, 0, inputCount);

        yReal = input.data[i][inputCount];
        context = this.contextSet.getLine(i);

        this.layers[Network.CONTEXT].neuronsList.setLine(0, 0, inputCount, x);
        this.layers[Network.CONTEXT].neuronsList.setLine(0, inputCount, hiddenCount, context);

        //7.36 7.37
        Sh = this.layers[Network.CONTEXT].neuronsList.times(w1).minus(this.layers[Network.HIDDEN].t);
        this.layers[Network.HIDDEN].neuronsList = this.activate(Sh);

        Sy = this.layers[Network.HIDDEN].neuronsList.times(w2).minus(this.layers[Network.OUTPUT].t);
        this.layers[Network.OUTPUT].neuronsList = this.activate(Sy);

        y = this.layers[Network.OUTPUT].neuronsList.data[0][0];

        outError = y - yReal;

        Ej = outError * outError / 2;
        E += Ej;
      }

      stepsCount++;
      if (stepsCount % (maxStepsCount / 10) == 0) {
        console.log(`Итераций = ${stepsCount}; E = ${E}`)
      }
      if (stepsCount == maxStepsCount) {
        isRunning = false;
        console.log("Выход по количеству итераций")
      }
    } while (Math.abs(E) > e && isRunning);

    x = input.getLinePart(inputRowsCount - 1, 1, inputCount);
    context = this.contextSet.getLine(inputRowsCount - 1);

    this.layers[Network.CONTEXT].neuronsList.setLine(0, 0, inputCount, x);
    this.layers[Network.CONTEXT].neuronsList.setLine(0, inputCount, hiddenCount, context);

    Sh = this.layers[Network.CONTEXT].neuronsList.times(w1).minus(this.layers[Network.HIDDEN].t);
    this.layers[Network.HIDDEN].neuronsList = this.activate(Sh);

    Sy = this.layers[Network.HIDDEN].neuronsList.times(w2).minus(this.layers[Network.OUTPUT].t);
    this.layers[Network.OUTPUT].neuronsList = this.activate(Sy);

    y = this.layers[Network.OUTPUT].neuronsList.data[0][0];
    this.resW1 = w1;
    this.resW2 = w2;

    // console.log("Матрица весов W на первом слое:");
    // w1.print();
    // console.log("Матрица весов W' на втором слое:");
    // w2.print();

    // this.layers[Network.CONTEXT].print("CONTEXT");
    // this.layers[Network.HIDDEN].print("HIDDEN");
    // this.layers[Network.OUTPUT].print("OUTPUT");

    console.log(`E = ${E}`)
    console.log(`ALPHA = ${alpha}`)
    console.log(`Steps count = ${stepsCount}`)
    console.log(`Y = ${y}`)
  }

  test(input: Matrix,
       inputW1: Matrix, inputW2: Matrix,
       layers: Layer[],
       inputContextSet: Matrix): number {

    this.layers = layers;
    this.contextSet = inputContextSet;

    let inputRowsCount = input.rows;
    let inputColumnsCount = input.columns;
    let inputCount = inputColumnsCount - 1;

    let hiddenCount = inputCount / 2;
    if (hiddenCount < 2) {
      hiddenCount = 2;
    }

    let x: number[] = input.getLinePart(inputRowsCount - 1, 1, inputCount);
    let context: number[] = this.contextSet.getLine(inputRowsCount - 1);

    this.layers[Network.CONTEXT].neuronsList.setLine(0, 0, inputCount, x);
    this.layers[Network.CONTEXT].neuronsList.setLine(0, inputCount, hiddenCount, context);

    let Sh: Matrix = this.layers[Network.CONTEXT].neuronsList.times(inputW1).minus(this.layers[Network.HIDDEN].t);
    this.layers[Network.HIDDEN].neuronsList = this.activate(Sh);

    let Sy: Matrix = this.layers[Network.HIDDEN].neuronsList.times(inputW2).minus(this.layers[Network.OUTPUT].t);
    this.layers[Network.OUTPUT].neuronsList = this.activate(Sy);

    return this.layers[Network.OUTPUT].neuronsList.data[0][0];
  }

  private activate(S: Matrix): Matrix {
    let lineIndex = 0;
    let columnsCount = S.columns;
    let output: Matrix = new Matrix(1, columnsCount);
    for (let j = 0; j < columnsCount; j++) {
      output.data[lineIndex][j] = this.activationFunction(S.data[lineIndex][j]);
    }
    return output;
  }

  // функция активации
  private activationFunction(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  // производная функции активации
  private derivativeActivationFunction(x: number): number {
    let fx = this.activationFunction(x);
    return fx * (1 - fx);
  }
}
