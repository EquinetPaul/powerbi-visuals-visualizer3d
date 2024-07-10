# powerbi-visuals-visualizer3d
PowerBI 3D Visualizer

![Screenshot of the visual](assets/screenshot_3d.gif)

This custom visual for Power BI allows you to create interactive 3D plots using Plotly.

### Setting Up Environment

Before starting creating your first custom visual follow by [this](https://learn.microsoft.com/en-us/power-bi/developer/visuals/environment-setup)
setting up environment instruction.


### Install dev dependencies:

Once you have cloned this repository, run these commands to install dependencies and to connect the visual into powerbi.

```
npm install # This command will install all necessary modules
```

### Start dev app
```
pbiviz start
```

## v1.2.0.0 (preview)
- Order by an axis
- Check data validity 

## v1.1.0.0
- Revert **X, Y & Z** axis
- Change the style of elements (line, scatter, line & scatter)
- Size and width of marker and line
- Display Labels and set up their position (middle, top, bottom)
- Display or hide the legend and its orientation (column, line)
- **Fetch More Data**: activate or not
- Removed **Group** field

## v1.0.0.0
- Use Plotly.JS
- 3 fields for coordinates: **X Axis**, **Y Axis** and **Z Axis**
- 2 fields to group the coordinates: **Legend** (one trace per legend) and **Group** that groups the linked legends
- Use of the fetchMoreData API to collect more data
- Lines ordered by increasing Z values
