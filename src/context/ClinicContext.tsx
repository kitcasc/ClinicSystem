import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Patient } from '../types';

interface ClinicState {
  patients: Patient[];
  maxQueueNumber: number;
}

type ClinicAction =
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'UPDATE_PATIENT'; payload: Patient }
  | { type: 'SET_MAX_QUEUE_NUMBER'; payload: number }
  | { type: 'LOAD_STATE'; payload: ClinicState }
  | { type: 'SORT_PATIENTS' };

const STORAGE_KEY = 'clinic_state';

// 排序病人的函數
const sortPatients = (patients: Patient[]): Patient[] => {
  // 首先找出正在看診中的病人
  const inProgressPatient = patients.find(p => p.status === 'inProgress');
  
  // 將病人分為幾個組別
  const inProgress = inProgressPatient ? [inProgressPatient] : [];
  const waitingNormal = patients.filter(p => p.status === 'waiting' && !p.returnTime);
  const waitingReturned = patients.filter(p => p.status === 'waiting' && p.returnTime);
  const noShowNotReturned = patients.filter(p => p.status === 'noShow' && !p.returnTime);
  const noShowReturned = patients.filter(p => p.status === 'noShow' && p.returnTime);
  const completed = patients.filter(p => p.status === 'completed');
  
  // 對正常候診病人按號碼排序
  waitingNormal.sort((a, b) => a.queueNumber - b.queueNumber);
  
  // 對已回報的過號病人按回報時間排序
  waitingReturned.sort((a, b) => a.returnTime!.getTime() - b.returnTime!.getTime());
  noShowReturned.sort((a, b) => a.returnTime!.getTime() - b.returnTime!.getTime());
  
  // 合併已回報的過號病人到候診名單中，根據規則插入
  // 規則：過號病人回報後，需等待目前看診中的病人看完，再等下一個正常病人看完後才輪到他看診
  const finalWaiting = [...waitingNormal];
  if (inProgressPatient && waitingNormal.length > 0) {
    // 找到目前看診中的病人後的下一個正常病人
    const nextNormalIndex = waitingNormal.findIndex(p => p.queueNumber > inProgressPatient.queueNumber);
    let insertIndex = nextNormalIndex >= 0 ? nextNormalIndex + 1 : waitingNormal.length;
    
    // 插入已回報的過號病人 (從 waitingReturned 和 noShowReturned)
    const allReturned = [...waitingReturned, ...noShowReturned];
    for (const returnedPatient of allReturned) {
      // 確保插入位置不超出陣列長度
      if (insertIndex >= finalWaiting.length) {
        finalWaiting.push(returnedPatient);
      } else {
        finalWaiting.splice(insertIndex, 0, returnedPatient);
      }
      // 下一個過號病人插入到下一個位置
      insertIndex++;
    }
  } else {
    // 如果沒有正在看診的病人或沒有正常候診病人，直接將過號病人加到最後
    finalWaiting.push(...waitingReturned, ...noShowReturned);
  }
  
  // 組合所有病人
  return [
    ...inProgress,
    ...finalWaiting,
    ...noShowNotReturned,
    ...completed
  ];
};

const getInitialState = (): ClinicState => {
  const savedState = localStorage.getItem(STORAGE_KEY);
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      // 將日期字符串轉換回 Date 對象
      const state = {
        ...parsed,
        patients: parsed.patients.map((patient: any) => ({
          ...patient,
          checkInTime: new Date(patient.checkInTime),
          noShowTime: patient.noShowTime ? new Date(patient.noShowTime) : undefined,
          returnTime: patient.returnTime ? new Date(patient.returnTime) : undefined,
        })),
      };
      
      // 排序病人
      state.patients = sortPatients(state.patients);
      
      return state;
    } catch (e) {
      console.error('Error parsing saved state:', e);
    }
  }
  return {
    patients: [],
    maxQueueNumber: 0,
  };
};

const initialState = getInitialState();

const ClinicContext = createContext<{
  state: ClinicState;
  dispatch: React.Dispatch<ClinicAction>;
} | null>(null);

const clinicReducer = (state: ClinicState, action: ClinicAction): ClinicState => {
  let newState: ClinicState;
  
  switch (action.type) {
    case 'ADD_PATIENT':
      newState = {
        ...state,
        patients: [...state.patients, action.payload],
        maxQueueNumber: Math.max(state.maxQueueNumber, action.payload.queueNumber),
      };
      break;
    case 'UPDATE_PATIENT':
      newState = {
        ...state,
        patients: state.patients.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
      break;
    case 'SET_MAX_QUEUE_NUMBER':
      newState = {
        ...state,
        maxQueueNumber: action.payload,
      };
      break;
    case 'LOAD_STATE':
      newState = action.payload;
      break;
    case 'SORT_PATIENTS':
      newState = {
        ...state,
        patients: sortPatients(state.patients),
      };
      break;
    default:
      return state;
  }

  // 排序病人
  newState.patients = sortPatients(newState.patients);

  // 保存到 localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  return newState;
};

export const ClinicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(clinicReducer, initialState);

  // 監聽 localStorage 變化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          // 將日期字符串轉換回 Date 對象
          const parsedState = {
            ...newState,
            patients: newState.patients.map((patient: any) => ({
              ...patient,
              checkInTime: new Date(patient.checkInTime),
              noShowTime: patient.noShowTime ? new Date(patient.noShowTime) : undefined,
              returnTime: patient.returnTime ? new Date(patient.returnTime) : undefined,
            })),
          };
          
          // 排序病人
          parsedState.patients = sortPatients(parsedState.patients);
          
          // 直接加載整個狀態
          dispatch({ type: 'LOAD_STATE', payload: parsedState });
        } catch (e) {
          console.error('Error parsing storage event data:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ClinicContext.Provider value={{ state, dispatch }}>
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
