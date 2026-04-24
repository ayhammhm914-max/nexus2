export type User = {
  id: string;
  email: string;
  username: string;
  role: "CUSTOMER" | "ADMIN" | "SUPERADMIN";
  isEmailVerified: boolean;
  avatarUrl?: string | null;
  loyaltyPoints: number;
  balance: number;
};

