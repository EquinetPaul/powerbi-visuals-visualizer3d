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
import { ColorHelper, hexToRGBString } from "powerbi-visuals-utils-colorutils";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import ISelectionId = powerbi.visuals.ISelectionId;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataViewTableRow = powerbi.DataViewTableRow;
import IColorPalette = powerbi.extensibility.IColorPalette;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import Fill = powerbi.Fill;
import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
import { dataViewObjects } from "powerbi-visuals-utils-dataviewutils";
import Plotly from 'plotly.js-dist';
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import VisualDataChangeOperationKind = powerbi.VisualDataChangeOperationKind;

import { VisualFormattingSettingsModel } from "./settings";
import { VisualSettings } from "./settings";
import { color, group } from "d3";

export interface dataPoint {
    x: powerbi.PrimitiveValue,
    y: powerbi.PrimitiveValue,
    z: powerbi.PrimitiveValue,
    legend: powerbi.PrimitiveValue,
    group: powerbi.PrimitiveValue,
    selection: ISelectionId
}

export class Visual implements IVisual {
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private host: IVisualHost;
    private dataPoints: dataPoint[] = []
    private dataPointsUniqueLegend: dataPoint[]
    private localizationManager: ILocalizationManager;
    private colorPalette: IColorPalette;

    private target: HTMLElement;
    private updateCount: number;
    private settings: VisualSettings;
    private textNode: Text;
    private windowsLoaded: number;


    constructor(options: VisualConstructorOptions) {
        this.formattingSettingsService = new FormattingSettingsService(this.localizationManager);
        this.host = options.host;
        this.colorPalette = options.host.colorPalette;

        this.target = options.element;
        this.updateCount = 0;
        this.windowsLoaded = 0;
        this.host = options.host;
        if (typeof document !== 'undefined') {
            const new_p: HTMLElement = document.createElement('p');
            new_p.appendChild(document.createTextNode('Message:'));
            const new_em: HTMLElement = document.createElement('em');
            this.textNode = document.createTextNode(this.updateCount.toString());
            new_em.appendChild(this.textNode);
            new_p.appendChild(new_em);
            this.target.appendChild(new_p);
        }
    }

    public update(options: VisualUpdateOptions) {
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews[0]);

        if (!options.dataViews || options.dataViews.length === 0 || !options.dataViews[0].table) {
            return;
        }

        // Fetch More Data
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

        if (options.operationKind === VisualDataChangeOperationKind.Create) {
            this.windowsLoaded = 1;
        }
        if (options.operationKind === VisualDataChangeOperationKind.Append) {
            this.windowsLoaded += 1;
        }

        let rowCount = options.dataViews[0].table.rows.length;

        // TODO: change this to display a better message
        if (options.dataViews[0].metadata.segment) {
            this.textNode.textContent = `Loading more data. ${rowCount} rows loaded so far (over ${this.windowsLoaded} fetches)...`;
            let canFetchMore = this.host.fetchMoreData();
            if (!canFetchMore) {
                this.textNode.textContent = `Memory limit hit after ${this.windowsLoaded} fetches. We managed to get ${rowCount} rows.`;
            }
        } else {
            this.textNode.textContent = `We have all the data we can get (${rowCount} rows over ${this.windowsLoaded} fetches)!`;
        }

        const table = options.dataViews[0].table;

        // Transform data
        this.dataPoints = this.transformTable(table)

        let tableInformations = {
            xColumnName : "",
            yColumnName : "",
            zColumnName : "",
            legendColumnName : "",
            groupColumnName: ""
        }

        const xIndex = table.columns.findIndex(column => column.roles.x);
        const yIndex = table.columns.findIndex(column => column.roles.y);
        const zIndex = table.columns.findIndex(column => column.roles.z);
        const legendIndex = table.columns.findIndex(column => column.roles.legend);
        const groupIndex = table.columns.findIndex(column => column.roles.group);

        console.log(xIndex, yIndex, zIndex, legendIndex, groupIndex)
        console.log("ok1")

        const xColumnName = table.columns.find(column => column.roles.x).displayName
        const yColumnName = table.columns.find(column => column.roles.y).displayName
        const zColumnName = table.columns.find(column => column.roles.z).displayName
        const legendColumnName = table.columns.find(column => column.roles.legend).displayName
        const groupColumnName = (groupIndex != -1) ? table.columns.find(column => column.roles.group).displayName : ""

        console.log("ok2")

        tableInformations.xColumnName =  xColumnName
        tableInformations.yColumnName =  yColumnName
        tableInformations.zColumnName =  zColumnName
        tableInformations.legendColumnName =  legendColumnName
        tableInformations.groupColumnName = groupColumnName

        console.log("ok3")

        // TODO: draw visual in a function
        // Draw visual
        var gd = document.querySelector('div');
        const legendTraces = {};

        // Parcourir les données pour les organiser par légende
        this.dataPoints.forEach(point => {
            const group = point.group;
            const legend = point.legend as string;

            if (!legendTraces[legend]) {
                legendTraces[legend] = [];
            }

            legendTraces[legend].push(point);
        });

        // Trier les points par valeur de Z pour chaque légende
        Object.keys(legendTraces).forEach(legend => {
            legendTraces[legend].sort((a, b) => a.z - b.z);
        });

        // Préparer les données pour Plotly après avoir trié
        const traces = Object.keys(legendTraces).map(legend => {
            const group = (groupIndex != -1) ? legendTraces[legend][0].legend : "" 
            const trace = {
                x: [],
                y: [],
                z: [],
                mode: 'lines',
                type: 'scatter3d',
                name: legend,
                legendgroup: group ,
                text: [],
                marker: { size: 3 },
                line: {
                    color: hexToRGBString(this.colorPalette.getColor(group).value)
                },
                hovertemplate:
                    `<b>${tableInformations.legendColumnName}:</b> ${legend}<br>`+
                    `<b>${tableInformations.groupColumnName} </b> ${group}<br>`+
                    `<b>${tableInformations.zColumnName}:</b> `+ "%{z}</br>" +
                    `<b>${tableInformations.xColumnName}:</b> `+ "%{x}</br>" +
                    `<b>${tableInformations.yColumnName}:</b> `+ "%{y}</br>"
            };

            legendTraces[legend].forEach(point => {
                trace.x.push(point.x);
                trace.y.push(point.y);
                trace.z.push(point.z);
                // trace.text.push(point.legend);
            });

            return trace;
        });

        // Définir la mise en page du graphique
        const layout = {
            // title: '3D Scatter Plot',
            scene: {
                // xaxis: { title: 'X Axis' },
                // yaxis: { title: 'Y Axis' },
                // zaxis: { title: 'Z Axis' }
            },
            showlegend: true,
            // legend: {"orientation": "h"}, // TODO: formatting parameter
            margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 0,
                pad: 0
            },
            automargin: true,
        };

        Plotly.newPlot(gd, traces, layout,
            { displaylogo: false }, // Hide Plotly Logo
            { responsive: true }
        );
    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property. 
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    public transformTable(table: powerbi.DataViewTable): dataPoint[] {
        const dataPoints: dataPoint[] = []

        let tableInformations = {
            xColumnName : "",
            yColumnName : "",
            zColumnName : "",
            legendColumnName : ""
        }

        const xIndex = table.columns.findIndex(column => column.roles.x);
        const yIndex = table.columns.findIndex(column => column.roles.y);
        const zIndex = table.columns.findIndex(column => column.roles.z);
        const legendIndex = table.columns.findIndex(column => column.roles.legend);
        const groupIndex = table.columns.findIndex(column => column.roles.group);

        const xColumnName = table.columns.find(column => column.roles.x).displayName
        const yColumnName = table.columns.find(column => column.roles.y).displayName
        const zColumnName = table.columns.find(column => column.roles.z).displayName
        const legendColumnName = table.columns.find(column => column.roles.legend).displayName

        tableInformations.xColumnName =  xColumnName
        tableInformations.yColumnName =  yColumnName
        tableInformations.zColumnName =  zColumnName
        tableInformations.legendColumnName =  legendColumnName

        table.rows.forEach((row, rowIndex) => {
            const xValue = row[xIndex];
            const yValue = row[yIndex];
            const zValue = row[zIndex];
            const legendValue = row[legendIndex];
            const groupValue = row[groupIndex];
            const selection: ISelectionId = this.host.createSelectionIdBuilder()
                .withTable(table, rowIndex)
                .createSelectionId();

            dataPoints.push({
                x: xValue,
                y: yValue,
                z: zValue,
                legend: legendValue,
                group: groupValue,
                selection: selection
            })
        })

        return dataPoints
        
    }

    private static parseSettings(dataView: powerbi.DataView): VisualSettings {
        return VisualSettings.parse(dataView) as VisualSettings;
    }

}
