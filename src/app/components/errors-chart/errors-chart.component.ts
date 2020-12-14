import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ChartComponent} from 'ng-apexcharts';
import {ChartOptions} from '../real-predict-chart/real-predict-chart.component';
import {Dataset, DataUtils} from "../../utils/data.utils";

@Component({
  selector: 'errors-chart',
  templateUrl: './errors-chart.component.html',
  styleUrls: ['./errors-chart.component.less']
})
export class ErrorsChartComponent implements OnInit{

  title: string = "Погрешность обучения";
  pointLabel: string = "Значение ошибки";

  width = 700;
  height = this.width / 1.5;

  @Input()
  epochs: string[];

  @Input()
  errors: number[];

  @ViewChild('chart') chart: ChartComponent;

  public chartOptions: Partial<ChartOptions>;

  constructor(
    private dataUtils: DataUtils
  ) {
    this.buildChartOptions();
  }

  ngOnInit() {
    this.dataUtils.errors$.subscribe((data) => {
      this.updateChartOptions();
    })
  }

  updateChartOptions() {
    this.chartOptions.series = [
      {
        name: this.pointLabel,
        data: this.errors
      }
    ];
    this.chartOptions.xaxis = {
      categories: this.epochs
    };
  }

  buildChartOptions() {
    this.chartOptions = {
      series: [
        {
          name: this.pointLabel,
          data: this.errors
        }
      ],
      chart: {
        width: this.width,
        height: this.height,
        type: "line",
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight"
      },
      title: {
        text: this.title,
        align: "left"
      },
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"],
          opacity: 0.5
        }
      },
      xaxis: {
        categories: this.epochs
      }
    };
  }

}
