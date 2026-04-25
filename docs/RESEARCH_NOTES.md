# Game Mechanics Research

## Phaser 3 Best Practices

### Sprite Management
1. **Texture Atlas over Spritesheets** - Use JSON atlas for better memory management
2. **Object Pooling** - Pre-create sprites, reuse from pool instead of create/destroy
3. **Sprite pooling via this.textures.get()** - Check texture exists before loading

### Scaling Issues
- `ScaleManager.RESIZE` mode: Canvas resizes with window, parent must have explicit dimensions
- `resizeInterval: 0` - Reduces resize event throttling
- `expandParent: true` - Parent element expands to fill viewport

### Common Issues
1. Canvas not appearing: Parent element has no size or is `display: none`
2. Sprites overlapping: Not using spritesheet frames correctly
3. Blank screen: Asset loading failure or AudioContext blocking

## Relevant Libraries
- **Phaser拼图** - Animation state machine
- **rex-conditionstatengraph** - Decision trees for AI
- **phaser-plugin-ads** - Monetization (optional)

## References
- https://rexrainbow.github.io/phaser3-rex-notes/
- https://newdocs.phaser/tutorials/getting-started/index.html
- https://labs.phaser.io/ - Official examples
