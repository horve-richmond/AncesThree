export interface FamilyMember {
  id: string;
  name: string;
  relation: 'root' | 'spouse' | 'child' | 'parent' | 'sibling' | 'relative'; // Simplified for UI context
  gender: 'male' | 'female' | 'other';
  birthDate: string;
  deathDate?: string;
  photoUrl?: string;
  bio: string;
  location: string;
  generation: number;
  parents: string[]; // IDs
  children: string[]; // IDs
  spouses: string[]; // IDs
  attributes: {
    skills: string[];
    roles: string[]; // e.g., "Family Historian"
    traits: string[];
  };
}

export interface FamilyEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  involvedMemberIds: string[];
  type: 'birth' | 'marriage' | 'death' | 'achievement' | 'migration' | 'general';
}

export type ViewState = 'tree' | 'profile' | 'timeline' | 'ai-historian';
