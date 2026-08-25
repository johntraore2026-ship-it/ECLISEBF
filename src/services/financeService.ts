import { supabase, isSupabaseConfigured, isTableMissingError } from '../lib/supabase';
import { FinanceTransaction, FinanceCategory, FinanceAttachment, TransactionStatus } from '../types';
import { DEMO_TRANSACTIONS, DEMO_FINANCE_CATEGORIES } from '../data/demoData';

let localDemoTransactions = [...DEMO_TRANSACTIONS];
let localDemoCategories = [...DEMO_FINANCE_CATEGORIES];

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  tithesTotal: number;
  offeringsTotal: number;
  pendingApprovalsCount: number;
  pendingApprovalsAmount: number;
}

export const financeService = {
  async getCategories(churchId: string, isDemoMode = false): Promise<FinanceCategory[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoCategories.filter(c => c.church_id === churchId);
    }

    const { data, error } = await supabase
      .from('finance_categories')
      .select('*')
      .eq('church_id', churchId)
      .order('name');

    if (error) {
      if (isTableMissingError(error)) {
        return localDemoCategories.filter(c => c.church_id === churchId);
      }
      throw new Error(`Erreur lors du chargement des catégories financières : ${error.message}`);
    }

    return (data || []) as FinanceCategory[];
  },

  async createCategory(categoryData: Omit<FinanceCategory, 'id'>, isDemoMode = false): Promise<FinanceCategory> {
    if (isDemoMode || !isSupabaseConfigured) {
      const newCat: FinanceCategory = {
        ...categoryData,
        id: `fc-demo-${Date.now()}`
      };
      localDemoCategories.push(newCat);
      return newCat;
    }

    const { data, error } = await supabase
      .from('finance_categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de catégorie : ${error.message}`);
    }

    return data as FinanceCategory;
  },

  async getTransactions(churchId: string, isDemoMode = false): Promise<FinanceTransaction[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoTransactions
        .filter(t => t.church_id === churchId)
        .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
    }

    // Attempt query with category join, fallback to plain select if relationships are missing
    let data: any = null;
    let error: any = null;

    try {
      const res = await supabase
        .from('finance_transactions')
        .select(`
          *,
          category:finance_categories(name)
        `)
        .eq('church_id', churchId)
        .order('transaction_date', { ascending: false });

      if (res.error) {
        // Retry with basic select in case of foreign key relationship error in schema cache
        const simpleRes = await supabase
          .from('finance_transactions')
          .select('*')
          .eq('church_id', churchId)
          .order('transaction_date', { ascending: false });
        
        data = simpleRes.data;
        error = simpleRes.error;
      } else {
        data = res.data;
        error = res.error;
      }
    } catch (e: any) {
      error = e;
    }

    if (error) {
      console.warn('Supabase finance_transactions notice (using local fallback):', error.message || error);
      return localDemoTransactions
        .filter(t => t.church_id === churchId)
        .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
    }

    return (data || []).map((item: any) => ({
      ...item,
      category_name: item.category?.name || item.category_name || 'Général',
      created_by_name: item.created_by_name || undefined,
      approved_by_name: item.approved_by_name || undefined,
      donor_name: item.donor_name || undefined,
    })) as FinanceTransaction[];
  },

  async createTransaction(
    transData: Omit<FinanceTransaction, 'id' | 'created_at' | 'updated_at' | 'approved_by' | 'approved_at'>,
    isDemoMode = false
  ): Promise<FinanceTransaction> {
    if (isDemoMode || !isSupabaseConfigured) {
      const newTx: FinanceTransaction = {
        ...transData,
        id: `ft-demo-${Date.now()}`,
        status: transData.status || 'PENDING_APPROVAL',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localDemoTransactions = [newTx, ...localDemoTransactions];
      return newTx;
    }

    const { data, error } = await supabase
      .from('finance_transactions')
      .insert([{
        church_id: transData.church_id,
        transaction_type: transData.transaction_type,
        category_id: transData.category_id,
        amount: transData.amount,
        description: transData.description,
        transaction_date: transData.transaction_date,
        payment_method: transData.payment_method,
        reference_number: transData.reference_number,
        donor_member_id: transData.donor_member_id,
        donor_name: transData.donor_name,
        status: transData.status || 'PENDING_APPROVAL',
        receipt_number: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        created_by: transData.created_by,
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la saisie financière : ${error.message}`);
    }

    return data as FinanceTransaction;
  },

  async approveTransaction(id: string, approverId: string, approverName: string, isDemoMode = false): Promise<void> {
    if (isDemoMode || !isSupabaseConfigured) {
      const tx = localDemoTransactions.find(t => t.id === id);
      if (!tx) throw new Error('Transaction introuvable');
      tx.status = 'APPROVED';
      tx.approved_by = approverId;
      tx.approved_by_name = approverName;
      tx.approved_at = new Date().toISOString();
      tx.updated_at = new Date().toISOString();
      return;
    }

    // Call PostgreSQL stored procedure `approve_finance_transaction`
    const { error } = await supabase.rpc('approve_finance_transaction', {
      p_transaction_id: id
    });

    if (error) {
      throw new Error(`Erreur lors de l'approbation financière : ${error.message}`);
    }
  },

  async rejectTransaction(id: string, reason: string, isDemoMode = false): Promise<void> {
    if (isDemoMode || !isSupabaseConfigured) {
      const tx = localDemoTransactions.find(t => t.id === id);
      if (!tx) throw new Error('Transaction introuvable');
      tx.status = 'REJECTED';
      tx.rejection_reason = reason;
      tx.updated_at = new Date().toISOString();
      return;
    }

    const { error } = await supabase
      .from('finance_transactions')
      .update({
        status: 'REJECTED',
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors du rejet : ${error.message}`);
    }
  },

  async computeSummary(churchId: string, isDemoMode = false): Promise<FinanceSummary> {
    const list = await this.getTransactions(churchId, isDemoMode);
    
    let totalIncome = 0;
    let totalExpense = 0;
    let tithesTotal = 0;
    let offeringsTotal = 0;
    let pendingApprovalsCount = 0;
    let pendingApprovalsAmount = 0;

    for (const tx of list) {
      if (tx.status === 'APPROVED') {
        if (tx.transaction_type === 'INCOME') {
          totalIncome += Number(tx.amount);
          if (tx.category_name?.toLowerCase().includes('dîme') || tx.category_id === 'fc1') {
            tithesTotal += Number(tx.amount);
          }
          if (tx.category_name?.toLowerCase().includes('offrande') || tx.category_id === 'fc2') {
            offeringsTotal += Number(tx.amount);
          }
        } else if (tx.transaction_type === 'EXPENSE') {
          totalExpense += Number(tx.amount);
        }
      } else if (tx.status === 'PENDING_APPROVAL') {
        pendingApprovalsCount += 1;
        pendingApprovalsAmount += Number(tx.amount);
      }
    }

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      tithesTotal,
      offeringsTotal,
      pendingApprovalsCount,
      pendingApprovalsAmount
    };
  }
};
