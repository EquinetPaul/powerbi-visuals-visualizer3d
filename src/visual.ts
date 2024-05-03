import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";

import { dataViewObjects } from "powerbi-visuals-utils-dataviewutils";

import { BarChartSettingsModel } from "./settings";

import "./../style/visual.less";

// powerbi.visuals
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import Fill = powerbi.Fill;
import ISandboxExtendedColorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;
import ISelectionId = powerbi.visuals.ISelectionId;
import IVisual = powerbi.extensibility.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import PrimitiveValue = powerbi.PrimitiveValue;
import SubSelectableDirectEdit = powerbi.visuals.SubSelectableDirectEdit;
import SubSelectableDirectEditStyle = powerbi.visuals.SubSelectableDirectEditStyle;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;


/**
 * Interface for BarChart data points.
 *
 * @interface
 * @property {PrimitiveValue} value             - Data value for point.
 * @property {string} category          - Corresponding category of data value.
 * @property {string} color             - Color corresponding to data point.
 * @property {string} strokeColor       - Stroke color for data point column.
 * @property {number} strokeWidth       - Stroke width for data point column.
 * @property {ISelectionId} selectionId - Id assigned to data point for cross filtering
 *                                        and visual interaction.
 */
export interface BarChartDataPoint {
    value: PrimitiveValue;
    category: string;
    color: string;
    strokeColor: string;
    strokeWidth: number;
    selectionId: ISelectionId;
    index: number;
    format?: string;
}

function createSelectorDataPoints(options: VisualUpdateOptions, host: IVisualHost): BarChartDataPoint[] {
    const barChartDataPoints: BarChartDataPoint[] = []
    const dataViews = options.dataViews;

    if (!dataViews
        || !dataViews[0]
        || !dataViews[0].categorical
        || !dataViews[0].categorical.categories
        || !dataViews[0].categorical.categories[0].source
        || !dataViews[0].categorical.values
    ) {
        return barChartDataPoints;
    }

    const categorical = dataViews[0].categorical;
    const category = categorical.categories[0];
    const dataValue = categorical.values[0];

    //let dataMax: number = 0;

    const colorPalette: ISandboxExtendedColorPalette = host.colorPalette;
    //const objects = dataViews[0].metadata.objects;

    const strokeColor: string = getColumnStrokeColor(colorPalette);

    const strokeWidth: number = getColumnStrokeWidth(colorPalette.isHighContrast);

    for (let i = 0, len = Math.max(category.values.length, dataValue.values.length); i < len; i++) {
        const color: string = getColumnColorByIndex(category, i, colorPalette);

        const selectionId: ISelectionId = host.createSelectionIdBuilder()
            .withCategory(category, i)
            .createSelectionId();

        barChartDataPoints.push({
            color,
            strokeColor,
            strokeWidth,
            selectionId,
            value: dataValue.values[i],
            category: `${category.values[i]}`,
            index: i,
            format: dataValue.objects ? <string>dataValue.objects[i].general.formatString : null,
        });
    }

    return barChartDataPoints;
}

function getColumnColorByIndex(
    category: DataViewCategoryColumn,
    index: number,
    colorPalette: ISandboxExtendedColorPalette,
): string {
    if (colorPalette.isHighContrast) {
        return colorPalette.background.value;
    }

    const defaultColor: Fill = {
        solid: {
            color: colorPalette.getColor(`${category.values[index]}`).value,
        }
    };

    const prop: DataViewObjectPropertyIdentifier = {
        objectName: "colorSelector",
        propertyName: "fill"
    };

    let colorFromObjects: Fill;
    if (category.objects?.[index]) {
        colorFromObjects = dataViewObjects.getValue(category?.objects[index], prop);
    }

    return colorFromObjects?.solid.color ?? defaultColor.solid.color;
}

function getColumnStrokeColor(colorPalette: ISandboxExtendedColorPalette): string {
    return colorPalette.isHighContrast
        ? colorPalette.foreground.value
        : null;
}

function getColumnStrokeWidth(isHighContrast: boolean): number {
    return isHighContrast
        ? 2
        : 0;
}

export class BarChart implements IVisual {
    private barDataPoints: BarChartDataPoint[];
    private formattingSettingsService: FormattingSettingsService;
    private formattingSettings: BarChartSettingsModel;
    private host: IVisualHost;
    private localizationManager: ILocalizationManager;
    public visualOnObjectFormatting?: powerbi.extensibility.visual.VisualOnObjectFormatting;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.localizationManager = this.host.createLocalizationManager();
        this.formattingSettingsService = new FormattingSettingsService(this.localizationManager);
    }

    public update(options: VisualUpdateOptions) {
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(BarChartSettingsModel, options.dataViews?.[0]);
        this.barDataPoints = createSelectorDataPoints(options, this.host);
        this.formattingSettings.populateColorSelector(this.barDataPoints);

        console.log(this.barDataPoints)

    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    public destroy(): void {
        // Perform any cleanup tasks here
    }

}
