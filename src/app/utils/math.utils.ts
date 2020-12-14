export class MathUtils {

  public static function(x: number): number {
    return 1 / (1 + Math.exp(-x));
    // return Math.atan(x);
  }

  public static dFunction(x: number): number {
    const fx = this.function(x);
    return fx * (1 - fx);
    // return 1.0 / (1.0 + x * x);
  }

  public static findMax(sequence: number[]): number {
    let max = 0;
    for (const v of sequence) {
      if (Math.abs(v) > max) {
        max = Math.abs(v);
      }
    }
    return max;
  }

  public static random(left: number, right: number): number {
    return Math.random() * (right - left) + left;
  }

  /* MSE */

  public static calculateError(real: number[], predict: number[]): number {
    const average = this.getAverage(predict);
    const sumSquaredDeviations = this.sumSquaredDeviations(real, predict);

    return Math.sqrt(sumSquaredDeviations / average);
  }

  private static sumSquaredDeviations(arr1: number[], arr2: number[]): number {
    let sumSqrDev = 0;
    if (arr1.length === arr2.length) {
      for (let i = 0; i < arr1.length; i++) {
        const deltaSqr = Math.pow(arr1[i] - arr2[i], 2);
        sumSqrDev += deltaSqr;
      }
    }
    return sumSqrDev;
  }

  private static getAverage(arr: number[]): number {
    let sum = 0;
    for (const v of arr) {
      sum += v;
    }
    return sum / arr.length;
  }

}
