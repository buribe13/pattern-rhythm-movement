# Album Archive Gallery - Pattern, Rhythm, Movement

An interactive P5.js gallery showcasing favorite albums with dynamic patterns, rhythmic compositions, and smooth movement.

## Features

- **Visual Pattern**: Grid-based layout with rhythmic variations
- **HSB Color Mode**: Dynamic color variations using Hue, Saturation, and Brightness
- **Rhythmic Movement**: Smooth animations using sine waves for oscillation
- **Loops for Variations**: Iterative patterns creating visual rhythm
- **Composition & Symmetry**: Balanced 4x4 grid layout with tiling

## Setup

1. **Download Album Covers**:
   - Run the download script: `./download_covers.sh`
   - Or manually download images to the `assets/` folder (see `download_images.md` for instructions)
   - Images should be named according to the filenames in `sketch.js`

2. **Open the Project**:
   - Open `index.html` in a web browser
   - Or use a local server (recommended):
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (if you have http-server installed)
     npx http-server
     ```
   - Navigate to `http://localhost:8000`

## Album List

1. D'Angelo - Voodoo
2. King Krule - The OOZ
3. Prince - Self Titled
4. Earl Sweatshirt - Some Rap Songs
5. MIKE - Tears of Joy
6. Standing on the Corner - Red Burns
7. Alex G - Rocket
8. Sun Kil Moon - Benji
9. Blu - Her Favorite Color
10. Stevie Wonder - Songs in the Key of Life
11. Blue Iverson - Hotep
12. Knxwledge - Anthology
13. Fly Anakin & Koncept Jack$on - Chapel Drive
14. Navy Blue - Ada Irin
15. Drake - Views

## Technical Details

- **Color Mode**: HSB (Hue: 0-360, Saturation: 0-100, Brightness: 0-100)
- **Pattern**: Grid-based with background pattern overlay
- **Rhythm**: Sine wave-based animations creating smooth oscillations
- **Movement**: Rotational and scale variations synchronized across albums
- **Composition**: 4x4 grid with responsive sizing

## Assignment Requirements Met

✅ Visual pattern in P5.js  
✅ Rhythmic composition with variation across window  
✅ HSB color mode for color variations  
✅ Loops to iterate through variations  
✅ Attention to composition, tiling, and symmetry  
