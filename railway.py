import requests
from PIL import Image, ImageFilter
from io import BytesIO
import math
import os
import json

# --- ⚙️ Configuration ---
# 1. Output Directory for Railway Layers
IMG_DIR = "./assets/railway_layers_only" 
DATA_DIR = "./data"
os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)
JSON_NAME = "china_city_railways.json"

# 2. Railway Color (Deep Red)
# The script will download the raw layer and recolor it to this.
RAIL_COLOR = (168, 49, 36, 255) 

# 3. Data Source (Exactly the same as your base map script)
DATA_SOURCE = {
    "直辖市": [
        ("beijing", "北京", 39.9042, 116.4074, 12),
        ("shanghai", "上海", 31.2304, 121.4737, 12),
        ("tianjin", "天津", 39.14, 117.21, 12),
        ("chongqing", "重庆", 29.5630, 106.5516, 12),
    ]
}

# URL for OpenRailwayMap (Signals Layer - cleanest lines)
URL_ORM = "https://a.tiles.openrailwaymap.org/signals/{z}/{x}/{y}.png"

# --- 🧮 Math Helpers ---
def latlon_to_tile(lat, lon, zoom):
    n = 2.0 ** zoom
    xtile = int((lon + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.log(math.tan(math.radians(lat)) + (1 / math.cos(math.radians(lat)))) / math.pi) / 2.0 * n)
    return xtile, ytile

def download_image(url):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.openrailwaymap.org/'
        }
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code == 200:
            return Image.open(BytesIO(r.content)).convert("RGBA")
    except:
        pass
    return None

# --- 🚂 Railway Processing Function ---
def process_railway(img_rail):
    """
    Process the raw ORM tile:
    1. Extract alpha channel (shapes).
    2. Thin the lines (erosion).
    3. Recolor to target color.
    """
    # 1. Resize (Upscale 256 -> 512 to match base map resolution)
    # Using LANCZOS for smooth edges before thinning
    img_rail = img_rail.resize((512, 512), Image.LANCZOS)
    
    # 2. Thinning (Erosion)
    alpha = img_rail.getchannel('A')
    # Use MinFilter(3) to thin the lines. Increase to 5 if you want even thinner lines.
    thinned_alpha = alpha.filter(ImageFilter.MinFilter(3))
    
    # 3. Recolor
    # Create a solid color plate
    rail_layer = Image.new("RGBA", (512, 512), RAIL_COLOR)
    # Apply the thinned alpha as mask
    rail_layer.putalpha(thinned_alpha)
    
    return rail_layer

# --- 🔄 Main Generation Function ---
def generate_railway_layer(cid, name, lat, lon, zoom):
    # Ensure consistency with base map script logic
    final_zoom = zoom
    range_offset = 1 # Same coverage area
    
    center_x, center_y = latlon_to_tile(lat, lon, final_zoom)
    TILE_SIZE = 512
    width = TILE_SIZE * (range_offset * 2 + 1)
    height = TILE_SIZE * (range_offset * 2 + 1)
    
    # Create canvas (Transparent background)
    full_rail = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    
    print(f"🚂 [Railway Only] Downloading: {name} (z{final_zoom})...", end="")
    has_data = False

    for dx in range(-range_offset, range_offset + 1):
        for dy in range(-range_offset, range_offset + 1):
            xtile = center_x + dx
            ytile = center_y + dy
            px = (dx + range_offset) * TILE_SIZE
            py = (dy + range_offset) * TILE_SIZE
            
            # Download ORM Tile
            url = URL_ORM.format(z=final_zoom, x=xtile, y=ytile)
            img_r = download_image(url)
            
            if img_r:
                # Process and paste
                processed_tile = process_railway(img_r)
                full_rail.paste(processed_tile, (px, py))
                has_data = True
            # If no data, the canvas stays transparent at this tile
    
    # Resize output to max 1536px (matching base map script)
    if full_rail.width > 1600:
        full_rail = full_rail.resize((1536, 1536), Image.LANCZOS)
    
    # Save
    save_path = f"{IMG_DIR}/{cid}_rail.png"
    full_rail.save(save_path)
    
    if has_data:
        print(" ✅ Done")
    else:
        print(" ⚠️ No Rail Data (Saved Empty)")
        
    return final_zoom

# --- 🚀 Execution ---
print(f"🚀 Starting Railway Layer Downloader...")
json_output = []

for group_name, cities in DATA_SOURCE.items():
    print(f"\n📂 Processing Group: {group_name}")
    for item in cities:
        cid, name, lat, lon, initial_zoom = item
        
        # Check if already exists
        if os.path.exists(f"{IMG_DIR}/{cid}_rail.png"):
            print(f"⏩ Skipping {name} (Already exists)")
            continue
            
        used_zoom = generate_railway_layer(cid, name, lat, lon, initial_zoom)
        
        json_output.append({
            "id": cid, 
            "name": name, 
            "img": f"{IMG_DIR}/{cid}_rail.png",
            "lat": lat, 
            "lon": lon, 
            "zoom": used_zoom
        })

# Save metadata
with open(f"{DATA_DIR}/{JSON_NAME}", "w", encoding='utf-8') as f:
    json.dump(json_output, f, ensure_ascii=False, indent=2)

print(f"\n🎉 All railway layers saved to: {IMG_DIR}")