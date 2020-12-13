export class Matrix {
  data: Array<number[]>;
  rows: number;
  columns: number;

  constructor(rows: number, columns: number,
              left?: number, right?: number) {

    this.rows = rows;
    this.columns = columns;
    this.data = [];
    for (let i = 0; i < rows; i++) {
      this.data.push(Array(columns).fill(0));
    }
    if (left && right) {
      Matrix.random(this, left, right);
    }
  }

  times(B: Matrix): Matrix {
    let X = new Matrix(this.rows, B.columns);
    let C: Array<number[]> = X.data;
    let Bcolj: number[] = Array(this.columns);
    for (let j = 0; j < B.columns; j++) {
      for (let k = 0; k < this.columns; k++) {
        Bcolj[k] = B.data[k][j];
      }
      for (let i = 0; i < this.rows; i++) {
        let Arowi: number[] = this.data[i];
        let s = 0;
        for (let k = 0; k < this.columns; k++) {
          s += Arowi[k] * Bcolj[k];
          if (!Number.isFinite(s)) {
            s = s > 0 ? Number.MAX_VALUE : Number.MIN_VALUE;
          }
        }
        C[i][j] = s;
      }
    }
    return X;
  }

  minus(B: Matrix): Matrix {
    let X: Matrix = new Matrix(this.rows, this.columns);
    let C: Array<number[]> = X.data;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        C[i][j] = this.data[i][j] - B.data[i][j];
        if (!Number.isFinite(C[i][j])) {
          C[i][j] = C[i][j] > 0 ? Number.MAX_VALUE : Number.MIN_VALUE;
        }
      }
    }
    return X;
  }

  getLinePart(lineIndex: number, beginIndex: number, partSize: number): number[] {
    let line: number[] = Array(partSize);
    let endIndex: number = beginIndex + partSize;
    let i: number = 0;
    for (let j = beginIndex; j < endIndex; j++) {
      line[i] = this.data[lineIndex][j];
      i++;
    }
    return line;
  }

  getLine(lineIndex: number): number[] {
    let line: number[] = Array(this.columns);
    line.push(...this.data[lineIndex]);
    return line;
  }

  public setLine(lineIndex: number, beginIndex: number,
                 partSize: number, linePart: number[]): void {
    let endIndex = beginIndex + partSize;
    let i = -1;
    for (let j = beginIndex; j < endIndex; j++) {
      i++;
      this.data[lineIndex][j] = linePart[i];
    }
  }

  print(): void {
    console.log("\n");
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        let s: string = `${this.data[i][j]}`;
        let padding: number = Math.max(1, this.columns - s.length);
        for (let k = 0; k < padding; k++)
          console.log(" ", s);
      }
      console.log("\n")
    }
    console.log("\n")
  }

  private static random(matrix: Matrix, min: number, max: number): void {
    let matrixData: Array<number[]> = matrix.data;
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        matrixData[i][j] = (Math.random() * (max - min) + min) / 10;
      }
    }
  }
}
