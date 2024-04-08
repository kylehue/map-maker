# Map Maker for 2D Game Development
A simple tool for creating 2D game maps 🌏

[Go to app](https://kylehue.github.io/map-maker/)

![Preview](https://raw.githubusercontent.com/kylehue/map-maker/main/public/preview.gif)

## Features
- Multi-layering
- Map matrix
- Advanced Tools — Paint-Bucket, Brush, etc.
- Autosave (depends if *FileSystemAccess API* is supported on your browser)

## How to Use
- **Tile Placement**: Select a material, a tool (e.g. brush), and a layer. Then you can paint on the canvas just like you would on MS Paint.
- **Matrix Generation**: Matrix is automatically generated based on the placement of your tiles. To view a matrix, select a layer and go to matrix tab. Note that each layer has a matrix.
- **Export**: You can export in 3 different formats:
  1. `.mpmkr` - Project file.
  2. `.png` - Image snapshot of the whole map.
  3. `.txt` - Multiple text files that represents each layer's matrix.

## Important Notes
- Never have a matrix id that contains the matrix separator — It will corrupt your project!
- The default matrix separator is a space: ' '. You can change this in `Edit > Change matrix separator`
- Properly name your image files because they will be the basis of material name and matrix id.
- Do not set the matrix tab active while painting to avoid lag.
- Always lock the layers that you finish to avoid painting on wrong layers!
