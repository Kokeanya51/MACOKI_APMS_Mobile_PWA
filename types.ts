export type Role = "Super Admin" | "Pharmacist" | "Lab Staff" | "Reception";

export type Patient = {
  id: string;
  name: string;
  phone: string;
  sex: "Male" | "Female" | "Other";
  dob: string;
  address: string;
  bloodGroup: string;
  genotype: string;
  allergies: string;
  createdAt: string;
};

export type Visit = {
  id: string;
  patientId: string;
  date: string;
  complaint: string;
  assessment: string;
  treatment: string;
  clinician: string;
};

export type FollowUp = {
  id: string;
  patientId: string;
  date: string;
  reason: string;
  status: "Pending" | "Completed";
};

export type AppData = {
  patients: Patient[];
  visits: Visit[];
  followups: FollowUp[];
};