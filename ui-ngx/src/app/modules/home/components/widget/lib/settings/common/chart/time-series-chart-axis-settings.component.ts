///
/// Copyright © 2016-2024 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import {
  AxisPosition,
  timeSeriesAxisPositionTranslations,
  TimeSeriesChartAxisSettings,
  TimeSeriesChartYAxisSettings
} from '@home/components/widget/lib/chart/time-series-chart.models';
import { merge } from 'rxjs';

@Component({
  selector: 'tb-time-series-chart-axis-settings',
  templateUrl: './time-series-chart-axis-settings.component.html',
  styleUrls: ['./../../widget-settings.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeSeriesChartAxisSettingsComponent),
      multi: true
    }
  ]
})
export class TimeSeriesChartAxisSettingsComponent implements OnInit, ControlValueAccessor {

  settingsExpanded = false;

  axisTitle: string;

  axisPositions: AxisPosition[];

  timeSeriesAxisPositionTranslations = timeSeriesAxisPositionTranslations;

  @Input()
  disabled: boolean;

  @Input()
  axisType: 'xAxis' | 'yAxis' = 'xAxis';

  private modelValue: TimeSeriesChartAxisSettings | TimeSeriesChartYAxisSettings;

  private propagateChange = null;

  public axisSettingsFormGroup: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder) {
  }

  ngOnInit(): void {

    this.axisTitle = this.axisType === 'xAxis' ? 'widgets.time-series-chart.axis.x-axis' : 'widgets.time-series-chart.axis.y-axis';

    this.axisPositions = this.axisType === 'xAxis' ? [AxisPosition.top, AxisPosition.bottom] :
      [AxisPosition.left, AxisPosition.right];

    this.axisSettingsFormGroup = this.fb.group({
      show: [null, []],
      label: [null, []],
      labelFont: [null, []],
      labelColor: [null, []],
      position: [null, []],
      showTickLabels: [null, []],
      tickLabelFont: [null, []],
      tickLabelColor: [null, []],
      showTicks: [null, []],
      ticksColor: [null, []],
      showLine: [null, []],
      lineColor: [null, []],
      showSplitLines: [null, []],
      splitLinesColor: [null, []]
    });
    if (this.axisType === 'yAxis') {
      this.axisSettingsFormGroup.addControl('min', this.fb.control(null, []));
      this.axisSettingsFormGroup.addControl('max', this.fb.control(null, []));
    }
    this.axisSettingsFormGroup.valueChanges.subscribe(() => {
      this.updateModel();
    });
    merge(this.axisSettingsFormGroup.get('show').valueChanges,
          this.axisSettingsFormGroup.get('showTickLabels').valueChanges,
          this.axisSettingsFormGroup.get('showTicks').valueChanges,
          this.axisSettingsFormGroup.get('showLine').valueChanges,
          this.axisSettingsFormGroup.get('showSplitLines').valueChanges)
    .subscribe(() => {
      this.updateValidators();
    });
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(_fn: any): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.axisSettingsFormGroup.disable({emitEvent: false});
    } else {
      this.axisSettingsFormGroup.enable({emitEvent: false});
      this.updateValidators();
    }
  }

  writeValue(value: TimeSeriesChartAxisSettings | TimeSeriesChartYAxisSettings): void {
    this.modelValue = value;
    this.axisSettingsFormGroup.patchValue(
      value, {emitEvent: false}
    );
    this.updateValidators();
    this.axisSettingsFormGroup.get('show').valueChanges.subscribe((show) => {
      this.settingsExpanded = show;
    });
  }

  private updateValidators() {
    const show: boolean = this.axisSettingsFormGroup.get('show').value;
    const showTickLabels: boolean = this.axisSettingsFormGroup.get('showTickLabels').value;
    const showTicks: boolean = this.axisSettingsFormGroup.get('showTicks').value;
    const showLine: boolean = this.axisSettingsFormGroup.get('showLine').value;
    const showSplitLines: boolean = this.axisSettingsFormGroup.get('showSplitLines').value;
    if (show) {
      this.axisSettingsFormGroup.enable({emitEvent: false});
      if (showTickLabels) {
        this.axisSettingsFormGroup.get('tickLabelFont').enable({emitEvent: false});
        this.axisSettingsFormGroup.get('tickLabelColor').enable({emitEvent: false});
      } else {
        this.axisSettingsFormGroup.get('tickLabelFont').disable({emitEvent: false});
        this.axisSettingsFormGroup.get('tickLabelColor').disable({emitEvent: false});
      }
      if (showTicks) {
        this.axisSettingsFormGroup.get('ticksColor').enable({emitEvent: false});
      } else {
        this.axisSettingsFormGroup.get('ticksColor').disable({emitEvent: false});
      }
      if (showLine) {
        this.axisSettingsFormGroup.get('lineColor').enable({emitEvent: false});
      } else {
        this.axisSettingsFormGroup.get('lineColor').disable({emitEvent: false});
      }
      if (showSplitLines) {
        this.axisSettingsFormGroup.get('splitLinesColor').enable({emitEvent: false});
      } else {
        this.axisSettingsFormGroup.get('splitLinesColor').disable({emitEvent: false});
      }
    } else {
      this.axisSettingsFormGroup.disable({emitEvent: false});
      this.axisSettingsFormGroup.get('show').enable({emitEvent: false});
      if (this.axisType === 'yAxis') {
        this.axisSettingsFormGroup.get('min').enable({emitEvent: false});
        this.axisSettingsFormGroup.get('max').enable({emitEvent: false});
      }
    }
  }

  private updateModel() {
    this.modelValue = this.axisSettingsFormGroup.getRawValue();
    this.propagateChange(this.modelValue);
  }
}
