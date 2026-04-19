export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'order' | 'refund';
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  depositId?: string;
  qrisUrl?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Order {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  operatorId: string;
  operatorName: string;
  orderId: string;
  phoneNumber: string;
  otp: string | null;
  price: number;
  markedPrice: number;
  status: 'pending' | 'received' | 'cancelled' | 'timeout' | 'finished';
  createdAt: any;
  updatedAt: any;
}

export interface Withdraw {
  id: string;
  adminId: string;
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'success' | 'failed';
  withdrawId?: string;
  createdAt: any;
}

export interface UserData {
  uid: string;
  email: string;
  balance: number;
  totalTransactions: number;
  createdAt: any;
  isAdmin?: boolean;
}
