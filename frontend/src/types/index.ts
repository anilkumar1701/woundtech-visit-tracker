export interface Clinician {
  id: string;
  name: string;
  specialty: string | null;
  lastVisitAt: string | null;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string | null;
  lastVisitAt: string | null;
  createdAt: string;
}

export interface Visit {
  id: string;
  clinicianId: string;
  patientId: string;
  visitDate: string;
  notes: string | null;
  createdAt: string;
  clinician: Clinician;
  patient: Patient;
}
