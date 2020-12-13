import { Component, ViewChild } from '@angular/core';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexMarkers,
  ApexYAxis,
  ApexGrid,
  ApexTitleSubtitle,
  ApexLegend
} from 'ng-apexcharts';

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
export class RealPredictChartComponent {

  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions> = {
    series: [
      {
        name: 'Реальные данные',
        data: [28, 29, 33, 36, 32, 32, 33]
      },
      {
        name: 'Прогноз',
        data: [12, 11, 14, 18, 17, 13, 13]
      }
    ],
    chart: {
      width: 600,
      height: 400,
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
    colors: ['#77B6EA', '#545454'],
    dataLabels: {
      enabled: true
    },
    stroke: {
      curve: 'smooth'
    },
    title: {
      text: 'Котировки золота',
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
      size: 1
    },
    xaxis: {
      categories: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'
      ],
      title: {
        text: 'День'
      }
    },
    yaxis: {
      title: {
        text: 'Стоимость'
      },
      min: 5,
      max: 40
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: -25,
      offsetX: -5
    }
  };

  constructor() {
  }

}
