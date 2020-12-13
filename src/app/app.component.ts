import { Component } from '@angular/core';
import {DataUtils} from "./utils/data.utils";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = "Elman RNN Predictor";

  output: string = "";

  constructor(
    public dataUtils: DataUtils
  ) {
  }

  onTrain() {
    this.dataUtils.train();
  }

  onTest() {
    this.dataUtils.test();
  }

}
