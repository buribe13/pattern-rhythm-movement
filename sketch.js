// Claw Machine Album Archive - Pattern, Rhythm, Movement
// Using HSB color mode for color variations

// Helper functions to convert between RGB and HSB
function rgbToHsb(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let delta = max - min;

  let h = 0;
  let s = max === 0 ? 0 : (delta / max) * 100;
  let brightness = max * 100;

  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
    } else if (max === g) {
      h = ((b - r) / delta + 2) * 60;
    } else {
      h = ((r - g) / delta + 4) * 60;
    }
  }

  return { h: h, s: s, b: brightness };
}

function hsbToRgb(h, s, b) {
  h /= 360;
  s /= 100;
  b /= 100;

  let r, g, blue;
  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = b * (1 - s);
  let q = b * (1 - f * s);
  let t = b * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = b;
      g = t;
      blue = p;
      break;
    case 1:
      r = q;
      g = b;
      blue = p;
      break;
    case 2:
      r = p;
      g = b;
      blue = t;
      break;
    case 3:
      r = p;
      g = q;
      blue = b;
      break;
    case 4:
      r = t;
      g = p;
      blue = b;
      break;
    case 5:
      r = b;
      g = p;
      blue = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(blue * 255),
  };
}

let albums = [];
let albumImages = [];
let validAlbumIndices = []; // Track which albumData indices have valid images
let tileSize = 120; // Base size for album covers
let padding = 15;
let time = 0;
let hueOffset = 0;

// Claw machine state
let claw = {
  x: 0,
  y: 0,
  targetX: 0,
  speed: 5,
  state: "idle", // 'idle', 'moving', 'descending', 'grabbing', 'ascending', 'movingToCenter', 'holding'
  grabbedAlbum: null,
  clawY: 0,
  maxClawY: 0,
  grabTimer: 0,
  autoGrab: false, // Flag to auto-grab when reaching target position
  targetClawY: 0, // Target Y position for claw when holding displayed album
};

// Sound state tracking
let soundState = {
  lastMoveSound: 0, // Track when last movement sound played
  moveSoundInterval: 8, // Frames between movement sounds
  lastClankSound: 0, // Track when last clank sound played
  clankSoundInterval: 15, // Frames between clank sounds
  lastGrabSound: 0, // Track when grab sound last played
  grabSoundPlayed: false, // Track if grab sound was played for current grab
};

// Selected album info
let selectedAlbum = null;
let infoPanelHeight = 200;
let hoveredAlbum = null; // Track which album is being hovered
let displayedAlbum = null; // Album being displayed at top
let displayScale = 1.0; // Scale animation for displayed album
let displayTargetScale = 4.0; // Target scale when at top (2x the previous size)
let displayY = 0; // Y position for displayed album
let topDisplayArea = 400; // Space reserved at top for displayed album
let displayedAlbumHovered = false; // Track if displayed album is hovered

// Falling album animation state
let fallingAlbum = {
  active: false,
  albumIndex: null,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  scale: 1.0,
  targetScale: 1.0,
  targetX: 0,
  targetY: 0,
  rotation: 0,
  rotationSpeed: 0,
  bounceCount: 0, // Track number of bounces
  settled: false, // Whether the album has settled into place
};

// Album data with filenames and information
// Updated to use actual files from album-covers folder
const albumData = [
  {
    name: "D'Angelo - Voodoo",
    file: "d'angelo - voodoo.webp",
    artist: "D'Angelo",
    album: "Voodoo",
    year: "2000",
    genre: "R&B, Neo-Soul",
  },
  {
    name: "King Krule - The OOZ",
    file: "king krule - the ooz.webp",
    artist: "King Krule",
    album: "The OOZ",
    year: "2017",
    genre: "Alternative, Art Rock",
  },
  {
    name: "Prince - Self Titled",
    file: "prince - prince.webp",
    artist: "Prince",
    album: "Prince",
    year: "1979",
    genre: "Funk, R&B, Pop",
  },
  {
    name: "Earl Sweatshirt - Some Rap Songs",
    file: "earl sweatshirt - some rap songs.webp",
    artist: "Earl Sweatshirt",
    album: "Some Rap Songs",
    year: "2018",
    genre: "Hip-Hop, Abstract Rap",
  },
  {
    name: "MIKE - Tears of Joy",
    file: "mike - tears of joy.webp",
    artist: "MIKE",
    album: "Tears of Joy",
    year: "2019",
    genre: "Hip-Hop, Abstract Rap",
  },
  {
    name: "Standing on the Corner - Red Burns",
    file: "sotc - red burns.jpg",
    artist: "Standing on the Corner",
    album: "Red Burns",
    year: "2017",
    genre: "Experimental, Jazz, Hip-Hop",
  },
  {
    name: "Alex G - Rocket",
    file: "alex g - rocket.webp",
    artist: "Alex G",
    album: "Rocket",
    year: "2017",
    genre: "Indie Rock, Lo-Fi",
  },
  {
    name: "Sun Kil Moon - Benji",
    file: "sun kil moon - benji.webp",
    artist: "Sun Kil Moon",
    album: "Benji",
    year: "2014",
    genre: "Folk, Indie Rock",
  },
  {
    name: "Blu - Her Favorite Color",
    file: "blu - her favorite color.jpg",
    artist: "Blu",
    album: "Her Favorite Color",
    year: "2011",
    genre: "Hip-Hop, Alternative Rap",
  },
  {
    name: "Stevie Wonder - Songs in the Key of Life",
    file: "stevie wonder - songs in the key of life.webp",
    artist: "Stevie Wonder",
    album: "Songs in the Key of Life",
    year: "1976",
    genre: "Soul, Funk, R&B",
  },
  {
    name: "Blue Iverson - Hotep",
    file: "hotep-blue-iverson.webp",
    artist: "Blue Iverson",
    album: "Hotep",
    year: "2020",
    genre: "Hip-Hop",
  },
  {
    name: "SWV - It's About Time",
    file: "It's_About_Time_(SWV_album).jpeg",
    artist: "SWV",
    album: "It's About Time",
    year: "1992",
    genre: "R&B, New Jack Swing",
  },
  {
    name: "Fly Anakin & Koncept Jack$on - Chapel Drive",
    file: "koncept jackson and fly anakin - chapel drive.jpg",
    artist: "Fly Anakin & Koncept Jack$on",
    album: "Chapel Drive",
    year: "2020",
    genre: "Hip-Hop",
  },
  {
    name: "Navy Blue - Ada Irin",
    file: "navy blue - ada irin.jpg",
    artist: "Navy Blue",
    album: "Ada Irin",
    year: "2020",
    genre: "Hip-Hop, Abstract Rap",
  },
  {
    name: "Drake - Views",
    file: "drake - views.webp",
    artist: "Drake",
    album: "Views",
    year: "2016",
    genre: "Hip-Hop, R&B, Pop",
  },
];

function preload() {
  // Load album cover images from album-covers folder
  for (let i = 0; i < albumData.length; i++) {
    let img = loadImage(
      `album-covers/${albumData[i].file}`,
      () => console.log(`Loaded: ${albumData[i].name}`),
      () => console.log(`Failed to load: ${albumData[i].file}`)
    );
    albumImages.push(img);
  }
}

// Sound synthesis functions
function playClankSound() {
  // Create a metallic clank sound using noise and oscillator
  try {
    let osc = new p5.Oscillator("sawtooth");
    let env = new p5.Envelope();
    let noise = new p5.Noise("brown");

    // Clank sound: short, metallic, percussive
    osc.freq(random(200, 400)); // Random frequency for variation
    osc.amp(0);
    osc.start();

    // Quick attack and decay for clank
    env.setADSR(0.001, 0.1, 0.3, 0.2);
    env.setRange(0.3, 0);
    env.play(osc);

    // Stop oscillator after envelope completes
    setTimeout(() => {
      osc.stop();
      osc.dispose();
    }, 200);

    // Add some noise for metallic texture
    noise.amp(0);
    noise.start();
    let noiseEnv = new p5.Envelope();
    noiseEnv.setADSR(0.001, 0.05, 0.2, 0.1);
    noiseEnv.setRange(0.1, 0);
    noiseEnv.play(noise);

    setTimeout(() => {
      noise.stop();
      noise.dispose();
    }, 150);
  } catch (e) {
    // Silently fail if audio context not available
    console.log("Audio not available");
  }
}

function playGrabSound() {
  // Create a satisfying grab/pickup sound
  try {
    let osc = new p5.Oscillator("sine");
    let env = new p5.Envelope();

    // Grab sound: quick, satisfying
    osc.freq(300);
    osc.amp(0);
    osc.start();

    // Quick attack, medium sustain, quick release
    env.setADSR(0.01, 0.15, 0.4, 0.2);
    env.setRange(0.4, 0);
    env.play(osc);

    // Add a second oscillator for depth
    let osc2 = new p5.Oscillator("triangle");
    osc2.freq(150);
    osc2.amp(0);
    osc2.start();

    let env2 = new p5.Envelope();
    env2.setADSR(0.01, 0.1, 0.3, 0.15);
    env2.setRange(0.2, 0);
    env2.play(osc2);

    setTimeout(() => {
      osc.stop();
      osc.dispose();
      osc2.stop();
      osc2.dispose();
    }, 300);
  } catch (e) {
    console.log("Audio not available");
  }
}

function playMovementSound() {
  // Create a subtle mechanical movement sound
  try {
    let osc = new p5.Oscillator("sawtooth");
    let env = new p5.Envelope();

    // Lower frequency for mechanical sound
    osc.freq(random(80, 120));
    osc.amp(0);
    osc.start();

    // Very quick, subtle sound
    env.setADSR(0.001, 0.05, 0.1, 0.05);
    env.setRange(0.15, 0);
    env.play(osc);

    setTimeout(() => {
      osc.stop();
      osc.dispose();
    }, 100);
  } catch (e) {
    console.log("Audio not available");
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100); // HSB with alpha range 0-100

  // Set default text properties
  // Use sans-serif which will use SF Pro on macOS via CSS
  textFont("sans-serif");
  textSize(13);
  textAlign(CENTER);
  textLeading(13);

  // Initialize claw position
  claw.x = width / 2;
  claw.targetX = width / 2;
  claw.y = 80;
  // Make claw extend fully to reach albums at bottom (albums are at height - tileSize/2)
  claw.maxClawY = height - tileSize / 2 + 20; // Extend slightly past album center

  // Filter out albums with missing/invalid images
  validAlbumIndices = [];
  for (let i = 0; i < albumData.length; i++) {
    // Check if image exists and has valid dimensions
    if (
      albumImages[i] &&
      albumImages[i].width > 0 &&
      albumImages[i].height > 0
    ) {
      validAlbumIndices.push(i);
    } else {
      console.log(`Skipping album ${albumData[i].name} - image not loaded`);
    }
  }

  // Calculate album positions at bottom of screen
  // Only use albums with valid images
  let validAlbumCount = validAlbumIndices.length;
  let albumAreaWidth = width - padding * 2;
  let albumSpacing = validAlbumCount > 0 ? albumAreaWidth / validAlbumCount : 0;
  // Position albums so their bottom edge sits at the very bottom of the screen (overlapping info panel)
  let bottomY = height - tileSize / 2;

  // Initialize albums at bottom (only for valid images)
  for (let j = 0; j < validAlbumIndices.length; j++) {
    let i = validAlbumIndices[j]; // Original albumData index
    let x = padding + j * albumSpacing + albumSpacing / 2;

    albums.push({
      x: x,
      y: bottomY,
      size: tileSize,
      rotation: 0,
      rotationSpeed: random(-0.01, 0.01),
      dataIndex: i, // Store original albumData index
      albumIndex: j, // Store position in albums array
      grabbed: false,
      dominantColor: null,
      secondaryColor: null,
      colorPalette: [], // Full color palette array
      colorsExtracted: false,
      targetX: x, // Target X position for reactive movement
    });
  }

  // Extract colors from album covers after a brief delay to ensure images are loaded
  setTimeout(() => {
    for (let j = 0; j < albums.length; j++) {
      let i = albums[j].dataIndex;
      if (
        albumImages[i] &&
        albumImages[i].width > 0 &&
        !albums[j].colorsExtracted
      ) {
        extractAlbumColors(j);
        albums[j].colorsExtracted = true;
      }
    }
  }, 100);
}

function draw() {
  // Draw rhythmic pattern background
  drawRhythmicPattern();

  time += 0.02;

  // Check for album hover
  checkAlbumHover();

  // Check for displayed album hover
  checkDisplayedAlbumHover();

  // Update cursor based on hover state
  if (hoveredAlbum !== null && !albums[hoveredAlbum].grabbed) {
    cursor(HAND);
  } else if (displayedAlbumHovered) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }

  // Update claw
  updateClaw();

  // Update falling album animation
  if (fallingAlbum.active) {
    updateFallingAlbum();
    // Make other albums react to the falling album
    updateAlbumReactions();
  }

  // Draw description on initial landing screen
  if (displayedAlbum === null && !fallingAlbum.active) {
    drawDescription();
  }

  // Draw displayed album at top (if any)
  if (displayedAlbum !== null) {
    drawDisplayedAlbum();
  }

  // Draw albums at bottom
  drawAlbums();

  // Draw falling album (on top of other albums)
  if (fallingAlbum.active) {
    drawFallingAlbum();
  }

  // Draw claw machine
  drawClaw();

  // Draw info panel at bottom
  drawInfoPanel();
}

function drawRhythmicPattern() {
  // Create a rhythmic composition with variation across the entire window
  // Uses loops, HSB colors, tiling, and symmetry

  push();
  noStroke();

  // Base tile size for the pattern
  let baseTileSize = 60;
  let cols = ceil(width / baseTileSize) + 2;
  let rows = ceil(height / baseTileSize) + 2;

  // Offset for animation/scrolling effect
  let offsetX = (time * 10) % baseTileSize;
  let offsetY = (time * 8) % baseTileSize;

  // Get color palette from displayed album or use default
  let baseHue = 240;
  let baseSat = 15;
  let baseBright = 95;

  if (
    displayedAlbum !== null &&
    albums[displayedAlbum].colorPalette &&
    albums[displayedAlbum].colorPalette.length > 0
  ) {
    let album = albums[displayedAlbum];
    let dominant = album.colorPalette[0];
    baseHue = dominant.h;
    baseSat = min(dominant.s, 30); // Limit saturation for subtlety
    baseBright = constrain(dominant.b, 85, 98); // Keep bright for visibility
  } else if (
    selectedAlbum !== null &&
    albums[selectedAlbum].colorPalette &&
    albums[selectedAlbum].colorPalette.length > 0
  ) {
    let album = albums[selectedAlbum];
    let dominant = album.colorPalette[0];
    baseHue = dominant.h;
    baseSat = min(dominant.s, 30);
    baseBright = constrain(dominant.b, 85, 98);
  }

  // Draw tiled pattern using nested loops
  for (let i = -1; i < rows; i++) {
    for (let j = -1; j < cols; j++) {
      let x = j * baseTileSize - offsetX;
      let y = i * baseTileSize - offsetY;

      // Calculate variation based on position and time
      let gridX = j;
      let gridY = i;

      // Create rhythmic variation using sine waves
      let rhythm1 = sin(time * 2 + gridX * 0.5 + gridY * 0.3) * 0.5 + 0.5;
      let rhythm2 = sin(time * 1.5 + gridX * 0.7 - gridY * 0.4) * 0.5 + 0.5;
      let rhythm3 = sin(time * 3 + (gridX + gridY) * 0.2) * 0.5 + 0.5;

      // Create symmetry by mirroring pattern
      let symmetryX = abs(gridX % 4);
      let symmetryY = abs(gridY % 4);

      // Vary hue based on position and rhythm
      let hueVariation = (gridX * 15 + gridY * 10 + time * 20) % 360;
      let hue = (baseHue + hueVariation * rhythm1 * 0.3) % 360;

      // Vary saturation based on rhythm
      let sat = baseSat + rhythm2 * 20;
      sat = constrain(sat, 5, 40);

      // Vary brightness based on rhythm and position
      let bright = baseBright - rhythm3 * 15;
      bright = constrain(bright, 70, 98);

      // Create pattern element size variation
      let sizeMultiplier = 0.6 + rhythm1 * 0.4;
      let tileSize = baseTileSize * sizeMultiplier;

      // Draw symmetrical pattern elements
      push();
      translate(x + baseTileSize / 2, y + baseTileSize / 2);

      // Create radial symmetry
      let symmetryAngle = ((gridX + gridY) * PI) / 4;
      rotate(symmetryAngle + time * 0.5);

      // Draw pattern element with HSB color (subtle alpha for background)
      fill(hue, sat, bright, 15);

      // Draw multiple overlapping shapes for complexity
      for (let k = 0; k < 3; k++) {
        let scale = 1 - k * 0.3;
        let alpha = 15 - k * 4;
        let hueShift = k * 20;

        fill((hue + hueShift) % 360, sat, bright, alpha);

        // Draw geometric shapes with variation
        if (k === 0) {
          // Outer circle
          ellipse(0, 0, tileSize * scale, tileSize * scale);
        } else if (k === 1) {
          // Rotated square
          push();
          rotate(PI / 4 + time);
          rectMode(CENTER);
          rect(0, 0, tileSize * scale * 0.7, tileSize * scale * 0.7);
          pop();
        } else {
          // Inner circle
          ellipse(0, 0, tileSize * scale * 0.5, tileSize * scale * 0.5);
        }
      }

      // Add accent lines for rhythm (very subtle)
      stroke((hue + 60) % 360, sat + 10, bright - 10, 20);
      strokeWeight(1);
      for (let l = 0; l < 4; l++) {
        push();
        rotate((l * PI) / 2 + time);
        line(0, 0, tileSize * 0.4, 0);
        pop();
      }

      noStroke();
      pop();
    }
  }

  // Add wave pattern overlay for additional rhythm
  push();
  noFill();
  strokeWeight(2);

  for (let wave = 0; wave < 3; wave++) {
    let waveHue = (baseHue + wave * 40) % 360;
    let waveY = height / 4 + wave * (height / 4);
    let waveAmplitude = 20 + sin(time * 2 + wave) * 10;
    let waveFrequency = 0.02 + wave * 0.01;

    stroke(waveHue, baseSat + 10, baseBright - 5, 10);

    beginShape();
    for (let x = 0; x < width; x += 2) {
      let y = waveY + sin(x * waveFrequency + time * 2 + wave) * waveAmplitude;
      vertex(x, y);
    }
    endShape();
  }

  noStroke();
  pop();

  pop();
}

function drawPatternBackground() {
  // Draw gradient background based on selected album's color palette
  push();
  noStroke();

  // Determine which album's colors to use
  let palette = [];

  if (displayedAlbum !== null) {
    // Use displayed album's full color palette
    let album = albums[displayedAlbum];
    palette =
      album.colorPalette && album.colorPalette.length > 0
        ? album.colorPalette
        : [
            album.dominantColor || { h: 240, s: 10, b: 85 },
            album.secondaryColor || { h: 240, s: 10, b: 75 },
          ];
  } else if (selectedAlbum !== null) {
    // Use selected album's full color palette
    let album = albums[selectedAlbum];
    palette =
      album.colorPalette && album.colorPalette.length > 0
        ? album.colorPalette
        : [
            album.dominantColor || { h: 240, s: 10, b: 85 },
            album.secondaryColor || { h: 240, s: 10, b: 75 },
          ];
  } else {
    // Default light gradient (light blue-gray in HSB)
    palette = [
      { h: 240, s: 5, b: 98 },
      { h: 240, s: 5, b: 96 },
    ];
  }

  // Create a super smooth pixel-by-pixel gradient using the full palette
  // This eliminates any visible horizontal lines
  loadPixels();

  for (let y = 0; y < height; y++) {
    // Calculate interpolation value based on vertical position
    let inter = map(y, 0, height, 0, 1);

    // Use smoothstep for even softer transitions
    inter = inter * inter * (3 - 2 * inter);

    // Map interpolation to palette indices
    let colorIndex = inter * (palette.length - 1);
    let colorIndexFloor = floor(colorIndex);
    let colorIndexCeil = min(colorIndexFloor + 1, palette.length - 1);
    let t = colorIndex - colorIndexFloor;

    // Smooth interpolation between adjacent colors
    let color1 = palette[colorIndexFloor];
    let color2 = palette[colorIndexCeil];

    // Use easeInOut for even smoother transitions
    t = t * t * (3 - 2 * t);

    // Interpolate HSB values (handle hue circularity)
    let h1 = color1.h;
    let h2 = color2.h;
    let dh = h2 - h1;
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;
    let h = (h1 + dh * t) % 360;
    if (h < 0) h += 360;
    let s = lerp(color1.s, color2.s, t);
    let b = lerp(color1.b, color2.b, t);

    // Convert HSB to RGB for pixel array (pixels are always RGB)
    let rgb = hsbToRgb(h, s, b);

    // Set color for entire row
    for (let x = 0; x < width; x++) {
      let index = (y * width + x) * 4;
      pixels[index] = rgb.r;
      pixels[index + 1] = rgb.g;
      pixels[index + 2] = rgb.b;
      pixels[index + 3] = 255; // Pixel array alpha is always 0-255
    }
  }

  updatePixels();
  pop();
}

function extractAlbumColors(albumIndex) {
  let dataIndex = albums[albumIndex].dataIndex;
  let img = albumImages[dataIndex];
  if (!img || img.width === 0) return;

  img.loadPixels();

  // Sample colors from a grid across the entire image for better color representation
  let samples = [];
  let gridSize = 8; // Sample from an 8x8 grid
  let stepX = floor(img.width / gridSize);
  let stepY = floor(img.height / gridSize);

  // Sample from grid points
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let x = floor(i * stepX + stepX / 2);
      let y = floor(j * stepY + stepY / 2);
      let idx = (y * img.width + x) * 4;

      if (idx < img.pixels.length - 3) {
        let r = img.pixels[idx];
        let g = img.pixels[idx + 1];
        let b = img.pixels[idx + 2];
        let a = img.pixels[idx + 3];

        // Only include colors that are not too transparent
        if (a > 128) {
          // Convert RGB to HSB
          let hsb = rgbToHsb(r, g, b);
          samples.push({ h: hsb.h, s: hsb.s, b: hsb.b });
        }
      }
    }
  }

  // Cluster similar colors and get distinct palette
  let palette = extractDistinctColors(samples, 5); // Get 5 distinct colors

  // Sort colors by brightness for better gradient
  palette.sort((a, b) => {
    return b.b - a.b; // Sort by brightness (brightest first)
  });

  // Store full palette
  albums[albumIndex].colorPalette = palette;

  // Keep dominant and secondary for backward compatibility
  albums[albumIndex].dominantColor = palette[0] || { h: 240, s: 10, b: 85 };
  albums[albumIndex].secondaryColor = palette[palette.length - 1] || {
    h: 240,
    s: 10,
    b: 75,
  };
}

function extractDistinctColors(samples, count) {
  if (samples.length === 0) return [];
  if (samples.length <= count) return samples;

  // Use k-means-like approach to find distinct colors
  let clusters = [];
  let clusterCount = min(count, samples.length);

  // Initialize clusters with evenly spaced samples
  for (let i = 0; i < clusterCount; i++) {
    let idx = floor((i / clusterCount) * samples.length);
    clusters.push({
      h: samples[idx].h,
      s: samples[idx].s,
      b: samples[idx].b,
      count: 0,
    });
  }

  // Assign samples to nearest cluster
  for (let sample of samples) {
    let minDist = Infinity;
    let nearestCluster = 0;

    for (let i = 0; i < clusters.length; i++) {
      // Calculate distance in HSB space (accounting for hue circularity)
      let dh = min(
        abs(sample.h - clusters[i].h),
        360 - abs(sample.h - clusters[i].h)
      );
      let ds = sample.s - clusters[i].s;
      let db = sample.b - clusters[i].b;
      // Weight hue less since it's circular, normalize values
      let dist = sqrt((dh * dh) / 100 + ds * ds + db * db);

      if (dist < minDist) {
        minDist = dist;
        nearestCluster = i;
      }
    }

    // Update cluster center (running average)
    clusters[nearestCluster].count++;
    let n = clusters[nearestCluster].count;
    // Handle hue averaging with circular wrapping
    let h1 = clusters[nearestCluster].h;
    let h2 = sample.h;
    let dh = h2 - h1;
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;
    clusters[nearestCluster].h = (h1 + dh / n) % 360;
    if (clusters[nearestCluster].h < 0) clusters[nearestCluster].h += 360;
    clusters[nearestCluster].s =
      (clusters[nearestCluster].s * (n - 1) + sample.s) / n;
    clusters[nearestCluster].b =
      (clusters[nearestCluster].b * (n - 1) + sample.b) / n;
  }

  // Return cluster centers as colors
  return clusters.map((c) => ({ h: floor(c.h), s: floor(c.s), b: floor(c.b) }));
}

function checkAlbumHover() {
  hoveredAlbum = null;

  // Check if mouse is over any album
  for (let j = 0; j < albums.length; j++) {
    if (albums[j].grabbed) continue;

    // Calculate distance from mouse to album center
    // Account for rotation by checking in screen space
    let dx = mouseX - albums[j].x;
    let dy = mouseY - albums[j].y;
    let distance = sqrt(dx * dx + dy * dy);

    // Check if within album bounds (accounting for rotation)
    if (distance < albums[j].size * 0.6) {
      hoveredAlbum = j;
      break;
    }
  }
}

function drawAlbums() {
  for (let j = 0; j < albums.length; j++) {
    let album = albums[j];
    let i = album.dataIndex; // Original albumData index

    // Skip if grabbed
    if (album.grabbed) continue;

    push();
    translate(album.x, album.y);

    // Subtle rotation
    album.rotation += album.rotationSpeed;
    rotate(album.rotation);

    // Hover animation: scale and enhanced glow
    let isHovered = hoveredAlbum === j;
    let hoverScale = isHovered ? 1.15 : 1.0;
    let hoverGlow = isHovered ? 1.5 : 1.0;
    let hoverAlpha = isHovered ? 1.3 : 1.0;

    // Smooth scale transition
    if (!album.currentScale) album.currentScale = 1.0;
    album.currentScale = lerp(album.currentScale, hoverScale, 0.15);
    scale(album.currentScale);

    // Get colors for gradient (default to subtle colors if not extracted)
    let color1 = album.dominantColor || { h: 240, s: 10, b: 85 };
    let color2 = album.secondaryColor || { h: 240, s: 10, b: 75 };

    // Draw album cover image (just the square, no borders)
    if (albumImages[i] && albumImages[i].width > 0) {
      imageMode(CENTER);
      noTint();
      image(albumImages[i], 0, 0, album.size, album.size);
    } else {
      // Placeholder (shouldn't happen since we filter these out)
      fill(0, 0, 40, 20);
      noStroke();
      rectMode(CENTER);
      rect(0, 0, album.size, album.size);

      fill(0, 0, 20, 80);
      textAlign(CENTER, CENTER);
      textSize(13);
      textLeading(13);
      text(albumData[i].name.split(" - ")[0], 0, 0);
    }

    pop();
  }
}

// Helper function to get background color at a specific Y position
function getBackgroundColorAtY(y) {
  // Determine which album's colors to use
  let palette = [];

  if (displayedAlbum !== null) {
    let album = albums[displayedAlbum];
    palette =
      album.colorPalette && album.colorPalette.length > 0
        ? album.colorPalette
        : [
            album.dominantColor || { h: 240, s: 10, b: 85 },
            album.secondaryColor || { h: 240, s: 10, b: 75 },
          ];
  } else if (selectedAlbum !== null) {
    let album = albums[selectedAlbum];
    palette =
      album.colorPalette && album.colorPalette.length > 0
        ? album.colorPalette
        : [
            album.dominantColor || { h: 240, s: 10, b: 85 },
            album.secondaryColor || { h: 240, s: 10, b: 75 },
          ];
  } else {
    palette = [
      { h: 240, s: 5, b: 98 },
      { h: 240, s: 5, b: 96 },
    ];
  }

  // Calculate interpolation value based on vertical position
  let inter = map(y, 0, height, 0, 1);
  inter = inter * inter * (3 - 2 * inter); // smoothstep

  // Map interpolation to palette indices
  let colorIndex = inter * (palette.length - 1);
  let colorIndexFloor = floor(colorIndex);
  let colorIndexCeil = min(colorIndexFloor + 1, palette.length - 1);
  let t = colorIndex - colorIndexFloor;
  t = t * t * (3 - 2 * t); // easeInOut

  // Interpolate between adjacent colors (HSB)
  let color1 = palette[colorIndexFloor];
  let color2 = palette[colorIndexCeil];

  // Handle hue circularity
  let h1 = color1.h;
  let h2 = color2.h;
  let dh = h2 - h1;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  let h = (h1 + dh * t) % 360;
  if (h < 0) h += 360;

  return {
    h: h,
    s: lerp(color1.s, color2.s, t),
    b: lerp(color1.b, color2.b, t),
  };
}

// Helper function to calculate luminance (perceived brightness) from HSB
function getLuminanceFromHsb(h, s, b) {
  // Convert HSB to RGB first
  let rgb = hsbToRgb(h, s, b);
  // Using relative luminance formula from WCAG
  let rsRGB = rgb.r / 255;
  let gsRGB = rgb.g / 255;
  let bsRGB = rgb.b / 255;

  let rLinear =
    rsRGB <= 0.03928 ? rsRGB / 12.92 : pow((rsRGB + 0.055) / 1.055, 2.4);
  let gLinear =
    gsRGB <= 0.03928 ? gsRGB / 12.92 : pow((gsRGB + 0.055) / 1.055, 2.4);
  let bLinear =
    bsRGB <= 0.03928 ? bsRGB / 12.92 : pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

// Helper function to determine if text should be white or black based on background
function getTextColorForBackground(bgColor) {
  // Always return black text in HSB (0 saturation, 0 brightness = black)
  return { h: 0, s: 0, b: 0 };
}

function drawDescription() {
  // Draw description text on initial landing screen
  push();

  // Container settings
  let containerPadding = 12;
  let borderRadius = 4;
  let containerX = 40; // Left position
  let containerY = 40; // Top position
  let containerWidth = min(width - containerX * 2, 600) / 2; // Half width
  let innerWidth = containerWidth - containerPadding * 2; // Text area width

  // Text content
  let titleText = "a claw machine experience of my fav albums....ever";
  let descriptionText =
    "Explore a curated collection of album covers through an interactive claw machine experience. use the arrow keys to move the claw, press SPACE to drop and grab an album, or simply click on any album to view it.";

  // Set up title text style and calculate wrapping
  textSize(18);
  textLeading(22);
  textStyle(BOLD);
  let titleAscent = textAscent();
  let titleLines = wrapText(titleText, innerWidth);

  // Set up description text style and calculate wrapping
  textSize(13);
  textLeading(20);
  textStyle(NORMAL);
  let descAscent = textAscent();
  let descLines = wrapText(descriptionText, innerWidth);

  // Calculate container dimensions
  let titleHeight = titleLines.length * 22; // line height * number of lines
  let titleSpacing = 20;
  let descHeight = descLines.length * 20; // line height * number of lines
  let contentHeight = titleHeight + titleSpacing + descHeight;
  let containerHeight = contentHeight + containerPadding * 2;

  // Draw white background container
  fill(0, 0, 100, 100); // White in HSB
  noStroke();
  rect(containerX, containerY, containerWidth, containerHeight, borderRadius);

  // Get text color
  let bgColor = getBackgroundColorAtY(containerY);
  let textColor = getTextColorForBackground(bgColor);

  // Draw title
  textSize(18);
  textLeading(22);
  textStyle(BOLD);
  textAlign(LEFT);
  fill(textColor.h, textColor.s, textColor.b, 100);
  let titleY = containerY + containerPadding + titleAscent;
  for (let i = 0; i < titleLines.length; i++) {
    text(titleLines[i], containerX + containerPadding, titleY);
    titleY += 22;
  }

  // Draw description
  textSize(13);
  textLeading(20);
  textStyle(NORMAL);
  fill(textColor.h, textColor.s, max(0, textColor.b - 30), 90);
  let descY =
    containerY + containerPadding + titleHeight + titleSpacing + descAscent;
  for (let i = 0; i < descLines.length; i++) {
    text(descLines[i], containerX + containerPadding, descY);
    descY += 20;
  }

  pop();
}

// Helper function to wrap text to a given width
function wrapText(text, maxWidth) {
  let words = text.split(" ");
  let lines = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    let testLine = currentLine + (currentLine ? " " : "") + words[i];
    let testWidth = textWidth(testLine);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function drawDisplayedAlbum() {
  if (displayedAlbum === null) return;

  let album = albums[displayedAlbum];
  let dataIndex = album.dataIndex;
  let albumInfo = albumData[dataIndex];

  // Animate scale up
  displayScale = lerp(displayScale, displayTargetScale, 0.08);

  push();
  translate(width / 2, displayY);

  // Draw album cover with scaling
  if (albumImages[dataIndex] && albumImages[dataIndex].width > 0) {
    push();
    scale(displayScale);
    imageMode(CENTER);
    noTint();

    // Draw album image (no border, no shadow, 0px border radius)
    let scaledSize = album.size * 0.88;
    image(albumImages[dataIndex], 0, 0, scaledSize, scaledSize);

    pop();
  }

  // Draw album info below the cover
  let infoY = (album.size * displayScale * 0.88) / 2 + 30;

  // Calculate text Y position in screen coordinates
  let textY = displayY + infoY;

  // Get background color at text position and determine appropriate text color
  let bgColor = getBackgroundColorAtY(textY);
  let textColor = getTextColorForBackground(bgColor);

  // Album title
  fill(textColor.h, textColor.s, textColor.b, 100); // 100 = full opacity in 0-100 range
  textAlign(CENTER);
  textSize(13);
  textLeading(13);
  text(albumInfo.album, 0, infoY);

  // Artist
  textSize(13);
  textLeading(13);
  textStyle(NORMAL);
  // Use slightly darker shade for artist text (reduce brightness)
  let artistColor = {
    h: textColor.h,
    s: textColor.s,
    b: max(0, textColor.b - 20),
  };
  fill(artistColor.h, artistColor.s, artistColor.b, 100);
  text(albumInfo.artist, 0, infoY + 20);

  // Year and genre
  textSize(13);
  textLeading(13);
  // Use darker shade for year/genre text (reduce brightness more)
  let detailColor = {
    h: textColor.h,
    s: textColor.s,
    b: max(0, textColor.b - 40),
  };
  fill(detailColor.h, detailColor.s, detailColor.b, 100);
  text(`${albumInfo.year} • ${albumInfo.genre}`, 0, infoY + 40);

  pop();
}

function drawClaw() {
  push();

  // Draw cable/chain
  stroke(0, 0, 30, 60);
  strokeWeight(3);
  line(claw.x, claw.y, claw.x, claw.clawY);

  // Draw claw base (at top)
  fill(0, 0, 40, 80);
  noStroke();
  rectMode(CENTER);
  rect(claw.x, claw.y, 40, 20, 5);

  // Draw claw (at bottom)
  let clawSize = 30;
  // Claw is closed when grabbing or holding a displayed album
  let clawOpen =
    claw.state === "grabbing" || claw.state === "holding" ? 0.5 : 1.0;

  fill(0, 0, 50, 80);
  stroke(0, 0, 30, 100);
  strokeWeight(2);

  // Claw left
  push();
  translate(claw.x - clawSize / 2, claw.clawY);
  rotate((-PI / 6) * clawOpen);
  rect(0, 0, 8, 20, 2);
  pop();

  // Claw right
  push();
  translate(claw.x + clawSize / 2, claw.clawY);
  rotate((PI / 6) * clawOpen);
  rect(0, 0, 8, 20, 2);
  pop();

  // Claw center
  rect(claw.x, claw.clawY, 10, 15, 2);

  // Draw grabbed album if any (only if not yet displayed)
  if (claw.grabbedAlbum !== null && displayedAlbum === null) {
    let album = albums[claw.grabbedAlbum];
    let dataIndex = album.dataIndex;
    push();
    translate(claw.x, claw.clawY + 40);
    rotate(album.rotation);

    // Draw album image
    if (albumImages[dataIndex] && albumImages[dataIndex].width > 0) {
      imageMode(CENTER);
      noTint();
      image(albumImages[dataIndex], 0, 0, album.size * 0.88, album.size * 0.88);
    }

    pop();
  }

  pop();
}

function updateClaw() {
  // Move claw horizontally
  if (
    claw.state === "idle" ||
    claw.state === "moving" ||
    claw.state === "movingToCenter"
  ) {
    let dx = claw.targetX - claw.x;
    if (abs(dx) > 1) {
      claw.x += constrain(dx, -claw.speed, claw.speed);
      if (claw.state === "idle") {
        claw.state = "moving";
      }
      // Play movement sound with throttling
      if (
        frameCount - soundState.lastMoveSound >=
        soundState.moveSoundInterval
      ) {
        playMovementSound();
        soundState.lastMoveSound = frameCount;
      }
    } else {
      claw.x = claw.targetX;
      if (claw.state === "moving") {
        // Check if we should auto-grab
        if (claw.autoGrab) {
          claw.autoGrab = false;
          claw.state = "descending";
          claw.clawY = claw.y;
        } else {
          claw.state = "idle";
        }
      } else if (claw.state === "idle" && claw.autoGrab) {
        // If already at target position and autoGrab is set, start descending immediately
        claw.autoGrab = false;
        claw.state = "descending";
        claw.clawY = claw.y;
      } else if (claw.state === "movingToCenter") {
        // Reached center, now prepare to drop down and hold the album
        if (claw.grabbedAlbum !== null) {
          // Reset previously displayed album if any
          if (displayedAlbum !== null && displayedAlbum !== claw.grabbedAlbum) {
            albums[displayedAlbum].grabbed = false;
          }
          // Album was grabbed - move to middle and display
          displayedAlbum = claw.grabbedAlbum;
          displayScale = 1.0; // Start at normal scale
          displayY = height / 2; // Center in middle of screen
          albums[claw.grabbedAlbum].grabbed = true;
          selectedAlbum = claw.grabbedAlbum;
          // Keep the claw attached - don't set grabbedAlbum to null
          // Calculate target claw Y position (above the displayed album)
          let albumSize = albums[claw.grabbedAlbum].size * 0.88;
          claw.targetClawY = displayY - albumSize / 2 - 20; // 20px above album top
          // Start from top position and drop down
          claw.clawY = claw.y;
          claw.state = "holding"; // New state to keep claw attached
        } else {
          claw.state = "idle";
          claw.grabTimer = 0;
        }
      }
    }
  }

  // Handle claw states
  if (claw.state === "descending") {
    claw.clawY += 8;
    // Play clank sounds while descending (throttled)
    if (
      frameCount - soundState.lastClankSound >=
      soundState.clankSoundInterval
    ) {
      playClankSound();
      soundState.lastClankSound = frameCount;
    }
    if (claw.clawY >= claw.maxClawY) {
      claw.clawY = claw.maxClawY;
      claw.state = "grabbing";
      // Check for album collision
      checkAlbumGrab();
      // Reset grab sound flag when starting to grab
      soundState.grabSoundPlayed = false;
    }
  } else if (claw.state === "grabbing") {
    // Hold for a moment, then ascend
    claw.grabTimer++;
    if (claw.grabTimer > 30) {
      // ~0.5 seconds at 60fps
      claw.state = "ascending";
      claw.grabTimer = 0;
    }
  } else if (claw.state === "ascending") {
    claw.clawY -= 8;
    // Play clank sounds while ascending (throttled)
    if (
      frameCount - soundState.lastClankSound >=
      soundState.clankSoundInterval
    ) {
      playClankSound();
      soundState.lastClankSound = frameCount;
    }
    if (claw.clawY <= claw.y) {
      claw.clawY = claw.y;
      if (claw.grabbedAlbum !== null) {
        // After ascending, move to center position
        claw.targetX = width / 2;
        claw.state = "movingToCenter";
      } else {
        claw.state = "idle";
        claw.grabTimer = 0;
      }
    }
  } else if (claw.state === "holding") {
    // When holding a displayed album, drop down slightly to middle position
    if (displayedAlbum !== null) {
      // Update target claw Y position based on current display scale and position
      let albumSize = albums[displayedAlbum].size * 0.88 * displayScale;
      claw.targetClawY = displayY - albumSize / 2 - 20;

      // Smoothly drop claw down to target position
      let dy = claw.targetClawY - claw.clawY;
      if (abs(dy) > 2) {
        // Drop down at a moderate speed
        claw.clawY += constrain(dy * 0.15, -8, 8);
      } else {
        claw.clawY = claw.targetClawY;
      }

      // Keep claw at center
      claw.x = width / 2;
      claw.targetX = width / 2;
    }
  }
}

function checkAlbumGrab() {
  // Check if claw is over any album
  for (let i = 0; i < albums.length; i++) {
    if (albums[i].grabbed) continue;

    let distance = dist(claw.x, claw.clawY, albums[i].x, albums[i].y);
    if (distance < albums[i].size * 0.6) {
      // Grab this album
      claw.grabbedAlbum = i;
      // Play grab sound when successfully picking up an album
      if (!soundState.grabSoundPlayed) {
        playGrabSound();
        soundState.grabSoundPlayed = true;
      }
      break;
    }
  }
}

function drawInfoPanel() {
  // Draw panel background
  push();
  translate(0, height);

  fill(240, 5, 96, 95);
  noStroke();
  rect(0, 0, width, infoPanelHeight);

  // Draw border
  stroke(240, 5, 80, 60);
  strokeWeight(2);
  line(0, 0, width, 0);

  if (selectedAlbum !== null) {
    let albumIndex = selectedAlbum; // This is the index in albums array
    let dataIndex = albums[albumIndex].dataIndex; // Get the original albumData index
    let album = albumData[dataIndex];

    // Draw album cover (small)
    push();
    translate(30, infoPanelHeight / 2);

    if (albumImages[dataIndex] && albumImages[dataIndex].width > 0) {
      imageMode(CENTER);
      noTint();
      image(albumImages[dataIndex], 0, 0, 120, 120);
    }
    pop();

    // Get background color at text position and determine appropriate text color
    // Info panel has fixed light background, but check to be safe
    let bgColor = { h: 240, s: 5, b: 96 }; // Info panel background color
    let textColor = getTextColorForBackground(bgColor);

    // Draw text info
    fill(textColor.h, textColor.s, textColor.b, 100);
    textAlign(CENTER);
    textSize(13);
    textLeading(13);
    textStyle(BOLD);
    text(album.album, width / 2, 50);

    textSize(13);
    textLeading(13);
    textStyle(NORMAL);
    // Use slightly darker shade for artist text (reduce brightness)
    let artistColor = {
      h: textColor.h,
      s: textColor.s,
      b: max(0, textColor.b - 20),
    };
    fill(artistColor.h, artistColor.s, artistColor.b, 100);
    text(album.artist, width / 2, 70);

    textSize(13);
    textLeading(13);
    // Use darker shade for year/genre text (reduce brightness more)
    let detailColor = {
      h: textColor.h,
      s: textColor.s,
      b: max(0, textColor.b - 40),
    };
    fill(detailColor.h, detailColor.s, detailColor.b, 100);
    text(`${album.year} • ${album.genre}`, width / 2, 90);
  } else {
    // Instructions
    let bgColor = { h: 240, s: 5, b: 96 }; // Info panel background color
    let textColor = getTextColorForBackground(bgColor);
    fill(textColor.h, textColor.s, textColor.b, 80); // Slightly transparent for instructions
    textAlign(CENTER);
    textSize(13);
    textLeading(13);
    text(
      "Use ← → arrow keys to move the claw, SPACE to drop and grab an album",
      width / 2,
      infoPanelHeight / 2
    );
  }

  pop();
}

function keyPressed() {
  if (keyCode === LEFT_ARROW || key === "a" || key === "A") {
    if (claw.state === "idle" || claw.state === "moving") {
      claw.targetX = constrain(claw.targetX - 50, 20, width - 20);
    }
  } else if (keyCode === RIGHT_ARROW || key === "d" || key === "D") {
    if (claw.state === "idle" || claw.state === "moving") {
      claw.targetX = constrain(claw.targetX + 50, 20, width - 20);
    }
  } else if (key === " " || keyCode === 32) {
    // Spacebar to drop claw
    if (claw.state === "idle" || claw.state === "moving") {
      // Check if claw is already positioned over an album
      let albumUnderClaw = null;
      for (let i = 0; i < albums.length; i++) {
        if (albums[i].grabbed) continue;
        let distance = dist(claw.x, claw.y, albums[i].x, albums[i].y);
        if (distance < albums[i].size * 0.6) {
          albumUnderClaw = i;
          break;
        }
      }

      if (albumUnderClaw !== null) {
        // If over an album, select it (which will trigger grab sequence)
        selectAlbum(albumUnderClaw);
      } else {
        // Otherwise, just drop the claw
        claw.state = "descending";
        claw.clawY = claw.y;
      }
    }
  } else if (key === "r" || key === "R") {
    // Reset selected album
    if (selectedAlbum !== null) {
      albums[selectedAlbum].grabbed = false;
      selectedAlbum = null;
      displayedAlbum = null;
      displayScale = 1.0;
      // Release the claw
      if (claw.grabbedAlbum !== null) {
        claw.grabbedAlbum = null;
      }
      claw.state = "idle";
      claw.clawY = claw.y;
    }
  }

  return false; // Prevent default behavior
}

function mousePressed() {
  // Check if displayed album was clicked
  if (displayedAlbumHovered && displayedAlbum !== null) {
    dropAlbum();
    return;
  }

  // Check if an album was clicked
  if (hoveredAlbum !== null && !albums[hoveredAlbum].grabbed) {
    // Select the album directly (same as claw machine selection)
    selectAlbum(hoveredAlbum);
  }
}

function checkDisplayedAlbumHover() {
  displayedAlbumHovered = false;

  if (displayedAlbum !== null) {
    let album = albums[displayedAlbum];
    let albumSize = album.size * 0.88 * displayScale;
    let halfSize = albumSize / 2;

    // Check if mouse is within the displayed album bounds
    let dx = mouseX - width / 2;
    let dy = mouseY - displayY;
    let distance = sqrt(dx * dx + dy * dy);

    // Check if within album bounds (accounting for scale)
    if (distance < halfSize) {
      displayedAlbumHovered = true;
    }
  }
}

function dropAlbum() {
  if (displayedAlbum === null) return;

  let albumIndex = displayedAlbum;
  let album = albums[albumIndex];

  // Initialize falling animation
  fallingAlbum.active = true;
  fallingAlbum.albumIndex = albumIndex;

  // Start from current displayed position (center of screen)
  fallingAlbum.x = width / 2;
  // Use displayY if valid, otherwise use center of screen
  fallingAlbum.y = displayY > 0 ? displayY : height / 2;
  fallingAlbum.vx = random(-1, 1); // Initial horizontal velocity for natural movement
  fallingAlbum.vy = 0; // Start with no vertical velocity
  fallingAlbum.scale = displayScale > 1 ? displayScale : 4.0; // Start at current display scale or default
  fallingAlbum.targetScale = 1.0; // Target is normal size
  fallingAlbum.rotation = album.rotation || 0;
  fallingAlbum.rotationSpeed = random(-0.02, 0.02); // Rotation speed
  fallingAlbum.bounceCount = 0; // Reset bounce count
  fallingAlbum.settled = false; // Reset settled flag

  // Calculate target position (random among other albums)
  let bottomY = height - tileSize / 2;
  let albumAreaWidth = width - padding * 2;
  let albumCount = albums.length;
  let albumSpacing = albumCount > 0 ? albumAreaWidth / albumCount : 0;

  // Choose a random position among the album slots
  let randomSlot = floor(random(0, albumCount));
  fallingAlbum.targetX = padding + randomSlot * albumSpacing + albumSpacing / 2;
  fallingAlbum.targetY = bottomY;

  // Reset displayed album state (but keep album grabbed until animation completes)
  displayedAlbum = null;
  displayScale = 1.0;
  selectedAlbum = null;

  // Keep album grabbed during fall so it doesn't appear in regular album drawing
  album.grabbed = true;

  // Release the claw
  claw.grabbedAlbum = null;
  claw.state = "idle";
  claw.clawY = claw.y;
}

function updateFallingAlbum() {
  if (!fallingAlbum.active) return;

  let album = albums[fallingAlbum.albumIndex];
  let albumSize = album.size * 0.88 * fallingAlbum.scale;
  let bottomY = height - tileSize / 2;
  let bounceDamping = 0.6; // Energy loss on bounce (0.6 = 60% of velocity retained)
  let minVelocity = 0.5; // Minimum velocity before settling

  // Apply gravity
  fallingAlbum.vy += 0.3;

  // Limit max velocity
  let maxVelocity = 12;
  fallingAlbum.vy = constrain(fallingAlbum.vy, -maxVelocity, maxVelocity);
  fallingAlbum.vx = constrain(fallingAlbum.vx, -maxVelocity, maxVelocity);

  // Update position
  fallingAlbum.x += fallingAlbum.vx;
  fallingAlbum.y += fallingAlbum.vy;

  // Check for wall collisions (left and right)
  let halfSize = albumSize / 2;
  if (fallingAlbum.x - halfSize < padding) {
    fallingAlbum.x = padding + halfSize;
    fallingAlbum.vx = -fallingAlbum.vx * bounceDamping;
    fallingAlbum.bounceCount++;
  } else if (fallingAlbum.x + halfSize > width - padding) {
    fallingAlbum.x = width - padding - halfSize;
    fallingAlbum.vx = -fallingAlbum.vx * bounceDamping;
    fallingAlbum.bounceCount++;
  }

  // Check for bottom collision
  if (fallingAlbum.y + halfSize >= bottomY) {
    fallingAlbum.y = bottomY - halfSize;

    // Bounce if velocity is significant
    if (abs(fallingAlbum.vy) > minVelocity) {
      fallingAlbum.vy = -fallingAlbum.vy * bounceDamping;
      fallingAlbum.bounceCount++;

      // Add some horizontal velocity variation on bounce
      fallingAlbum.vx += random(-1, 1);
    } else {
      // Low velocity - stop vertical movement
      fallingAlbum.vy = 0;
    }
  }

  // Check for collisions with other albums
  for (let i = 0; i < albums.length; i++) {
    if (i === fallingAlbum.albumIndex || albums[i].grabbed) continue;

    let otherAlbum = albums[i];
    let dx = fallingAlbum.x - otherAlbum.x;
    let dy = fallingAlbum.y - otherAlbum.y;
    let distance = sqrt(dx * dx + dy * dy);
    let minDistance = albumSize / 2 + otherAlbum.size / 2;

    if (distance < minDistance && distance > 0) {
      // Collision detected - push apart and bounce
      let angle = atan2(dy, dx);
      let overlap = minDistance - distance;

      // Separate the albums
      fallingAlbum.x += cos(angle) * overlap * 0.5;
      fallingAlbum.y += sin(angle) * overlap * 0.5;

      // Calculate bounce (reflect velocity along collision normal)
      let relativeVx = fallingAlbum.vx;
      let relativeVy = fallingAlbum.vy;
      let dotProduct = relativeVx * cos(angle) + relativeVy * sin(angle);

      // Reflect velocity
      fallingAlbum.vx -= 2 * dotProduct * cos(angle) * bounceDamping;
      fallingAlbum.vy -= 2 * dotProduct * sin(angle) * bounceDamping;

      fallingAlbum.bounceCount++;
    }
  }

  // Check if album should settle (low velocity and on bottom)
  let totalVelocity = sqrt(
    fallingAlbum.vx * fallingAlbum.vx + fallingAlbum.vy * fallingAlbum.vy
  );
  let isOnBottom = fallingAlbum.y + halfSize >= bottomY - 2;

  if (
    !fallingAlbum.settled &&
    isOnBottom &&
    totalVelocity < minVelocity &&
    fallingAlbum.bounceCount > 0
  ) {
    // Album has naturally settled - keep it where it is
    fallingAlbum.settled = true;
    fallingAlbum.targetX = fallingAlbum.x; // Set target to current position
  }

  // If settled, stop all movement and finalize
  if (fallingAlbum.settled) {
    // Gradually stop all movement
    fallingAlbum.vx *= 0.9;
    fallingAlbum.vy = 0;

    // When movement has stopped, finalize
    if (abs(fallingAlbum.vx) < 0.1) {
      fallingAlbum.vx = 0;
      fallingAlbum.vy = 0;
      fallingAlbum.active = false;

      // Reset the album state - keep it where it naturally landed
      album.grabbed = false;
      album.x = fallingAlbum.x; // Keep the natural landing position
      album.y = bottomY;
      album.targetX = fallingAlbum.x; // Update target to match
      album.rotation = fallingAlbum.rotation;
      album.rotationSpeed = random(-0.01, 0.01);

      // Don't rearrange - let albums stay where they naturally settled
    }
  }

  // Update rotation
  fallingAlbum.rotation += fallingAlbum.rotationSpeed;

  // Smooth scale down animation
  fallingAlbum.scale = lerp(fallingAlbum.scale, fallingAlbum.targetScale, 0.03);

  // Apply friction/damping
  fallingAlbum.vx *= 0.98;
  fallingAlbum.rotationSpeed *= 0.99;
}

function updateAlbumReactions() {
  if (!fallingAlbum.active) return;

  let fallingAlbumSize =
    albums[fallingAlbum.albumIndex].size * 0.88 * fallingAlbum.scale;
  let fallingHalfSize = fallingAlbumSize / 2;
  let bottomY = height - tileSize / 2;
  let reactionDistance = tileSize * 1.5; // Distance at which albums start reacting
  let pushStrength = 0.15; // How strongly albums push away
  let returnStrength = 0.08; // How quickly albums return to their positions

  // Initialize target positions if not set
  for (let i = 0; i < albums.length; i++) {
    if (!albums[i].targetX) {
      albums[i].targetX = albums[i].x;
    }
  }

  for (let i = 0; i < albums.length; i++) {
    if (i === fallingAlbum.albumIndex || albums[i].grabbed) continue;

    let album = albums[i];
    let albumHalfSize = album.size / 2;

    // Calculate distance to falling album
    let dx = album.x - fallingAlbum.x;
    let dy = album.y - fallingAlbum.y;
    let distance = sqrt(dx * dx + dy * dy);
    let minDistance = fallingHalfSize + albumHalfSize;

    // Check if falling album is near (especially when it's close to the bottom)
    let fallingNearBottom =
      fallingAlbum.y + fallingHalfSize > bottomY - tileSize;
    let isNearFalling = distance < reactionDistance && fallingNearBottom;

    if (isNearFalling && distance > 0) {
      // Push away from falling album
      let angle = atan2(dy, dx);
      let pushDistance = reactionDistance - distance;
      let pushAmount = pushDistance * pushStrength;

      // Calculate new target position (push away)
      let newTargetX = album.x + cos(angle) * pushAmount;

      // Constrain to valid area
      newTargetX = constrain(
        newTargetX,
        padding + albumHalfSize,
        width - padding - albumHalfSize
      );

      // Smoothly move towards new target
      album.targetX = newTargetX;
    } else if (!fallingAlbum.settled) {
      // Only try to return to evenly-spaced positions if falling album hasn't settled yet
      // Once settled, albums stay where they naturally ended up
      let albumAreaWidth = width - padding * 2;
      let albumCount = albums.length;
      let albumSpacing = albumCount > 0 ? albumAreaWidth / albumCount : 0;
      let originalX = padding + i * albumSpacing + albumSpacing / 2;

      // Smoothly return to original position
      album.targetX = lerp(album.targetX, originalX, returnStrength);
    }
    // If falling album is settled, don't change targetX - let albums stay where they are

    // Also check for collisions with other albums and push them apart
    for (let j = i + 1; j < albums.length; j++) {
      if (j === fallingAlbum.albumIndex || albums[j].grabbed) continue;

      let otherAlbum = albums[j];
      let otherHalfSize = otherAlbum.size / 2;

      let dx2 = album.x - otherAlbum.x;
      let distance2 = abs(dx2);
      let minDistance2 = albumHalfSize + otherHalfSize;

      if (distance2 < minDistance2 && distance2 > 0) {
        // Albums are overlapping - push them apart
        let overlap = minDistance2 - distance2;
        let pushAmount2 = overlap * 0.5;

        if (dx2 > 0) {
          // album is to the right of otherAlbum
          album.targetX += pushAmount2;
          otherAlbum.targetX -= pushAmount2;
        } else {
          // album is to the left of otherAlbum
          album.targetX -= pushAmount2;
          otherAlbum.targetX += pushAmount2;
        }

        // Constrain both
        album.targetX = constrain(
          album.targetX,
          padding + albumHalfSize,
          width - padding - albumHalfSize
        );
        otherAlbum.targetX = constrain(
          otherAlbum.targetX,
          padding + otherHalfSize,
          width - padding - otherHalfSize
        );
      }
    }

    // Smoothly move album towards target position
    let dx3 = album.targetX - album.x;
    if (abs(dx3) > 0.1) {
      album.x += dx3 * 0.2; // Smooth movement
    } else {
      album.x = album.targetX;
    }
  }
}

function findEmptySpot(preferredX) {
  // Find the nearest empty spot to the preferred X position
  let bottomY = height - tileSize / 2;
  let albumAreaWidth = width - padding * 2;
  let albumCount = albums.length;
  let albumSpacing = albumCount > 0 ? albumAreaWidth / albumCount : 0;

  // Get all occupied positions
  let occupiedPositions = [];
  for (let i = 0; i < albums.length; i++) {
    if (i !== fallingAlbum.albumIndex && !albums[i].grabbed) {
      occupiedPositions.push(albums[i].x);
    }
  }

  // Try to find a spot near preferredX
  let bestX = preferredX;
  let minDistance = Infinity;

  // Check all possible slot positions
  for (let i = 0; i < albumCount; i++) {
    let slotX = padding + i * albumSpacing + albumSpacing / 2;

    // Check if this slot is too close to any occupied position
    let tooClose = false;
    for (let occupiedX of occupiedPositions) {
      if (abs(slotX - occupiedX) < tileSize * 0.8) {
        tooClose = true;
        break;
      }
    }

    if (!tooClose) {
      let distance = abs(slotX - preferredX);
      if (distance < minDistance) {
        minDistance = distance;
        bestX = slotX;
      }
    }
  }

  // If no good spot found, use preferredX
  return bestX;
}

function drawFallingAlbum() {
  if (!fallingAlbum.active) return;

  let album = albums[fallingAlbum.albumIndex];
  let dataIndex = album.dataIndex;

  push();
  translate(fallingAlbum.x, fallingAlbum.y);
  rotate(fallingAlbum.rotation);
  scale(fallingAlbum.scale);

  // Draw album cover image
  if (albumImages[dataIndex] && albumImages[dataIndex].width > 0) {
    imageMode(CENTER);
    noTint();
    let scaledSize = album.size * 0.88;
    image(albumImages[dataIndex], 0, 0, scaledSize, scaledSize);
  }

  pop();
}

function rearrangeAlbums() {
  // Calculate new positions for all albums
  let albumCount = albums.length;
  let albumAreaWidth = width - padding * 2;
  let albumSpacing = albumCount > 0 ? albumAreaWidth / albumCount : 0;
  let bottomY = height - tileSize / 2;

  // Update positions for all albums
  for (let j = 0; j < albums.length; j++) {
    let newX = padding + j * albumSpacing + albumSpacing / 2;
    albums[j].x = newX;
    albums[j].targetX = newX; // Update target position as well
    albums[j].y = bottomY;
  }
}

function selectAlbum(index) {
  // Reset previously displayed album if any
  if (displayedAlbum !== null && displayedAlbum !== index) {
    albums[displayedAlbum].grabbed = false;
    displayedAlbum = null;
    displayScale = 1.0;
  }

  // Animate claw to move to the selected album position, then grab and move to center
  claw.targetX = albums[index].x;
  claw.autoGrab = true; // Set flag to auto-grab when reaching position

  // If claw is already at or very close to target position, start descending immediately
  if (
    abs(claw.x - claw.targetX) <= 1 &&
    (claw.state === "idle" || claw.state === "moving")
  ) {
    claw.x = claw.targetX;
    claw.state = "descending";
    claw.clawY = claw.y;
    claw.autoGrab = false; // Clear flag since we're starting immediately
  } else if (claw.state === "idle" || claw.state === "moving") {
    claw.state = "moving";
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Update claw max Y - extend fully to reach albums at bottom
  claw.maxClawY = height - tileSize / 2 + 20; // Extend slightly past album center

  // Update display Y position
  if (displayedAlbum !== null) {
    displayY = height / 2;
    // Update claw target Y position
    if (claw.state === "holding") {
      let albumSize = albums[displayedAlbum].size * 0.88 * displayScale;
      claw.targetClawY = displayY - albumSize / 2 - 20;
    }
  }

  // Reposition albums at bottom
  let validAlbumCount = albums.length;
  let albumAreaWidth = width - padding * 2;
  let albumSpacing = validAlbumCount > 0 ? albumAreaWidth / validAlbumCount : 0;
  // Position albums so their bottom edge sits at the very bottom of the screen (overlapping info panel)
  let bottomY = height - tileSize / 2;

  for (let j = 0; j < albums.length; j++) {
    let newX = padding + j * albumSpacing + albumSpacing / 2;
    albums[j].x = newX;
    if (!albums[j].targetX) albums[j].targetX = newX;
    albums[j].targetX = newX; // Update target position
    albums[j].y = bottomY;
  }
}
