export interface Artifact {
  id: string;
  scanLogId: string;
  title: string;
  description: string;
  tags: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  images: string[];
  createdAt: number;
  updatedAt: number;
}
