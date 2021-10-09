# Urban China Web Design

<img src="./img/display.png" width="80%">

## Start

1. Purpose: Shows the dynamics of urban land use in each major Chinese city from 1995-2015 and a 3D histogram of population density for the whole China in 2015. This project comes with the function of selecting each map mode (normal mode, black background mode, remote sensing mode), city case and overall China's perspective change.

2. Application framework.

   `Mapbox-gl`: responsible for the main map display

   `Echarts-gl`: build the population density 3D map together with `Mapbox`.

3. Geographic data are pre-processed by `QGIS 3.18`.

## Land
 data

1. Data source: <a href="https://land.copernicus.eu/global/products/lc">Copernicus Global Urban Coverage Dataset</a

2. Continuous urban land change in China presented via `.gif`, raster data using Web Mercator projection (EPSG:3857)

   <img src="./img/display_land.png" width="70%">

## Population data

1. Data source: <a href="https://landscan.ornl.gov/">LandScan Global Population Data</a>, export data to json format ([longitude, latitude, population])

2. Use `Echarts-gl` as the main framework and `Mapbox-gl` as the base map for population density 3D mapping

   <img src="./img/display_pop.png" width="70%">
