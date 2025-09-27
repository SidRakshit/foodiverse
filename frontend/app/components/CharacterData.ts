export interface CharacterOption {
  id: string;
  number: number;
  skinColor: string;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
}

export const CHARACTER_OPTIONS: CharacterOption[] = [
  {
    id: 'char1',
    number: 1,
    skinColor: '#FFDBAC', // Fair skin
    hairColor: '#8B4513', // Brown hair
    shirtColor: '#FF6B6B', // Red shirt
    pantsColor: '#4ECDC4' // Teal pants
  },
  {
    id: 'char2',
    number: 2,
    skinColor: '#F5DEB3', // Light skin
    hairColor: '#2C1810', // Black hair
    shirtColor: '#FF6B35', // Orange shirt
    pantsColor: '#2E5266' // Navy pants
  },
  {
    id: 'char3',
    number: 3,
    skinColor: '#8B4513', // Brown skin
    hairColor: '#1A0A00', // Dark brown hair
    shirtColor: '#9B59B6', // Purple shirt
    pantsColor: '#2C3E50' // Dark blue pants
  },
  {
    id: 'char4',
    number: 4,
    skinColor: '#D2B48C', // Tan skin
    hairColor: '#654321', // Brown hair
    shirtColor: '#27AE60', // Green shirt
    pantsColor: '#8E44AD' // Purple pants
  },
  {
    id: 'char5',
    number: 5,
    skinColor: '#FFDBAC', // Fair skin
    hairColor: '#FFD700', // Blonde hair
    shirtColor: '#E74C3C', // Red shirt
    pantsColor: '#34495E' // Gray pants
  },
  {
    id: 'char6',
    number: 6,
    skinColor: '#C49B61', // Olive skin
    hairColor: '#4A4A4A', // Dark hair
    shirtColor: '#3498DB', // Blue shirt
    pantsColor: '#2C2C2C' // Black pants
  },
  {
    id: 'char7',
    number: 7,
    skinColor: '#E6B887', // Medium brown skin
    hairColor: '#2F1B14', // Dark brown hair
    shirtColor: '#F39C12', // Yellow shirt
    pantsColor: '#16A085' // Teal pants
  },
  {
    id: 'char8',
    number: 8,
    skinColor: '#CD853F', // Medium tan skin
    hairColor: '#654321', // Brown hair
    shirtColor: '#2ECC71', // Mint green shirt
    pantsColor: '#7F8C8D' // Gray pants
  }
];

export interface GenderOption {
  id: string;
  name: string;
  pronouns: string;
  allowCustom?: boolean;
}

export const GENDER_OPTIONS: GenderOption[] = [
  { id: 'he', name: 'He/Him', pronouns: 'he/him' },
  { id: 'she', name: 'She/Her', pronouns: 'she/her' },
  { id: 'they', name: 'They/Them', pronouns: 'they/them' },
  { id: 'custom', name: 'Custom', pronouns: '', allowCustom: true },
  { id: 'prefer-not', name: 'Prefer not to specify', pronouns: '' }
];

export interface PlayerCharacter {
  selectedCharacter: CharacterOption;
  playerName: string;
  selectedGender?: GenderOption;
  customPronouns?: string;
  showPronouns: boolean;
}