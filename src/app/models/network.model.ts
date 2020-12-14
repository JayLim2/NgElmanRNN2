import {Matrix} from './matrix.model';
import {Layer} from './layer.model';
import {DataUtils} from "../utils/data.utils";
import {Constants} from "../utils/constants";

export class Network {
  // индексы
  private static readonly CONTEXT = 0;
  private static readonly HIDDEN = 1;
  private static readonly OUTPUT = 2;

  private static readonly LAYERS_COUNT = 3;

  hiddenWeights: Matrix;
  outputWeights: Matrix;
  contextSet: Matrix;
  layers: Layer[] = Array(Network.LAYERS_COUNT);

  constructor(
    public dataUtils: DataUtils
  ) {
  }


  train(input: Matrix, e: number, moment: number, learnRate: number, epochs: number) {
    let x: number[];
    let yReal: number, y: number, outError: number, Ej: number;
    let Sh: Matrix, Sy: Matrix;

    const inputRowsCount = input.rows;
    const inputColumnsCount = input.columns;

    const inputCount = inputColumnsCount - 1;
    const hiddenCount = Math.max(inputCount / 2, 2);
    const outputCount = 1;

    this.layers[Network.CONTEXT] = new Layer(1, inputCount + hiddenCount);
    this.contextSet = new Matrix(inputRowsCount, hiddenCount, Constants.LEFT, Constants.RIGHT);
    const hiddenWeights: Matrix = new Matrix(inputCount + hiddenCount, hiddenCount, Constants.LEFT, Constants.RIGHT);

    this.layers[Network.HIDDEN] = new Layer(1, hiddenCount);
    this.layers[Network.OUTPUT] = new Layer(1, outputCount);
    const outputWeights: Matrix = new Matrix(hiddenCount, outputCount, Constants.LEFT, Constants.RIGHT);

    let context: number[];

    let E: number;
    let isRunning = true;
    let currentEpoch = 0;

    do {
      E = 0;

      // Прямой проход: для каждого вектора последовательности вычисляем состояния скрытого слоя
      for (let i = 0; i < inputRowsCount; i++) {
        x = input.getLinePart(i, 0, inputCount);

        yReal = input.data[i][inputCount];
        context = this.contextSet.getLine(i);

        this.layers[Network.CONTEXT].neurons.setLine(0, 0, inputCount, x);
        this.layers[Network.CONTEXT].neurons.setLine(0, inputCount, hiddenCount, context);

        Sh = this.layers[Network.CONTEXT].neurons.mul(hiddenWeights).sub(this.layers[Network.HIDDEN].delay);
        this.layers[Network.HIDDEN].neurons = this.activate(Sh);

        Sy = this.layers[Network.HIDDEN].neurons.mul(outputWeights).sub(this.layers[Network.OUTPUT].delay);
        this.layers[Network.OUTPUT].neurons = this.activate(Sy);

        y = this.layers[Network.OUTPUT].neurons.data[0][0];

        // (3)
        outError = y - yReal;

        const hiddenErrors: number[] = Array(hiddenCount);
        const dFSy: number = this.derivativeActivationFunction(Sy.data[0][0]);
        for (let wI = 0; wI < hiddenCount; wI++) {
          outputWeights.data[wI][0] = outputWeights.data[wI][0] - learnRate * outError * dFSy * this.layers[Network.HIDDEN].neurons.data[0][wI];
        }
        this.layers[Network.OUTPUT].delay.data[0][0] = this.layers[Network.OUTPUT].delay.data[0][0] + moment * outError * dFSy;

        const dFSh: Matrix = new Matrix(1, hiddenCount);
        for (let j = 0; j < hiddenCount; j++) {
          dFSh.data[0][j] = this.derivativeActivationFunction(Sh.data[0][j]);
          hiddenErrors[j] = outError * dFSh.data[0][j] * outputWeights.data[j][0];
        }

        for (let wI = 0; wI < inputCount + hiddenCount; wI++) {
          for (let wJ = 0; wJ < hiddenCount; wJ++) {
            hiddenWeights.data[wI][wJ] = hiddenWeights.data[wI][wJ] - learnRate * hiddenErrors[wJ] * dFSh.data[0][wJ] * this.layers[Network.CONTEXT].neurons.data[0][wI];
          }
        }

        for (let j = 0; j < hiddenCount; j++) {
          this.layers[Network.HIDDEN].delay.data[0][j] = this.layers[Network.HIDDEN].delay.data[0][j] + moment * hiddenErrors[j] * dFSh.data[0][j];
        }
        this.contextSet.setLine(0, 0, hiddenCount, this.layers[Network.HIDDEN].neurons.getLine(0));
      }

      // Обратный проход: вычисляем ошибку выходного слоя
      // вычисляем ошибку скрытого слоя в конечном состоянии
      // вычисляем ошибки скрытого слоя в промежуточных состояниях
      for (let i = 0; i < inputRowsCount; i++) {
        x = input.getLinePart(i, 0, inputCount);

        yReal = input.data[i][inputCount];
        context = this.contextSet.getLine(i);

        this.layers[Network.CONTEXT].neurons.setLine(0, 0, inputCount, x);
        this.layers[Network.CONTEXT].neurons.setLine(0, inputCount, hiddenCount, context);

        // 7.36 7.37
        Sh = this.layers[Network.CONTEXT].neurons.mul(hiddenWeights).sub(this.layers[Network.HIDDEN].delay);
        this.layers[Network.HIDDEN].neurons = this.activate(Sh);

        Sy = this.layers[Network.HIDDEN].neurons.mul(outputWeights).sub(this.layers[Network.OUTPUT].delay);
        this.layers[Network.OUTPUT].neurons = this.activate(Sy);

        y = this.layers[Network.OUTPUT].neurons.data[0][0];

        outError = y - yReal;
        Ej = outError * outError / 2;

        E += Ej;
      }

      currentEpoch++;
      if (currentEpoch % (epochs / 10) === 0) {
        console.log(`Итераций = ${currentEpoch}; E = ${E}`);

        //show error on chart
        this.dataUtils.putError(currentEpoch, E);
      }
      if (currentEpoch === epochs) {
        isRunning = false;
        console.log('Выход по количеству итераций');
      }
    } while (Math.abs(E) > e && isRunning);

    x = input.getLinePart(inputRowsCount - 1, 1, inputCount);
    context = this.contextSet.getLine(inputRowsCount - 1);

    this.layers[Network.CONTEXT].neurons.setLine(0, 0, inputCount, x);
    this.layers[Network.CONTEXT].neurons.setLine(0, inputCount, hiddenCount, context);

    Sh = this.layers[Network.CONTEXT].neurons.mul(hiddenWeights).sub(this.layers[Network.HIDDEN].delay);
    this.layers[Network.HIDDEN].neurons = this.activate(Sh);

    Sy = this.layers[Network.HIDDEN].neurons.mul(outputWeights).sub(this.layers[Network.OUTPUT].delay);
    this.layers[Network.OUTPUT].neurons = this.activate(Sy);

    y = this.layers[Network.OUTPUT].neurons.data[0][0];
    this.hiddenWeights = hiddenWeights;
    this.outputWeights = outputWeights;

    // this.layers[Network.CONTEXT].print("CONTEXT");
    // this.layers[Network.HIDDEN].print("HIDDEN");
    // this.layers[Network.OUTPUT].print("OUTPUT");

    console.log(`E = ${E}`);
    console.log(`Learn rate = ${learnRate}`);
    console.log(`Moment = ${moment}`);
    console.log(`Epochs = ${currentEpoch}`);
    console.log(`Y = ${y}`);
  }

  test(input: Matrix,
       inputW1: Matrix, inputW2: Matrix,
       layers: Layer[],
       inputContextSet: Matrix): number {

    this.layers = layers;
    this.contextSet = inputContextSet;

    const inputRowsCount = input.rows;
    const inputColumnsCount = input.columns;
    const inputCount = inputColumnsCount - 1;

    let hiddenCount = inputCount / 2;
    if (hiddenCount < 2) {
      hiddenCount = 2;
    }

    const x: number[] = input.getLinePart(inputRowsCount - 1, 1, inputCount);
    const context: number[] = this.contextSet.getLine(inputRowsCount - 1);

    this.layers[Network.CONTEXT].neurons.setLine(0, 0, inputCount, x);
    this.layers[Network.CONTEXT].neurons.setLine(0, inputCount, hiddenCount, context);

    const Sh: Matrix = this.layers[Network.CONTEXT].neurons.mul(inputW1).sub(this.layers[Network.HIDDEN].delay);
    this.layers[Network.HIDDEN].neurons = this.activate(Sh);

    const Sy: Matrix = this.layers[Network.HIDDEN].neurons.mul(inputW2).sub(this.layers[Network.OUTPUT].delay);
    this.layers[Network.OUTPUT].neurons = this.activate(Sy);

    return this.layers[Network.OUTPUT].neurons.data[0][0];
  }

  private activate(S: Matrix): Matrix {
    const lineIndex = 0;
    const columnsCount = S.columns;
    const output: Matrix = new Matrix(1, columnsCount);
    for (let j = 0; j < columnsCount; j++) {
      output.data[lineIndex][j] = this.activationFunction(S.data[lineIndex][j]);
    }
    return output;
  }

  // функция активации
  private activationFunction(x: number): number {
    return 1 / (1 + Math.exp(-x));
    // return Math.atan(x);
  }

  // производная функции активации
  private derivativeActivationFunction(x: number): number {
    const fx = this.activationFunction(x);
    return fx * (1 - fx);
    // return 1.0 / (1.0 + x * x);
  }
}
