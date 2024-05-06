/*
*  Power BI Visual CLI
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

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import ISelectionId = powerbi.visuals.ISelectionId;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataViewTableRow = powerbi.DataViewTableRow;
import ISandboxExtendedColorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;
import { dataViewObject, dataViewObjects } from "powerbi-visuals-utils-dataviewutils";

import PrimitiveValue = powerbi.PrimitiveValue;
import Fill = powerbi.Fill;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
import DataViewObjects = powerbi.DataViewObjects;
import DataViewObject = powerbi.DataViewObject;

import { VisualFormattingSettingsModel } from "./settings";

export interface DataPoint {
    value_x: PrimitiveValue;
    value_y: PrimitiveValue;
    category: PrimitiveValue;
    color: string;
    selectionId: ISelectionId;
    index: number;
}

export class Visual implements IVisual {

    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private host: IVisualHost;
    private DataPoints: DataPoint[];

    constructor(options: VisualConstructorOptions) {

        this.formattingSettingsService = new FormattingSettingsService();

        this.host = options.host;
    }

    public update(options: VisualUpdateOptions) {
        // const DataPoints: DataPoint[] = []

        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews?.[0]);
        this.DataPoints = createSelectorDataPoints(options, this.host);
        this.formattingSettings.populateColorSelector(this.DataPoints)

        console.log("ok")

    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property. 
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}

function createSelectorDataPoints(options: VisualUpdateOptions, host: IVisualHost): DataPoint[] {
    const DataPoints: DataPoint[] = []
    const dataViews = options.dataViews;

    if (!dataViews
        || !dataViews[0]
        || !dataViews[0].table
    ) {
        return DataPoints;
    }



    const dataView = options.dataViews[0];
    const colorPalette: ISandboxExtendedColorPalette = host.colorPalette;

    let table = options.dataViews[0].table;
    let rows = table.rows;
    let xIndex = table.columns.findIndex(column => column.roles.measure);
    let yIndex = table.columns.findIndex(column => column.roles.measure2);
    let legendIndex = table.columns.findIndex(column => column.roles.category);

    let categories: DataViewCategoryColumn = {
        values: [],
        source: dataView.metadata.columns[legendIndex]
    }
    rows.forEach(row => {
        categories.values.push(row[legendIndex])
    })

    dataView.table.rows.forEach((row: DataViewTableRow, rowIndex: number) => {
        const x = row[xIndex]
        const y = row[yIndex]
        const legend = row[legendIndex]
        const color = colorPalette.getColor(legend.toString()).value
        // const color = getColumnColorByIndex(categories, rowIndex, colorPalette)

        const selection: ISelectionId = host.createSelectionIdBuilder()
            .withTable(dataView.table, rowIndex)
            .createSelectionId();


        DataPoints.push({
            value_x: x,
            value_y: y,
            category: legend,
            color: color,
            selectionId: selection,
            index: rowIndex
        })

    })

    return DataPoints;

}

// TO DO
// HOW TO ADAPT THIS METHOD TO GET THE COLOR EITHER FROM:
//     PALETTE (DEFAULT BEHAVIOR)
//     OBJECT  (WHEN DEFINED BY THE USER IN PROPERTY PANE)

// dataViewObjects.getValue(category:powerbi.DataViewCategoryColumn)
// Can't find a solution to adapt this method to a data role/mapping table
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

    let result = colorFromObjects?.solid.color ?? defaultColor.solid.color;

    return result
}