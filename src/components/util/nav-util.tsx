import { LucideIcon } from "lucide-react";

export const navMain: {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items: {
    title: string;
    url: string;
  }[];
}[] = [
  {
    title: "Wallets",
    url: "#",
    items: [
      {
        title: "HD wallet creation",
        url: "/wallet-creation",
      },
    ],
  },
];
