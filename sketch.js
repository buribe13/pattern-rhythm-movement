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
let dropButtonHovered = false; // Track if drop button is hovered

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
  textFont("IBM Plex Sans");
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
      colorsExtracted: false
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
  // White background
  background(255, 255, 255);
  
  time += 0.02;
  
  // Draw gradient background
  drawPatternBackground();
  
  // Check for album hover
  checkAlbumHover();
  
  // Check for drop button hover
  checkDropButtonHover();
  
  // Update cursor based on hover state
  if (hoveredAlbum !== null && !albums[hoveredAlbum].grabbed) {
    cursor(HAND);
  } else if (dropButtonHovered) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
  
  // Update claw
  updateClaw();
  
  // Draw displayed album at top (if any)
  if (displayedAlbum !== null) {
    drawDisplayedAlbum();
  }
  
  // Draw albums at bottom
  drawAlbums();
  
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
  let color1, color2;
  
  if (displayedAlbum !== null) {
    // Use displayed album's colors - blend with white for visibility
    let album = albums[displayedAlbum];
    let dom = album.dominantColor || {r: 200, g: 200, b: 220};
    let sec = album.secondaryColor || {r: 180, g: 180, b: 200};
    // Blend colors with white (50% white, 50% color) for more visible gradient
    color1 = {
      r: lerp(255, dom.r, 0.5),
      g: lerp(255, dom.g, 0.5),
      b: lerp(255, dom.b, 0.5)
    };
    color2 = {
      r: lerp(255, sec.r, 0.5),
      g: lerp(255, sec.g, 0.5),
      b: lerp(255, sec.b, 0.5)
    };
  } else if (selectedAlbum !== null) {
    // Use selected album's colors - blend with white
    let album = albums[selectedAlbum];
    let dom = album.dominantColor || {r: 200, g: 200, b: 220};
    let sec = album.secondaryColor || {r: 180, g: 180, b: 200};
    color1 = {
      r: lerp(255, dom.r, 0.5),
      g: lerp(255, dom.g, 0.5),
      b: lerp(255, dom.b, 0.5)
    };
    color2 = {
      r: lerp(255, sec.r, 0.5),
      g: lerp(255, sec.g, 0.5),
      b: lerp(255, sec.b, 0.5)
    };
  } else {
    // Default light gradient (very subtle)
    color1 = {r: 250, g: 250, b: 255};
    color2 = {r: 245, g: 245, b: 250};
  }
  
  // Create gradient by drawing multiple rectangles with interpolated colors
  let gradientSteps = 100;
  for (let i = 0; i <= gradientSteps; i++) {
    let inter = map(i, 0, gradientSteps, 0, 1);
    let r = lerp(color1.r, color2.r, inter);
    let g = lerp(color1.g, color2.g, inter);
    let b = lerp(color1.b, color2.b, inter);
    
    fill(r, g, b, 255); // Full opacity for visible gradient
    rect(0, map(i, 0, gradientSteps, 0, height), width, height / gradientSteps);
  }
  
  pop();
}

function extractAlbumColors(albumIndex) {
  let dataIndex = albums[albumIndex].dataIndex;
  let img = albumImages[dataIndex];
  if (!img || img.width === 0) return;
  
  // Sample colors from different regions of the image
  let samples = [];
  let sampleSize = 5;
  
  // Sample from corners and center
  let regions = [
    {x: img.width * 0.2, y: img.height * 0.2},
    {x: img.width * 0.8, y: img.height * 0.2},
    {x: img.width * 0.2, y: img.height * 0.8},
    {x: img.width * 0.8, y: img.height * 0.8},
    {x: img.width * 0.5, y: img.height * 0.5}
  ];
  
  img.loadPixels();
  for (let region of regions) {
    let x = floor(region.x);
    let y = floor(region.y);
    let idx = (y * img.width + x) * 4;
    if (idx < img.pixels.length - 3) {
      samples.push({
        r: img.pixels[idx],
        g: img.pixels[idx + 1],
        b: img.pixels[idx + 2]
      });
    }
  }
  
  // Find most vibrant color as dominant
  let dominant = samples[0];
  let maxSaturation = 0;
  for (let sample of samples) {
    let r = sample.r / 255;
    let g = sample.g / 255;
    let b = sample.b / 255;
    let max = max(r, g, b);
    let min = min(r, g, b);
    let saturation = max === 0 ? 0 : (max - min) / max;
    if (saturation > maxSaturation) {
      maxSaturation = saturation;
      dominant = sample;
    }
  }
  
  // Use a different sample as secondary
  let secondary = samples.length > 1 ? samples[1] : dominant;
  
  albums[albumIndex].dominantColor = dominant;
  albums[albumIndex].secondaryColor = secondary;
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
  
  // Album title
  fill(20, 20, 20, 255);
  textAlign(CENTER);
  textSize(13);
  textLeading(13);
  textStyle(BOLD);
  text(albumInfo.album, 0, infoY);
  
  // Artist
  textSize(13);
  textLeading(13);
  textStyle(NORMAL);
  fill(40, 40, 40, 255);
  text(albumInfo.artist, 0, infoY + 20);
  
  // Year and genre
  textSize(13);
  textLeading(13);
  fill(60, 60, 60, 255);
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
    
    // Draw text info
    fill(20, 20, 20, 255);
    textAlign(CENTER);
    textSize(13);
    textLeading(13);
    textStyle(BOLD);
    text(album.album, width / 2, 50);
    
    textSize(13);
    textLeading(13);
    textStyle(NORMAL);
    fill(40, 40, 40, 255);
    text(album.artist, width / 2, 70);
    
    textSize(13);
    textLeading(13);
    fill(60, 60, 60, 255);
    text(`${album.year} • ${album.genre}`, width / 2, 90);
    
    // Draw drop button (positioned below the genre text)
    // Draw in screen coordinates by temporarily resetting the translate
    pop(); // Exit the translate context
    push(); // Start new context for button
    
    let buttonY = height - 80; // Position from bottom: 80px up from bottom
    let buttonWidth = 120;
    let buttonHeight = 35;
    let buttonX = width / 2;
    
    // Button background - make it more visible
    fill(dropButtonHovered ? 160 : 190, 190, 190, 255);
    stroke(120, 120, 120, 255);
    strokeWeight(2);
    rectMode(CENTER);
    rect(buttonX, buttonY, buttonWidth, buttonHeight, 6);
    
    // Button text
    fill(20, 20, 20, 255);
    textAlign(CENTER, CENTER);
    textSize(13);
    textStyle(BOLD);
    text('DROP', buttonX, buttonY);
    
    pop(); // Exit button context
    push(); // Restore panel context
    translate(0, height); // Restore the translate for the rest of the panel
  } else {
    // Instructions
    fill(100, 100, 100, 255);
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
  // Check if drop button was clicked
  if (dropButtonHovered && selectedAlbum !== null) {
    dropAlbum();
    return;
  }
  
  // Check if an album was clicked
  if (hoveredAlbum !== null && !albums[hoveredAlbum].grabbed) {
    // Select the album directly (same as claw machine selection)
    selectAlbum(hoveredAlbum);
  }
}

function checkDropButtonHover() {
  dropButtonHovered = false;
  
  if (selectedAlbum !== null) {
    // Button is drawn in screen coordinates at height - 80
    let buttonY = height - 80;
    let buttonWidth = 120;
    let buttonHeight = 35;
    let buttonX = width / 2;
    
    if (mouseX >= buttonX - buttonWidth/2 && mouseX <= buttonX + buttonWidth/2 &&
        mouseY >= buttonY - buttonHeight/2 && mouseY <= buttonY + buttonHeight/2) {
      dropButtonHovered = true;
    }
  }
}

function dropAlbum() {
  if (selectedAlbum === null) return;
  
  // Reset the selected album
  albums[selectedAlbum].grabbed = false;
  
  // Reset displayed album
  displayedAlbum = null;
  displayScale = 1.0;
  selectedAlbum = null;
  
  // Release the claw
  claw.grabbedAlbum = null;
  claw.state = 'idle';
  claw.clawY = claw.y;
  
  // Rearrange all albums at the bottom
  rearrangeAlbums();
}

function rearrangeAlbums() {
  // Calculate new positions for all albums
  let albumCount = albums.length;
  let albumAreaWidth = width - (padding * 2);
  let albumSpacing = albumCount > 0 ? albumAreaWidth / albumCount : 0;
  let bottomY = height - (tileSize / 2);
  
  // Update positions for all albums
  for (let j = 0; j < albums.length; j++) {
    albums[j].x = padding + (j * albumSpacing) + (albumSpacing / 2);
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
    albums[j].x = padding + (j * albumSpacing) + (albumSpacing / 2);
    albums[j].y = bottomY;
  }
}
