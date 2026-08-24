import { Member, FinanceTransaction } from '../types';
import { FinanceSummary } from '../services/financeService';

/**
 * Escapes a single CSV cell value and wraps in quotes if necessary
 */
function sanitizeCell(value: any): string {
  if (value === null || value === undefined) return '""';
  const stringVal = String(value).trim();
  // If contains commas, semicolons, quotes, or newlines, quote and escape
  if (/[",;\n\r]/.test(stringVal)) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return `"${stringVal}"`;
}

/**
 * Triggers a client-side browser download of a CSV file with UTF-8 BOM for Excel compatibility
 */
export function downloadCSV(filename: string, csvContent: string): void {
  // UTF-8 BOM ensures Microsoft Excel and other spreadsheet apps properly render accents
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports full list of members for administrative backup
 */
export function exportMembersToCSV(members: Member[], churchName = 'Église'): void {
  const headers = [
    'ID Membre',
    'Civilité',
    'Nom',
    'Prénom',
    'Genre',
    'Date de Naissance',
    'Téléphone',
    'Email',
    'Profession',
    'Quartier / Adresse',
    'Statut Spirituel',
    'Date de Conversion',
    "Date Baptême d'eau",
    'Baptême Saint-Esprit',
    'Département / Ministère',
    'Groupe / Cellule de Maison',
    'Date Adhésion',
    'Statut Activité',
    'Notes Pastorales / Remarques'
  ];

  const rows = members.map((m) => {
    return [
      sanitizeCell(m.id),
      sanitizeCell(m.gender === 'MALE' ? 'M.' : 'Mme/Mlle'),
      sanitizeCell(m.last_name),
      sanitizeCell(m.first_name),
      sanitizeCell(m.gender === 'MALE' ? 'Masculin' : 'Féminin'),
      sanitizeCell(m.birth_date || ''),
      sanitizeCell(m.phone || ''),
      sanitizeCell(m.email || ''),
      sanitizeCell(m.profession || ''),
      sanitizeCell(m.neighborhood || ''),
      sanitizeCell(m.spiritual_status),
      sanitizeCell(m.conversion_date || ''),
      sanitizeCell(m.baptism_date || ''),
      sanitizeCell(m.holy_spirit_baptized ? 'OUI' : 'NON'),
      sanitizeCell(m.department_name || ''),
      sanitizeCell(m.group_name || ''),
      sanitizeCell(m.join_date || ''),
      sanitizeCell(m.is_active ? 'ACTIF' : 'INACTIF'),
      sanitizeCell(m.notes || '')
    ].join(';');
  });

  const nowStr = new Date().toISOString().split('T')[0];
  const csvData = [
    `# EXPORT ADMINISTRATIF DE L'ANNUAIRE DES MEMBRES - ${churchName} - Date: ${nowStr}`,
    headers.join(';'),
    ...rows
  ].join('\r\n');

  downloadCSV(`eglisebf_membres_sauvegarde_${nowStr}.csv`, csvData);
}

/**
 * Exports financial report and transactions for administrative audit and backup
 */
export function exportFinanceReportToCSV(
  transactions: FinanceTransaction[],
  summary?: FinanceSummary | null,
  churchName = 'Église'
): void {
  const headers = [
    'N° Reçu / Réf',
    'Date Transaction',
    'Type Opération',
    'Catégorie Comptable',
    'Montant (FCFA)',
    'Mode de Paiement',
    'Donateur / Bénéficiaire',
    'Statut Approbation',
    'Description / Motif',
    'Saisi Par',
    'Approuvé Par',
    'Date Approbation',
    'Horodatage Création'
  ];

  const rows = transactions.map((t) => {
    const isIncome = t.transaction_type === 'INCOME';
    return [
      sanitizeCell(t.receipt_number || t.reference_number || t.id),
      sanitizeCell(t.transaction_date),
      sanitizeCell(isIncome ? 'RECETTE (ENTRÉE)' : 'DÉPENSE (SORTIE)'),
      sanitizeCell(t.category_name || ''),
      sanitizeCell(t.amount),
      sanitizeCell(t.payment_method),
      sanitizeCell(t.donor_name || ''),
      sanitizeCell(
        t.status === 'APPROVED'
          ? 'APPROUVÉ'
          : t.status === 'PENDING_APPROVAL'
          ? 'EN ATTENTE VALIDATION'
          : 'REJETÉ'
      ),
      sanitizeCell(t.description || ''),
      sanitizeCell(t.created_by_name || ''),
      sanitizeCell(t.approved_by_name || ''),
      sanitizeCell(t.approved_at || ''),
      sanitizeCell(t.created_at)
    ].join(';');
  });

  const nowStr = new Date().toISOString().split('T')[0];
  
  // Calculate running totals
  const totalIncome = transactions
    .filter((t) => t.transaction_type === 'INCOME' && t.status === 'APPROVED')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.transaction_type === 'EXPENSE' && t.status === 'APPROVED')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netBalance = totalIncome - totalExpense;

  const summaryHeaderLines = [
    `# RAPPORT FINANCIER ADMINISTRATIF - ${churchName} - Date: ${nowStr}`,
    `# TOTAL RECETTES APPROUVÉES : ${totalIncome.toLocaleString('fr-FR')} FCFA`,
    `# TOTAL DÉPENSES APPROUVÉES : ${totalExpense.toLocaleString('fr-FR')} FCFA`,
    `# SOLDE NET DE TRÉSORERIE : ${netBalance.toLocaleString('fr-FR')} FCFA`,
    `# NOMBRE TOTAL D'ÉCRITURES : ${transactions.length}`,
    '#'
  ].join('\r\n');

  const csvData = [summaryHeaderLines, headers.join(';'), ...rows].join('\r\n');

  downloadCSV(`eglisebf_rapport_financier_${nowStr}.csv`, csvData);
}
