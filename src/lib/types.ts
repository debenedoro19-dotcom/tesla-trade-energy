export type Appointment = {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  format: "In-Person" | "Virtual";
  status: "pending" | "approved" | "rejected" | "completed";
  notes: string;
  createdAt: string;
};

export type InventoryItem = {
  id: string;
  title: string;
  category: "Vehicles" | "Energy" | "Robotics";
  price: number;
  status: "available" | "sold" | "pending";
  description: string;
  image?: string;
  createdAt: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  approved: boolean;
  avatar?: string;
  createdAt: string;
};

export type InvestmentPackage = {
  id: string;
  name: string;
  minAmount: number;
  expectedReturn: string;
  duration: string;
  description: string;
  features: string[];
  highlighted: boolean;
  active: boolean;
  createdAt: string;
};

export type PaymentMethod = {
  id: string;
  name: string;
  type: "Bank" | "Crypto" | "Card" | "Other";
  details: string;
  instructions: string;
  active: boolean;
  createdAt: string;
};

export type PortfolioItem = {
  id: string;
  name: string;
  symbol: string;
  value: string;
  change: string;
  changeUp: boolean;
  allocation: string;
  createdAt: string;
};

export type Giveaway = {
  id: string;
  title: string;
  prize: string;
  description: string;
  endDate: string;
  entryFee: string;
  maxEntries: number;
  currentEntries: number;
  active: boolean;
  image?: string;
  createdAt: string;
};

export type SiteSettings = {
  heroTitle: string;
  heroSubtitle: string;
  tradingVolume: string;
  activeTraders: string;
  uptime: string;
  appointmentFee: string;
  inventoryTitle: string;
  inventorySubtitle: string;
  marketTitle: string;
  marketSubtitle: string;
  visionTitle: string;
  visionSubtitle: string;
  vipTitle: string;
  vipSubtitle: string;
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  contactTitle: string;
  contactSubtitle: string;
  investmentsTitle: string;
  investmentsSubtitle: string;
  paymentsTitle: string;
  paymentsSubtitle: string;
  portfolioTitle: string;
  portfolioSubtitle: string;
  giveawayTitle: string;
  giveawaySubtitle: string;
  whatsappNumber: string;
  supportEmail: string;
  adminPassword: string;
};


export type Order = {
  id: string;
  type: "product" | "investment" | "giveaway";
  productName: string;
  productId?: string;
  name: string;
  email: string;
  phone: string;
  paymentMethod: string;
  amount: string;
  notes: string;
  status: "pending" | "paid" | "cancelled" | "completed";
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  createdAt: string;
  lastLogin?: string;
  // KYC
  kycStatus: "none" | "pending" | "approved" | "rejected";
  kycFullName?: string;
  kycIdType?: string;
  kycIdNumber?: string;
  kycCountry?: string;
  kycAddress?: string;
  kycSubmittedAt?: string;
  kycNotes?: string;
};

export type ChatMessage = {
  id: string;
  sessionId: string;
  name: string;
  email: string;
  message: string;
  from: "user" | "support";
  read: boolean;
  createdAt: string;
};
