/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
import ColorPicker = formattingSettings.ColorPicker;
import NumUpDown = formattingSettings.NumUpDown;
import AutoDropdown = formattingSettings.AutoDropdown;
import powerbiVisualsApi from "powerbi-visuals-api";

import { dataPoint } from "./visual";

import { dataViewObjectsParser } from 'powerbi-visuals-utils-dataviewutils';
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class VisualSettings extends DataViewObjectsParser { }

class AxisCardSettings extends FormattingSettingsCard {

    revertXAxis = new formattingSettings.ToggleSwitch({
        name: "revertXAxis",
        displayName: "Revert X Axis",
        value: false
    });

    revertYAxis = new formattingSettings.ToggleSwitch({
        name: "revertYAxis",
        displayName: "Revert Y Axis",
        value: false
    });

    revertZAxis = new formattingSettings.ToggleSwitch({
        name: "revertZAxis",
        displayName: "Revert Z Axis",
        value: false
    });

    name: string = "axis";
    displayName: string = "Axis";
    slices: Array<FormattingSettingsSlice> = [this.revertXAxis, this.revertYAxis, this.revertZAxis];
}

class StyleCardSettings extends FormattingSettingsCard {

    elementStyle = new AutoDropdown({
        name: "elementStyle",
        displayName: "Element",
        value: "lines+markers"
    });

    markerSize = new NumUpDown({
        name: "markerSize",
        displayName: "Marker Size",
        value: 2,
        options: {
            minValue: {
                type: powerbiVisualsApi.visuals.ValidatorType.Min,
                value: 0,
            },
            maxValue: {
                type: powerbiVisualsApi.visuals.ValidatorType.Max,
                value: 10,
            }
        }
    });

    name: string = "style";
    displayName: string = "Style";
    slices: Array<FormattingSettingsSlice> = [this.elementStyle, this.markerSize];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    axisCardSettings = new AxisCardSettings();
    styleCardSettings = new StyleCardSettings();

    cards = [this.axisCardSettings, this.styleCardSettings];
    
}
