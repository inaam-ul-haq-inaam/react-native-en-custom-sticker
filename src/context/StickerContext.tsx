import React, { createContext, useContext, useState } from 'react';
import type { StickerMakerOptions } from '../types/types';
import { ActionPopup } from '../components/ActionPopup';
import { StickerEditorModal } from '../components/StickerEditorModal';

interface StickerContextType {
  openStickerPopup: (options?: StickerMakerOptions) => void;
  closeStickerPopup: () => void;
  openEditor: (uri: string) => void;
  closeEditor: () => void;
}

const StickerContext = createContext<StickerContextType | undefined>(undefined);

interface StickerProviderProps {
  children: React.ReactNode;
}

export const StickerProvider: React.FC<StickerProviderProps> = ({
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [options, setOptions] = useState<StickerMakerOptions | undefined>(undefined);
  
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState<string | null>(null);

  const openStickerPopup = (newOptions?: StickerMakerOptions) => {
    if (newOptions) setOptions(newOptions);
    setIsVisible(true);
  };

  const closeStickerPopup = () => {
    setIsVisible(false);
  };

  const openEditor = (uri: string) => {
    setCurrentImageUri(uri);
    setIsEditorVisible(true);
  };

  const closeEditor = () => {
    setCurrentImageUri(null);
    setIsEditorVisible(false);
  };

  return (
    <StickerContext.Provider value={{ openStickerPopup, closeStickerPopup, openEditor, closeEditor }}>
      {children}

      <ActionPopup
        isVisible={isVisible}
        onClose={closeStickerPopup}
        actionMenu={options?.actionMenu}
        actions={options?.actions}
      />
      
      {isEditorVisible && (
        <StickerEditorModal
          uri={currentImageUri}
          onClose={closeEditor}
          actions={options?.actions}
          loader={options?.loader}
          editor={options?.editor}
        />
      )}
    </StickerContext.Provider>
  );
};

export const useStickerMaker = () => {
  const context = useContext(StickerContext);
  if (!context) {
    throw new Error('useStickerMaker must be used within a StickerProvider');
  }
  return context;
};
