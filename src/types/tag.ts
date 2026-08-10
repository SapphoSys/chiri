export interface Tag {
  id: string;
  name: string;
  color: string;
  icon?: string; // Icon name from lucide-react
  emoji?: string; // Emoji character(s)
  sortOrder: number;
}
