-- ==============================================================================
-- APPLICATION ÉGLISEBF - SCHEMA POSTGRESQL & ROW LEVEL SECURITY (RLS) SUPABASE
-- SaaS Multi-Tenant pour la Gestion Complète des Églises
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & TYPES
DO $$ BEGIN
    CREATE TYPE church_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE spiritual_status AS ENUM ('INQUIRER', 'NEW_CONVERT', 'BAPTIZED', 'COMMUNICANT', 'WORKER', 'DEACON', 'ELDER', 'PASTOR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE marital_status AS ENUM ('SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE finance_type AS ENUM ('INCOME', 'EXPENSE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE finance_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE pastoral_record_type AS ENUM ('COUNSELING', 'SPIRITUAL_CARE', 'MARITAL_GUIDANCE', 'DELIVERANCE', 'CONFIDENTIAL_NOTE', 'DISCIPLINE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. STRUCTURE MULTI-ÉGLISES & STRUCTURE TERRITORIALE
CREATE TABLE IF NOT EXISTS denominations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    country TEXT NOT NULL DEFAULT 'Burkina Faso',
    headquarters_city TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    denomination_id UUID REFERENCES denominations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS churches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    denomination_id UUID REFERENCES denominations(id) ON DELETE SET NULL,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
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

-- 4. UTILISATEURS, PROFILS & RÔLES (RBAC)
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
    level INTEGER NOT NULL -- 1: SUPER_ADMIN, 5: CHURCH_ADMIN, 6: PASTOR, 7: TREASURER, 8: LEADER, 9: MEMBER
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

-- 5. MEMBRES, DÉPARTEMENTS & GROUPES DE MAISON
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
    address TEXT,
    neighborhood TEXT,
    city TEXT DEFAULT 'Ouagadougou',
    marital_status marital_status DEFAULT 'SINGLE' NOT NULL,
    spiritual_status spiritual_status DEFAULT 'COMMUNICANT' NOT NULL,
    baptism_date DATE,
    baptism_place TEXT,
    join_date DATE DEFAULT CURRENT_DATE NOT NULL,
    photo_url TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
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
    type TEXT DEFAULT 'HOUSE_CELL' NOT NULL, -- HOUSE_CELL, PRAYER_GROUP, DISCIPLESHIP, etc.
    neighborhood TEXT,
    address TEXT,
    leader_id UUID REFERENCES members(id) ON DELETE SET NULL,
    meeting_day TEXT,
    meeting_time TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    role_in_group TEXT DEFAULT 'MEMBER' NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(group_id, member_id)
);

CREATE TABLE IF NOT EXISTS member_departments (
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    role_in_department TEXT DEFAULT 'MEMBER' NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY(member_id, department_id)
);

-- 6. CULTES & PRÉSENCES
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

CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'PRESENT' NOT NULL,
    check_in_time TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    notes TEXT,
    UNIQUE(session_id, member_id)
);

-- 7. MODULE FINANCIER & TRÉSORERIE (Circuit d'approbation)
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
    payment_method TEXT NOT NULL DEFAULT 'CASH', -- CASH, BANK_TRANSFER, ORANGE_MONEY, MOOV_MONEY, WAVE, CHECK
    reference_number TEXT,
    donor_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    donor_name TEXT,
    status finance_status DEFAULT 'PENDING_APPROVAL' NOT NULL,
    receipt_number TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    cancelled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS finance_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES finance_transactions(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    content_type TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. SUIVI PASTORAL & DEMANDES DE PRIÈRE (HAUTE CONFIDENTIALITÉ)
CREATE TABLE IF NOT EXISTS pastoral_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    pastor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    record_type pastoral_record_type NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Protégé par RLS et permissions pastorales
    is_confidential BOOLEAN DEFAULT true NOT NULL,
    follow_up_date DATE,
    status TEXT DEFAULT 'OPEN' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS pastoral_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    visitor_name TEXT NOT NULL,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    purpose TEXT NOT NULL,
    summary TEXT NOT NULL,
    prayer_points TEXT,
    status TEXT DEFAULT 'COMPLETED' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS prayer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    requester_name TEXT NOT NULL,
    requester_phone TEXT,
    request_text TEXT NOT NULL,
    is_confidential BOOLEAN DEFAULT false NOT NULL,
    is_urgent BOOLEAN DEFAULT false NOT NULL,
    status TEXT DEFAULT 'NEW' NOT NULL, -- NEW, PRAYING, ANSWERED, CLOSED
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    testimony TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. FORMATIONS & DISCIPULAT
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,
    instructor_name TEXT,
    level TEXT DEFAULT 'FOUNDATION' NOT NULL,
    duration_weeks INTEGER DEFAULT 4,
    cover_image_url TEXT,
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS course_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    video_url TEXT,
    audio_url TEXT,
    duration_minutes INTEGER DEFAULT 20,
    order_index INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    passing_score INTEGER DEFAULT 75 NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_index INTEGER NOT NULL,
    explanation TEXT
);

CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    course_title TEXT NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE NOT NULL,
    certificate_number TEXT UNIQUE NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. MÉDIATHÈQUE & PRÉDICATIONS
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- SERMON, AUDIO_TEACHING, BULLETIN, DOCUMENT, PHOTO, LIVESTREAM
    description TEXT,
    preacher_name TEXT,
    media_date DATE DEFAULT CURRENT_DATE NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_type TEXT,
    file_size INTEGER,
    is_public BOOLEAN DEFAULT true NOT NULL,
    views_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. ÉVÉNEMENTS & ANNONCES
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT NOT NULL,
    banner_url TEXT,
    requires_registration BOOLEAN DEFAULT false NOT NULL,
    max_attendees INTEGER,
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_audience TEXT DEFAULT 'ALL' NOT NULL,
    priority TEXT DEFAULT 'NORMAL' NOT NULL,
    published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMPTZ,
    is_pinned BOOLEAN DEFAULT false NOT NULL,
    created_by_name TEXT
);

-- 12. AUDIT LOGS & INVITATIONS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'PENDING' NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 13. FONCTIONS SQL SÉCURISÉES (SECURITY DEFINER)
-- ==============================================================================

-- Récupération sécurisée du church_id de l'utilisateur connecté
CREATE OR REPLACE FUNCTION user_church_id()
RETURNS UUID AS $$
  SELECT church_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Vérification sécurisée si l'utilisateur possède un rôle
CREATE OR REPLACE FUNCTION has_role(role_code TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND (r.code = role_code OR r.code = 'SUPER_ADMIN')
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Vérification sécurisée si l'utilisateur possède une permission
CREATE OR REPLACE FUNCTION has_permission(perm_code TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND (p.code = perm_code OR r.code = 'SUPER_ADMIN' OR r.code = 'CHURCH_ADMIN')
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Procédure atomique et sécurisée d'inscription d'une nouvelle église
CREATE OR REPLACE FUNCTION register_church(
    p_church_name TEXT,
    p_city TEXT,
    p_pastor_name TEXT,
    p_phone TEXT,
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_church_id UUID;
    v_church_slug TEXT;
    v_admin_role_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentification requise pour créer une église.';
    END IF;

    -- Génération slug unique
    v_church_slug := lower(regexp_replace(p_church_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 6);

    -- Création église
    INSERT INTO churches (name, slug, city, pastor_name, phone, email, status)
    VALUES (p_church_name, v_church_slug, p_city, p_pastor_name, p_phone, p_email, 'ACTIVE')
    RETURNING id INTO v_church_id;

    -- Mise à jour ou création profil utilisateur
    INSERT INTO profiles (id, first_name, last_name, phone, email, church_id, status)
    VALUES (v_user_id, p_first_name, p_last_name, p_phone, p_email, v_church_id, 'ACTIVE')
    ON CONFLICT (id) DO UPDATE
    SET church_id = v_church_id, first_name = p_first_name, last_name = p_last_name, phone = p_phone, status = 'ACTIVE';

    -- Récupération rôle CHURCH_ADMIN
    SELECT id INTO v_admin_role_id FROM roles WHERE code = 'CHURCH_ADMIN' LIMIT 1;

    -- Attribution sécurisée du rôle CHURCH_ADMIN
    IF v_admin_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id, church_id, assigned_at)
        VALUES (v_user_id, v_admin_role_id, v_church_id, now())
        ON CONFLICT (user_id, role_id, church_id) DO NOTHING;
    END IF;

    -- Création des catégories financières par défaut pour la nouvelle église
    INSERT INTO finance_categories (church_id, name, type, code, is_system) VALUES
    (v_church_id, 'Dîmes des membres', 'INCOME', 'TITHE', true),
    (v_church_id, 'Offrandes de culte', 'INCOME', 'OFFERING', true),
    (v_church_id, 'Dons pour la construction / Temple', 'INCOME', 'BUILDING_FUND', true),
    (v_church_id, 'Aide sociale & Compassion', 'INCOME', 'WELFARE', true),
    (v_church_id, 'Frais de fonctionnement & Électricité', 'EXPENSE', 'UTILITIES', true),
    (v_church_id, 'Soutien pastoral & Ministère', 'EXPENSE', 'PASTORAL_SUPPORT', true),
    (v_church_id, 'Évangélisation & Missions', 'EXPENSE', 'MISSIONS', true);

    -- Journal d'audit
    INSERT INTO audit_logs (church_id, actor_id, actor_name, action, resource_type, resource_id, metadata)
    VALUES (v_church_id, v_user_id, p_first_name || ' ' || p_last_name, 'CHURCH_CREATED', 'churches', v_church_id, json_build_object('name', p_church_name, 'city', p_city));

    RETURN json_build_object('success', true, 'church_id', v_church_id, 'slug', v_church_slug);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Approbation sécurisée d'une transaction financière
CREATE OR REPLACE FUNCTION approve_finance_transaction(p_transaction_id UUID)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_church_id UUID;
    v_trans_church_id UUID;
    v_current_status finance_status;
BEGIN
    v_user_id := auth.uid();
    v_church_id := user_church_id();

    IF NOT (has_role('CHURCH_ADMIN') OR has_role('TREASURER') OR has_permission('finance.approve')) THEN
        RAISE EXCEPTION 'Autorisation insuffisante pour approuver les transactions financières.';
    END IF;

    SELECT church_id, status INTO v_trans_church_id, v_current_status
    FROM finance_transactions WHERE id = p_transaction_id;

    IF v_trans_church_id IS NULL OR v_trans_church_id != v_church_id THEN
        RAISE EXCEPTION 'Transaction introuvable ou non autorisée.';
    END IF;

    IF v_current_status != 'PENDING_APPROVAL' AND v_current_status != 'DRAFT' THEN
        RAISE EXCEPTION 'La transaction ne peut pas être approuvée dans son statut actuel.';
    END IF;

    UPDATE finance_transactions
    SET status = 'APPROVED',
        approved_by = v_user_id,
        approved_at = now(),
        updated_at = now()
    WHERE id = p_transaction_id;

    INSERT INTO audit_logs (church_id, actor_id, action, resource_type, resource_id, metadata)
    VALUES (v_church_id, v_user_id, 'FINANCE_APPROVED', 'finance_transactions', p_transaction_id, json_build_object('approved_at', now()));

    RETURN json_build_object('success', true, 'status', 'APPROVED');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES - ISOLATION STRICTE PAR ÉGLISE
-- ==============================================================================

-- Activation RLS sur toutes les tables
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastoral_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastoral_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- POLITIQUES CHURCHES
CREATE POLICY "Users can view their own church"
ON churches FOR SELECT
TO authenticated
USING (id = user_church_id() OR has_role('SUPER_ADMIN'));

CREATE POLICY "Admins can update their own church"
ON churches FOR UPDATE
TO authenticated
USING (id = user_church_id() AND (has_role('CHURCH_ADMIN') OR has_role('SUPER_ADMIN')));

-- POLITIQUES PROFILES
CREATE POLICY "Users can view profiles of their church"
ON profiles FOR SELECT
TO authenticated
USING (church_id = user_church_id() OR id = auth.uid() OR has_role('SUPER_ADMIN'));

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- POLITIQUES MEMBERS
CREATE POLICY "Members tenant select policy"
ON members FOR SELECT
TO authenticated
USING (church_id = user_church_id() OR has_role('SUPER_ADMIN'));

CREATE POLICY "Members tenant insert policy"
ON members FOR INSERT
TO authenticated
WITH CHECK (church_id = user_church_id() AND (has_role('CHURCH_ADMIN') OR has_role('PASTOR') OR has_permission('members.create')));

CREATE POLICY "Members tenant update policy"
ON members FOR UPDATE
TO authenticated
USING (church_id = user_church_id() AND (has_role('CHURCH_ADMIN') OR has_role('PASTOR') OR has_permission('members.edit')));

CREATE POLICY "Members tenant delete policy"
ON members FOR DELETE
TO authenticated
USING (church_id = user_church_id() AND has_role('CHURCH_ADMIN'));

-- POLITIQUES DÉPARTEMENTS & GROUPES
CREATE POLICY "Departments select policy"
ON departments FOR SELECT TO authenticated
USING (church_id = user_church_id());

CREATE POLICY "Departments modify policy"
ON departments FOR ALL TO authenticated
USING (church_id = user_church_id() AND (has_role('CHURCH_ADMIN') OR has_role('PASTOR')));

CREATE POLICY "Groups select policy"
ON groups FOR SELECT TO authenticated
USING (church_id = user_church_id());

CREATE POLICY "Groups modify policy"
ON groups FOR ALL TO authenticated
USING (church_id = user_church_id() AND (has_role('CHURCH_ADMIN') OR has_role('PASTOR') OR has_role('LEADER')));

-- POLITIQUES CULTES & PRÉSENCES
CREATE POLICY "Attendance sessions select"
ON attendance_sessions FOR SELECT TO authenticated
USING (church_id = user_church_id());

CREATE POLICY "Attendance sessions write"
ON attendance_sessions FOR ALL TO authenticated
USING (church_id = user_church_id() AND (has_role('CHURCH_ADMIN') OR has_role('PASTOR') OR has_role('LEADER')));

-- POLITIQUES FINANCIÈRES (RESTRICTIONS STRICTES)
CREATE POLICY "Finance read policy"
ON finance_transactions FOR SELECT TO authenticated
USING (
  church_id = user_church_id() AND 
  (has_role('CHURCH_ADMIN') OR has_role('TREASURER') OR has_role('PASTOR') OR has_permission('finance.read'))
);

CREATE POLICY "Finance insert policy"
ON finance_transactions FOR INSERT TO authenticated
WITH CHECK (
  church_id = user_church_id() AND 
  (has_role('CHURCH_ADMIN') OR has_role('TREASURER') OR has_permission('finance.create'))
);

CREATE POLICY "Finance update policy"
ON finance_transactions FOR UPDATE TO authenticated
USING (
  church_id = user_church_id() AND status != 'APPROVED' AND
  (has_role('CHURCH_ADMIN') OR has_role('TREASURER'))
);

-- POLITIQUES PASTORALES (HAUTE CONFIDENTIALITÉ)
CREATE POLICY "Pastoral records read strict"
ON pastoral_records FOR SELECT TO authenticated
USING (
  church_id = user_church_id() AND 
  (has_role('PASTOR') OR (has_role('CHURCH_ADMIN') AND is_confidential = false) OR pastor_id = auth.uid() OR has_permission('pastoral.read'))
);

CREATE POLICY "Pastoral records insert strict"
ON pastoral_records FOR INSERT TO authenticated
WITH CHECK (
  church_id = user_church_id() AND 
  (has_role('PASTOR') OR has_permission('pastoral.create'))
);

-- POLITIQUES AUDIT LOGS (LECTURE SEULEMENT POUR ADMINS, PAS DE MODIFICATION CLIENT)
CREATE POLICY "Audit logs select"
ON audit_logs FOR SELECT TO authenticated
USING (church_id = user_church_id() AND (has_role('CHURCH_ADMIN') OR has_role('SUPER_ADMIN')));

-- ==============================================================================
-- 15. SEED DATA : RÔLES & PERMISSIONS SYSTÈME
-- ==============================================================================
INSERT INTO roles (code, name, description, level, is_system) VALUES
('SUPER_ADMIN', 'Super Administrateur Plateforme', 'Accès global à l''ensemble des églises et configurations du système.', 1, true),
('DENOMINATION_ADMIN', 'Administrateur Dénomination', 'Supervision nationale d''une fédération ou union d''églises.', 2, true),
('REGION_ADMIN', 'Superviseur Régional', 'Coordination des églises d''une région ecclésiastique.', 3, true),
('DISTRICT_ADMIN', 'Superviseur de District', 'Coordination pastorale locale d''un district.', 4, true),
('CHURCH_ADMIN', 'Administrateur d''Église', 'Gestion complète de l''église locale, des utilisateurs et paramètres.', 5, true),
('PASTOR', 'Pasteur / Responsable Spirituel', 'Ministère pastoral, prédication, suivi des membres et visites.', 6, true),
('TREASURER', 'Trésorier / Responsable Financier', 'Comptabilité, dîmes, offrandes, dépenses et rapports financiers.', 7, true),
('LEADER', 'Responsable de Département / Cellule', 'Animation d''un groupe de maison ou département.', 8, true),
('MEMBER', 'Membre de l''Église', 'Consultation des annonces, cours, prédications et événements.', 9, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO permissions (code, name, module, description) VALUES
('members.read', 'Consulter les membres', 'members', 'Accès à l''annuaire et fiches membres'),
('members.create', 'Ajouter des membres', 'members', 'Création de nouveaux profils'),
('members.edit', 'Modifier les membres', 'members', 'Édition des données personnelles'),
('members.delete', 'Supprimer les membres', 'members', 'Archivage ou suppression'),
('finance.read', 'Voir les finances', 'finance', 'Consulter les états financiers'),
('finance.create', 'Saisir des transactions', 'finance', 'Création de dîmes/dépenses'),
('finance.approve', 'Approuver les dépenses', 'finance', 'Circuit de validation financière'),
('pastoral.read', 'Consulter le suivi pastoral', 'pastoral', 'Accès aux notes pastorales'),
('pastoral.create', 'Créer des notes pastorales', 'pastoral', 'Enregistrement d''entretiens spirituels'),
('pastoral.confidential', 'Accès aux dossiers scellés', 'pastoral', 'Accès aux cas hautement confidentiels'),
('courses.manage', 'Gérer les formations', 'training', 'Création de cours et quiz'),
('media.upload', 'Publier des médias', 'media', 'Ajout de sermons audio/vidéo/documents')
ON CONFLICT (code) DO NOTHING;
