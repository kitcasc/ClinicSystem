export interface Patient {
  id: string;
  name: string;
  medicalRecordNumber?: string;
  phoneNumber?: string;
  queueNumber: number;
  status: 'waiting' | 'inProgress' | 'completed' | 'noShow';
  checkInTime: Date;
  noShowTime?: Date;
  returnTime?: Date;
}

export interface QueueState {
  currentPatient: Patient | null;
  waitingPatients: Patient[];
  noShowPatients: Patient[];
  completedPatients: Patient[];
}

export interface ClinicState {
  queue: QueueState;
  maxQueueNumber: number;
} 