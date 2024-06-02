# powerbi-visuals-visualizer3d
PowerBI 3D Visualizer

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

## v1.0.0.0
- 3 fields for coordinates: **X Axis**, **Y Axis** and **Z Axis**
- 2 fields to group the coordinates: **Legend** (one trace per legend) and **Group** that groups the linked legends
- Use of the fetchMoreData API to collect more data
- Lines ordered by increasing Z values