export interface Tag {
  id: string;
  name: string;
  color: string;
  icon?: string; // icon name from lucide-react
  emoji?: string; // emoji character(s)
  sortOrder: number;
}
