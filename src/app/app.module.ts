import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ErrorsChartComponent} from "./components/errors-chart/errors-chart.component";
import {ChartsModule} from "ng2-charts";
import {DataUtils} from "./utils/data.utils";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [
    AppComponent,
    ErrorsChartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ChartsModule,
    HttpClientModule
  ],
  providers: [
    DataUtils
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
