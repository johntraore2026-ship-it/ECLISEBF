import React, { useState } from 'react';
import { X, Database, Copy, Check, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SqlScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlScriptModal: React.FC<SqlScriptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlScript = `-- ==============================================================================
-- APPLICATION ÉGLISEBF - SCHEMA POSTGRESQL & ROW LEVEL SECURITY (RLS) SUPABASE
-- SaaS Multi-Tenant pour la Gestion Complète des Églises
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TYPES & ENUMS
DO $$ BEGIN
    CREATE TYPE church_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL');
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');
    CREATE TYPE spiritual_status AS ENUM ('INQUIRER', 'NEW_CONVERT', 'BAPTIZED', 'COMMUNICANT', 'WORKER', 'DEACON', 'ELDER', 'PASTOR');
    CREATE TYPE marital_status AS ENUM ('SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED');
    CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE');
    CREATE TYPE finance_type AS ENUM ('INCOME', 'EXPENSE');
    CREATE TYPE finance_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED');
    CREATE TYPE pastoral_record_type AS ENUM ('COUNSELING', 'SPIRITUAL_CARE', 'MARITAL_GUIDANCE', 'DELIVERANCE', 'CONFIDENTIAL_NOTE', 'DISCIPLINE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1. ÉGLISES (MULTI-TENANT)
CREATE TABLE IF NOT EXISTS churches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL,
    neighborhood TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    pastor_name TEXT,
    description TEXT,
    logo_url TEXT,
    status church_status DEFAULT 'ACTIVE' NOT NULL,
    currency TEXT DEFAULT 'XOF' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PROFILS & ROLES (RBAC)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    photo_url TEXT,
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
    status user_status DEFAULT 'ACTIVE' NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT true NOT NULL,
    level INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    module TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role_id, church_id)
);

-- 3. MEMBRES, DÉPARTEMENTS, GROUPES
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender gender_type NOT NULL,
    phone TEXT,
    email TEXT,
    birth_date DATE,
    profession TEXT,
    neighborhood TEXT,
    city TEXT DEFAULT 'Ouagadougou',
    marital_status marital_status DEFAULT 'SINGLE' NOT NULL,
    spiritual_status spiritual_status DEFAULT 'COMMUNICANT' NOT NULL,
    baptism_date DATE,
    join_date DATE DEFAULT CURRENT_DATE NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    leader_id UUID REFERENCES members(id) ON DELETE SET NULL,
    meeting_schedule TEXT,
    color TEXT DEFAULT '#10B981',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'HOUSE_CELL' NOT NULL,
    neighborhood TEXT,
    address TEXT,
    leader_id UUID REFERENCES members(id) ON DELETE SET NULL,
    meeting_day TEXT,
    meeting_time TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CULTES & PRÉSENCES
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL,
    title TEXT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    preacher_name TEXT,
    theme TEXT,
    men_count INTEGER DEFAULT 0 NOT NULL,
    women_count INTEGER DEFAULT 0 NOT NULL,
    children_count INTEGER DEFAULT 0 NOT NULL,
    visitors_count INTEGER DEFAULT 0 NOT NULL,
    total_count INTEGER DEFAULT 0 NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. FINANCES & TRÉSORERIE
CREATE TABLE IF NOT EXISTS finance_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type finance_type NOT NULL,
    code TEXT,
    description TEXT,
    is_system BOOLEAN DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS finance_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    transaction_type finance_type NOT NULL,
    category_id UUID NOT NULL REFERENCES finance_categories(id) ON DELETE RESTRICT,
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL DEFAULT 'CASH',
    reference_number TEXT,
    donor_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    donor_name TEXT,
    status finance_status DEFAULT 'PENDING_APPROVAL' NOT NULL,
    receipt_number TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. SUIVI PASTORAL CONFIDENTIEL
CREATE TABLE IF NOT EXISTS pastoral_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    pastor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    record_type pastoral_record_type NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_confidential BOOLEAN DEFAULT true NOT NULL,
    follow_up_date DATE,
    status TEXT DEFAULT 'OPEN' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS prayer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    requester_name TEXT NOT NULL,
    requester_phone TEXT,
    request_text TEXT NOT NULL,
    is_confidential BOOLEAN DEFAULT false NOT NULL,
    is_urgent BOOLEAN DEFAULT false NOT NULL,
    status TEXT DEFAULT 'NEW' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. FONCTIONS SÉCURISÉES RLS
CREATE OR REPLACE FUNCTION user_church_id()
RETURNS UUID AS $$
  SELECT church_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_role(role_code TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND (r.code = role_code OR r.code = 'SUPER_ADMIN')
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 9. ACTIVATION RLS
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastoral_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members tenant select" ON members FOR SELECT TO authenticated
USING (church_id = user_church_id() OR has_role('SUPER_ADMIN'));

CREATE POLICY "Finance read strict" ON finance_transactions FOR SELECT TO authenticated
USING (church_id = user_church_id() AND (has_role('CHURCH_ADMIN') OR has_role('TREASURER') OR has_role('PASTOR')));

CREATE POLICY "Pastoral read strict" ON pastoral_records FOR SELECT TO authenticated
USING (church_id = user_church_id() AND (has_role('PASTOR') OR pastor_id = auth.uid()));`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadSql = () => {
    const element = document.createElement('a');
    const file = new Blob([sqlScript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'eglisebf-supabase-schema.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl text-white shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Schéma SQL PostgreSQL & Politiques RLS</h2>
              <p className="text-xs text-slate-400">Script DDL complet prêt à exécuter dans le SQL Editor de Supabase</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-emerald-400">Instructions Supabase :</span> Ouvrez votre console Supabase → <strong>SQL Editor</strong> → Collez et exécutez ce script.
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copySql}
                id="copy-sql-modal-btn"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copié dans le presse-papier !' : 'Copier le Script SQL'}
              </button>
              <button
                onClick={downloadSql}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                Télécharger .sql
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="bg-slate-950 p-4 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[50vh] border border-slate-800 leading-relaxed select-all">
              {sqlScript}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Row Level Security (RLS) & Multi-tenant isolation intégrés</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
