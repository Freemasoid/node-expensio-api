export type Transaction = {
  _id: string;
  title: string;
  amount: number;
  type: "expense" | "income";
  category: string;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _v: number;
};

export type Card = {
  _id: string;
  bankName: string;
  cardType: "credit" | "debit";
  lastFourDigits: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  _v: number;
};
