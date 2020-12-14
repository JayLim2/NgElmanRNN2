import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Matrix} from '../models/matrix.model';
import {Network} from '../models/network.model';
import {Layer} from '../models/layer.model';

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

    this.days$.next(this.dataChart.days);
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
    alpha: 0.01,
    scale: 10
  };

  private layers: Layer[];
  private w1: Matrix;
  private w2: Matrix;
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

  public load(): void {
    this.loadDataset().subscribe((dataset: string) => {
      this.distribute(dataset);
    });
  }

  public train() {
    console.log('Training: ', this.trainingSequence);
    console.log('Testing: ', this.testSequence);
    const sequence: number[] = this.getSequence(this.trainingSequence);
    this.scaleSequence(sequence);

    const inputMatrix: Matrix = this.getInputMatrix(sequence);
    inputMatrix.print();

    const network: Network = new Network(this);
    network.train(
      inputMatrix,
      this.configuration.maxError,
      this.configuration.alpha,
      this.configuration.epochs
    );

    this.layers = network.layers;
    this.contextSet = network.contextSet;
    this.w1 = network.resW1;
    this.w2 = network.resW2;

    console.log('w1');
    this.w1.print();
    console.log('w2');
    this.w2.print();
  }

  public test() {
    console.log('TEST');
    const sequence: number[] = this.getSequence(this.testSequence);
    const count = sequence.length;
    const predict: number[] = Array(count);
    const real: number[] = Array(count);

    console.log('test seq: ', this.testSequence);
    console.log('count: ', count);

    for (let i = 0; i < count; i++) {
      const length = 5;
      const seq: number[] = [];
      seq.push(...sequence.slice(i, length));

      const yPredict = this.runSequenceTest(seq);
      const yReal = sequence[i + length];
      console.log("Y REAL: ", yReal);

      predict[i] = yPredict;
      real[i] = yReal;

      this.putData(i + 1, real[i], predict[i]);
    }
    console.log('СКО: ', this.calculateError(real, predict), '\n');
    console.log('Реальные: ', real);
    console.log('Прогноз: ', predict);
  }

  private runSequenceTest(seq: number[]): number {
    const scaleParams: number[] = this.scaleSequence(seq);
    const input: Matrix = this.getInputMatrix(seq);
    const network: Network = new Network(this);
    let y: number = network.test(
      input, this.w1, this.w2, this.layers, this.contextSet
    );
    if (scaleParams[0] >= 1) { // max >= 1
      y = y * scaleParams[1]; // y = y * scale_k
    }
    return y;
  }

  private printArr(arr: number[]) {
    for (const v of arr) {
      console.log(v, ' ');
    }
    console.log('\n');
  }

  private calculateError(real: number[], predict: number[]): number {
    const average = this.getAverage(predict);
    const sumSquaredDeviations = this.sumSquaredDeviations(real, predict);

    return Math.sqrt(sumSquaredDeviations / average);
  }

  private sumSquaredDeviations(arr1: number[], arr2: number[]): number {
    let sumSqrDev = 0;
    if (arr1.length === arr2.length) {
      for (let i = 0; i < arr1.length; i++) {
        const deltaSqr = Math.pow(arr1[i] - arr2[i], 2);
        sumSqrDev += deltaSqr;
      }
    }
    return sumSqrDev;
  }

  private getAverage(arr: number[]): number {
    let sum = 0;
    for (const v of arr) {
      sum += v;
    }
    return sum / arr.length;
  }

  private loadDataset(): Observable<any> {
    return this.http.get('../../assets/gold.txt', {
      responseType: 'text'
    });
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
    const max = this.findMax(sequence);
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

  private findMax(sequence: number[]): number {
    let max = 0;
    for (const v of sequence) {
      if (Math.abs(v) > max) {
        max = Math.abs(v);
      }
    }
    return max;
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

  private random(left: number, right: number): number {
    return Math.random() * (right - left) + left;
  }

  private alpha(): number {
    return this.configuration.alpha;
  }

  private learnRate(): number {
    return this.alpha();
  }

}
