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

  private static random(matrix: Matrix, min: number, max: number): void {
    const matrixData: Array<number[]> = matrix.data;
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        matrixData[i][j] = (Math.random() * (max - min) + min) / 10;
      }
    }
  }

  mul(B: Matrix): Matrix {
    const X = new Matrix(this.rows, B.columns);
    const C: Array<number[]> = X.data;
    const columnB: number[] = Array(this.columns);
    for (let j = 0; j < B.columns; j++) {
      for (let k = 0; k < this.columns; k++) {
        columnB[k] = B.data[k][j];
      }
      for (let i = 0; i < this.rows; i++) {
        const rowA: number[] = this.data[i];
        let sum = 0;
        for (let k = 0; k < this.columns; k++) {
          sum = this.getValueOrLimit(sum + rowA[k] * columnB[k]);
        }
        C[i][j] = sum;
      }
    }
    return X;
  }

  sub(B: Matrix): Matrix {
    const X: Matrix = new Matrix(this.rows, this.columns);
    const C: Array<number[]> = X.data;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        C[i][j] = this.getValueOrLimit(this.data[i][j] - B.data[i][j]);
      }
    }
    return X;
  }

  private getValueOrLimit(value: any) {
    if (!Number.isFinite(value)) {
      return value > 0 ? Number.MAX_VALUE : Number.MIN_VALUE;
    }
    return value;
  }

  getLinePart(lineIndex: number, beginIndex: number, partSize: number): number[] {
    const line: number[] = Array(partSize);
    const endIndex: number = beginIndex + partSize;
    let i = 0;
    for (let j = beginIndex; j < endIndex; j++) {
      line[i] = this.data[lineIndex][j];
      i++;
    }
    return line;
  }

  getLine(lineIndex: number): number[] {
    return [...this.data[lineIndex]];
  }

  setLine(lineIndex: number, beginIndex: number,
                 partSize: number, linePart: number[]): void {

    const endIndex = beginIndex + partSize;
    let i = -1;
    for (let j = beginIndex; j < endIndex; j++) {
      i++;
      this.data[lineIndex][j] = linePart[i];
    }
  }

  print(): void {
    console.log('\n');
    console.log(this.data);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        const s = `${this.data[i][j]}`;
        const padding: number = Math.max(1, this.columns - s.length);
        for (let k = 0; k < padding; k++) {
          console.log(' ', s);
        }
      }
      console.log('\n');
    }
    console.log('\n');
  }
}
