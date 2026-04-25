// ==========================================
// DEVICE DETECTION UTILITY
// ==========================================

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'tv';
export type InputType = 'touch' | 'mouse' | 'gamepad' | 'keyboard';

export interface DeviceInfo {
  type: DeviceType;
  inputType: InputType;
  width: number;
  height: number;
  pixelRatio: number;
  isTouch: boolean;
  supportsGamepad: boolean;
}

export class DeviceDetector {
  private static instance: DeviceDetector;
  private deviceInfo: DeviceInfo;
  
  private constructor() {
    this.deviceInfo = this.detect();
    this.setupResizeListener();
  }
  
  static getInstance(): DeviceDetector {
    if (!DeviceDetector.instance) {
      DeviceDetector.instance = new DeviceDetector();
    }
    return DeviceDetector.instance;
  }
  
  private detect(): DeviceInfo {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Check for touch capability
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Check for gamepad support
    const supportsGamepad = 'getGamepads' in navigator;
    
    // Determine device type
    let type: DeviceType;
    if (this.isTVDevice()) {
      type = 'tv';
    } else if (width < 768) {
      type = 'mobile';
    } else if (width < 1024) {
      type = 'tablet';
    } else {
      type = 'desktop';
    }
    
    // Determine input type
    let inputType: InputType;
    if (type === 'tv' || supportsGamepad) {
      inputType = 'gamepad';
    } else if (isTouch) {
      inputType = 'touch';
    } else if (type === 'desktop') {
      inputType = 'keyboard';
    } else {
      inputType = 'mouse';
    }
    
    return {
      type,
      inputType,
      width,
      height,
      pixelRatio,
      isTouch,
      supportsGamepad,
    };
  }
  
  private isTVDevice(): boolean {
    // Check for TV-like characteristics
    const userAgent = navigator.userAgent.toLowerCase();
    const tvAgents = ['tv', 'smarttv', 'googletv', 'appletv', 'webos', 'tizen'];
    const isTVUA = tvAgents.some(agent => userAgent.includes(agent));
    
    // Check for fullscreen mode typical of TV apps
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    
    // Check for large screen
    const isLargeScreen = window.innerWidth >= 1920 && window.innerHeight >= 1080;
    
    return isTVUA || (isFullscreen && isLargeScreen);
  }
  
  private setupResizeListener(): void {
    let resizeTimeout: number;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        this.deviceInfo = this.detect();
        // Dispatch custom event for scene updates
        window.dispatchEvent(new CustomEvent('deviceChanged', { 
          detail: this.deviceInfo 
        }));
      }, 250);
    });
  }
  
  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }
  
  isMobile(): boolean {
    return this.deviceInfo.type === 'mobile';
  }
  
  isTablet(): boolean {
    return this.deviceInfo.type === 'tablet';
  }
  
  isDesktop(): boolean {
    return this.deviceInfo.type === 'desktop';
  }
  
  isTV(): boolean {
    return this.deviceInfo.type === 'tv';
  }
  
  isTouchDevice(): boolean {
    return this.deviceInfo.isTouch;
  }
  
  supportsGamepad(): boolean {
    return this.deviceInfo.supportsGamepad;
  }
  
  getInputType(): InputType {
    return this.deviceInfo.inputType;
  }
  
  getDeviceType(): DeviceType {
    return this.deviceInfo.type;
  }
  
  getScaleFactor(): number {
    switch (this.deviceInfo.type) {
      case 'mobile':
        return 1.0;
      case 'tablet':
        return 1.2;
      case 'desktop':
        return 1.0;
      case 'tv':
        return 1.5;
      default:
        return 1.0;
    }
  }
  
  getMinTouchTarget(): number {
    switch (this.deviceInfo.type) {
      case 'mobile':
        return 44;
      case 'tablet':
        return 40;
      case 'desktop':
        return 20;
      case 'tv':
        return 48;
      default:
        return 44;
    }
  }
  
  getFontSize(baseSize: number): number {
    return baseSize * this.getScaleFactor();
  }
}

// Export singleton accessor
export const getDeviceInfo = () => DeviceDetector.getInstance().getDeviceInfo();
export const isMobile = () => DeviceDetector.getInstance().isMobile();
export const isTablet = () => DeviceDetector.getInstance().isTablet();
export const isDesktop = () => DeviceDetector.getInstance().isDesktop();
export const isTV = () => DeviceDetector.getInstance().isTV();
export const isTouchDevice = () => DeviceDetector.getInstance().isTouchDevice();
export const getInputType = () => DeviceDetector.getInstance().getInputType();
export const getDeviceType = () => DeviceDetector.getInstance().getDeviceType();
export const getScaleFactor = () => DeviceDetector.getInstance().getScaleFactor();
export const getMinTouchTarget = () => DeviceDetector.getInstance().getMinTouchTarget();