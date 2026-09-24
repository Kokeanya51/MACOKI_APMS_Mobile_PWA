import { AppData } from "./types";

const KEY = "macoki_apms_data_v1";

const seed: AppData = {
  patients: [
    {
      id: "P-0001",
      name: "Chidinma Example",
      phone: "08000000000",
      sex: "Female",
      dob: "1995-05-12",
      address: "Ikwuano, Abia State",
      bloodGroup: "O+",
      genotype: "AA",
      allergies: "None known",
      createdAt: new Date().toISOString()
    }
  ],
  visits: [],
  followups: []
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : seed;
  } catch {
    return seed;
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-8)}`;
}