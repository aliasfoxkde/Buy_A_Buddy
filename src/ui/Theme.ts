/**
 * UI Theme - Standardized colors, fonts, and spacing
 */

export const Theme = {
  // Primary colors
  primary: 0xa855f7,      // Purple - main brand color
  primaryDark: 0x7c3aed,  // Darker purple
  primaryLight: 0xc084fc,  // Lighter purple
  
  // Secondary colors
  secondary: 0xec4899,    // Pink - accents
  secondaryDark: 0xdb2777,
  
  // Semantic colors
  success: 0x22c55e,       // Green - health, success
  warning: 0xf59e0b,       // Orange/Yellow - XP, warnings
  danger: 0xef4444,        // Red - damage, errors
  info: 0x3b82f6,          // Blue - mana, info
  
  // Background colors
  bgDark: 0x0d0d1a,        // Darkest background
  bgPrimary: 0x1a1a2e,     // Main background
  bgSecondary: 0x2d1b4e,    // Card/panel background
  bgHover: 0x3d2b5e,       // Hover state
  
  // Text colors
  textPrimary: '#ffffff',    // White text
  textSecondary: '#a1a1aa', // Gray text
  textMuted: '#71717a',     // Muted text
  
  // Border colors
  border: 0x555555,         // Default border
  borderLight: 0x3f3f46,    // Light border
  borderFocus: 0xa855f7,   // Focus border
  
  // Special
  gold: 0xfbbf24,          // Gold/currency
  health: 0x22c55e,        // Health bar
  mana: 0x3b82f6,          // Mana bar
  xp: 0xf59e0b,            // Experience bar
  
  // Shadows
  shadow: 0x000000,
  
  // Spacing (in pixels)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  
  // Border radius
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999
  },
  
  // Font sizes
  fontSize: {
    xs: '10px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    title: '36px',
    hero: '48px'
  },
  
  // Button sizes
  button: {
    small: { width: 100, height: 36 },
    medium: { width: 150, height: 44 },
    large: { width: 200, height: 52 }
  }
};

// Helper function to get color as hex string
export function colorToHex(color: number): string {
  return '#' + color.toString(16).padStart(6, '0');
}

// Helper for alpha
export function withAlpha(color: number, alpha: number): number {
  // Phaser uses 0xRRGGBB format, alpha is separate
  return color;
}
