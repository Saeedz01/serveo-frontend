export type Provider = {
  id: string;
  name: string;
  role: string;
  rating: number;
  jobs: number;
  rate: string;
  status: string;
  initials: string;
};

export const providers: Provider[] = [
  {
    id: "1",
    name: "Maya Chen",
    role: "Furniture assembly pro",
    rating: 4.98,
    jobs: 214,
    rate: "$45/hr",
    status: "Available today",
    initials: "MC",
  },
  {
    id: "2",
    name: "Jordan Ellis",
    role: "Moving specialist",
    rating: 4.95,
    jobs: 168,
    rate: "$55/hr",
    status: "2 slots left",
    initials: "JE",
  },
  {
    id: "3",
    name: "Sam Ortiz",
    role: "Home repair expert",
    rating: 4.97,
    jobs: 301,
    rate: "$60/hr",
    status: "Booked 12 times this week",
    initials: "SO",
  },
];
