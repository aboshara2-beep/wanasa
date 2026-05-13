import { create } from 'zustand';

interface Campaign {
  id:          string;
  sponsorName: string;
  title:       string;
  description: string;
  logoUrl:     string;
  themeColor:  string;
  endAt:       string;
}

interface SponsoredState {
  isActive:             boolean;
  lockNormalChallenges: boolean;
  pinToFeed:            boolean;
  campaign:             Campaign | null;
}

interface SponsorshipStore {
  state:          SponsoredState;
  setSponsored:   (campaign: Campaign) => void;
  clearSponsored: () => void;
}

const DEFAULT: SponsoredState = {
  isActive:             false,
  lockNormalChallenges: false,
  pinToFeed:            false,
  campaign:             null,
};

export const useSponsorshipStore = create<SponsorshipStore>((set) => ({
  state: DEFAULT,

  setSponsored: (campaign) =>
    set({
      state: {
        isActive:             true,
        lockNormalChallenges: true,
        pinToFeed:            true,
        campaign,
      },
    }),

  clearSponsored: () => set({ state: DEFAULT }),
}));
