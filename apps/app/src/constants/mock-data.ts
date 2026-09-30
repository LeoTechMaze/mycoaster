/**
 * Static placeholder content for the layout pass, copied from the design
 * prototype (design_handoff_mycoaster). Replace with real API data later.
 */

import type { CoasterStatus, Sentiment } from '@/constants/theme';

export type MockReview = {
  user: string;
  badge: string;
  stars: string;
  date: string;
  text: string;
};

export type MockTag = { name: string; count: number; sentiment: Sentiment };

export type MockAiSummary = { summary: string; tags: MockTag[] };

export type MockCoaster = {
  id: string;
  name: string;
  type: string;
  status: CoasterStatus;
  rating: string;
  ridden?: boolean;
  ai?: MockAiSummary;
  reviews?: MockReview[];
};

export type MockPhoto = {
  id: string;
  author: string;
  likes: number;
  height: number;
  hueA: string;
  hueB: string;
  tag: string;
  pending?: boolean;
  liked?: boolean;
};

export type MockPark = {
  id: string;
  name: string;
  location: string;
  kmLabel: string;
  rating: string;
  reviewCount: number;
  hueA: string;
  hueB: string;
  hasHero?: boolean;
  ridden: number;
  total: number;
  ai?: MockAiSummary;
  reviews?: MockReview[];
  photos?: MockPhoto[];
  coasters: MockCoaster[];
};

export const mockUser = {
  name: 'Leo',
  initial: 'L',
  credits: 47,
  rank: 128,
  parksVisited: 12,
  reviews: 9,
  photosShared: 14,
  badge: 'Enthusiast',
  nextBadge: 'Veteran',
  nextBadgeAt: 75,
  creditsToNextBadge: 28,
  badgeProgressPct: 44,
  isPremium: false,
};

export const mockParks: MockPark[] = [
  {
    id: 'beto',
    name: 'Beto Carrero World',
    location: 'Penha, SC · Brazil',
    kmLabel: '12 km',
    rating: '4.8',
    reviewCount: 214,
    hueA: '#dde7fa',
    hueB: '#d2defa',
    hasHero: true,
    ridden: 3,
    total: 9,
    ai: {
      summary:
        'Visitors consistently praise the immersive theming and world-class coaster lineup, with FireWhip cited as the highlight. Long queues on weekends and pricey food inside the park are the most common complaints.',
      tags: [
        { name: 'Theming', count: 41, sentiment: 'positive' },
        { name: 'Queues', count: 33, sentiment: 'negative' },
        { name: 'Food', count: 18, sentiment: 'mixed' },
        { name: 'Service', count: 12, sentiment: 'positive' },
        { name: 'Value', count: 9, sentiment: 'mixed' },
      ],
    },
    reviews: [
      {
        user: 'Marina P.',
        badge: 'Veteran',
        stars: '★★★★★',
        date: '2 weeks ago',
        text: 'Best park in Latin America, no contest. The Theming on the new area is world-class and the staff Service was impeccable. Go on a weekday!',
      },
      {
        user: 'Diego R.',
        badge: 'Enthusiast',
        stars: '★★★★',
        date: '1 month ago',
        text: 'Amazing coaster lineup but the Queues on Saturday were brutal — 90 min for FireWhip. Food is decent but overpriced for what you get.',
      },
      {
        user: 'Carla M.',
        badge: 'Rookie',
        stars: '★★★★★',
        date: '1 month ago',
        text: 'My first big park! The Theming blew my mind, everything feels like a movie set. Queues moved faster than expected.',
      },
    ],
    photos: [
      { id: 'b1', author: 'Marina P.', likes: 128, hueA: '#dde7fa', hueB: '#cdd9f5', height: 150, tag: 'FireWhip loop', liked: true },
      { id: 'b2', author: 'Diego R.', likes: 96, hueA: '#d8ecdf', hueB: '#c8e2d2', height: 110, tag: 'park entrance' },
      { id: 'b3', author: 'Ana T.', likes: 74, hueA: '#fbe9db', hueB: '#f4dcc8', height: 130, tag: 'night parade' },
      { id: 'b4', author: 'Rafael S.', likes: 51, hueA: '#e9defa', hueB: '#ded0f4', height: 120, tag: 'Star Mountain' },
      { id: 'b5', author: 'Julia F.', likes: 33, hueA: '#dbeef8', hueB: '#c9e3f2', height: 140, tag: 'castle area' },
      { id: 'b6', author: 'Pedro L.', likes: 20, hueA: '#f6e3e9', hueB: '#efd2dc', height: 105, tag: 'kids zone' },
    ],
    coasters: [
      {
        id: 'fw',
        name: 'FireWhip',
        type: 'Inverted',
        status: 'operating',
        rating: '4.9',
        ridden: true,
        ai: {
          summary:
            'Riders love the intense first drop and relentless pacing — pure Adrenaline from start to finish, and remarkably smooth for an inverted coaster. The single-train operation makes the Queue slow on busy days.',
          tags: [
            { name: 'Adrenaline', count: 38, sentiment: 'positive' },
            { name: 'Smoothness', count: 21, sentiment: 'positive' },
            { name: 'Queue', count: 17, sentiment: 'negative' },
            { name: 'Airtime', count: 9, sentiment: 'positive' },
          ],
        },
        reviews: [
          {
            user: 'Lucas V.',
            badge: 'Legend',
            stars: '★★★★★',
            date: '3 days ago',
            text: 'Still the best inverted in the southern hemisphere. The Adrenaline on that first drop never gets old. Buttery Smoothness after the retrack.',
          },
          {
            user: 'Fer G.',
            badge: 'Veteran',
            stars: '★★★★',
            date: '2 weeks ago',
            text: 'Incredible ride but the Queue crawls — one train ops on a Saturday is criminal.',
          },
          {
            user: 'Bia N.',
            badge: 'Enthusiast',
            stars: '★★★★★',
            date: '1 month ago',
            text: 'Rode it 6 times in a row. Zero headbanging, all Adrenaline. Sit in the back for the Airtime pop.',
          },
        ],
      },
      { id: 'sm', name: 'Star Mountain', type: 'Indoor', status: 'operating', rating: '4.3', ridden: true },
      { id: 'ba', name: 'Big Apple', type: 'Junior', status: 'operating', rating: '3.2', ridden: true },
      { id: 'mo', name: 'Mina de Ouro', type: 'Mine Train', status: 'operating', rating: '4.1' },
      { id: 'fu', name: 'Furacão', type: 'Spinning', status: 'operating', rating: '3.8' },
      { id: 'pn', name: 'Pantera Negra', type: 'Launched', status: 'operating', rating: '4.7' },
      { id: 'zp', name: 'Zeppelin', type: 'Steel Looper', status: 'sbno', rating: '4.0' },
      { id: 'tv', name: 'Trovão', type: 'Family Boomerang', status: 'operating', rating: '4.4' },
      { id: 'ek', name: 'Estrela Kids', type: 'Junior', status: 'operating', rating: '2.9' },
    ],
  },
  {
    id: 'hopi',
    name: 'Hopi Hari',
    location: 'Vinhedo, SP · Brazil',
    kmLabel: '92 km',
    rating: '4.2',
    reviewCount: 8,
    hueA: '#d8ecdf',
    hueB: '#c8e2d2',
    ridden: 0,
    total: 4,
    reviews: [
      {
        user: 'Tiago B.',
        badge: 'Veteran',
        stars: '★★★★',
        date: '3 weeks ago',
        text: 'Montezum alone is worth the trip — classic wooden roughness in the best way. Park upkeep has improved a lot this year.',
      },
      {
        user: 'Lu C.',
        badge: 'Enthusiast',
        stars: '★★★',
        date: '2 months ago',
        text: 'Fun day but half the food stands were closed and Katapul broke down twice.',
      },
    ],
    photos: [
      { id: 'h1', author: 'Tiago B.', likes: 44, hueA: '#d8ecdf', hueB: '#c6ddce', height: 130, tag: 'Montezum turn' },
      { id: 'h2', author: 'Lu C.', likes: 29, hueA: '#fbe9db', hueB: '#f2d8c4', height: 110, tag: 'Katapul launch' },
      { id: 'h3', author: 'Nina R.', likes: 12, hueA: '#dbeef8', hueB: '#c7e0ef', height: 145, tag: 'main street' },
    ],
    coasters: [
      {
        id: 'mz',
        name: 'Montezum',
        type: 'Wooden',
        status: 'operating',
        rating: '4.6',
        reviews: [
          {
            user: 'Tiago B.',
            badge: 'Veteran',
            stars: '★★★★★',
            date: '3 weeks ago',
            text: 'One of the great woodies of the world. Rattly, fast, glorious.',
          },
          {
            user: 'Rê A.',
            badge: 'Rookie',
            stars: '★★★★',
            date: '1 month ago',
            text: 'Scared me half to death. 10/10 would scream again.',
          },
        ],
      },
      { id: 'kt', name: 'Katapul', type: 'Launched', status: 'operating', rating: '4.4' },
      { id: 'vg', name: 'Vurang', type: 'Family', status: 'operating', rating: '3.7' },
      { id: 'lb', name: 'La Bruxa', type: 'Wild Mouse', status: 'sbno', rating: '3.5' },
    ],
  },
  {
    id: 'mira',
    name: 'Mirabilandia',
    location: 'Olinda, PE · Brazil',
    kmLabel: '2,650 km',
    rating: '3.9',
    reviewCount: 3,
    hueA: '#fbe9db',
    hueB: '#f4dcc8',
    ridden: 0,
    total: 2,
    coasters: [
      { id: 'cy', name: 'Cyclone', type: 'Steel Looper', status: 'operating', rating: '3.9' },
      { id: 'sl', name: 'Super Loop', type: 'Family', status: 'operating', rating: '3.4' },
    ],
  },
  {
    id: 'europa',
    name: 'Europa-Park',
    location: 'Rust · Germany',
    kmLabel: '9,412 km',
    rating: '4.9',
    reviewCount: 6,
    hueA: '#e9defa',
    hueB: '#ded0f4',
    ridden: 0,
    total: 6,
    coasters: [
      { id: 'ss', name: 'Silver Star', type: 'Mega', status: 'operating', rating: '4.8' },
      { id: 'bf', name: 'Blue Fire', type: 'Launched', status: 'operating', rating: '4.7' },
      { id: 'wo', name: 'Wodan', type: 'Wooden', status: 'operating', rating: '4.8' },
      { id: 'em', name: 'Euro-Mir', type: 'Spinning', status: 'operating', rating: '4.2' },
      { id: 'ar', name: 'Arthur', type: 'Inverted Family', status: 'operating', rating: '4.3' },
      { id: 'vn', name: 'Voltron Nevera', type: 'Multi-launch', status: 'operating', rating: '4.9' },
    ],
  },
  {
    id: 'sfmm',
    name: 'Six Flags Magic Mountain',
    location: 'Valencia, CA · USA',
    kmLabel: '9,840 km',
    rating: '4.6',
    reviewCount: 5,
    hueA: '#dbeef8',
    hueB: '#c9e3f2',
    ridden: 0,
    total: 3,
    coasters: [
      { id: 'x2', name: 'X2', type: '4th Dimension', status: 'operating', rating: '4.7' },
      { id: 'ta', name: 'Tatsu', type: 'Flying', status: 'operating', rating: '4.6' },
      { id: 'tc', name: 'Twisted Colossus', type: 'Hybrid', status: 'operating', rating: '4.8' },
    ],
  },
];

export function findPark(id: string | undefined): MockPark {
  return mockParks.find((p) => p.id === id) ?? mockParks[0];
}

export function findCoaster(id: string | undefined): { park: MockPark; coaster: MockCoaster } {
  for (const park of mockParks) {
    const coaster = park.coasters.find((c) => c.id === id);
    if (coaster) return { park, coaster };
  }
  return { park: mockParks[0], coaster: mockParks[0].coasters[0] };
}

export type MockRankRow = {
  rank: number;
  name: string;
  credits: number;
  badge: string;
  initial: string;
  me?: boolean;
};

export const mockPodium = {
  first: { name: 'CoasterKing_BR', credits: '512 credits · Legend', initial: 'C' },
  second: { name: 'LoopHunter', credits: '486 credits', initial: 'L' },
  third: { name: 'AirtimeAna', credits: '451 credits', initial: 'A' },
};

export const mockRankRowsTop: MockRankRow[] = [
  { rank: 4, name: 'KredHunter', credits: 448, badge: 'Legend', initial: 'K' },
  { rank: 5, name: 'WoodieWill', credits: 430, badge: 'Legend', initial: 'W' },
  { rank: 6, name: 'inversion_iza', credits: 402, badge: 'Veteran', initial: 'I' },
  { rank: 7, name: 'ParkHopperBR', credits: 388, badge: 'Veteran', initial: 'P' },
];

export const mockRankRowsAroundMe: MockRankRow[] = [
  { rank: 127, name: 'ThrillTheo', credits: 48, badge: 'Enthusiast', initial: 'T' },
  { rank: 128, name: 'Leo (you)', credits: 47, badge: 'Enthusiast', initial: 'L', me: true },
  { rank: 129, name: 'gforce_gabi', credits: 46, badge: 'Enthusiast', initial: 'G' },
];

export const mockRecentCredits = [
  { name: 'FireWhip', park: 'Beto Carrero World', when: 'Just now' },
  { name: 'Star Mountain', park: 'Beto Carrero World', when: 'May 12' },
  { name: 'Big Apple', park: 'Beto Carrero World', when: 'Apr 30' },
];

export const mockLogList = [
  { name: 'Mina de Ouro', park: 'Beto Carrero World' },
  { name: 'Furacão', park: 'Beto Carrero World' },
  { name: 'Pantera Negra', park: 'Beto Carrero World' },
  { name: 'Trovão', park: 'Beto Carrero World' },
  { name: 'Montezum', park: 'Hopi Hari' },
  { name: 'Katapul', park: 'Hopi Hari' },
];
