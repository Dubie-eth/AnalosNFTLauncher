import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CollectionConfig, Collection, CollectionStatus } from '@analos-nft-launcher/shared';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  
  // Collections
  collections: Collection[];
  selectedCollection: Collection | null;
  
  // Creation Flow
  creationStep: number;
  collectionConfig: Partial<CollectionConfig> | null;
  uploadedImages: any[];
  generatedMetadata: any[];
  
  // Loading States
  isLoading: boolean;
  loadingMessage: string;
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
  }>;
}

interface AppActions {
  // UI Actions
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  
  // Collection Actions
  setCollections: (collections: Collection[]) => void;
  addCollection: (collection: Collection) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  setSelectedCollection: (collection: Collection | null) => void;
  
  // Creation Flow Actions
  setCreationStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setCollectionConfig: (config: Partial<CollectionConfig> | null) => void;
  updateCollectionConfig: (updates: Partial<CollectionConfig>) => void;
  setUploadedImages: (images: any[]) => void;
  addUploadedImage: (image: any) => void;
  removeUploadedImage: (index: number) => void;
  setGeneratedMetadata: (metadata: any[]) => void;
  resetCreationFlow: () => void;
  
  // Loading Actions
  setLoading: (loading: boolean, message?: string) => void;
  
  // Notification Actions
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  sidebarOpen: false,
  theme: 'light',
  collections: [],
  selectedCollection: null,
  creationStep: 0,
  collectionConfig: null,
  uploadedImages: [],
  generatedMetadata: [],
  isLoading: false,
  loadingMessage: '',
  notifications: [],
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // UI Actions
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setTheme: (theme) => set({ theme }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        toggleTheme: () => set((state) => ({ 
          theme: state.theme === 'light' ? 'dark' : 'light' 
        })),
        
        // Collection Actions
        setCollections: (collections) => set({ collections }),
        addCollection: (collection) => set((state) => ({
          collections: [...state.collections, collection]
        })),
        updateCollection: (id, updates) => set((state) => ({
          collections: state.collections.map(collection =>
            collection.id === id ? { ...collection, ...updates } : collection
          ),
          selectedCollection: state.selectedCollection?.id === id 
            ? { ...state.selectedCollection, ...updates }
            : state.selectedCollection
        })),
        setSelectedCollection: (collection) => set({ selectedCollection: collection }),
        
        // Creation Flow Actions
        setCreationStep: (step) => set({ creationStep: step }),
        nextStep: () => set((state) => ({ 
          creationStep: Math.min(state.creationStep + 1, 5) 
        })),
        prevStep: () => set((state) => ({ 
          creationStep: Math.max(state.creationStep - 1, 0) 
        })),
        setCollectionConfig: (config) => set({ collectionConfig: config }),
        updateCollectionConfig: (updates) => set((state) => ({
          collectionConfig: state.collectionConfig 
            ? { ...state.collectionConfig, ...updates }
            : updates
        })),
        setUploadedImages: (images) => set({ uploadedImages: images }),
        addUploadedImage: (image) => set((state) => ({
          uploadedImages: [...state.uploadedImages, image]
        })),
        removeUploadedImage: (index) => set((state) => ({
          uploadedImages: state.uploadedImages.filter((_, i) => i !== index)
        })),
        setGeneratedMetadata: (metadata) => set({ generatedMetadata: metadata }),
        resetCreationFlow: () => set({
          creationStep: 0,
          collectionConfig: null,
          uploadedImages: [],
          generatedMetadata: [],
        }),
        
        // Loading Actions
        setLoading: (loading, message = '') => set({ 
          isLoading: loading, 
          loadingMessage: message 
        }),
        
        // Notification Actions
        addNotification: (notification) => set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: Date.now().toString(),
              timestamp: new Date(),
            }
          ]
        })),
        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),
        clearNotifications: () => set({ notifications: [] }),
      }),
      {
        name: 'analos-nft-launcher-store',
        partialize: (state) => ({
          theme: state.theme,
          collections: state.collections,
          selectedCollection: state.selectedCollection,
        }),
      }
    ),
    {
      name: 'analos-nft-launcher',
    }
  )
);
