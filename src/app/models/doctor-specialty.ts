export enum DoctorSpecialty {
    Cardiologia = 'Cardiologia',
    Dermatologia = 'Dermatologia',
    Gastroenterologia = 'Gastroenterologia',
    Neurologia = 'Neurologia',
    Ortopedia = 'Ortopedia',
    Pediatria = 'Pediatria',
    Psiquiatria = 'Psiquiatria',
    Radiologia = 'Radiologia',
    Urologia = 'Urologia',
}

export const DOCTOR_SPECIALTY_LABELS: Record<DoctorSpecialty, string> = {
    [DoctorSpecialty.Cardiologia]: 'Cardiologia',
    [DoctorSpecialty.Dermatologia]: 'Dermatologia',
    [DoctorSpecialty.Gastroenterologia]: 'Gastroenterologia',
    [DoctorSpecialty.Neurologia]: 'Neurologia',
    [DoctorSpecialty.Ortopedia]: 'Ortopedia',
    [DoctorSpecialty.Pediatria]: 'Pediatria',
    [DoctorSpecialty.Psiquiatria]: 'Psiquiatria',
    [DoctorSpecialty.Radiologia]: 'Radiologia',
    [DoctorSpecialty.Urologia]: 'Urologia',
};

export const DOCTOR_SPECIALTY_OPTIONS: { value: DoctorSpecialty, displayName: string }[] = Object.values(DoctorSpecialty).map(specialty => ({
  value: specialty as DoctorSpecialty,
  displayName: DOCTOR_SPECIALTY_LABELS[specialty as DoctorSpecialty]
}));