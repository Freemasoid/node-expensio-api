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
