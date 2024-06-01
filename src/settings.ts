<<<<<<< HEAD
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
import powerbi from "powerbi-visuals-api";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
import IEnumMember = powerbi.IEnumMember

import Slice = formattingSettings.Slice;
import ItemDropdown = formattingSettings.ItemDropdown;
import Card = formattingSettings.SimpleCard;

/**
 * Data Point Formatting Card
 */
class DataPointCardSettings extends FormattingSettingsCard {

    public positionOptions: IEnumMember[] = [
        { displayName: "Right", value: "Right" }, 
        { displayName: "Left", value: "Left" }
    ]

    defaultColor = new formattingSettings.ColorPicker({
        name: "defaultColor",
        displayName: "Default color",
        value: { value: "" },
    });

    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text Size",
        value: 12
    });

    enumMembers: IEnumMember[] = [
        { value: "top", displayName: "Top" },
        { value: "middle", displayName: "Middle" },
        { value: "bottom", displayName: "Bottom" }
    ];

    position = new ItemDropdown({
        name: "position",
        displayName: "Position",
        items: this.positionOptions,
        value: this.positionOptions[0]
    });

    name: string = "dataPoint";
    displayName: string = "Data colors";
    slices: Array<FormattingSettingsSlice> = [this.defaultColor, this.fontSize, this.position];
}

/**
* visual settings model class
*
*/
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    // Create formatting settings model formatting cards
    dataPointCard = new DataPointCardSettings();


    cards = [this.dataPointCard];

}
=======
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
import Slice = formattingSettings.Slice;
import Card = formattingSettings.SimpleCard;
import ColorPicker = formattingSettings.ColorPicker;

import { DataPoint } from "./visual";

class ColorSelectorCardSettings extends Card {
    name: string = "colorSelector";
    displayName: string = "Data Colors";
    slices: Slice[] = [];
}

/**
 * Data Point Formatting Card
 */
class DataPointCardSettings extends FormattingSettingsCard {
    defaultColor = new formattingSettings.ColorPicker({
        name: "defaultColor",
        displayName: "Default color",
        value: { value: "" }
    });

    showAllDataPoints = new formattingSettings.ToggleSwitch({
        name: "showAllDataPoints",
        displayName: "Show all",
        value: true
    });

    fill = new formattingSettings.ColorPicker({
        name: "fill",
        displayName: "Fill",
        value: { value: "" }
    });

    fillRule = new formattingSettings.ColorPicker({
        name: "fillRule",
        displayName: "Color saturation",
        value: { value: "" }
    });

    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text Size",
        value: 12
    });

    name: string = "dataPoint";
    displayName: string = "Data colors";
    slices: Array<FormattingSettingsSlice> = [this.defaultColor, this.showAllDataPoints, this.fill, this.fillRule, this.fontSize];
}

/**
* visual settings model class
*
*/
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    // Create formatting settings model formatting cards
    dataPointCard = new DataPointCardSettings();
    colorSelector = new ColorSelectorCardSettings();

    cards = [this.colorSelector];

    populateColorSelector(dataPoints: DataPoint[]) {
        const slices: Slice[] = this.colorSelector.slices;
        if (dataPoints) {
            dataPoints.forEach(dataPoint => {
                slices.push(new ColorPicker({
                    name: "fill",
                    displayName: dataPoint.category.toString(),
                    value: { value: dataPoint.color },
                    selector: dataPoint.selectionId.getSelector(),
                }));
            });
        }
    }
}
>>>>>>> cb0ceaaceca03c3d5d1b9bf91aa8b70c0656bf65
