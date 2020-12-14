import {Component, ViewChild} from '@angular/core';
import {Dataset, DataUtils} from "./utils/data.utils";
import {FormControl, FormGroup} from "@angular/forms";
import {ErrorsChartComponent} from "./components/errors-chart/errors-chart.component";
import {RealPredictChartComponent} from "./components/real-predict-chart/real-predict-chart.component";

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
      dataset: new FormControl('gold')
    })
  }

  @ViewChild("errorsChart")
  errorsChart: ErrorsChartComponent;

  @ViewChild("dataChart")
  dataChart: RealPredictChartComponent;

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
