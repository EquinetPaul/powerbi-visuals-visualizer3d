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
import { hexToRGBString } from "powerbi-visuals-utils-colorutils";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import ISelectionId = powerbi.visuals.ISelectionId;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IColorPalette = powerbi.extensibility.IColorPalette;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import Plotly from 'plotly.js-dist';

import { VisualFormattingSettingsModel } from "./settings";
import { VisualSettings } from "./settings";

export interface dataPoint {
    x: powerbi.PrimitiveValue,
    y: powerbi.PrimitiveValue,
    z: powerbi.PrimitiveValue,
    legend: powerbi.PrimitiveValue,
    selection: ISelectionId
}

interface tableInformations {
    xColumnName: string,
    yColumnName: string,
    zColumnName: string,
    legendColumnName: string
}

export class Visual implements IVisual {
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private host: IVisualHost;
    private dataPoints: dataPoint[] = []
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
        // if (typeof document !== 'undefined') {
        //     const new_p: HTMLElement = document.createElement('p');
        //     const new_em: HTMLElement = document.createElement('em');
        //     this.textNode = document.createTextNode(this.updateCount.toString());
        //     new_em.appendChild(this.textNode);
        //     new_p.appendChild(new_em);
        //     this.target.appendChild(new_p);
        // }
    }

    public getTableInformations(table: powerbi.DataViewTable) {
        const tableInformations = {
            xColumnName: "",
            yColumnName: "",
            zColumnName: "",
            legendColumnName: ""
        }

        const xColumnName = table.columns.find(column => column.roles.x).displayName
        const yColumnName = table.columns.find(column => column.roles.y).displayName
        const zColumnName = table.columns.find(column => column.roles.z).displayName
        const legendColumnName = table.columns.find(column => column.roles.legend)?.displayName ?? "";

        tableInformations.xColumnName = xColumnName
        tableInformations.yColumnName = yColumnName
        tableInformations.zColumnName = zColumnName
        tableInformations.legendColumnName = legendColumnName

        return tableInformations
    }

    public createTraces(tableInformations: tableInformations) {
        const legendTraces = {};

        // Parcourir les données pour les organiser par légende
        this.dataPoints.forEach(point => {
            const legend = point.legend as string;

            if (!legendTraces[legend]) {
                legendTraces[legend] = [];
            }

            legendTraces[legend].push(point);
        });

        // Trier les points par valeur de Z pour chaque légende
        Object.keys(legendTraces).forEach(legend => {
            switch (this.formattingSettings.axisCardSettings.sortBy.value.toString()) {
                case "x": legendTraces[legend].sort((a, b) => a.x - b.x); break;
                case "y": legendTraces[legend].sort((a, b) => a.y - b.y); break;
                case "z": legendTraces[legend].sort((a, b) => a.z - b.z); break;
                default: legendTraces[legend].sort((a, b) => a.z - b.z);
            }

        });

        // Préparer les données pour Plotly après avoir trié
        const traces = Object.keys(legendTraces).map(legend => {
            const color = hexToRGBString(this.colorPalette.getColor(legend).value)
            const trace = {
                x: [],
                y: [],
                z: [],
                mode: this.formattingSettings.styleCardSettings.elementStyle.value,
                type: 'scatter3d',
                name: legend,
                text: [],
                marker: {
                    size: this.formattingSettings.styleCardSettings.markerSize.value
                },
                line: {
                    color: color,
                    width: this.formattingSettings.styleCardSettings.lineSize.value
                },
                hovertemplate:
                    `<b>${tableInformations.legendColumnName}:</b> ${legend}<br>` +
                    `<b>${tableInformations.zColumnName}:</b> ` + "%{z}</br>" +
                    `<b>${tableInformations.xColumnName}:</b> ` + "%{x}</br>" +
                    `<b>${tableInformations.yColumnName}:</b> ` + "%{y}</br>"
            };

            legendTraces[legend].forEach(point => {
                trace.x.push(point.x);
                trace.y.push(point.y);
                trace.z.push(point.z);
                trace.text.push(point.legend);
            });

            return trace;
        });

        return traces
    }

    public areDataTypesGood(options: VisualUpdateOptions) {
        if (!options.dataViews || !options.dataViews[0] || !options.dataViews[0].table || options.dataViews.length === 0) {
            return;
        }

        const table = options.dataViews[0].table;
        const columns = table.columns;

        const xIndex = columns.findIndex(c => c.roles['x']);
        const yIndex = columns.findIndex(c => c.roles['y']);
        const zIndex = columns.findIndex(c => c.roles['z']);
        const legendIndex = columns.findIndex(c => c.roles['legend']);

        if (xIndex === -1 || yIndex === -1 || zIndex === -1) {
            return;
        }

        const isXNumeric = columns[xIndex].type.numeric;
        const isYNumeric = columns[yIndex].type.numeric;
        const isZNumeric = columns[zIndex].type.numeric;

        if (legendIndex != -1) {
            const isLegendValid = columns[legendIndex].type.numeric || columns[legendIndex].type.text;
            return isXNumeric && isYNumeric && isZNumeric && isLegendValid
        }
        else {
            return isXNumeric && isYNumeric && isZNumeric
        }

    }

    private displayInvalidData() {
        const gd = document.querySelector('div');
        if (gd) {
            // Clear existing content
            while (gd.firstChild) {
                gd.removeChild(gd.firstChild);
            }
            
            // Create paragraph elements
            const p1 = document.createElement('p');
            p1.textContent = 'Invalid data.';
            const p2 = document.createElement('p');
            p2.textContent = 'Check that the X, Y and Z axes are numerical and that the Legend is numerical or textual.';
            
            // Append paragraph elements to the div
            gd.appendChild(p1);
            gd.appendChild(p2);
        }
    }    

    public update(options: VisualUpdateOptions) {
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews[0]);
        
        if (!this.areDataTypesGood(options)) {
            this.displayInvalidData()
            return;
        }

        if (this.formattingSettings.fetchMoreData.displayVisual.value) {
            // Fetch More Data
            if (this.formattingSettings.fetchMoreData.activate.value) {
                this.host.displayWarningIcon("Fetch More Data", "Fetch More Data option is activated and can slow the visual creation.")
                this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
                if (options.dataViews[0].metadata.segment) {
                    this.host.fetchMoreData();
                }
            }

            // Get Data
            const table = options.dataViews[0].table;

            // Transform data
            this.dataPoints = this.transformTable(table)
            const tableInformations : tableInformations = this.getTableInformations(table)

            // Create traces
            const traces = this.createTraces(tableInformations)

            // Draw visual
            const gd : HTMLDivElement = document.querySelector('div');

            // Définir la mise en page du graphique
            const layout = this.getLayout(tableInformations, traces)

            Plotly.newPlot(
                gd,
                traces,
                layout,
                {
                    displaylogo: false,
                    responsive: true,
                    modeBarButtonsToRemove: ['resetCameraLastSave3d', 'toImage']
                }
            );

        }
        else {
            this.host.displayWarningIcon("Refresh Visual", "The Refresh Visual option is deactivated so the visual won't be refreshed if you add new data of apply filters.")
        }

    }

    public getLayout(tableInformations, traces) {
        const generateAnnotations = () => {
            if (this.formattingSettings.styleCardSettings.displayLabels.value) {
                return traces.map(trace => {
                    let index;
                    switch (this.formattingSettings.styleCardSettings.labelsPosition.value) {
                        case 'middle':
                            index = Math.floor(trace.x.length / 2);
                            break;
                        case 'top':
                            index = trace.x.length - 1;
                            break;
                        case 'bottom':
                            index = 0;
                            break;
                        default:
                            index = trace.x.length - 1; // Par défaut, on utilise 'top'
                    }

                    return {
                        x: trace.x[index],
                        y: trace.y[index],
                        z: trace.z[index],
                        text: trace.name,
                        font: {
                            color: trace.line.color,
                            size: 12
                        },
                        showarrow: false
                    };
                });
            }
            return [];
        };

        const layout = {
            // title: '3D Scatter Plot',
            scene: {
                xaxis: {
                    title: tableInformations.xColumnName,
                    autorange: this.formattingSettings.axisCardSettings.revertXAxis.value ? 'reversed' : 'true'
                },
                yaxis: {
                    title: tableInformations.yColumnName,
                    autorange: this.formattingSettings.axisCardSettings.revertYAxis.value ? 'reversed' : 'true'
                },
                zaxis: {
                    title: tableInformations.zColumnName,
                    autorange: this.formattingSettings.axisCardSettings.revertZAxis.value ? 'reversed' : 'true'
                },
                annotations: generateAnnotations()
            },
            showlegend: this.formattingSettings.legendCardSettings.show.value,
            legend: {
                "orientation": this.formattingSettings.legendCardSettings.legendOrientation.value,
                x: this.formattingSettings.legendCardSettings.legendPosition.value
            },
            margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 50,
                pad: 0
            },
            automargin: true,
        };

        return layout
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

        const xIndex = table.columns.findIndex(column => column.roles.x);
        const yIndex = table.columns.findIndex(column => column.roles.y);
        const zIndex = table.columns.findIndex(column => column.roles.z);
        const legendIndex = table.columns.findIndex(column => column.roles.legend);

        table.rows.forEach((row, rowIndex) => {
            const xValue = row[xIndex];
            const yValue = row[yIndex];
            const zValue = row[zIndex];
            const legendValue = legendIndex !== -1 ? row[legendIndex] : '';
            const selection: ISelectionId = this.host.createSelectionIdBuilder()
                .withTable(table, rowIndex)
                .createSelectionId();

            dataPoints.push({
                x: xValue,
                y: yValue,
                z: zValue,
                legend: legendValue,
                selection: selection
            })
        })

        return dataPoints
    }

    private static parseSettings(dataView: powerbi.DataView): VisualSettings {
        return VisualSettings.parse(dataView) as VisualSettings;
    }

}
