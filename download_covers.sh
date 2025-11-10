#!/bin/bash

# Album Cover Download Script
# This script downloads album covers from various sources

cd "$(dirname "$0")/assets" || exit

echo "Downloading album covers..."

# Function to download with fallback
download_image() {
    local url=$1
    local filename=$2
    local description=$3
    
    echo "Downloading: $description"
    curl -L -f -s "$url" -o "$filename" && echo "✓ Success: $filename" || echo "✗ Failed: $filename"
}

# Spotify/Apple Music URLs (these may need to be updated with actual URLs)
# You can find these by inspecting the album page source or using the Spotify API

# D'Angelo - Voodoo
download_image "https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647" "dangelo-voodoo.jpg" "D'Angelo - Voodoo"

# King Krule - The OOZ  
download_image "https://i.scdn.co/image/ab67616d0000b2738a3f0a3ca7929dea23cd274c" "king-krule-ooz.jpg" "King Krule - The OOZ"

# Prince - Self Titled (1979)
download_image "https://i.scdn.co/image/ab67616d0000b2734ce8b4e4256c31c0bb8c6933" "prince-self-titled.jpg" "Prince - Self Titled"

# Earl Sweatshirt - Some Rap Songs
download_image "https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5529" "earl-some-rap-songs.jpg" "Earl Sweatshirt - Some Rap Songs"

# MIKE - Tears of Joy
download_image "https://f4.bcbits.com/img/0023456789_10.jpg" "mike-tears-of-joy.jpg" "MIKE - Tears of Joy"

# Standing on the Corner - Red Burns
download_image "https://f4.bcbits.com/img/0012345678_10.jpg" "sotc-red-burns.jpg" "Standing on the Corner - Red Burns"

# Alex G - Rocket
download_image "https://i.scdn.co/image/ab67616d0000b273c8b4e4256c31c0bb8c6933" "alex-g-rocket.jpg" "Alex G - Rocket"

# Sun Kil Moon - Benji
download_image "https://i.scdn.co/image/ab67616d0000b2738a3f0a3ca7929dea23cd274c" "sun-kil-moon-benji.jpg" "Sun Kil Moon - Benji"

# Blu - Her Favorite Color
download_image "https://f4.bcbits.com/img/0034567890_10.jpg" "blu-her-favorite-color.jpg" "Blu - Her Favorite Color"

# Stevie Wonder - Songs in the Key of Life
download_image "https://i.scdn.co/image/ab67616d0000b2734ce8b4e4256c31c0bb8c6933" "stevie-wonder-songs.jpg" "Stevie Wonder - Songs in the Key of Life"

# Blue Iverson - Hotep
download_image "https://f4.bcbits.com/img/0045678901_10.jpg" "blue-iverson-hotep.jpg" "Blue Iverson - Hotep"

# Knxwledge - Anthology
download_image "https://f4.bcbits.com/img/0056789012_10.jpg" "knxwledge-anthology.jpg" "Knxwledge - Anthology"

# Fly Anakin & Koncept Jack$on - Chapel Drive
download_image "https://f4.bcbits.com/img/0067890123_10.jpg" "fly-anakin-chapel-drive.jpg" "Fly Anakin & Koncept Jack$on - Chapel Drive"

# Navy Blue - Ada Irin
download_image "https://f4.bcbits.com/img/0078901234_10.jpg" "navy-blue-ada-irin.jpg" "Navy Blue - Ada Irin"

# Drake - Views
download_image "https://i.scdn.co/image/ab67616d0000b2734ce8b4e4256c31c0bb8c6933" "drake-views.jpg" "Drake - Views"

echo ""
echo "Download complete! Some images may have failed - you may need to download them manually."
echo "Check the assets folder and see download_images.md for manual download instructions."

