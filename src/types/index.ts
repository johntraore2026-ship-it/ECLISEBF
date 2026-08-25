export type UUID = string;

export type ChurchStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TRIAL';

export interface Church {
  id: UUID;
  name: string;
  slug: string;
  denomination_id?: UUID | null;
  region_id?: UUID | null;
  district_id?: UUID | null;
  city: string;
  neighborhood?: string;
  address?: string;
  phone?: string;
  email?: string;
  pastor_name?: string;
  description?: string;
  logo_url?: string;
  status: ChurchStatus;
  currency?: string;
  created_at: string;
  updated_at: string;
}

export interface Denomination {
  id: UUID;
  name: string;
  code: string;
  country: string;
  headquarters_city?: string;
  created_at: string;
}

export interface Region {
  id: UUID;
  name: string;
  code: string;
  denomination_id?: UUID;
  created_at: string;
}

export interface District {
  id: UUID;
  name: string;
  region_id: UUID;
  created_at: string;
}

export type ProfileStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface Profile {
  id: UUID;
  first_name: string;
  last_name: string;
  phone?: string;
  photo_url?: string;
  church_id: UUID;
  status: ProfileStatus;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: UUID;
  code: string;
  name: string;
  description?: string;
  is_system?: boolean;
  level: number; // 1: SUPER_ADMIN, 2: DENOMINATION, 3: REGION, 4: DISTRICT, 5: CHURCH_ADMIN, 6: PASTOR, 7: TREASURER, 8: LEADER, 9: MEMBER
}

export interface Permission {
  id: UUID;
  code: string;
  name: string;
  module: string;
  description?: string;
}

export interface UserRole {
  id: UUID;
  user_id: UUID;
  role_id: UUID;
  church_id: UUID;
  assigned_by?: UUID;
  assigned_at: string;
  role?: Role;
}

export type SpiritualStatus = 'INQUIRER' | 'NEW_CONVERT' | 'BAPTIZED' | 'COMMUNICANT' | 'WORKER' | 'DEACON' | 'ELDER' | 'PASTOR';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'DIVORCED';
export type Gender = 'MALE' | 'FEMALE';

export interface Member {
  id: UUID;
  church_id: UUID;
  first_name: string;
  last_name: string;
  gender: Gender;
  phone?: string;
  email?: string;
  birth_date?: string;
  profession?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  marital_status: MaritalStatus;
  spiritual_status: SpiritualStatus;
  conversion_date?: string;
  baptism_date?: string;
  baptism_place?: string;
  holy_spirit_baptized?: boolean;
  join_date: string;
  photo_url?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  department_id?: UUID;
  department_name?: string;
  group_id?: UUID;
  group_name?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: UUID;
  church_id: UUID;
  name: string;
  code?: string;
  description?: string;
  leader_id?: UUID;
  leader_name?: string;
  meeting_schedule?: string;
  color?: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface Group {
  id: UUID;
  church_id: UUID;
  name: string;
  type: 'HOUSE_CELL' | 'PRAYER_GROUP' | 'DISCIPLESHIP' | 'COMMITTEE' | 'OTHER';
  neighborhood?: string;
  address?: string;
  leader_id?: UUID;
  leader_name?: string;
  meeting_day?: string;
  meeting_time?: string;
  color?: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface GroupMember {
  id: UUID;
  group_id: UUID;
  member_id: UUID;
  role_in_group: 'LEADER' | 'ASSISTANT' | 'HOST' | 'MEMBER';
  joined_at: string;
  member?: Member;
}

export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface FinanceCategory {
  id: UUID;
  church_id: UUID;
  name: string;
  type: TransactionType;
  code?: string;
  description?: string;
  is_system?: boolean;
}

export interface FinanceTransaction {
  id: UUID;
  church_id: UUID;
  transaction_type: TransactionType;
  category_id: UUID;
  category_name?: string;
  amount: number;
  description: string;
  transaction_date: string;
  payment_method: 'CASH' | 'BANK_TRANSFER' | 'ORANGE_MONEY' | 'MOOV_MONEY' | 'WAVE' | 'CHECK';
  reference_number?: string;
  donor_member_id?: UUID;
  donor_name?: string;
  status: TransactionStatus;
  receipt_number?: string;
  created_by: UUID;
  created_by_name?: string;
  approved_by?: UUID;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  cancelled_by?: UUID;
  cancelled_at?: string;
  attachments?: FinanceAttachment[];
  created_at: string;
  updated_at: string;
}

export interface FinanceAttachment {
  id: UUID;
  transaction_id: UUID;
  file_name: string;
  file_url: string;
  file_size?: number;
  content_type?: string;
  created_at: string;
}

export interface AttendanceSession {
  id: UUID;
  church_id: UUID;
  session_type: 'SUNDAY_SERVICE_1' | 'SUNDAY_SERVICE_2' | 'MIDWEEK_PRAYER' | 'YOUTH_SERVICE' | 'SPECIAL_EVENT';
  title: string;
  session_date: string;
  start_time: string;
  end_time?: string;
  preacher_name?: string;
  theme?: string;
  men_count: number;
  women_count: number;
  children_count: number;
  visitors_count: number;
  total_count: number;
  notes?: string;
  created_by: UUID;
  created_at: string;
}

export interface AttendanceRecord {
  id: UUID;
  session_id: UUID;
  member_id: UUID;
  status: 'PRESENT' | 'EXCUSED' | 'ABSENT';
  check_in_time?: string;
  notes?: string;
  member?: Member;
}

export type PastoralRecordType = 'COUNSELING' | 'SPIRITUAL_CARE' | 'MARITAL_GUIDANCE' | 'DELIVERANCE' | 'CONFIDENTIAL_NOTE' | 'DISCIPLINE';

export interface PastoralRecord {
  id: UUID;
  church_id: UUID;
  member_id: UUID;
  member_name?: string;
  pastor_id: UUID;
  pastor_name?: string;
  record_type: PastoralRecordType;
  title: string;
  content: string; // Strictly protected / confidential
  is_confidential: boolean;
  follow_up_date?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

export interface PastoralVisit {
  id: UUID;
  church_id: UUID;
  member_id: UUID;
  member_name?: string;
  visitor_name: string;
  visit_date: string;
  purpose: 'EVANGELISM' | 'SICK_VISIT' | 'ENCOURAGEMENT' | 'BEREAVEMENT' | 'NEW_COMER';
  summary: string;
  prayer_points?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
}

export interface PrayerRequest {
  id: UUID;
  church_id: UUID;
  member_id?: UUID;
  requester_name: string;
  requester_phone?: string;
  request_text: string;
  is_confidential: boolean;
  is_urgent: boolean;
  status: 'NEW' | 'PRAYING' | 'ANSWERED' | 'CLOSED';
  assigned_to?: UUID;
  testimony?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: UUID;
  course_id: UUID;
  member_id: UUID;
  member_name: string;
  member_phone?: string;
  member_email?: string;
  enrolled_at: string;
  status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';
  progress_percentage: number;
}

export interface Course {
  id: UUID;
  church_id: UUID;
  title: string;
  slug: string;
  description: string;
  instructor_name?: string;
  level: 'FOUNDATION' | 'INTERMEDIATE' | 'ADVANCED' | 'LEADERSHIP';
  duration_weeks?: number;
  cover_image_url?: string;
  is_published: boolean;
  created_at: string;
  modules?: CourseModule[];
}

export interface CourseModule {
  id: UUID;
  course_id: UUID;
  title: string;
  order_index: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: UUID;
  module_id: UUID;
  title: string;
  content: string;
  video_url?: string;
  audio_url?: string;
  duration_minutes?: number;
  order_index: number;
}

export interface Quiz {
  id: UUID;
  course_id: UUID;
  title: string;
  passing_score: number;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: UUID;
  quiz_id: UUID;
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation?: string;
}

export interface Certificate {
  id: UUID;
  church_id: UUID;
  course_id: UUID;
  user_id: UUID;
  member_name: string;
  course_title: string;
  issue_date: string;
  certificate_number: string;
  pdf_url?: string;
}

export interface MediaCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface MediaItem {
  id: UUID;
  church_id: UUID;
  title: string;
  category: string;
  description?: string;
  preacher_name?: string;
  media_date: string;
  file_url: string;
  thumbnail_url?: string;
  file_type?: string;
  file_size?: number;
  is_public: boolean;
  views_count: number;
  created_at: string;
  educational_link_url?: string;
  bible_references?: string;
  study_notes_url?: string;
  reference_books?: string;
}

export interface ChurchEvent {
  id: UUID;
  church_id: UUID;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location: string;
  banner_url?: string;
  requires_registration: boolean;
  max_attendees?: number;
  registration_count?: number;
  is_published: boolean;
  created_at: string;
}

export interface Announcement {
  id: UUID;
  church_id: UUID;
  title: string;
  content: string;
  target_audience: 'ALL' | 'MEMBERS' | 'WORKERS' | 'LEADERS';
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  published_at: string;
  expires_at?: string;
  is_pinned: boolean;
  created_by_name?: string;
}

export interface AuditLog {
  id: UUID;
  church_id?: UUID;
  actor_id?: UUID;
  actor_name?: string;
  action: string;
  resource_type: string;
  resource_id?: UUID;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface Invitation {
  id: UUID;
  church_id: UUID;
  email: string;
  role_id: UUID;
  invited_by: UUID;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  expires_at: string;
  created_at: string;
}
