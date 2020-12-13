import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ErrorsChartComponent} from "./components/errors-chart/errors-chart.component";
import {ChartsModule} from "ng2-charts";
import {DataUtils} from "./utils/data.utils";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgApexchartsModule} from "ng-apexcharts";
import { RealPredictChartComponent } from './components/real-predict-chart/real-predict-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    ErrorsChartComponent,
    RealPredictChartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ChartsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgApexchartsModule,
  ],
  providers: [
    DataUtils
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
