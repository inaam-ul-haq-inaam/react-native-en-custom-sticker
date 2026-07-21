// src/types.ts
export interface StickerData {
  path: string;
  filename: string;
  size?: number;
  extension?: string;
  base64?: string;
  exif?: Record<string, any>;
}

export interface ActionMenuConfig {
  labels?: {
    title?: string;
    subtitle?: string;
    camera?: string;
    cameraSubtitle?: string;
    gallery?: string;
    gallerySubtitle?: string;
    cancel?: string;
  };
  theme?: {
    titleColor?: string;
    primaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
    overlayColor?: string;
  };
  sequence?: ('camera' | 'gallery' | 'cancel')[];
}

export interface LoaderConfig {
  loadingText?: string;
  loadingSubtitle?: string;
  theme?: {
    spinnerColor?: string;
    overlayColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
}

export interface EditorConfig {
  recipientName?: string;
  theme?: {
    backgroundColor?: string;
    bottomBarColor?: string;
    headerIconColor?: string;
    favoriteIconColor?: string;
    sendButtonColor?: string;
    thumbnailBorderColor?: string;
  };
  icons?: {
    close?: string;
    text?: string;
    favorite?: string;
    favoriteActive?: string;
    send?: string;
  };
  textEditor?: {
    labels?: {
      done?: string;
      placeholder?: string;
    };
    theme?: {
      overlayColor?: string;
      doneColor?: string;
      iconColor?: string;
    };
  };
}

export interface StickerMakerActions {
  onMediaAction?: (action: 'camera' | 'gallery') => void;
  onStickerAction?: (action: 'send' | 'favorite', uri: string) => void;
}

export interface StickerMakerOptions {
  actionMenu?: ActionMenuConfig;
  loader?: LoaderConfig;
  editor?: EditorConfig;
  actions?: StickerMakerActions;
}

export interface StickerMakerProps {
  children: React.ReactNode;
}
