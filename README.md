# MuchaGio Fishing Maps v0.9.0

## Main change
The former hand-drawn fishing corridors have been removed. Fishing overlays now load real OpenStreetMap waterway geometries through the Overpass API and therefore follow the mapped Neckar, canal and Enz courses.

## Version display
The current version, build date and GIS status are visible under **Info** and in the sidebar header.

## Accuracy
Water geometry is GIS-based. Official start/end limits and permitted bank sides remain orientation data until the Hege6 maps have been fully georeferenced and digitized.

## Deployment
Upload the complete folder contents to the repository root and overwrite existing files. GitHub Pages can continue to deploy from `main / root`.


## v0.9.0
- Satellite view retained as a permanent, remembered basemap
- Review zones converted from broad circles to targeted review points
- Point-level source and accuracy metadata
- Updated UI labels and data-quality explanation
