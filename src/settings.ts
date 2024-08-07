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
import NumUpDown = formattingSettings.NumUpDown;
import AutoDropdown = formattingSettings.AutoDropdown;
import powerbiVisualsApi from "powerbi-visuals-api";

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

    sortBy = new AutoDropdown({
        name: "sortBy",
        displayName: "Sort By",
        value: "z"
    });


    name: string = "axis";
    displayName: string = "Axis";
    slices: Array<FormattingSettingsSlice> = [this.revertXAxis, this.revertYAxis, this.revertZAxis, this.sortBy];
}

class StyleCardSettings extends FormattingSettingsCard {

    elementStyle = new AutoDropdown({
        name: "elementStyle",
        displayName: "Element",
        value: "markers"
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

    lineSize = new NumUpDown({
        name: "lineSize",
        displayName: "Line Size",
        value: 3,
        options: {
            minValue: {
                type: powerbiVisualsApi.visuals.ValidatorType.Min,
                value: 1,
            },
            maxValue: {
                type: powerbiVisualsApi.visuals.ValidatorType.Max,
                value: 10,
            }
        }
    });

    displayLabels = new formattingSettings.ToggleSwitch({
        name: "displayLabels",
        displayName: "Display Labels",
        value: false
    });
    
    labelsPosition = new AutoDropdown({
        name: "labelsPosition",
        displayName: "Labels Position",
        value: "middle"
    });

    name: string = "style";
    displayName: string = "Style";
    slices: Array<FormattingSettingsSlice> = [this.elementStyle, this.lineSize, this.markerSize, this.displayLabels, this.labelsPosition];
}

class LegendCardSettings extends FormattingSettingsCard {

    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        value: true
    });

    legendOrientation = new AutoDropdown({
        name: "legendOrientation",
        displayName: "Orientation",
        value: "l"
    });

    legendPosition = new AutoDropdown({
        name: "legendPosition",
        displayName: "Position",
        value: "0"
    });


    name: string = "legend";
    displayName: string = "Legend";
    slices: Array<FormattingSettingsSlice> = [this.show, this.legendOrientation, this.legendPosition];
}

class FetchMoreData extends FormattingSettingsCard {

    activate = new formattingSettings.ToggleSwitch({
        name: "activate",
        displayName: "Activate",
        value: false
    });

    displayVisual = new formattingSettings.ToggleSwitch({
        name: "displayVisual",
        displayName: "Refresh Visual",
        value: true
    });

    name: string = "fetchMoreData";
    displayName: string = "Fetch More Data";
    slices: Array<FormattingSettingsSlice> = [this.activate, this.displayVisual];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    axisCardSettings = new AxisCardSettings();
    styleCardSettings = new StyleCardSettings();
    legendCardSettings = new LegendCardSettings();
    fetchMoreData = new FetchMoreData()

    cards = [this.axisCardSettings, this.styleCardSettings, this.legendCardSettings, this.fetchMoreData];
    
}
