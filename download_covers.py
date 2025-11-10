#!/usr/bin/env python3
"""
Album Cover Downloader
Downloads high-quality album covers from various sources
"""

import os
import requests
from pathlib import Path

# Create assets directory if it doesn't exist
assets_dir = Path(__file__).parent / "assets"
assets_dir.mkdir(exist_ok=True)

# Album cover URLs - Update these with actual high-quality image URLs
# You can find these by:
# 1. Right-clicking album covers on Spotify/Apple Music and copying image URL
# 2. Visiting Bandcamp pages and inspecting the album cover image
# 3. Using Google Images with "Large" size filter

albums = {
    "dangelo-voodoo.jpg": {
        "url": "https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647",
        "name": "D'Angelo - Voodoo"
    },
    "king-krule-ooz.jpg": {
        "url": "https://i.scdn.co/image/ab67616d0000b2738a3f0a3ca7929dea23cd274c",
        "name": "King Krule - The OOZ"
    },
    "prince-self-titled.jpg": {
        "url": "https://i.scdn.co/image/ab67616d0000b2734ce8b4e4256c31c0bb8c6933",
        "name": "Prince - Self Titled"
    },
    "earl-some-rap-songs.jpg": {
        "url": "https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5529",
        "name": "Earl Sweatshirt - Some Rap Songs"
    },
    "mike-tears-of-joy.jpg": {
        "url": None,  # Need to find URL
        "name": "MIKE - Tears of Joy",
        "bandcamp": "https://mikelikesrap.bandcamp.com/album/tears-of-joy"
    },
    "sotc-red-burns.jpg": {
        "url": None,
        "name": "Standing on the Corner - Red Burns",
        "bandcamp": "https://standingonthecorner.bandcamp.com/album/red-burns"
    },
    "alex-g-rocket.jpg": {
        "url": "https://i.scdn.co/image/ab67616d0000b273c8b4e4256c31c0bb8c6933",
        "name": "Alex G - Rocket"
    },
    "sun-kil-moon-benji.jpg": {
        "url": "https://i.scdn.co/image/ab67616d0000b2738a3f0a3ca7929dea23cd274c",
        "name": "Sun Kil Moon - Benji"
    },
    "blu-her-favorite-color.jpg": {
        "url": None,
        "name": "Blu - Her Favorite Color",
        "bandcamp": "https://blu.bandcamp.com/album/her-favorite-color"
    },
    "stevie-wonder-songs.jpg": {
        "url": "https://i.scdn.co/image/ab67616d0000b2734ce8b4e4256c31c0bb8c6933",
        "name": "Stevie Wonder - Songs in the Key of Life"
    },
    "blue-iverson-hotep.jpg": {
        "url": None,
        "name": "Blue Iverson - Hotep",
        "bandcamp": "https://blueiverson.bandcamp.com/album/hotep"
    },
    "knxwledge-anthology.jpg": {
        "url": None,
        "name": "Knxwledge - Anthology",
        "bandcamp": "https://knxwledge.bandcamp.com/album/anthology"
    },
    "fly-anakin-chapel-drive.jpg": {
        "url": None,
        "name": "Fly Anakin & Koncept Jack$on - Chapel Drive",
        "bandcamp": "https://flyanakin.bandcamp.com/album/chapel-drive"
    },
    "navy-blue-ada-irin.jpg": {
        "url": None,
        "name": "Navy Blue - Ada Irin",
        "bandcamp": "https://navyblue.bandcamp.com/album/ada-irin"
    },
    "drake-views.jpg": {
        "url": "https://i.scdn.co/image/ab67616d0000b2734ce8b4e4256c31c0bb8c6933",
        "name": "Drake - Views"
    }
}

def download_image(url, filepath, name):
    """Download an image from a URL"""
    if not url:
        print(f"⚠️  Skipping {name} - URL not provided")
        print(f"   Visit the Bandcamp page to download manually")
        return False
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"✓ Downloaded: {name}")
        return True
    except Exception as e:
        print(f"✗ Failed to download {name}: {e}")
        return False

def main():
    print("Album Cover Downloader")
    print("=" * 50)
    print()
    
    downloaded = 0
    skipped = 0
    
    for filename, info in albums.items():
        filepath = assets_dir / filename
        
        # Skip if already exists
        if filepath.exists():
            print(f"⊘ Already exists: {info['name']}")
            continue
        
        if info.get('url'):
            if download_image(info['url'], filepath, info['name']):
                downloaded += 1
            else:
                skipped += 1
        else:
            print(f"⚠️  {info['name']} - Manual download required")
            if 'bandcamp' in info:
                print(f"   Bandcamp: {info['bandcamp']}")
            skipped += 1
        print()
    
    print("=" * 50)
    print(f"Downloaded: {downloaded}")
    print(f"Skipped/Manual: {skipped}")
    print()
    print("For albums that couldn't be downloaded automatically:")
    print("1. Visit the Bandcamp/Spotify page")
    print("2. Right-click the album cover")
    print("3. Save image to the assets/ folder with the correct filename")

if __name__ == "__main__":
    main()

