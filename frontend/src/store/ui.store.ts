import { create } from "zustand";

type UIState = {
  announcementDismissed: boolean;
  dismissAnnouncement: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  announcementDismissed: false,
  dismissAnnouncement: () => set({ announcementDismissed: true })
}));

