import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Patient } from '../types';
import { useClinic } from '../context/ClinicContext';

const maskName = (name: string): string => {
  if (name.length <= 2) {
    return name.charAt(0) + '○';
  }
  return name.charAt(0) + '○'.repeat(name.length - 2) + name.charAt(name.length - 1);
};

const PublicView: React.FC = () => {
  const { state } = useClinic();
  const { patients } = state;

  const getStatusText = (status: Patient['status']): string => {
    switch (status) {
      case 'waiting':
        return '候診中';
      case 'inProgress':
        return '看診中';
      case 'completed':
        return '完診';
      case 'noShow':
        return '過號';
      default:
        return '';
    }
  };

  // 獲取當前正在看診的病人
  const currentInProgressPatient = patients.find(p => p.status === 'inProgress');
  
  // 計算過號病人的預計看診順序
  const getNoShowSequence = (patient: Patient): string => {
    // 如果病人沒有報到時間，不顯示預計順序
    if (!patient.returnTime) {
      return '尚未報到';
    }
    
    // 如果沒有正在看診的病人，不顯示預計順序
    if (!currentInProgressPatient) {
      return '等待醫師開始看診';
    }
    
    const currentQueueNumber = currentInProgressPatient.queueNumber;
    const patientQueueNumber = patient.queueNumber;
    
    // 過號病人在報到後排在當前看診號碼之後的兩個號碼之後
    // 例如：當前看診7號，過號3號報到，則顯示：7-->8-->3-->9
    if (patientQueueNumber < currentQueueNumber) {
      return `預計順序: ${currentQueueNumber}-->${currentQueueNumber + 1}-->${patientQueueNumber}-->${currentQueueNumber + 2}`;
    } 
    // 如果過號病人的號碼大於當前看診號碼，則排在當前號碼之後
    else {
      return `預計順序: ${currentQueueNumber}-->${patientQueueNumber}`;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        診所叫號系統
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          目前看診狀態
        </Typography>
        <List>
          {patients.map((patient) => (
            <React.Fragment key={patient.id}>
              <ListItem>
                <ListItemText
                  primary={`${patient.queueNumber}號 - ${maskName(patient.name)}`}
                  secondary={getStatusText(patient.status)}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          過號病人預計看診順序
        </Typography>
        <List>
          {patients
            .filter((p) => p.status === 'noShow')
            .map((patient) => (
              <ListItem key={patient.id}>
                <ListItemText
                  primary={`${patient.queueNumber}號 - ${maskName(patient.name)}`}
                  secondary={getNoShowSequence(patient)}
                />
              </ListItem>
            ))}
        </List>
      </Paper>
    </Box>
  );
};

export default PublicView; 