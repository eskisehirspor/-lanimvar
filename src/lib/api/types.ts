import type { TaskStatus } from '@/features/task/model/status';

/** Row shapes the app reads (mirrors supabase/migrations). Writes go through RPCs only. */
export type AppRole = 'customer' | 'tasker' | 'admin';
export type Verification = 'pending' | 'approved' | 'rejected' | 'suspended';
export type DisputeKind = 'incident' | 'dispute' | 'report' | 'no_show';
export type DisputeStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';
export type MediaKind = 'task' | 'before' | 'after' | 'arrival' | 'incident';

export interface Profile {
  id: string;
  role: AppRole;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
  phone_verified_at: string | null;
  email_verified_at: string | null;
  home_district: string | null;
  home_neighbourhood: string | null;
  home_address: string | null;
  home_details: string | null;
  home_lat: number | null;
  home_lng: number | null;
  onboarded_at: string | null;
  is_banned: boolean;
  deleted_at: string | null;
  legal_version: string | null;
}

export const profileColumns =
  'id, role, full_name, first_name, last_name, birth_date, phone, email, phone_verified_at, email_verified_at, home_district, home_neighbourhood, home_address, home_details, home_lat, home_lng, onboarded_at, is_banned, deleted_at, legal_version';

export type CategorySection = 'daily' | 'social' | 'wait' | 'pets' | 'extra';

export interface TaskerProfile {
  user_id: string;
  verification: Verification;
  is_online: boolean;
  rating_avg: number;
  rating_count: number;
  completed_count: number;
  categories: string[];
  application_submitted_at: string | null;
}

export interface PricingRule {
  id: string;
  category: string;
  label: string;
  recommended_price: number;
  min_price: number;
  max_price: number;
  active: boolean;
  section: CategorySection;
  sort: number;
  max_people: number;
}

/** The customer's own task (they may see their own address). */
export interface Task {
  id: string;
  customer_id: string;
  category: string;
  title: string;
  description: string | null;
  price: number;
  status: TaskStatus;
  approx_label: string;
  approx_lat: number;
  approx_lng: number;
  exact_address: string;
  exact_details: string | null;
  exact_lat: number | null;
  exact_lng: number | null;
  searching_since: string | null;
  scheduled_for: string | null;
  first_accepted_at: string | null;
  arrived_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

export interface TaskEvent {
  id: number;
  task_id: string;
  actor_id: string | null;
  type: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface TaskMedia {
  id: string;
  task_id: string;
  uploader_id: string;
  kind: MediaKind;
  storage_path: string;
  created_at: string;
}

export interface Offer {
  task_id: string;
  title: string;
  description: string | null;
  category: string;
  price: number;
  approx_label: string;
  approx_lat: number;
  approx_lng: number;
  distance_m: number | null;
  expires_at: string;
  customer_first_name: string;
  customer_tasks: number;
  scheduled_for: string | null;
  rehire: boolean;
}

export interface Job {
  task_id: string;
  title: string;
  category: string;
  price: number;
  status: TaskStatus;
  approx_label: string;
  approx_lat: number;
  approx_lng: number;
  customer_id: string;
  customer_first_name: string;
  accepted_at: string;
  arrived_at: string | null;
}

export interface TaskTasker {
  tasker_id: string;
  first_name: string;
  initials: string;
  rating_avg: number;
  rating_count: number;
  completed_count: number;
  verified: boolean;
  lat: number | null;
  lng: number | null;
  seen_at: string | null;
}

export interface ExactAddress {
  exact_address: string;
  exact_details: string | null;
  exact_lat: number | null;
  exact_lng: number | null;
}

export interface Dispute {
  id: string;
  task_id: string | null;
  reporter_id: string | null;
  subject_id: string | null;
  kind: DisputeKind;
  status: DisputeStatus;
  reason: string;
  details: string | null;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface AdminMetrics {
  tasks_created: number;
  tasks_accepted: number;
  tasks_completed: number;
  tasks_expired: number;
  accept_p50_s: number | null;
  accept_p90_s: number | null;
  open_incidents: number;
  open_disputes: number;
  open_reports: number;
  pending_taskers: number;
  online_taskers: number;
}

export interface AdminPerson {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  role: AppRole;
  is_banned: boolean;
  deleted_at: string | null;
  created_at: string;
  phone_verified: boolean;
  email_verified: boolean;
  home_district: string | null;
  verification: Verification | null;
  is_online: boolean | null;
  rating_avg: number | null;
  completed_count: number | null;
  national_id: string | null;
  id_front_path: string | null;
  selfie_path: string | null;
  categories: string[] | null;
  has_vehicle: boolean | null;
  application_submitted_at: string | null;
  open_reports: number;
  late_cancels: number;
}

export interface AuditRow {
  id: number;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  data: Record<string, unknown>;
  created_at: string;
}
