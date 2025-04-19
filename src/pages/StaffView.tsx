import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Check as CheckIcon } from '@mui/icons-material';
import { Patient } from '../types';
import { useClinic } from '../context/ClinicContext';

const StaffView: React.FC = () => {
  const { state, dispatch } = useClinic();
  const { patients, maxQueueNumber } = state;

  const [formData, setFormData] = useState({
    queueNumber: '',
    name: '',
    medicalRecordNumber: '',
    phoneNumber: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newPatient: Patient = {
      id: Date.now().toString(),
      name: formData.name,
      queueNumber: formData.queueNumber ? parseInt(formData.queueNumber) : maxQueueNumber + 1,
      medicalRecordNumber: formData.medicalRecordNumber || undefined,
      phoneNumber: formData.phoneNumber || undefined,
      status: 'waiting',
      checkInTime: new Date(),
    };

    dispatch({ type: 'ADD_PATIENT', payload: newPatient });
    setFormData({
      queueNumber: '',
      name: '',
      medicalRecordNumber: '',
      phoneNumber: '',
    });
  };

  const handleNoShowReturn = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      const updatedPatient = {
        ...patient,
        status: 'waiting' as const,
        returnTime: new Date(),
      };
      dispatch({ type: 'UPDATE_PATIENT', payload: updatedPatient });
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        掛號人員系統
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          新增病人
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="看診號碼"
                name="queueNumber"
                value={formData.queueNumber}
                onChange={handleInputChange}
                helperText={`目前最大看診號: ${maxQueueNumber}`}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="病人姓名"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="病歷號"
                name="medicalRecordNumber"
                value={formData.medicalRecordNumber}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="電話"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
                fullWidth
              >
                新增病人
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          候診名單
        </Typography>
        <List>
          {patients
            .filter((p) => p.status === 'waiting')
            .map((patient) => (
              <React.Fragment key={patient.id}>
                <ListItem>
                  <ListItemText
                    primary={`${patient.queueNumber}號 - ${patient.name}`}
                    secondary={`病歷號: ${patient.medicalRecordNumber || '無'} | 電話: ${patient.phoneNumber || '無'}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
        </List>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          過號管理
        </Typography>
        <List>
          {patients
            .filter((p) => p.status === 'noShow')
            .map((patient) => (
              <React.Fragment key={patient.id}>
                <ListItem>
                  <ListItemText
                    primary={`${patient.queueNumber}號 - ${patient.name}`}
                    secondary={`病歷號: ${patient.medicalRecordNumber || '無'} | 電話: ${patient.phoneNumber || '無'}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleNoShowReturn(patient.id)}
                      color="primary"
                    >
                      <CheckIcon />
                    </IconButton>
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

export default StaffView; 