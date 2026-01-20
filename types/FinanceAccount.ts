export type AccountType = 'cash' | 'bank_account' | 'credit_card' | 'digital_wallet' | 'savings';
export type Currency = 'CLP' | 'USD' | 'UF';

export interface FinanceAccount {
    id: number;
    name: string;
    type: AccountType;
    currency: Currency;
    initial_balance: number;
    current_balance: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user_id: number;
}