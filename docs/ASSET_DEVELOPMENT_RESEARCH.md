# Game Asset Development Research

## Problem Statement
Need to properly extract, analyze, and implement game assets from reference artwork for "Buy a Buddy" RPG game.

## Research Findings

### 1. Image Analysis & Sprite Extraction Tools

#### Python Libraries
```bash
# Install dependencies
pip install Pillow opencv-python numpy scikit-image matplotlib
```

| Library | Purpose | Pros | Cons |
|---------|---------|------|------|
| **Pillow** | Basic image manipulation | Simple, widely used | Limited edge detection |
| **OpenCV** | Computer vision | Edge detection, contours, masking | Steeper learning curve |
| **scikit-image** | Image processing | Segmentation, region detection | Memory intensive |
| **numpy** | Array operations | Fast pixel manipulation | Low-level |

#### Sprite Sheet Parsing
```python
# Automated sprite detection using edge detection
import cv2
import numpy as np

def find_sprite_bounds(image_path):
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Edge detection
    edges = cv2.Canny(gray, 50, 150)
    
    # Find contours (sprite boundaries)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Get bounding boxes
    bounds = [cv2.boundingRect(c) for c in contours]
    return bounds
```

### 2. AI Image Understanding Tools

#### Google Gemini / Vertex AI
```bash
# Use Gemini API for image analysis
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "contents": [{
      "parts": [{
        "inlineData": {
          "mimeType": "image/png",
          "data": "BASE64_IMAGE_DATA"
        }
      }, {
        "text": "Describe this sprite sheet layout. Identify each character and their position."
      }]
    }]
  }'
```

#### Hugging Face Models
```python
from transformers import pipeline

# Image-to-text for sprite analysis
captioner = pipeline("image-to-text", model="Salesforce/blip-image-captioning-base")
description = captioner("sprite_sheet.png")
print(description)
```

#### CLIP for Image Similarity
```python
from PIL import Image
import torch
from torchvision.transforms import Compose, Resize, ToTensor, Normalize
from CLIP import clip

# Analyze sprite characteristics
def analyze_sprite(image_path):
    model, preprocess = clip.load("ViT-B/32")
    image = preprocess(Image.open(image_path)).unsqueeze(0)
    
    text = clip.tokenize(["cute anime character", "dark villain", "angel wings"])
    similarity = model(image, text)
    return similarity
```

### 3. Sprite Segmentation Techniques

#### Grid-Based with Smart Cropping
```python
def smart_crop_sprite_sheet(image_path, rows=2, cols=3):
    img = Image.open(image_path)
    w, h = img.size
    
    cell_w = w // cols
    cell_h = h // rows
    
    sprites = []
    for r in range(rows):
        for c in range(cols):
            x = c * cell_w
            y = r * cell_h
            
            # Add padding
            padding = 10
            cell = img.crop((
                max(0, x - padding),
                max(0, y - padding),
                min(w, x + cell_w + padding),
                min(h, y + cell_h + padding)
            ))
            
            # Trim transparency/whitespace
            cell = trim_whitespace(cell)
            sprites.append(cell)
    
    return sprites
```

#### Color-Based Segmentation
```python
import cv2
import numpy as np

def color_segment_sprites(image_path):
    img = cv2.imread(image_path)
    
    # Convert to different color spaces
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # Find non-background regions
    lower = np.array([0, 0, 100])
    upper = np.array([180, 50, 255])
    mask = cv2.inRange(hsv, lower, upper)
    
    # Find bounding rects of colored regions
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    sprites = []
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        if w > 50 and h > 50:  # Filter small regions
            sprite = img[y:y+h, x:x+w]
            sprites.append(sprite)
    
    return sprites
```

### 4. Game Engine Asset Pipelines

#### Texture Atlas Generation
```bash
# Using TexturePacker (command line)
texturepacker sprites/*.png --data sprites.json --format phaser

# Using free alternatives
npm install -g spritesmith
spritesmith sprites/*.png
```

#### Phaser-Specific Sprite Loading
```typescript
// Efficient sprite loading in Phaser
class SpriteManager {
  private loadProgress = 0;
  private totalSprites = 0;

  async loadAllSprites(scene: Phaser.Scene): Promise<void> {
    const sprites = [
      { key: 'twilight_petal', path: 'images/buddies/twilight_petal.png' },
      // ... etc
    ];

    this.totalSprites = sprites.length;
    
    for (const sprite of sprites) {
      await new Promise<void>((resolve) => {
        scene.load.image(sprite.key, sprite.path);
        scene.load.once('complete', resolve);
        scene.load.start();
      });
      
      this.loadProgress++;
      this.updateLoadingBar();
    }
  }

  createCharacter(scene: Phaser.Scene, type: string, x: number, y: number) {
    return scene.add.sprite(x, y, `sprite_${type}`);
  }
}
```

### 5. Automated Testing & Validation

#### Playwright Visual Regression
```typescript
import { test, expect } from '@playwright/test';

test('character sprites render correctly', async ({ page }) => {
  await page.goto('/#/character-select');
  
  // Check all 12 sprites are visible
  const sprites = page.locator('.character-card img');
  await expect(sprites).toHaveCount(12);
  
  // Verify no broken images
  const brokenImages = page.locator('img[src*="404"], img[alt*="error"]');
  await expect(brokenImages).toHaveCount(0);
  
  // Screenshot comparison
  await expect(page).toHaveScreenshot('character-select.png', {
    threshold: 0.1, // Allow 10% pixel difference
  });
});
```

#### Sprite Integrity Check
```python
def validate_sprites(directory):
    issues = []
    
    for filename in os.listdir(directory):
        if not filename.endswith('.png'):
            continue
            
        img = Image.open(os.path.join(directory, filename))
        
        # Check dimensions (should be square for our sprites)
        if img.size[0] != img.size[1]:
            issues.append(f"{filename}: Not square ({img.size})")
        
        # Check minimum size
        if min(img.size) < 256:
            issues.append(f"{filename}: Too small ({img.size})")
        
        # Check for too much transparency (empty sprite)
        alpha = img.split()[-1] if img.mode == 'RGBA' else None
        if alpha:
            transparent_ratio = sum(1 for p in alpha.getdata() if p == 0) / len(alpha.getdata())
            if transparent_ratio > 0.9:
                issues.append(f"{filename}: Mostly transparent")
    
    return issues
```

### 6. Alternative: AI-Generated Assets

#### Custom Sprite Generation
```bash
# Using NanoGPT/Qwen Image API
curl -X POST "https://nano-gpt.com/v1/images/generations" \
  -H "Authorization: Bearer sk-nano-..." \
  -d '{
    "model": "qwen-image",
    "prompt": "Cute anime character sprite, pink hair, purple dress, white wings, transparent background, RPG game style, 512x512",
    "size": "1024x1024",
    "n": 4
  }'
```

### 7. Recommended Pipeline

```
┌─────────────────┐
│  Reference Art   │
│  (1536x1024)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Python Script  │  ← Edge detection + contour finding
│  (OpenCV)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Auto-detect    │  ← Find sprite boundaries
│  Sprites        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Crop & Export  │  ← Smart cropping with padding
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Analysis    │  ← Gemini/CLIP for descriptions
│  (Optional)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validate       │  ← Check size, transparency
│  Sprites        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Load to Phaser │  ← SpriteRenderer.ts
└─────────────────┘
```

## Implementation Checklist

- [x] Python sprite extraction with Pillow
- [ ] OpenCV edge detection for better bounds
- [ ] AI-powered sprite analysis (Gemini/CLIP)
- [ ] Automated sprite validation
- [ ] Visual regression testing
- [ ] Texture atlas generation
- [ ] Menu background from reference art
- [ ] UI elements extraction

## Next Steps

1. **Install OpenCV** and write smart extraction script
2. **Use AI analysis** to auto-generate character descriptions
3. **Build validation pipeline** to ensure sprite quality
4. **Create automated tests** for visual consistency
