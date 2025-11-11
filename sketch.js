// Claw Machine Album Archive - Pattern, Rhythm, Movement
// Using HSB color mode for color variations

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
  state: 'idle', // 'idle', 'moving', 'descending', 'grabbing', 'ascending', 'movingToCenter', 'holding'
  grabbedAlbum: null,
  clawY: 0,
  maxClawY: 0,
  grabTimer: 0,
  autoGrab: false, // Flag to auto-grab when reaching target position
  targetClawY: 0 // Target Y position for claw when holding displayed album
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
  settled: false // Whether the album has settled into place
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
    genre: "R&B, Neo-Soul"
  },
  { 
    name: "King Krule - The OOZ", 
    file: "king krule - the ooz.webp",
    artist: "King Krule",
    album: "The OOZ",
    year: "2017",
    genre: "Alternative, Art Rock"
  },
  { 
    name: "Prince - Self Titled", 
    file: "prince - prince.webp",
    artist: "Prince",
    album: "Prince",
    year: "1979",
    genre: "Funk, R&B, Pop"
  },
  { 
    name: "Earl Sweatshirt - Some Rap Songs", 
    file: "earl sweatshirt - some rap songs.webp",
    artist: "Earl Sweatshirt",
    album: "Some Rap Songs",
    year: "2018",
    genre: "Hip-Hop, Abstract Rap"
  },
  { 
    name: "MIKE - Tears of Joy", 
    file: "mike - tears of joy.webp",
    artist: "MIKE",
    album: "Tears of Joy",
    year: "2019",
    genre: "Hip-Hop, Abstract Rap"
  },
  { 
    name: "Standing on the Corner - Red Burns", 
    file: "sotc - red burns.jpg",
    artist: "Standing on the Corner",
    album: "Red Burns",
    year: "2017",
    genre: "Experimental, Jazz, Hip-Hop"
  },
  { 
    name: "Alex G - Rocket", 
    file: "alex g - rocket.webp",
    artist: "Alex G",
    album: "Rocket",
    year: "2017",
    genre: "Indie Rock, Lo-Fi"
  },
  { 
    name: "Sun Kil Moon - Benji", 
    file: "sun kil moon - benji.webp",
    artist: "Sun Kil Moon",
    album: "Benji",
    year: "2014",
    genre: "Folk, Indie Rock"
  },
  { 
    name: "Blu - Her Favorite Color", 
    file: "blu - her favorite color.jpg",
    artist: "Blu",
    album: "Her Favorite Color",
    year: "2011",
    genre: "Hip-Hop, Alternative Rap"
  },
  { 
    name: "Stevie Wonder - Songs in the Key of Life", 
    file: "stevie wonder - songs in the key of life.webp",
    artist: "Stevie Wonder",
    album: "Songs in the Key of Life",
    year: "1976",
    genre: "Soul, Funk, R&B"
  },
  { 
    name: "Blue Iverson - Hotep", 
    file: "hotep-blue-iverson.webp",
    artist: "Blue Iverson",
    album: "Hotep",
    year: "2020",
    genre: "Hip-Hop"
  },
  { 
    name: "SWV - It's About Time", 
    file: "It's_About_Time_(SWV_album).jpeg",
    artist: "SWV",
    album: "It's About Time",
    year: "1992",
    genre: "R&B, New Jack Swing"
  },
  { 
    name: "Fly Anakin & Koncept Jack$on - Chapel Drive", 
    file: "koncept jackson and fly anakin - chapel drive.jpg",
    artist: "Fly Anakin & Koncept Jack$on",
    album: "Chapel Drive",
    year: "2020",
    genre: "Hip-Hop"
  },
  { 
    name: "Navy Blue - Ada Irin", 
    file: "navy blue - ada irin.jpg",
    artist: "Navy Blue",
    album: "Ada Irin",
    year: "2020",
    genre: "Hip-Hop, Abstract Rap"
  },
  { 
    name: "Drake - Views", 
    file: "drake - views.webp",
    artist: "Drake",
    album: "Views",
    year: "2016",
    genre: "Hip-Hop, R&B, Pop"
  }
];

function preload() {
  // Load album cover images from album-covers folder
  for (let i = 0; i < albumData.length; i++) {
    let img = loadImage(`album-covers/${albumData[i].file}`, 
      () => console.log(`Loaded: ${albumData[i].name}`),
      () => console.log(`Failed to load: ${albumData[i].file}`)
    );
    albumImages.push(img);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB, 255, 255, 255, 100);
  
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
  claw.maxClawY = height - (tileSize / 2) + 20; // Extend slightly past album center
  
  // Filter out albums with missing/invalid images
  validAlbumIndices = [];
  for (let i = 0; i < albumData.length; i++) {
    // Check if image exists and has valid dimensions
    if (albumImages[i] && albumImages[i].width > 0 && albumImages[i].height > 0) {
      validAlbumIndices.push(i);
    } else {
      console.log(`Skipping album ${albumData[i].name} - image not loaded`);
    }
  }
  
  // Calculate album positions at bottom of screen
  // Only use albums with valid images
  let validAlbumCount = validAlbumIndices.length;
  let albumAreaWidth = width - (padding * 2);
  let albumSpacing = validAlbumCount > 0 ? albumAreaWidth / validAlbumCount : 0;
  // Position albums so their bottom edge sits at the very bottom of the screen (overlapping info panel)
  let bottomY = height - (tileSize / 2);
  
  // Initialize albums at bottom (only for valid images)
  for (let j = 0; j < validAlbumIndices.length; j++) {
    let i = validAlbumIndices[j]; // Original albumData index
    let x = padding + (j * albumSpacing) + (albumSpacing / 2);
    
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
      targetX: x // Target X position for reactive movement
    });
  }
  
  // Extract colors from album covers after a brief delay to ensure images are loaded
  setTimeout(() => {
    for (let j = 0; j < albums.length; j++) {
      let i = albums[j].dataIndex;
      if (albumImages[i] && albumImages[i].width > 0 && !albums[j].colorsExtracted) {
        extractAlbumColors(j);
        albums[j].colorsExtracted = true;
      }
    }
  }, 100);
}

function draw() {
  // Transparent background so CSS gradient shows through
  clear();
  
  time += 0.02;
  
  // Gradient background is now handled by CSS on body/html
  // drawPatternBackground();
  
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

function drawPatternBackground() {
  // Draw gradient background based on selected album's color palette
  push();
  noStroke();
  
  // Determine which album's colors to use
  let palette = [];
  
  if (displayedAlbum !== null) {
    // Use displayed album's full color palette
    let album = albums[displayedAlbum];
    palette = album.colorPalette && album.colorPalette.length > 0 
      ? album.colorPalette 
      : [album.dominantColor || {r: 200, g: 200, b: 220}, 
         album.secondaryColor || {r: 180, g: 180, b: 200}];
  } else if (selectedAlbum !== null) {
    // Use selected album's full color palette
    let album = albums[selectedAlbum];
    palette = album.colorPalette && album.colorPalette.length > 0 
      ? album.colorPalette 
      : [album.dominantColor || {r: 200, g: 200, b: 220}, 
         album.secondaryColor || {r: 180, g: 180, b: 200}];
  } else {
    // Default light gradient
    palette = [{r: 250, g: 250, b: 255}, {r: 245, g: 245, b: 250}];
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
    
    let r = lerp(color1.r, color2.r, t);
    let g = lerp(color1.g, color2.g, t);
    let b = lerp(color1.b, color2.b, t);
    
    // Set color for entire row
    for (let x = 0; x < width; x++) {
      let index = (y * width + x) * 4;
      pixels[index] = r;
      pixels[index + 1] = g;
      pixels[index + 2] = b;
      pixels[index + 3] = 255;
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
          samples.push({ r, g, b });
        }
      }
    }
  }
  
  // Cluster similar colors and get distinct palette
  let palette = extractDistinctColors(samples, 5); // Get 5 distinct colors
  
  // Sort colors by brightness and saturation for better gradient
  palette.sort((a, b) => {
    let brightnessA = (a.r + a.g + a.b) / 3;
    let brightnessB = (b.r + b.g + b.b) / 3;
    return brightnessB - brightnessA; // Sort by brightness (brightest first)
  });
  
  // Store full palette
  albums[albumIndex].colorPalette = palette;
  
  // Keep dominant and secondary for backward compatibility
  albums[albumIndex].dominantColor = palette[0] || {r: 200, g: 200, b: 220};
  albums[albumIndex].secondaryColor = palette[palette.length - 1] || {r: 180, g: 180, b: 200};
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
      r: samples[idx].r,
      g: samples[idx].g,
      b: samples[idx].b,
      count: 0
    });
  }
  
  // Assign samples to nearest cluster
  for (let sample of samples) {
    let minDist = Infinity;
    let nearestCluster = 0;
    
    for (let i = 0; i < clusters.length; i++) {
      let dr = sample.r - clusters[i].r;
      let dg = sample.g - clusters[i].g;
      let db = sample.b - clusters[i].b;
      let dist = sqrt(dr * dr + dg * dg + db * db);
      
      if (dist < minDist) {
        minDist = dist;
        nearestCluster = i;
      }
    }
    
    // Update cluster center (running average)
    clusters[nearestCluster].count++;
    let n = clusters[nearestCluster].count;
    clusters[nearestCluster].r = (clusters[nearestCluster].r * (n - 1) + sample.r) / n;
    clusters[nearestCluster].g = (clusters[nearestCluster].g * (n - 1) + sample.g) / n;
    clusters[nearestCluster].b = (clusters[nearestCluster].b * (n - 1) + sample.b) / n;
  }
  
  // Return cluster centers as colors
  return clusters.map(c => ({ r: floor(c.r), g: floor(c.g), b: floor(c.b) }));
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
    let color1 = album.dominantColor || {r: 200, g: 200, b: 220};
    let color2 = album.secondaryColor || {r: 180, g: 180, b: 200};
    
    // Draw album cover image (just the square, no borders)
    if (albumImages[i] && albumImages[i].width > 0) {
      imageMode(CENTER);
      noTint();
      image(albumImages[i], 0, 0, album.size, album.size);
    } else {
      // Placeholder (shouldn't happen since we filter these out)
      fill(100, 100, 100, 50);
      noStroke();
      rectMode(CENTER);
      rect(0, 0, album.size, album.size);
      
      fill(50, 50, 50, 200);
      textAlign(CENTER, CENTER);
      textSize(13);
      textLeading(13);
      text(albumData[i].name.split(' - ')[0], 0, 0);
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
    palette = album.colorPalette && album.colorPalette.length > 0 
      ? album.colorPalette 
      : [album.dominantColor || {r: 200, g: 200, b: 220}, 
         album.secondaryColor || {r: 180, g: 180, b: 200}];
  } else if (selectedAlbum !== null) {
    let album = albums[selectedAlbum];
    palette = album.colorPalette && album.colorPalette.length > 0 
      ? album.colorPalette 
      : [album.dominantColor || {r: 200, g: 200, b: 220}, 
         album.secondaryColor || {r: 180, g: 180, b: 200}];
  } else {
    palette = [{r: 250, g: 250, b: 255}, {r: 245, g: 245, b: 250}];
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
  
  // Interpolate between adjacent colors
  let color1 = palette[colorIndexFloor];
  let color2 = palette[colorIndexCeil];
  
  return {
    r: lerp(color1.r, color2.r, t),
    g: lerp(color1.g, color2.g, t),
    b: lerp(color1.b, color2.b, t)
  };
}

// Helper function to calculate luminance (perceived brightness)
function getLuminance(r, g, b) {
  // Using relative luminance formula from WCAG
  let rsRGB = r / 255;
  let gsRGB = g / 255;
  let bsRGB = b / 255;
  
  let rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : pow((rsRGB + 0.055) / 1.055, 2.4);
  let gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : pow((gsRGB + 0.055) / 1.055, 2.4);
  let bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

// Helper function to determine if text should be white or black based on background
function getTextColorForBackground(bgColor) {
  // Always return black text
  return {r: 0, g: 0, b: 0};
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
  fill(textColor.r, textColor.g, textColor.b, 255);
  textAlign(CENTER);
  textSize(13);
  textLeading(13);
  textStyle(BOLD);
  text(albumInfo.album, 0, infoY);
  
  // Artist
  textSize(13);
  textLeading(13);
  textStyle(NORMAL);
  // Use slightly lighter/darker shade for artist text
  let artistColor = textColor.r > 128 
    ? {r: max(0, textColor.r - 20), g: max(0, textColor.g - 20), b: max(0, textColor.b - 20)}
    : {r: min(255, textColor.r + 20), g: min(255, textColor.g + 20), b: min(255, textColor.b + 20)};
  fill(artistColor.r, artistColor.g, artistColor.b, 255);
  text(albumInfo.artist, 0, infoY + 20);
  
  // Year and genre
  textSize(13);
  textLeading(13);
  // Use slightly lighter/darker shade for year/genre text
  let detailColor = textColor.r > 128 
    ? {r: max(0, textColor.r - 40), g: max(0, textColor.g - 40), b: max(0, textColor.b - 40)}
    : {r: min(255, textColor.r + 40), g: min(255, textColor.g + 40), b: min(255, textColor.b + 40)};
  fill(detailColor.r, detailColor.g, detailColor.b, 255);
  text(`${albumInfo.year} • ${albumInfo.genre}`, 0, infoY + 40);
  
  pop();
}

function drawClaw() {
  push();
  
  // Draw cable/chain
  stroke(80, 80, 80, 150);
  strokeWeight(3);
  line(claw.x, claw.y, claw.x, claw.clawY);
  
  // Draw claw base (at top)
  fill(100, 100, 100, 200);
  noStroke();
  rectMode(CENTER);
  rect(claw.x, claw.y, 40, 20, 5);
  
  // Draw claw (at bottom)
  let clawSize = 30;
  // Claw is closed when grabbing or holding a displayed album
  let clawOpen = (claw.state === 'grabbing' || claw.state === 'holding') ? 0.5 : 1.0;
  
  fill(120, 120, 120, 200);
  stroke(80, 80, 80, 255);
  strokeWeight(2);
  
  // Claw left
  push();
  translate(claw.x - clawSize/2, claw.clawY);
  rotate(-PI/6 * clawOpen);
  rect(0, 0, 8, 20, 2);
  pop();
  
  // Claw right
  push();
  translate(claw.x + clawSize/2, claw.clawY);
  rotate(PI/6 * clawOpen);
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
  if (claw.state === 'idle' || claw.state === 'moving' || claw.state === 'movingToCenter') {
    let dx = claw.targetX - claw.x;
    if (abs(dx) > 1) {
      claw.x += constrain(dx, -claw.speed, claw.speed);
      if (claw.state === 'idle') {
        claw.state = 'moving';
      }
    } else {
      claw.x = claw.targetX;
      if (claw.state === 'moving') {
        // Check if we should auto-grab
        if (claw.autoGrab) {
          claw.autoGrab = false;
          claw.state = 'descending';
          claw.clawY = claw.y;
        } else {
          claw.state = 'idle';
        }
      } else if (claw.state === 'idle' && claw.autoGrab) {
        // If already at target position and autoGrab is set, start descending immediately
        claw.autoGrab = false;
        claw.state = 'descending';
        claw.clawY = claw.y;
      } else if (claw.state === 'movingToCenter') {
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
          claw.targetClawY = displayY - (albumSize / 2) - 20; // 20px above album top
          // Start from top position and drop down
          claw.clawY = claw.y;
          claw.state = 'holding'; // New state to keep claw attached
        } else {
          claw.state = 'idle';
          claw.grabTimer = 0;
        }
      }
    }
  }
  
  // Handle claw states
  if (claw.state === 'descending') {
    claw.clawY += 8;
    if (claw.clawY >= claw.maxClawY) {
      claw.clawY = claw.maxClawY;
      claw.state = 'grabbing';
      // Check for album collision
      checkAlbumGrab();
    }
  } else if (claw.state === 'grabbing') {
    // Hold for a moment, then ascend
    claw.grabTimer++;
    if (claw.grabTimer > 30) { // ~0.5 seconds at 60fps
      claw.state = 'ascending';
      claw.grabTimer = 0;
    }
  } else if (claw.state === 'ascending') {
    claw.clawY -= 8;
    if (claw.clawY <= claw.y) {
      claw.clawY = claw.y;
      if (claw.grabbedAlbum !== null) {
        // After ascending, move to center position
        claw.targetX = width / 2;
        claw.state = 'movingToCenter';
      } else {
        claw.state = 'idle';
        claw.grabTimer = 0;
      }
    }
  } else if (claw.state === 'holding') {
    // When holding a displayed album, drop down slightly to middle position
    if (displayedAlbum !== null) {
      // Update target claw Y position based on current display scale and position
      let albumSize = albums[displayedAlbum].size * 0.88 * displayScale;
      claw.targetClawY = displayY - (albumSize / 2) - 20;
      
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
      break;
    }
  }
}

function drawInfoPanel() {
  // Draw panel background
  push();
  translate(0, height);
  
  fill(240, 240, 245, 240);
  noStroke();
  rect(0, 0, width, infoPanelHeight);
  
  // Draw border
  stroke(200, 200, 200, 150);
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
    let bgColor = {r: 240, g: 240, b: 245}; // Info panel background color
    let textColor = getTextColorForBackground(bgColor);
    
    // Draw text info
    fill(textColor.r, textColor.g, textColor.b, 255);
    textAlign(CENTER);
    textSize(13);
    textLeading(13);
    textStyle(BOLD);
    text(album.album, width / 2, 50);
    
    textSize(13);
    textLeading(13);
    textStyle(NORMAL);
    // Use slightly lighter/darker shade for artist text
    let artistColor = textColor.r > 128 
      ? {r: max(0, textColor.r - 20), g: max(0, textColor.g - 20), b: max(0, textColor.b - 20)}
      : {r: min(255, textColor.r + 20), g: min(255, textColor.g + 20), b: min(255, textColor.b + 20)};
    fill(artistColor.r, artistColor.g, artistColor.b, 255);
    text(album.artist, width / 2, 70);
    
    textSize(13);
    textLeading(13);
    // Use slightly lighter/darker shade for year/genre text
    let detailColor = textColor.r > 128 
      ? {r: max(0, textColor.r - 40), g: max(0, textColor.g - 40), b: max(0, textColor.b - 40)}
      : {r: min(255, textColor.r + 40), g: min(255, textColor.g + 40), b: min(255, textColor.b + 40)};
    fill(detailColor.r, detailColor.g, detailColor.b, 255);
    text(`${album.year} • ${album.genre}`, width / 2, 90);
  } else {
    // Instructions
    let bgColor = {r: 240, g: 240, b: 245}; // Info panel background color
    let textColor = getTextColorForBackground(bgColor);
    fill(textColor.r, textColor.g, textColor.b, 200); // Slightly transparent for instructions
    textAlign(CENTER);
    textSize(13);
    textLeading(13);
    text('Use ← → arrow keys to move the claw, SPACE to drop and grab an album', width / 2, infoPanelHeight / 2);
  }
  
  pop();
}

function keyPressed() {
  if (keyCode === LEFT_ARROW || key === 'a' || key === 'A') {
    if (claw.state === 'idle' || claw.state === 'moving') {
      claw.targetX = constrain(claw.targetX - 50, 20, width - 20);
    }
  } else if (keyCode === RIGHT_ARROW || key === 'd' || key === 'D') {
    if (claw.state === 'idle' || claw.state === 'moving') {
      claw.targetX = constrain(claw.targetX + 50, 20, width - 20);
    }
  } else if (key === ' ' || keyCode === 32) {
    // Spacebar to drop claw
    if (claw.state === 'idle' || claw.state === 'moving') {
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
        claw.state = 'descending';
        claw.clawY = claw.y;
      }
    }
  } else if (key === 'r' || key === 'R') {
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
      claw.state = 'idle';
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
    let dx = mouseX - (width / 2);
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
  fallingAlbum.y = (displayY > 0) ? displayY : height / 2;
  fallingAlbum.vx = random(-1, 1); // Initial horizontal velocity for natural movement
  fallingAlbum.vy = 0; // Start with no vertical velocity
  fallingAlbum.scale = (displayScale > 1) ? displayScale : 4.0; // Start at current display scale or default
  fallingAlbum.targetScale = 1.0; // Target is normal size
  fallingAlbum.rotation = album.rotation || 0;
  fallingAlbum.rotationSpeed = random(-0.02, 0.02); // Rotation speed
  fallingAlbum.bounceCount = 0; // Reset bounce count
  fallingAlbum.settled = false; // Reset settled flag
  
  // Calculate target position (random among other albums)
  let bottomY = height - (tileSize / 2);
  let albumAreaWidth = width - (padding * 2);
  let albumCount = albums.length;
  let albumSpacing = albumCount > 0 ? albumAreaWidth / albumCount : 0;
  
  // Choose a random position among the album slots
  let randomSlot = floor(random(0, albumCount));
  fallingAlbum.targetX = padding + (randomSlot * albumSpacing) + (albumSpacing / 2);
  fallingAlbum.targetY = bottomY;
  
  // Reset displayed album state (but keep album grabbed until animation completes)
  displayedAlbum = null;
  displayScale = 1.0;
  selectedAlbum = null;
  
  // Keep album grabbed during fall so it doesn't appear in regular album drawing
  album.grabbed = true;
  
  // Release the claw
  claw.grabbedAlbum = null;
  claw.state = 'idle';
  claw.clawY = claw.y;
}

function updateFallingAlbum() {
  if (!fallingAlbum.active) return;
  
  let album = albums[fallingAlbum.albumIndex];
  let albumSize = album.size * 0.88 * fallingAlbum.scale;
  let bottomY = height - (tileSize / 2);
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
    let minDistance = (albumSize / 2) + (otherAlbum.size / 2);
    
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
  let totalVelocity = sqrt(fallingAlbum.vx * fallingAlbum.vx + fallingAlbum.vy * fallingAlbum.vy);
  let isOnBottom = fallingAlbum.y + halfSize >= bottomY - 2;
  
  if (!fallingAlbum.settled && isOnBottom && totalVelocity < minVelocity && fallingAlbum.bounceCount > 0) {
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
  
  let fallingAlbumSize = albums[fallingAlbum.albumIndex].size * 0.88 * fallingAlbum.scale;
  let fallingHalfSize = fallingAlbumSize / 2;
  let bottomY = height - (tileSize / 2);
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
    let fallingNearBottom = fallingAlbum.y + fallingHalfSize > bottomY - tileSize;
    let isNearFalling = distance < reactionDistance && fallingNearBottom;
    
    if (isNearFalling && distance > 0) {
      // Push away from falling album
      let angle = atan2(dy, dx);
      let pushDistance = reactionDistance - distance;
      let pushAmount = pushDistance * pushStrength;
      
      // Calculate new target position (push away)
      let newTargetX = album.x + cos(angle) * pushAmount;
      
      // Constrain to valid area
      newTargetX = constrain(newTargetX, padding + albumHalfSize, width - padding - albumHalfSize);
      
      // Smoothly move towards new target
      album.targetX = newTargetX;
    } else if (!fallingAlbum.settled) {
      // Only try to return to evenly-spaced positions if falling album hasn't settled yet
      // Once settled, albums stay where they naturally ended up
      let albumAreaWidth = width - (padding * 2);
      let albumCount = albums.length;
      let albumSpacing = albumCount > 0 ? albumAreaWidth / albumCount : 0;
      let originalX = padding + (i * albumSpacing) + (albumSpacing / 2);
      
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
        album.targetX = constrain(album.targetX, padding + albumHalfSize, width - padding - albumHalfSize);
        otherAlbum.targetX = constrain(otherAlbum.targetX, padding + otherHalfSize, width - padding - otherHalfSize);
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
  let bottomY = height - (tileSize / 2);
  let albumAreaWidth = width - (padding * 2);
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
    let slotX = padding + (i * albumSpacing) + (albumSpacing / 2);
    
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
  let albumAreaWidth = width - (padding * 2);
  let albumSpacing = albumCount > 0 ? albumAreaWidth / albumCount : 0;
  let bottomY = height - (tileSize / 2);
  
  // Update positions for all albums
  for (let j = 0; j < albums.length; j++) {
    let newX = padding + (j * albumSpacing) + (albumSpacing / 2);
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
  if (abs(claw.x - claw.targetX) <= 1 && (claw.state === 'idle' || claw.state === 'moving')) {
    claw.x = claw.targetX;
    claw.state = 'descending';
    claw.clawY = claw.y;
    claw.autoGrab = false; // Clear flag since we're starting immediately
  } else if (claw.state === 'idle' || claw.state === 'moving') {
    claw.state = 'moving';
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Update claw max Y - extend fully to reach albums at bottom
  claw.maxClawY = height - (tileSize / 2) + 20; // Extend slightly past album center
  
  // Update display Y position
  if (displayedAlbum !== null) {
    displayY = height / 2;
    // Update claw target Y position
    if (claw.state === 'holding') {
      let albumSize = albums[displayedAlbum].size * 0.88 * displayScale;
      claw.targetClawY = displayY - (albumSize / 2) - 20;
    }
  }
  
  // Reposition albums at bottom
  let validAlbumCount = albums.length;
  let albumAreaWidth = width - (padding * 2);
  let albumSpacing = validAlbumCount > 0 ? albumAreaWidth / validAlbumCount : 0;
  // Position albums so their bottom edge sits at the very bottom of the screen (overlapping info panel)
  let bottomY = height - (tileSize / 2);
  
  for (let j = 0; j < albums.length; j++) {
    let newX = padding + (j * albumSpacing) + (albumSpacing / 2);
    albums[j].x = newX;
    if (!albums[j].targetX) albums[j].targetX = newX;
    albums[j].targetX = newX; // Update target position
    albums[j].y = bottomY;
  }
}
