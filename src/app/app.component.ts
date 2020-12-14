import {Component} from '@angular/core';
import {DataUtils} from "./utils/data.utils";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = "Elman RNN Predictor";

  output: string = "";

  datasetForm: FormGroup;

  constructor(
    public dataUtils: DataUtils
  ) {
    this.datasetForm = new FormGroup({
      dataset: new FormControl('functional')
    })
  }

  onLoad() {
    this.dataUtils.load(this.datasetForm.value.dataset);
  }

  onTrain() {
    this.dataUtils.train();
  }

  onTest() {
    this.dataUtils.test();
  }

}
