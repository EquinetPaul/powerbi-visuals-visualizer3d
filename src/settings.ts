import powerbiVisualsApi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { BarChartDataPoint } from "./visual";

import Card = formattingSettings.SimpleCard;
import Model = formattingSettings.Model;
import Slice = formattingSettings.Slice;
import ColorPicker = formattingSettings.ColorPicker;
import ToggleSwitch = formattingSettings.ToggleSwitch;
import NumUpDown = formattingSettings.NumUpDown;
import TextInput = formattingSettings.TextInput;
import AutoDropdown = formattingSettings.AutoDropdown;
import FontControl = formattingSettings.FontControl;
import FontPicker = formattingSettings.FontPicker;


class ColorSelectorCardSettings extends Card {
    name: string = "colorSelector";
    displayName: string = "Data Colors";
    slices: Slice[] = [];
}

/**
* BarChart formatting settings model class
*/
export class BarChartSettingsModel extends Model {
    colorSelector = new ColorSelectorCardSettings();

    cards: Card[] = [this.colorSelector];

    /**
     * populate colorSelector object categories formatting properties
     * @param dataPoints 
     */
    populateColorSelector(dataPoints: BarChartDataPoint[]) {
        const slices: Slice[] = this.colorSelector.slices;
        if (dataPoints) {
            dataPoints.forEach(dataPoint => {
                slices.push(new ColorPicker({
                    name: "fill",
                    displayName: dataPoint.category,
                    value: { value: dataPoint.color },
                    selector: dataPoint.selectionId.getSelector(),
                }));
            });
        }
    }
}
