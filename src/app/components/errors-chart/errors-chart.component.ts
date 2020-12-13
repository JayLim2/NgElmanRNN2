import {Component, ViewChild} from '@angular/core';
import {ChartComponent} from 'ng-apexcharts';
import {ChartOptions} from '../real-predict-chart/real-predict-chart.component';

@Component({
  selector: 'errors-chart',
  templateUrl: './errors-chart.component.html',
  styleUrls: ['./errors-chart.component.less']
})
export class ErrorsChartComponent {

  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions> = {
    series: [
      {
        name: "Desktops",
        data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
      }
    ],
    chart: {
      width: 600,
      height: 400,
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
      text: "Погрешность обучения",
      align: "left"
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
        opacity: 0.5
      }
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep"
      ]
    }
  };

  constructor() {
  }

}
