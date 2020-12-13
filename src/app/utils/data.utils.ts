import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {Matrix} from "../models/matrix.model";
import {Network} from "../models/network.model";
import {Layer} from "../models/layer.model";

@Injectable()
export class DataUtils {

  private _trainingSamples: Array<number[]>;
  private _testingSamples: Array<number[]>;

  private _expectedOutput: Array<number[]>;

  private configuration = {
    epochs: 100_000,
    training: 90,
    testing: 0,
    inputCount: 0,
    contextCount: 0,
    hiddenCount: 0,
    outputCount: 0,
    normalize: false,
    moment: false,

    windowSize: 4,
    maxStep: 100000,
    maxError: 0.0001,
    alpha: 0.01,
    scale: 10
  };

  private layers: Layer[];
  private w1: Matrix;
  private w2: Matrix;
  private contextSet: Matrix;

  output: string = "";
  outputS: Subject<string> = new Subject<string>();

  public loading: boolean = false;
  public training: boolean = false;
  public trained: boolean = false;

  public lineChartData = [{
    data: [],
    label: 'Погрешность обучения'
  }];
  public lineChartLabels = [];

  private trainingSequence: string = "";
  private testSequence: string = "";

  constructor(
    private http: HttpClient
  ) {
  }

  get trainingSamples(): Array<number[]> {
    return this._trainingSamples;
  }

  private distribute(dataset: string) {
    let numbers: number[] = dataset.split(" ")
      .map(str => Number.parseFloat(str.trim()));
    let trainingCount = Math.round(this.configuration.training / 100) * numbers.length;

    let trainingNumbers = numbers.slice(0, trainingCount);
    let testNumbers = numbers.slice(trainingCount, numbers.length);

    this.trainingSequence = trainingNumbers.join(" ").trim();
    this.testSequence = testNumbers.join(" ").trim();
  }

  public train() {
    this.loadDataset().subscribe((dataset: string) => {
      this.distribute(dataset);

      console.log(dataset);
      console.log(this.trainingSequence);
      console.log(this.testSequence);
      let sequence: number[] = this.getSequence(this.trainingSequence);
      this.scaleSequence(sequence);

      let inputMatrix: Matrix = this.getInputMatrix(sequence);
      inputMatrix.print();

      let network: Network = new Network();
      network.train(
        inputMatrix,
        this.configuration.maxError,
        this.configuration.alpha,
        this.configuration.maxStep
      );

      this.layers = network.layers;
      this.contextSet = network.contextSet;
      this.w1 = network.resW1;
      this.w2 = network.resW2;

      console.log("w1");
      this.w1.print();
      console.log("w2");
      this.w2.print();
    })
  }

  public test() {
    let sequence: number[] = this.getSequence(this.testSequence);
    let count = this.testSequence.split(" ").length;
    let predict: number[] = Array(count);
    let real: number[] = Array(count);

    for (let i = 0; i < count; i++) {
      let seq: number[] = Array(5);
      seq.push(...sequence.slice(0, seq.length));

      let yPredict = this.testOne(seq);
      let yReal = sequence[i + 5];
      predict[i] = yPredict;
      real[i] = yReal;
    }
    console.log("СКО: ", this.calculateError(real, predict), "\n");

    console.log("Реальные: ");
    this.printArr(real);
    console.log("Прогноз: ");
    this.printArr(predict);
  }

  private testOne(seq: number[]): number {
    let scaleParams: number[] = this.scaleSequence(seq);

    let input: Matrix = this.getInputMatrix(seq);

    let network: Network = new Network();
    let y: number = network.test(input, this.w1, this.w2, this.layers, this.contextSet);

    if (scaleParams[0] >= 1) { // max >= 1
      y = y * scaleParams[1]; // y = y * scale_k
    }

    return y;
  }

  private printArr(arr: number[]) {
    for (let v of arr) {
      console.log(v, " ");
    }
    console.log("\n");
  }

  private calculateError(real: number[], predict: number[]): number {
    let average = this.getAverage(predict);
    let sumSquaredDeviations = this.sumSquaredDeviations(real, predict);

    return Math.sqrt(sumSquaredDeviations / average);
  }

  private sumSquaredDeviations(arr1: number[], arr2: number[]): number {
    let summSquarDev = 0;
    if (arr1.length == arr2.length) {
      for (let i = 0; i < arr1.length; i++) {
        let deltaSqar = (arr1[i] - arr2[i]) * (arr1[i] - arr2[i]);
        summSquarDev += deltaSqar;
      }
    }
    return summSquarDev;
  }

  private getAverage(arr: number[]): number {
    let sum = 0;
    for (let v of arr) {
      sum += v;
    }
    return sum / arr.length;
  }

  private loadDataset(): Observable<any> {
    return this.http.get("../../assets/gold.txt", {
      responseType: "text"
    });
  }

  private getSequence(seqStr: string): number[] {
    let strings: string[] = seqStr.split(" ");
    let sequence: number[] = [];
    for (let i = 0; i < strings.length; i++) {
      sequence.push(Number.parseFloat(strings[i]));
    }
    return sequence;
  }

  private scaleSequence(sequence: number[]): number[] {
    let max = this.findMax(sequence);
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
    for (let v of sequence) {
      if (Math.abs(v) > max) {
        max = Math.abs(v);
      }
    }
    return max;
  }

  private getInputMatrix(sequence: number[]): Matrix {
    let windowSize = this.configuration.windowSize;
    let sequencesCount = sequence.length;
    let step = 1;
    let windowsCount = 1 + (sequencesCount - windowSize) / step;
    let inputMatrix: Matrix = new Matrix(windowsCount, windowSize);
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
    return 0.01;
  }

  private learnRate(): number {
    return 0.1;
  }

}
