declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';

  interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    absoluteStrokeWidth?: boolean;
  }

  type LucideIcon = ComponentType<LucideProps>;

  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const Upload: LucideIcon;
  export const Download: LucideIcon;
  export const File: LucideIcon;
  export const FileText: LucideIcon;
  export const FileAudio: LucideIcon;
  export const FileVideo: LucideIcon;
  export const FolderOpen: LucideIcon;
  export const User: LucideIcon;
  export const LogOut: LucideIcon;
  export const Menu: LucideIcon;
  export const X: LucideIcon;
  export const Search: LucideIcon;
  export const Plus: LucideIcon;
  export const Trash2: LucideIcon;
  export const Edit: LucideIcon;
  export const Save: LucideIcon;
  export const Check: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Info: LucideIcon;
  export const Home: LucideIcon;
  export const Settings: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Lock: LucideIcon;
  export const Unlock: LucideIcon;
  export const Mail: LucideIcon;
  export const Phone: LucideIcon;
  export const Calendar: LucideIcon;
  export const Clock: LucideIcon;
  export const Star: LucideIcon;
  export const Heart: LucideIcon;
  export const Share: LucideIcon;
  export const Copy: LucideIcon;
  export const Link: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Folder: LucideIcon;
  export const FolderOpen: LucideIcon;
  
  // Add more icons as needed
  const icons: Record<string, LucideIcon>;
  export default icons;
} 