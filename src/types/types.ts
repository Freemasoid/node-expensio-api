export type Transaction = {
  _id: { $oid: string };
  title: string;
  amount: number;
  type: "expense" | "income";
  category: string;
  date: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  _v: number;
};
