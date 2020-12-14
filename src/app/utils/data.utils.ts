import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Matrix} from '../models/matrix.model';
import {Network} from '../models/network.model';
import {Layer} from '../models/layer.model';
import {MathUtils} from "./math.utils";

export type Dataset = 'functional' | 'sber' | 'gold';

export interface ErrorsChart {
  epochs: string[],
  errors: number[]
}

export interface DataChart {
  realData: number[],
  predictedData: number[],
  days: string[]
}

@Injectable()
export class DataUtils {

  trainingSequence = '';
  testSequence = '';

  errorsChart: ErrorsChart = {
    epochs: [],
    errors: []
  }

  dataChart: DataChart = {
    realData: [],
    predictedData: [],
    days: []
  }

  epochs$: Subject<any> = new Subject();
  errors$: Subject<any> = new Subject();

  realData$: Subject<any> = new Subject();
  predictedData$: Subject<any> = new Subject();
  days$: Subject<any> = new Subject();

  putError(epoch: number, error: number): void {
    this.errorsChart.epochs.push(`${epoch}`);
    this.errorsChart.errors.push(error);

    this.epochs$.next(this.errorsChart.epochs);
    this.errors$.next(this.errorsChart.errors);
  }

  putData(day: any, real: number, predicted: number): void {
    this.dataChart.days.push(`${day}`);
    this.dataChart.realData.push(real);
    this.dataChart.predictedData.push(predicted);

    console.log(this.dataChart.predictedData);

    this.days$.next(this.dataChart.days);
    this.realData$.next(this.dataChart.realData);
    this.predictedData$.next(this.dataChart.predictedData);
  }

  clear() {
    this.errorsChart.epochs = [];
    this.errorsChart.errors = [];
    this.epochs$.next(this.errorsChart.epochs);
    this.errors$.next(this.errorsChart.errors);

    this.dataChart.days = [];
    this.dataChart.realData = [];
    this.dataChart.predictedData = [];
    this.days$.next([this.dataChart.days]);
    this.realData$.next(this.dataChart.realData);
    this.predictedData$.next(this.dataChart.predictedData);
  }

  private configuration = {
    epochs: 10_000,
    training: 90,
    testing: 0,
    inputCount: 0,
    contextCount: 0,
    hiddenCount: 0,
    outputCount: 0,
    windowSize: 4,
    maxError: 0.0001,
    learnRate: 0.01,
    moment: 0.01
  };

  private layers: Layer[];
  private hiddenWeights: Matrix;
  private outputWeights: Matrix;
  private contextSet: Matrix;

  output = '';
  outputS: Subject<string> = new Subject<string>();

  public loading = false;
  public training = false;
  public trained = false;

  public trainingAccuracyChartData = [{
    data: [],
    label: 'Погрешность обучения'
  }];
  public trainingAccuracyChartLabels = [];

  public testAccuracyChartData = [{
    data: [],
    label: 'Погрешность прогнозирования'
  }];
  public testAccuracyChartLabels = [];

  constructor(
    private http: HttpClient
  ) {
  }

  public distribute(dataset: string) {
    const numbers: number[] = dataset.split(' ')
      .map(str => Number.parseFloat(str.trim()));
    const trainingCount = Math.round(this.configuration.training / 100 * numbers.length);

    // console.log(numbers);

    const trainingNumbers = numbers.slice(0, trainingCount);
    const testNumbers = numbers.slice(trainingCount, numbers.length);

    // console.log(trainingNumbers);
    // console.log(testNumbers);

    this.trainingSequence = trainingNumbers.join(' ').trim();
    this.testSequence = testNumbers.join(' ').trim();
  }

  dataset: Dataset;
  dataset$: Subject<Dataset> = new Subject();

  public load(name: Dataset): void {
    this.loadDataset(name).subscribe((dataset: string) => {
      if (name === 'functional') {
        this.configuration.epochs = 10_000;
      }
      this.dataset$.next(name);
      this.clear();
      this.distribute(dataset);
    });
  }

  private loadDataset(name: Dataset): Observable<any> {
    return this.http.get(`../../assets/${name}.txt`, {
      responseType: 'text'
    });
  }

  public train() {
    const sequence: number[] = this.getSequence(this.trainingSequence);
    this.scaleSequence(sequence);

    const inputMatrix: Matrix = this.getInputMatrix(sequence);
    inputMatrix.print();

    const network: Network = new Network(this);
    network.train(
      inputMatrix,
      this.configuration.maxError,
      this.configuration.moment,
      this.configuration.learnRate,
      this.configuration.epochs
    );

    this.layers = network.layers;
    this.contextSet = network.contextSet;
    this.hiddenWeights = network.hiddenWeights;
    this.outputWeights = network.outputWeights;

    console.log('hidden weights');
    this.hiddenWeights.print();
    console.log('output weights');
    this.outputWeights.print();
  }

  public test() {
    console.log('TEST');

    const sequence: number[] = this.getSequence(this.testSequence);
    const windowSize = 5;
    const count = sequence.length - windowSize;
    const predict: number[] = Array(count);
    const real: number[] = Array(count);

    // console.log('test seq: ', this.testSequence);
    // console.log('test seq (numbers): ', sequence);

    for (let i = 0; i < count; i++) {
      const seq: number[] = sequence.slice(i, i + windowSize);
      // console.log("SEQ: ");
      // console.log(seq);

      const yPredict = this.runSequenceTest(seq);
      const yReal = sequence[i + 5];

      predict[i] = yPredict;
      real[i] = yReal;

      this.putData(i + 1, real[i], predict[i]);
    }
    console.log('СКО: ', MathUtils.calculateError(real, predict), '\n');
    console.log('Реальные: ');
    console.log(real);
    console.log('Прогноз: ');
    console.log(predict);
  }

  private runSequenceTest(seq: number[]): number {
    const scaleParams: number[] = this.scaleSequence(seq);
    const input: Matrix = this.getInputMatrix(seq);
    const network: Network = new Network(this);
    let y: number = network.test(
      input, this.hiddenWeights, this.outputWeights, this.layers, this.contextSet
    );
    if (scaleParams[0] >= 1) {
      y = y * scaleParams[1];
    }
    return y;
  }

  private getSequence(seqStr: string): number[] {
    const strings: string[] = seqStr.split(' ');
    const sequence: number[] = [];
    for (let i = 0; i < strings.length; i++) {
      sequence.push(Number.parseFloat(strings[i]));
    }
    return sequence;
  }

  private scaleSequence(sequence: number[]): number[] {
    const max = MathUtils.findMax(sequence);
    let k = 1;
    if (max > 1) {
      let scaledMax = max;
      while (scaledMax > 1) {
        scaledMax /= 10;
        k *= 10;
      }
      for (let i = 0; i < sequence.length; i++) {
        sequence[i] = sequence[i] / k;
      }
    }
    return [max, k];
  }

  private getInputMatrix(sequence: number[]): Matrix {
    const windowSize = this.configuration.windowSize;
    const sequencesCount = sequence.length;
    const step = 1;
    const windowsCount = 1 + (sequencesCount - windowSize) / step;
    const inputMatrix: Matrix = new Matrix(windowsCount, windowSize);
    let currentStep = 0;
    for (let currentWindow = 0; currentWindow < windowsCount; currentWindow++) {
      let time = 0;
      for (let j = currentStep; j < currentStep + windowSize && j < sequencesCount; j++) {
        inputMatrix.data[currentWindow][time] = sequence[j];
        time++;
      }
      currentStep += step;
    }
    return inputMatrix;
  }

  private alpha(): number {
    return this.configuration.moment;
  }

  private learnRate(): number {
    return this.configuration.learnRate;
  }

}
