import {Component, Input, OnInit, ViewChild} from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexStroke,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexYAxis,
  ChartComponent
} from 'ng-apexcharts';
import {Subject} from "rxjs";
import {DataUtils} from "../../utils/data.utils";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  colors: string[];
  yaxis: ApexYAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'real-predict-chart',
  templateUrl: './real-predict-chart.component.html',
  styleUrls: ['./real-predict-chart.component.less']
})
export class RealPredictChartComponent implements OnInit{

  width = 1000;
  height = this.width / 1.5;

  title: string = "Котировки золота";
  realDataLabel: string = "Реальные данные";
  predictedDataLabel: string = "Прогноз";

  daysLabel: string = "День";
  costLabel: string = "Стоимость";

  @Input()
  realData: number[];

  @Input()
  predictedData: number[];

  @Input()
  days: string[];

  @ViewChild('chart') chart: ChartComponent;

  public chartOptions: Partial<ChartOptions>;

  minCost: number = 230;
  maxCost: number = 280;

  constructor(
    private dataUtils: DataUtils
  ) {
    this.buildChartOptions();
  }

  ngOnInit() {
    this.dataUtils.predictedData$.subscribe((data) => {
      console.log("DETECTED DATA")
      this.updateChartOptions();
    });
  }

  private updateChartOptions() {
    this.chartOptions.series = [
      {
        name: this.realDataLabel,
        data: this.realData
      },
      {
        name: this.predictedDataLabel,
        data: this.predictedData
      }
    ];
    this.chartOptions.xaxis = {
      categories: this.days,
        title: {
        text: this.daysLabel
      }
    }
    this.chartOptions.yaxis = {
      title: {
        text: this.costLabel
      },
      min: this.minCost,
      max: this.maxCost
    };
  }

  private buildChartOptions() {
    this.chartOptions = {
      series: [
        {
          name: this.realDataLabel,
          data: this.realData
        },
        {
          name: this.predictedDataLabel,
          data: this.predictedData
        }
      ],
      chart: {
        width: this.width,
        height: this.height,
        type: 'line',
        dropShadow: {
          enabled: true,
          color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2
        },
        toolbar: {
          show: false
        }
      },
      colors: ['#007bff', '#ff6600'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      title: {
        text: this.title,
        align: 'left'
      },
      grid: {
        borderColor: '#e7e7e7',
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      markers: {
        size: 0
      },
      xaxis: {
        categories: this.days,
        title: {
          text: this.daysLabel
        }
      },
      yaxis: {
        title: {
          text: this.costLabel
        },
        min: this.minCost,
        max: this.maxCost
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5
      }
    };
  }

}
