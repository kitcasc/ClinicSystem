import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { Patient } from '../types';
import { useClinic } from '../context/ClinicContext';

const DoctorView: React.FC = () => {
  const { state, dispatch } = useClinic();
  const { patients } = state;
  
  // 獲取當前正在看診的病人
  const inProgressPatient = patients.find(p => p.status === 'inProgress');
  
  // 使用 inProgressPatient 作為當前病人，而不是本地狀態
  // 這樣可以確保與全局狀態同步
  const currentPatient = inProgressPatient || null;
  
  // 獲取候診中的病人，已經由上下文排序
  const sortedWaitingPatients = patients.filter(p => p.status === 'waiting');

  const handleStartConsultation = () => {
    // 如果已經有病人正在看診，不做任何操作
    if (currentPatient) return;
    
    // 找到第一個等待中的病人
    const nextPatient = sortedWaitingPatients[0];
    if (!nextPatient) return;
    
    // 更新病人狀態為看診中
    const updatedPatient = {
      ...nextPatient,
      status: 'inProgress' as const,
    };
    dispatch({ type: 'UPDATE_PATIENT', payload: updatedPatient });
    
    // 重新排序病人
    dispatch({ type: 'SORT_PATIENTS' });
  };

  const handleEndConsultation = () => {
    if (!currentPatient) return;

    // 更新病人狀態為完診
    const updatedPatient = {
      ...currentPatient,
      status: 'completed' as const,
    };
    dispatch({ type: 'UPDATE_PATIENT', payload: updatedPatient });
    
    // 重新排序病人
    dispatch({ type: 'SORT_PATIENTS' });
  };

  const handleMarkNoShow = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId) || currentPatient;
    if (patient) {
      const updatedPatient = {
        ...patient,
        status: 'noShow' as const,
        noShowTime: new Date(),
      };
      dispatch({ type: 'UPDATE_PATIENT', payload: updatedPatient });
      
      // 重新排序病人
      dispatch({ type: 'SORT_PATIENTS' });
    }
  };

  const getStatusChip = (status: Patient['status']) => {
    const statusConfig = {
      waiting: { label: '候診中', color: 'default' },
      inProgress: { label: '看診中', color: 'primary' },
      completed: { label: '完診', color: 'success' },
      noShow: { label: '過號', color: 'error' },
    };

    const config = statusConfig[status];
    return (
      <Chip
        label={config.label}
        color={config.color as any}
        size="small"
      />
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        醫師看診系統
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          目前看診狀態
        </Typography>
        {currentPatient ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              正在看診：
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h5">
                {currentPatient.queueNumber}號 - {currentPatient.name}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<StopIcon />}
                  onClick={handleEndConsultation}
                  sx={{ mr: 1 }}
                >
                  結束看診
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleMarkNoShow(currentPatient.id)}
                >
                  標記過號
                </Button>
              </Box>
            </Paper>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={handleStartConsultation}
            disabled={sortedWaitingPatients.length === 0}
          >
            開始看診
          </Button>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          候診名單 ({sortedWaitingPatients.length}人)
        </Typography>
        <List>
          {sortedWaitingPatients.map((patient) => (
            <React.Fragment key={patient.id}>
              <ListItem>
                <ListItemText
                  primary={`${patient.queueNumber}號 - ${patient.name}`}
                  secondary={`病歷號: ${patient.medicalRecordNumber || '無'} ${patient.returnTime ? '(過號已報到)' : ''}`}
                />
                <ListItemSecondaryAction>
                  {getStatusChip(patient.status)}
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default DoctorView;
