import type { DayTheme, PlanetDay } from '../app/types/index';

// Day themes based on planetary rulers
export const dayThemes: Record<PlanetDay, DayTheme> = {
  sun: {
    name: 'Solar',
    description: 'Radiant energy of vitality and leadership',
    gradient: ['#FF9500', '#FF5E3A'],
    color: '#FF7A00',
    ui: {
      cardBorderRadius: 16,
      buttonBorderRadius: 8,
    },
    symbol: '☉',
    planetId: 'sun',
    correspondences: {
      colors: ['Gold', 'Yellow', 'Orange'],
      herbs: ['Sunflower', 'Marigold', 'St. John\'s Wort'],
      incense: ['Frankincense', 'Cinnamon', 'Orange'],
      crystals: ['Citrine', 'Amber', 'Tiger\'s Eye'],
      metal: 'Gold'
    },
    motifs: {
      element: 'Fire',
      pattern: 'Radial',
      symbol: '☉',
      borderStyle: 'golden',
      accentElement: 'sunflower'
    },
    patterns: {
      background: 'radial'
    },
    colors: {
      primary: '#FF9500',
      secondary: '#FF5E3A',
      gradientStart: '#FFF9F0',
      gradientMiddle: '#FFF5E6',
      gradientEnd: '#FFF0D9'
    },
    typography: {
      titleFont: 'Inter-Bold',
      bodyFont: 'Inter-Regular'
    }
  },
  moon: {
    name: 'Lunar',
    description: 'Intuitive energy of emotions and dreams',
    gradient: ['#8E8E93', '#C7C7CC'],
    color: '#AEAEB2',
    ui: {
      cardBorderRadius: 20,
      buttonBorderRadius: 20,
    },
    symbol: '☽',
    planetId: 'moon',
    correspondences: {
      colors: ['Silver', 'White', 'Pearl'],
      herbs: ['Jasmine', 'Mugwort', 'Willow'],
      incense: ['Jasmine', 'Sandalwood', 'Camphor'],
      crystals: ['Moonstone', 'Pearl', 'Selenite'],
      metal: 'Silver'
    },
    motifs: {
      element: 'Water',
      pattern: 'Waves',
      symbol: '☽',
      borderStyle: 'silver',
      accentElement: 'jasmine'
    },
    patterns: {
      background: 'waves'
    },
    colors: {
      primary: '#8E8E93',
      secondary: '#C7C7CC',
      gradientStart: '#F5F5F7',
      gradientMiddle: '#F0F0F2',
      gradientEnd: '#EBEBED'
    },
    typography: {
      titleFont: 'Inter-Bold',
      bodyFont: 'Inter-Regular'
    }
  },
  mars: {
    name: 'Martial',
    description: 'Dynamic energy of action and courage',
    gradient: ['#FF3B30', '#FF2D55'],
    color: '#FF3B30',
    ui: {
      cardBorderRadius: 8,
      buttonBorderRadius: 4,
    },
    symbol: '♂',
    planetId: 'mars',
    correspondences: {
      colors: ['Red', 'Crimson', 'Scarlet'],
      herbs: ['Dragon\'s Blood', 'Nettle', 'Ginger'],
      incense: ['Dragon\'s Blood', 'Tobacco', 'Pepper'],
      crystals: ['Ruby', 'Garnet', 'Bloodstone'],
      metal: 'Iron'
    },
    motifs: {
      element: 'Fire',
      pattern: 'Forge',
      symbol: '♂',
      borderStyle: 'iron',
      accentElement: 'dragon'
    },
    patterns: {
      background: 'forge'
    },
    colors: {
      primary: '#FF3B30',
      secondary: '#FF2D55',
      gradientStart: '#FFF5F5',
      gradientMiddle: '#FFEBEB',
      gradientEnd: '#FFE0E0'
    },
    typography: {
      titleFont: 'Inter-Bold',
      bodyFont: 'Inter-Regular'
    }
  },
  mercury: {
    name: 'Mercurial',
    description: 'Swift energy of communication and intellect',
    gradient: ['#5AC8FA', '#007AFF'],
    color: '#32ADE6',
    ui: {
      cardBorderRadius: 12,
      buttonBorderRadius: 12,
    },
    symbol: '☿',
    planetId: 'mercury',
    correspondences: {
      colors: ['Blue', 'Orange', 'Iridescent'],
      herbs: ['Lavender', 'Marjoram', 'Dill'],
      incense: ['Lavender', 'Clove', 'Storax'],
      crystals: ['Agate', 'Opal', 'Fluorite'],
      metal: 'Mercury/Quicksilver'
    },
    motifs: {
      element: 'Air',
      pattern: 'Circuit',
      symbol: '☿',
      borderStyle: 'alloy',
      accentElement: 'lavender'
    },
    patterns: {
      background: 'circuit'
    },
    colors: {
      primary: '#5AC8FA',
      secondary: '#007AFF',
      gradientStart: '#F0F9FF',
      gradientMiddle: '#E6F4FF',
      gradientEnd: '#D9EEFF'
    },
    typography: {
      titleFont: 'Inter-Bold',
      bodyFont: 'Inter-Regular'
    }
  },
  jupiter: {
    name: 'Jovial',
    description: 'Expansive energy of growth and abundance',
    gradient: ['#4CD964', '#34C759'],
    color: '#30D158',
    ui: {
      cardBorderRadius: 16,
      buttonBorderRadius: 16,
    },
    symbol: '♃',
    planetId: 'jupiter',
    correspondences: {
      colors: ['Purple', 'Blue', 'Indigo'],
      herbs: ['Sage', 'Cedar', 'Nutmeg'],
      incense: ['Cedar', 'Nutmeg', 'Saffron'],
      crystals: ['Amethyst', 'Lapis Lazuli', 'Sapphire'],
      metal: 'Tin'
    },
    motifs: {
      element: 'Air',
      pattern: 'Stars',
      symbol: '♃',
      borderStyle: 'tin',
      accentElement: 'sage'
    },
    patterns: {
      background: 'stars'
    },
    colors: {
      primary: '#4CD964',
      secondary: '#34C759',
      gradientStart: '#F0FFF5',
      gradientMiddle: '#E6FFEB',
      gradientEnd: '#D9FFE0'
    },
    typography: {
      titleFont: 'Inter-Bold',
      bodyFont: 'Inter-Regular'
    }
  },
  venus: {
    name: 'Venusian',
    description: 'Harmonious energy of love and beauty',
    gradient: ['#FF9500', '#FF2D55'],
    color: '#FF375F',
    ui: {
      cardBorderRadius: 24,
      buttonBorderRadius: 12,
    },
    symbol: '♀',
    planetId: 'venus',
    correspondences: {
      colors: ['Green', 'Pink', 'Rose'],
      herbs: ['Rose', 'Vanilla', 'Thyme'],
      incense: ['Rose', 'Vanilla', 'Benzoin'],
      crystals: ['Rose Quartz', 'Emerald', 'Jade'],
      metal: 'Copper'
    },
    motifs: {
      element: 'Earth',
      pattern: 'Petals',
      symbol: '♀',
      borderStyle: 'copper',
      accentElement: 'rose'
    },
    patterns: {
      background: 'petals'
    },
    colors: {
      primary: '#FF9500',
      secondary: '#FF2D55',
      gradientStart: '#FFF5F9',
      gradientMiddle: '#FFEBF3',
      gradientEnd: '#FFE0EC'
    },
    typography: {
      titleFont: 'Inter-Bold',
      bodyFont: 'Inter-Regular'
    }
  },
  saturn: {
    name: 'Saturnian',
    description: 'Structured energy of discipline and wisdom',
    gradient: ['#8E8E93', '#636366'],
    color: '#8E8E93',
    ui: {
      cardBorderRadius: 4,
      buttonBorderRadius: 2,
    },
    symbol: '♄',
    planetId: 'saturn',
    correspondences: {
      colors: ['Black', 'Dark Blue', 'Gray'],
      herbs: ['Cypress', 'Myrrh', 'Comfrey'],
      incense: ['Myrrh', 'Cypress', 'Patchouli'],
      crystals: ['Onyx', 'Obsidian', 'Jet'],
      metal: 'Lead'
    },
    motifs: {
      element: 'Earth',
      pattern: 'Stone',
      symbol: '♄',
      borderStyle: 'lead',
      accentElement: 'cypress'
    },
    patterns: {
      background: 'stone'
    },
    colors: {
      primary: '#8E8E93',
      secondary: '#636366',
      gradientStart: '#F5F5F5',
      gradientMiddle: '#EBEBEB',
      gradientEnd: '#E0E0E0'
    },
    typography: {
      titleFont: 'Inter-Bold',
      bodyFont: 'Inter-Regular'
    }
  }
};