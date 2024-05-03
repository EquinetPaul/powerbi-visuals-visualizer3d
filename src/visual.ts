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

import { VisualFormattingSettingsModel } from "./settings";

export class Visual implements IVisual {
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    constructor(options: VisualConstructorOptions) {

        this.formattingSettingsService = new FormattingSettingsService();
 
    }

    public update(options: VisualUpdateOptions) {
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews?.[0]);

        if (!options.dataViews || options.dataViews.length === 0 || !options.dataViews[0].table) {
            return;
        }
    
        let table = options.dataViews[0].table;
        let rows = table.rows;
        let xIndex = table.columns.findIndex(column => column.roles.x);
        let yIndex = table.columns.findIndex(column => column.roles.y);
        let zIndex = table.columns.findIndex(column => column.roles.z);
        let legendIndex = table.columns.findIndex(column => column.roles.legend);

        let legendValues = []
        rows.forEach( row => {
            legendValues.push(row[legendIndex])
        })
        const uniqueLegendValues = [...new Set(legendValues)];
        console.log(uniqueLegendValues)
        legendValues = undefined;

        this.formattingSettings.dataPointCard.position.items.push(
            { displayName: "test", value: "test" }
        )

        console.log(this.formattingSettings.dataPointCard.position.value)
    
        // let traceMap = new Map();
    
        // rows.forEach(row => {
        //     let legend = row[legendIndex];
        //     let trace = traceMap.get(legend);
        //     if (!trace) {
        //         trace = {
        //             x: [],
        //             y: [],
        //             z: [],
        //             type: 'scatter3d',
        //             mode: 'markers',
        //             name: legend,
        //             marker: { size: 4 }
        //         };
        //         traceMap.set(legend, trace);
        //     }
        //     trace.x.push(row[xIndex]);
        //     trace.y.push(row[yIndex]);
        //     trace.z.push(row[zIndex]);
        // });
    
        // let layout = {
        //     title: '3D Scatter Plot',
        //     scene: { 
        //         xaxis: { title: 'X Axis' },
        //         yaxis: { title: 'Y Axis' },
        //         zaxis: { title: 'Depth' }
        //     }
        // };
    
        // Plotly.newPlot(this.targetElement, Array.from(traceMap.values()), layout);
    }
    

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property. 
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}