import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Space,
  InputNumber,
  Select,
  Tag,
  Modal,
  List,
  Divider,
  Progress,
  DatePicker,
  Table,
  App,
  Popconfirm,
  Alert
} from 'antd';
import {
  HeartOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  TeamOutlined,
  DownloadOutlined,
  FileExcelOutlined
} from '@ant-design/icons';

import { supabaseService } from '../services/supabase';
import {
  selectVitals,
  selectMeasurements,
  selectBloodWork,
  selectLifestyle,
  selectGoals,
  setVitals,
  setMeasurements,
  setBloodWork,
  setLifestyle,
  setGoals
} from '../store/slices/healthslice';
import {
  validateVitals,
  validateMeasurements,
  validateBloodWork,
  validateAllergy,
  validateMedication,
  validateCondition,
  validateFamilyHistory,
  validateLifestyle,
  validateGoals,
  formatErrorMessage
} from '../utils/healthValidation';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const HealthRecordsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [vitalsForm] = Form.useForm();
  const [measurementsForm] = Form.useForm();
  const [bloodWorkForm] = Form.useForm();
  const [lifestyleForm] = Form.useForm();
  const [goalsForm] = Form.useForm();
  const [allergyForm] = Form.useForm();
  const [medicationForm] = Form.useForm();
  const [conditionForm] = Form.useForm();
  const [familyHistoryForm] = Form.useForm();
  
  const vitals = useSelector(selectVitals);
  const measurements = useSelector(selectMeasurements);
  const bloodWork = useSelector(selectBloodWork);
  const lifestyle = useSelector(selectLifestyle);
  const goals = useSelector(selectGoals);
  const health = useSelector(state => state.health);
  const currentUser = useSelector(state => state.auth.user);
  
  const [activeTab, setActiveTab] = useState('vitals');
  const [allergyModalVisible, setAllergyModalVisible] = useState(false);
  const [medicationModalVisible, setMedicationModalVisible] = useState(false);
  const [conditionModalVisible, setConditionModalVisible] = useState(false);
  const [familyHistoryModalVisible, setFamilyHistoryModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isExportHovered, setIsExportHovered] = useState(false);

  useEffect(() => {
    const initializeHealthData = async () => {
      // Check if user is authenticated
      if (!currentUser?.id) {
        message.warning('Please log in to access your health records');
        navigate('/login');
        return;
      }

      try {
        const { data: profile, error } = await supabaseService.userProfile.getProfile(currentUser.id);
        if (error) {
          console.error('Error fetching user profile:', error);
          if (error.message?.includes('Auth session missing')) {
            message.warning('Your session has expired. Please log in again.');
            navigate('/login');
            return;
          }
          message.error('Failed to load user profile');
          return;
        }
        
        if (profile) {
          setUserProfile(profile);
          
          // Load health records data
          try {
            const healthRecordsResult = await supabaseService.healthRecords.getAllHealthRecords(profile.id);
            if (healthRecordsResult.error) {
              console.error('Error loading health records:', healthRecordsResult.error);
            } else {
              setHealth(healthRecordsResult.data);
            }
          } catch (error) {
            console.error('Error loading health records:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        if (error.message?.includes('Auth session missing')) {
          message.warning('Your session has expired. Please log in again.');
          navigate('/login');
        } else {
          message.error('Failed to load user profile');
        }
      }
    };

    initializeHealthData();
  }, [dispatch, currentUser, message, navigate]);

  useEffect(() => {
    vitalsForm.setFieldsValue(vitals);
  }, [vitals, vitalsForm]);

  useEffect(() => {
    measurementsForm.setFieldsValue(measurements);
  }, [measurements, measurementsForm]);

  useEffect(() => {
    const bloodWorkFormData = {
      cholesterolTotal: bloodWork.cholesterolTotal,
      cholesterolLdl: bloodWork.cholesterolLdl,
      cholesterolHdl: bloodWork.cholesterolHdl,
      triglycerides: bloodWork.triglycerides,
      glucose: bloodWork.glucose,
      hba1c: bloodWork.hba1c,
      systolicBp: bloodWork.systolicBp,
      diastolicBp: bloodWork.diastolicBp,
      heartRate: bloodWork.heartRate,
      tsh: bloodWork.tsh,
      t3: bloodWork.t3,
      t4: bloodWork.t4,
      vitaminD: bloodWork.vitaminD,
      vitaminB12: bloodWork.vitaminB12,
      iron: bloodWork.iron,
      folate: bloodWork.folate,
      testDate: bloodWork.testDate ? dayjs(bloodWork.testDate) : null,
      labName: bloodWork.labName,
      notes: bloodWork.notes,
    };
    bloodWorkForm.setFieldsValue(bloodWorkFormData);
  }, [bloodWork, bloodWorkForm]);

  useEffect(() => {
    lifestyleForm.setFieldsValue(lifestyle);
  }, [lifestyle, lifestyleForm]);

  useEffect(() => {
    goalsForm.setFieldsValue(goals);
  }, [goals, goalsForm]);

  const handleVitalsSubmit = (values) => {
    setSubmitError(null);
    setValidationErrors({});
    
    const errors = validateVitals(values);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      message.error('Please fix the validation errors before submitting');
      return;
    }

    const bmi = values.weight && values.height ? 
      (values.weight / ((values.height / 100) ** 2)).toFixed(1) : null;
    
    const vitalsData = {
      weight: values.weight,
      height: values.height,
      bmi: parseFloat(bmi),
      bodyFat: values.bodyFat,
      muscleMass: values.muscleMass,
      waterPercentage: values.waterPercentage,
      boneDensity: values.boneDensity,
      metabolicAge: values.metabolicAge,
      visceralFat: values.visceralFat,
    };

    dispatch(setVitals(vitalsData));
    message.success('Vital signs updated successfully');
  };

  const handleMeasurementsSubmit = (values) => {
    setSubmitError(null);
    setValidationErrors({});
    
    const errors = validateMeasurements(values);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      message.error('Please fix the validation errors before submitting');
      return;
    }

    dispatch(setMeasurements(values));
    message.success('Body measurements updated successfully');
  };

  const handleBloodWorkSubmit = (values) => {
    setSubmitError(null);
    setValidationErrors({});
    
    const errors = validateBloodWork(values);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      message.error('Please fix the validation errors before submitting');
      return;
    }

    const bloodWorkData = {
      cholesterolTotal: values.cholesterolTotal,
      cholesterolLdl: values.cholesterolLdl,
      cholesterolHdl: values.cholesterolHdl,
      triglycerides: values.triglycerides,
      glucose: values.glucose,
      hba1c: values.hba1c,
      systolicBp: values.systolicBp,
      diastolicBp: values.diastolicBp,
      heartRate: values.heartRate,
      tsh: values.tsh,
      t3: values.t3,
      t4: values.t4,
      vitaminD: values.vitaminD,
      vitaminB12: values.vitaminB12,
      iron: values.iron,
      folate: values.folate,
      testDate: values.testDate ? values.testDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
      labName: values.labName,
      notes: values.notes,
    };
    
    dispatch(setBloodWork(bloodWorkData));
    message.success('Blood work results updated successfully');
  };

  const handleLifestyleSubmit = (values) => {
    dispatch(setLifestyle(values));
    message.success('Lifestyle information updated successfully');
  };

  const handleGoalsSubmit = (values) => {
    dispatch(setGoals(values));
    message.success('Health goals updated successfully');
  };

  const handleAddAllergy = async (values) => {
    if (!userProfile?.id) {
      message.error('User profile not found');
      return;
    }

    setSubmitError(null);
    setValidationErrors({});
    
    const errors = validateAllergy(values);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      message.error('Please fix the validation errors before submitting');
      return;
    }

    try {
      const allergyData = {
        user_profile_id: userProfile.id,
        allergy_name: values.allergyName,
        severity: values.severity,
        reaction_description: values.reactionDescription,
        diagnosed_date: values.diagnosedDate ? values.diagnosedDate.format('YYYY-MM-DD') : null,
      };
      
      await supabaseService.healthRecords.addAllergy(allergyData);
      
      // Refresh health data
      await initializeHealthData();
      
      allergyForm.resetFields();
      setAllergyModalVisible(false);
      message.success('Allergy added successfully');
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      setSubmitError(errorMessage);
      message.error('Failed to add allergy: ' + errorMessage);
    }
  };

  const handleRemoveAllergy = async (allergyId) => {
    try {
      await supabaseService.healthRecords.removeAllergy(allergyId);
      
      // Refresh health data
      await initializeHealthData();
      
      message.success('Allergy removed successfully');
    } catch (error) {
      message.error('Failed to remove allergy');
    }
  };

  const handleAddMedication = async (values) => {
    if (!userProfile?.id) {
      message.error('User profile not found');
      return;
    }

    try {
      const medicationData = {
        user_profile_id: userProfile.id,
        medication_name: values.medicationName,
        dosage: values.dosage,
        frequency: values.frequency,
        start_date: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        end_date: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        prescribing_doctor: values.prescribingDoctor,
        purpose: values.purpose,
        side_effects: values.sideEffects,
      };
      
      await supabaseService.healthRecords.addMedication(medicationData);
      
      // Refresh health data
      await initializeHealthData();
      
      medicationForm.resetFields();
      setMedicationModalVisible(false);
      message.success('Medication added successfully');
    } catch (error) {
      message.error('Failed to add medication');
    }
  };

  const handleRemoveMedication = async (medicationId) => {
    try {
      await supabaseService.healthRecords.removeMedication(medicationId);
      
      // Refresh health data
      await initializeHealthData();
      
      message.success('Medication removed successfully');
    } catch (error) {
      message.error('Failed to remove medication');
    }
  };

  const handleAddCondition = async (values) => {
    if (!userProfile?.id) {
      message.error('User profile not found');
      return;
    }

    try {
      const conditionData = {
        user_profile_id: userProfile.id,
        condition_name: values.conditionName,
        diagnosis_date: values.diagnosisDate ? values.diagnosisDate.format('YYYY-MM-DD') : null,
        severity: values.severity,
        status: values.status,
        treating_doctor: values.treatingDoctor,
        treatment_notes: values.treatmentNotes,
      };
      
      await supabaseService.healthRecords.addCondition(conditionData);
      
      // Refresh health data
      await initializeHealthData();
      
      conditionForm.resetFields();
      setConditionModalVisible(false);
      message.success('Condition added successfully');
    } catch (error) {
      message.error('Failed to add condition');
    }
  };

  const handleRemoveCondition = async (conditionId) => {
    try {
      await supabaseService.healthRecords.removeCondition(conditionId);
      
      // Refresh health data
      await initializeHealthData();
      
      message.success('Condition removed successfully');
    } catch (error) {
      message.error('Failed to remove condition');
    }
  };

  const handleAddFamilyHistory = async (values) => {
    if (!userProfile?.id) {
      message.error('User profile not found');
      return;
    }

    try {
      const familyHistoryData = {
        user_profile_id: userProfile.id,
        relation: values.relation,
        condition_name: values.conditionName,
        age_of_onset: values.ageOfOnset,
        notes: values.notes,
      };
      
      await supabaseService.healthRecords.addFamilyHistory(familyHistoryData);
      
      // Refresh health data
      await initializeHealthData();
      
      familyHistoryForm.resetFields();
      setFamilyHistoryModalVisible(false);
      message.success('Family history added successfully');
    } catch (error) {
      message.error('Failed to add family history');
    }
  };

  const handleRemoveFamilyHistory = async (recordId) => {
    try {
      await dispatch(removeFamilyHistoryAsync({ recordId })).unwrap();
      message.success('Family history removed successfully');
    } catch (error) {
      message.error('Failed to remove family history');
    }
  };

  // Custom button styles for export button
  const exportButtonStyle = {
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 50%, #17a2b8 100%)',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(40, 167, 69, 0.3)',
    fontWeight: 700,
    fontSize: '16px',
    padding: '8px 24px',
    height: '48px',
    minWidth: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer'
  };

  const exportButtonHoverStyle = {
    ...exportButtonStyle,
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 32px rgba(40, 167, 69, 0.4)'
  };

  const getHealthCompletionPercentage = () => {
    const totalFields = 15;
    let completedFields = 0;
    
    if (vitals.weight) completedFields++;
    if (vitals.height) completedFields++;
    if (vitals.bodyFat) completedFields++;
    if (measurements.waist) completedFields++;
    if (measurements.chest) completedFields++;
    if (bloodWork.cholesterolTotal) completedFields++;
    if (bloodWork.systolicBp) completedFields++;
    if (bloodWork.glucose) completedFields++;
    if (lifestyle.exerciseFrequency) completedFields++;
    if (lifestyle.sleepHours) completedFields++;
    if (lifestyle.stressLevel) completedFields++;
    if (goals.weightGoal) completedFields++;
    if (goals.exerciseGoal) completedFields++;
    if (health.allergies?.length > 0) completedFields++;
    if (health.medications?.length > 0) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  // Health Report Export Function - XLSX Format
  const handleExportHealthReport = () => {
    try {
      // Create workbook
      const workbook = XLSX.utils.book_new();
      
      // Patient Information Sheet
      const patientInfo = [
        ['Export Date', dayjs().format('YYYY-MM-DD HH:mm:ss')],
        ['Patient Name', userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'N/A' : 'N/A'],
        ['Email', userProfile?.email || 'N/A'],
        ['Phone', userProfile?.phone || 'N/A'],
        ['Date of Birth', userProfile?.date_of_birth || 'N/A'],
        ['Gender', userProfile?.gender || 'N/A']
      ];
      const patientSheet = XLSX.utils.aoa_to_sheet(patientInfo);
      XLSX.utils.book_append_sheet(workbook, patientSheet, 'Patient Information');
      
      // Vital Signs Sheet
      const vitalsData = [
        ['Measurement', 'Value', 'Unit'],
        ['Weight', vitals.weight || 'N/A', 'kg'],
        ['Height', vitals.height || 'N/A', 'cm'],
        ['BMI', vitals.bmi || 'N/A', 'kg/m²'],
        ['Body Fat', vitals.bodyFat || 'N/A', '%'],
        ['Muscle Mass', vitals.muscleMass || 'N/A', 'kg'],
        ['Water Percentage', vitals.waterPercentage || 'N/A', '%'],
        ['Bone Density', vitals.boneDensity || 'N/A', 'g/cm²'],
        ['Metabolic Age', vitals.metabolicAge || 'N/A', 'years'],
        ['Visceral Fat', vitals.visceralFat || 'N/A', 'level']
      ];
      const vitalsSheet = XLSX.utils.aoa_to_sheet(vitalsData);
      XLSX.utils.book_append_sheet(workbook, vitalsSheet, 'Vital Signs');
      
      // Body Measurements Sheet
      const measurementsData = [
        ['Measurement', 'Value', 'Unit'],
        ['Waist', measurements.waist || 'N/A', 'cm'],
        ['Chest', measurements.chest || 'N/A', 'cm'],
        ['Hips', measurements.hips || 'N/A', 'cm'],
        ['Neck', measurements.neck || 'N/A', 'cm'],
        ['Arms', measurements.arms || 'N/A', 'cm'],
        ['Thighs', measurements.thighs || 'N/A', 'cm'],
        ['Shoulders', measurements.shoulders || 'N/A', 'cm'],
        ['Forearms', measurements.forearms || 'N/A', 'cm'],
        ['Calves', measurements.calves || 'N/A', 'cm']
      ];
      const measurementsSheet = XLSX.utils.aoa_to_sheet(measurementsData);
      XLSX.utils.book_append_sheet(workbook, measurementsSheet, 'Body Measurements');
      
      // Blood Work Sheet
      const bloodWorkData = [
        ['Test', 'Value', 'Unit'],
        ['Total Cholesterol', bloodWork.cholesterolTotal || 'N/A', 'mg/dL'],
        ['LDL Cholesterol', bloodWork.cholesterolLdl || 'N/A', 'mg/dL'],
        ['HDL Cholesterol', bloodWork.cholesterolHdl || 'N/A', 'mg/dL'],
        ['Triglycerides', bloodWork.triglycerides || 'N/A', 'mg/dL'],
        ['Glucose', bloodWork.glucose || 'N/A', 'mg/dL'],
        ['HbA1c', bloodWork.hba1c || 'N/A', '%'],
        ['Systolic BP', bloodWork.systolicBp || 'N/A', 'mmHg'],
        ['Diastolic BP', bloodWork.diastolicBp || 'N/A', 'mmHg'],
        ['Heart Rate', bloodWork.heartRate || 'N/A', 'bpm'],
        ['TSH', bloodWork.tsh || 'N/A', 'mIU/L'],
        ['T3', bloodWork.t3 || 'N/A', 'pg/mL'],
        ['T4', bloodWork.t4 || 'N/A', 'ng/dL'],
        ['Vitamin D', bloodWork.vitaminD || 'N/A', 'ng/mL'],
        ['Vitamin B12', bloodWork.vitaminB12 || 'N/A', 'pg/mL'],
        ['Iron', bloodWork.iron || 'N/A', 'μg/dL'],
        ['Folate', bloodWork.folate || 'N/A', 'ng/mL'],
        ['Test Date', bloodWork.testDate || 'N/A', ''],
        ['Lab Name', bloodWork.labName || 'N/A', ''],
        ['Notes', bloodWork.notes || 'N/A', '']
      ];
      const bloodWorkSheet = XLSX.utils.aoa_to_sheet(bloodWorkData);
      XLSX.utils.book_append_sheet(workbook, bloodWorkSheet, 'Blood Work');
      
      // Lifestyle Sheet
      const lifestyleData = [
        ['Category', 'Value'],
        ['Exercise Frequency (times/week)', lifestyle.exerciseFrequency || 'N/A'],
        ['Sleep Hours', lifestyle.sleepHours || 'N/A'],
        ['Stress Level (1-10)', lifestyle.stressLevel || 'N/A'],
        ['Smoking Status', lifestyle.smokingStatus || 'N/A'],
        ['Alcohol Consumption (drinks/week)', lifestyle.alcoholConsumption || 'N/A'],
        ['Water Intake (glasses/day)', lifestyle.waterIntake || 'N/A']
      ];
      const lifestyleSheet = XLSX.utils.aoa_to_sheet(lifestyleData);
      XLSX.utils.book_append_sheet(workbook, lifestyleSheet, 'Lifestyle');
      
      // Health Goals Sheet
      const goalsData = [
        ['Goal', 'Target Value'],
        ['Weight Goal', goals.weightGoal || 'N/A'],
        ['Exercise Goal', goals.exerciseGoal || 'N/A'],
        ['Sleep Goal', goals.sleepGoal || 'N/A'],
        ['Water Goal (glasses/day)', goals.waterGoal || 'N/A'],
        ['Steps Goal (per day)', goals.stepsGoal || 'N/A']
      ];
      const goalsSheet = XLSX.utils.aoa_to_sheet(goalsData);
      XLSX.utils.book_append_sheet(workbook, goalsSheet, 'Health Goals');
      
      // Allergies Sheet
      if (health.allergies && health.allergies.length > 0) {
        const allergiesData = [
          ['Allergy Name', 'Severity', 'Reaction Description', 'Diagnosed Date']
        ];
        health.allergies.forEach(allergy => {
          allergiesData.push([
            allergy.allergy_name || 'N/A',
            allergy.severity || 'N/A',
            allergy.reaction_description || 'N/A',
            allergy.diagnosed_date || 'N/A'
          ]);
        });
        const allergiesSheet = XLSX.utils.aoa_to_sheet(allergiesData);
        XLSX.utils.book_append_sheet(workbook, allergiesSheet, 'Allergies');
      }
      
      // Medications Sheet
      if (health.medications && health.medications.length > 0) {
        const medicationsData = [
          ['Medication Name', 'Dosage', 'Frequency', 'Start Date', 'End Date', 'Prescribing Doctor', 'Purpose']
        ];
        health.medications.forEach(medication => {
          medicationsData.push([
            medication.medication_name || 'N/A',
            medication.dosage || 'N/A',
            medication.frequency || 'N/A',
            medication.start_date || 'N/A',
            medication.end_date || 'N/A',
            medication.prescribing_doctor || 'N/A',
            medication.purpose || 'N/A'
          ]);
        });
        const medicationsSheet = XLSX.utils.aoa_to_sheet(medicationsData);
        XLSX.utils.book_append_sheet(workbook, medicationsSheet, 'Medications');
      }
      
      // Medical Conditions Sheet
      if (health.conditions && health.conditions.length > 0) {
        const conditionsData = [
          ['Condition Name', 'Diagnosis Date', 'Severity', 'Status', 'Treating Doctor', 'Treatment Notes']
        ];
        health.conditions.forEach(condition => {
          conditionsData.push([
            condition.condition_name || 'N/A',
            condition.diagnosis_date || 'N/A',
            condition.severity || 'N/A',
            condition.status || 'N/A',
            condition.treating_doctor || 'N/A',
            condition.treatment_notes || 'N/A'
          ]);
        });
        const conditionsSheet = XLSX.utils.aoa_to_sheet(conditionsData);
        XLSX.utils.book_append_sheet(workbook, conditionsSheet, 'Medical Conditions');
      }
      
      // Family History Sheet
      if (health.familyHistory && health.familyHistory.length > 0) {
        const familyHistoryData = [
          ['Relation', 'Condition Name', 'Age of Onset', 'Notes']
        ];
        health.familyHistory.forEach(record => {
          familyHistoryData.push([
            record.relation || 'N/A',
            record.condition_name || 'N/A',
            record.age_of_onset || 'N/A',
            record.notes || 'N/A'
          ]);
        });
        const familyHistorySheet = XLSX.utils.aoa_to_sheet(familyHistoryData);
        XLSX.utils.book_append_sheet(workbook, familyHistorySheet, 'Family History');
      }
      
      // Summary Sheet
      const summaryData = [
        ['Category', 'Count'],
        ['Total Vital Signs Recorded', Object.keys(vitals).filter(key => vitals[key] !== null && vitals[key] !== undefined && vitals[key] !== '').length],
        ['Total Measurements Recorded', Object.keys(measurements).filter(key => measurements[key] !== null && measurements[key] !== undefined && measurements[key] !== '').length],
        ['Total Blood Work Tests', Object.keys(bloodWork).filter(key => bloodWork[key] !== null && bloodWork[key] !== undefined && bloodWork[key] !== '').length],
        ['Total Allergies', health.allergies?.length || 0],
        ['Total Medications', health.medications?.length || 0],
        ['Total Medical Conditions', health.conditions?.length || 0],
        ['Total Family History Records', health.familyHistory?.length || 0],
        ['Profile Completion', `${getHealthCompletionPercentage()}%`]
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      // Generate and download the file
      const fileName = `health-report-${dayjs().format('YYYY-MM-DD')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      message.success('Health report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export health report');
    }
  };

  const tabItems = [
    { key: 'vitals', label: 'Vital Signs', icon: <HeartOutlined /> },
    { key: 'measurements', label: 'Body Measurements', icon: <ExperimentOutlined /> },
    { key: 'bloodwork', label: 'Blood Work', icon: <MedicineBoxOutlined /> },
    { key: 'lifestyle', label: 'Lifestyle', icon: <InfoCircleOutlined /> },
    { key: 'medical', label: 'Medical History', icon: <WarningOutlined /> },
    { key: 'family', label: 'Family History', icon: <TeamOutlined /> },
    { key: 'goals', label: 'Health Goals', icon: <CheckCircleOutlined /> }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vitals':
        return (
          <Card title="Vital Signs" style={{ margin: 0, padding: '16px' }}>
            {submitError && (
              <Alert
                message="Error"
                description={submitError}
                type="error"
                closable
                onClose={() => setSubmitError(null)}
                style={{ marginBottom: 16 }}
              />
            )}
            <Form form={vitalsForm} layout="vertical" onFinish={handleVitalsSubmit} style={{ marginTop: '16px' }}>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Weight (kg)" name="weight">
                    <InputNumber style={{ width: '100%' }} placeholder="70" precision={1} min={0} max={1000} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Height (cm)" name="height">
                    <InputNumber style={{ width: '100%' }} placeholder="175" min={0} max={300} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="BMI">
                    <InputNumber style={{ width: '100%' }} value={vitals.bmi} disabled precision={1} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[24, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Body Fat (%)" name="bodyFat">
                    <InputNumber style={{ width: '100%' }} placeholder="15" precision={1} min={0} max={100} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Muscle Mass (kg)" name="muscleMass">
                    <InputNumber style={{ width: '100%' }} placeholder="32" precision={1} min={0} max={200} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Water Percentage (%)" name="waterPercentage">
                    <InputNumber style={{ width: '100%' }} placeholder="60" precision={1} min={0} max={100} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[24, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Bone Density (g/cm²)" name="boneDensity">
                    <InputNumber style={{ width: '100%' }} placeholder="2.8" precision={2} min={0} max={10} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Metabolic Age" name="metabolicAge">
                    <InputNumber style={{ width: '100%' }} placeholder="25" min={0} max={150} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Visceral Fat Level" name="visceralFat">
                    <InputNumber style={{ width: '100%' }} placeholder="5" min={0} max={30} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item style={{ marginTop: '24px' }}>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Save Vital Signs
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );

      case 'measurements':
        return (
          <Card title="Body Measurements" style={{ margin: 0, padding: '16px' }}>
            <Form form={measurementsForm} layout="vertical" onFinish={handleMeasurementsSubmit} style={{ marginTop: '16px' }}>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Waist (cm)" name="waist">
                    <InputNumber style={{ width: '100%' }} placeholder="80" min={0} max={500} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Chest (cm)" name="chest">
                    <InputNumber style={{ width: '100%' }} placeholder="95" min={0} max={500} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Hips (cm)" name="hips">
                    <InputNumber style={{ width: '100%' }} placeholder="90" min={0} max={500} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[24, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Neck (cm)" name="neck">
                    <InputNumber style={{ width: '100%' }} placeholder="35" min={0} max={100} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Arms (cm)" name="arms">
                    <InputNumber style={{ width: '100%' }} placeholder="30" min={0} max="200" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Thighs (cm)" name="thighs">
                    <InputNumber style={{ width: '100%' }} placeholder="55" min={0} max={200} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[24, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Shoulders (cm)" name="shoulders">
                    <InputNumber style={{ width: '100%' }} placeholder="45" min={0} max={200} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Forearms (cm)" name="forearms">
                    <InputNumber style={{ width: '100%' }} placeholder="25" min={0} max={100} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Calves (cm)" name="calves">
                    <InputNumber style={{ width: '100%' }} placeholder="35" min={0} max={100} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item style={{ marginTop: '24px' }}>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Save Measurements
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );

      case 'bloodwork':
        return (
          <Card title="Blood Work Results" style={{ margin: 0, padding: '16px' }}>
            <Form form={bloodWorkForm} layout="vertical" onFinish={handleBloodWorkSubmit} style={{ marginTop: '16px' }}>
              <Divider style={{ margin: '24px 0' }}>Cholesterol Panel</Divider>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={6} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Total Cholesterol (mg/dL)" name="cholesterolTotal">
                    <InputNumber style={{ width: '100%' }} placeholder="180" min={0} max={1000} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={6} style={{ marginBottom: '8px' }}>
                  <Form.Item label="LDL (mg/dL)" name="cholesterolLdl">
                    <InputNumber style={{ width: '100%' }} placeholder="100" min={0} max={1000} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={6} style={{ marginBottom: '8px' }}>
                  <Form.Item label="HDL (mg/dL)" name="cholesterolHdl">
                    <InputNumber style={{ width: '100%' }} placeholder="60" min={0} max={1000} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={6} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Triglycerides (mg/dL)" name="triglycerides">
                    <InputNumber style={{ width: '100%' }} placeholder="100" min={0} max={1000} />
                  </Form.Item>
                </Col>
              </Row>
              <Divider style={{ margin: '24px 0' }}>Blood Sugar & Pressure</Divider>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Glucose (mg/dL)" name="glucose">
                    <InputNumber style={{ width: '100%' }} placeholder="90" min={0} max={1000} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="HbA1c (%)" name="hba1c">
                    <InputNumber style={{ width: '100%' }} placeholder="5.2" precision={1} min={0} max={20} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Heart Rate (bpm)" name="heartRate">
                    <InputNumber style={{ width: '100%' }} placeholder="72" min={0} max={300} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[24, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Systolic BP (mmHg)" name="systolicBp">
                    <InputNumber style={{ width: '100%' }} placeholder="120" min={0} max={300} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Diastolic BP (mmHg)" name="diastolicBp">
                    <InputNumber style={{ width: '100%' }} placeholder="80" min={0} max={200} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Test Date" name="testDate">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Divider style={{ margin: '24px 0' }}>Thyroid Function</Divider>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="TSH (mIU/L)" name="tsh">
                    <InputNumber style={{ width: '100%' }} placeholder="2.5" precision={2} min={0} max={100} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="T3 (pg/mL)" name="t3">
                    <InputNumber style={{ width: '100%' }} placeholder="3.2" precision={1} min={0} max={20} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="T4 (ng/dL)" name="t4">
                    <InputNumber style={{ width: '100%' }} placeholder="8.5" precision={1} min={0} max={20} />
                  </Form.Item>
                </Col>
              </Row>
              <Divider style={{ margin: '24px 0' }}>Vitamins & Minerals</Divider>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={6} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Vitamin D (ng/mL)" name="vitaminD">
                    <InputNumber style={{ width: '100%' }} placeholder="30" precision={1} min={0} max={200} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={6} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Vitamin B12 (pg/mL)" name="vitaminB12">
                    <InputNumber style={{ width: '100%' }} placeholder="500" precision={1} min={0} max={5000} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={6} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Iron (μg/dL)" name="iron">
                    <InputNumber style={{ width: '100%' }} placeholder="100" precision={1} min={0} max={1000} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={6} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Folate (ng/mL)" name="folate">
                    <InputNumber style={{ width: '100%' }} placeholder="12" precision={1} min={0} max={100} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[24, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Lab Name" name="labName">
                    <Input placeholder="Enter lab name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Notes" name="notes">
                    <TextArea rows={3} placeholder="Additional notes or observations" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item style={{ marginTop: '24px' }}>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Save Blood Work Results
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );

      case 'lifestyle':
        return (
          <Card title="Lifestyle Information" style={{ margin: 0, padding: '16px' }}>
            <Form form={lifestyleForm} layout="vertical" onFinish={handleLifestyleSubmit} style={{ marginTop: '16px' }}>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Exercise Frequency (times/week)" name="exerciseFrequency">
                    <InputNumber style={{ width: '100%' }} placeholder="3" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Sleep Hours" name="sleepHours">
                    <InputNumber style={{ width: '100%' }} placeholder="8" precision={1} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Stress Level (1-10)" name="stressLevel">
                    <InputNumber style={{ width: '100%' }} placeholder="5" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[24, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Smoking Status" name="smokingStatus">
                    <Select placeholder="Select smoking status">
                      <Option value="never">Never</Option>
                      <Option value="former">Former</Option>
                      <Option value="current">Current</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Alcohol (drinks/week)" name="alcoholConsumption">
                    <InputNumber style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Water Intake (glasses/day)" name="waterIntake">
                    <InputNumber style={{ width: '100%' }} placeholder="8" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item style={{ marginTop: '24px' }}>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Save Lifestyle Information
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );

      case 'medical':
        return (
          <Card title="Medical History" style={{ margin: 0, padding: '16px' }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card size="small" title="Allergies" style={{ marginBottom: '16px' }} extra={
                  <Button type="link" icon={<PlusOutlined />} onClick={() => setAllergyModalVisible(true)}>
                    Add
                  </Button>
                }>
                  <List
                    size="small"
                    dataSource={health.allergies || []}
                    style={{ minHeight: '120px' }}
                    renderItem={allergy => (
                      <List.Item
                        actions={[
                          <Popconfirm
                            title="Remove this allergy?"
                            onConfirm={() => handleRemoveAllergy(allergy.id)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button type="link" danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        ]}
                      >
                        <div>
                          <Tag color={allergy.severity === 'severe' ? 'red' : allergy.severity === 'moderate' ? 'orange' : 'yellow'}>
                            {allergy.allergy_name}
                          </Tag>
                          {allergy.severity && <Text type="secondary">({allergy.severity})</Text>}
                        </div>
                      </List.Item>
                    )}
                    locale={{ emptyText: 'No allergies recorded' }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" title="Medications" style={{ marginBottom: '16px' }} extra={
                  <Button type="link" icon={<PlusOutlined />} onClick={() => setMedicationModalVisible(true)}>
                    Add
                  </Button>
                }>
                  <List
                    size="small"
                    dataSource={health.medications || []}
                    style={{ minHeight: '120px' }}
                    renderItem={medication => (
                      <List.Item
                        actions={[
                          <Popconfirm
                            title="Remove this medication?"
                            onConfirm={() => handleRemoveMedication(medication.id)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button type="link" danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        ]}
                      >
                        <div>
                          <Text strong>{medication.medication_name}</Text>
                          <br />
                          <Text type="secondary">{medication.dosage} - {medication.frequency}</Text>
                          {medication.purpose && (
                            <>
                              <br />
                              <Text type="secondary" style={{ fontSize: '12px' }}>Purpose: {medication.purpose}</Text>
                            </>
                          )}
                        </div>
                      </List.Item>
                    )}
                    locale={{ emptyText: 'No medications recorded' }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" title="Conditions" style={{ marginBottom: '16px' }} extra={
                  <Button type="link" icon={<PlusOutlined />} onClick={() => setConditionModalVisible(true)}>
                    Add
                  </Button>
                }>
                  <List
                    size="small"
                    dataSource={health.conditions || []}
                    style={{ minHeight: '120px' }}
                    renderItem={condition => (
                      <List.Item
                        actions={[
                          <Popconfirm
                            title="Remove this condition?"
                            onConfirm={() => handleRemoveCondition(condition.id)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button type="link" danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        ]}
                      >
                        <div>
                          <Tag color={condition.status === 'active' ? 'red' : condition.status === 'chronic' ? 'orange' : 'green'}>
                            {condition.condition_name}
                          </Tag>
                          {condition.severity && <Text type="secondary">({condition.severity})</Text>}
                          {condition.status && (
                            <>
                              <br />
                              <Text type="secondary" style={{ fontSize: '12px' }}>Status: {condition.status}</Text>
                            </>
                          )}
                        </div>
                      </List.Item>
                    )}
                    locale={{ emptyText: 'No conditions recorded' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        );

      case 'family':
        return (
          <Card title="Family History" style={{ margin: 0, padding: '16px' }}>
            <div style={{ marginBottom: '24px' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setFamilyHistoryModalVisible(true)}>
                Add Family History
              </Button>
            </div>
            <Table
              dataSource={health.familyHistory || []}
              rowKey="id"
              pagination={false}
              style={{ marginTop: '16px' }}
              columns={[
                {
                  title: 'Relation',
                  dataIndex: 'relation',
                  key: 'relation',
                },
                {
                  title: 'Condition',
                  dataIndex: 'condition_name',
                  key: 'condition_name',
                },
                {
                  title: 'Age of Onset',
                  dataIndex: 'age_of_onset',
                  key: 'age_of_onset',
                  render: (age) => age ? `${age} years` : 'N/A',
                },
                {
                  title: 'Notes',
                  dataIndex: 'notes',
                  key: 'notes',
                  render: (notes) => notes || 'No notes',
                },
                {
                  title: 'Action',
                  key: 'action',
                  render: (_, record) => (
                    <Popconfirm
                      title="Remove this family history record?"
                      onConfirm={() => handleRemoveFamilyHistory(record.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="link" danger icon={<DeleteOutlined />}>
                        Remove
                      </Button>
                    </Popconfirm>
                  ),
                },
              ]}
              locale={{ emptyText: 'No family history recorded' }}
            />
          </Card>
        );

      case 'goals':
        return (
          <Card title="Health Goals" style={{ margin: 0, padding: '16px' }}>
            <Form form={goalsForm} layout="vertical" onFinish={handleGoalsSubmit} style={{ marginTop: '16px' }}>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Weight Goal (kg)" name="weightGoal">
                    <InputNumber style={{ width: '100%' }} placeholder="65" precision={1} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="BMI Goal" name="bmiGoal">
                    <InputNumber style={{ width: '100%' }} placeholder="22" precision={1} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Exercise Goal (times/week)" name="exerciseGoal">
                    <InputNumber style={{ width: '100%' }} placeholder="3" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[24, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Sleep Goal (hours)" name="sleepGoal">
                    <InputNumber style={{ width: '100%' }} placeholder="8" precision={1} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Water Goal (glasses/day)" name="waterGoal">
                    <InputNumber style={{ width: '100%' }} placeholder="8" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item label="Steps Goal (per day)" name="stepsGoal">
                    <InputNumber style={{ width: '100%' }} placeholder="10000" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item style={{ marginTop: '24px' }}>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Save Health Goals
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ 
      padding: '32px', 
      height: '100vh',
      backgroundColor: '#f5f5f5',
      overflowY: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
          
          .export-button {
            background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%) !important;
            border: none !important;
            border-radius: 8px !important;
            box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            height: 48px !important;
            font-weight: 600 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            color: white !important;
          }
          
          .export-button:hover {
            background: linear-gradient(135deg, #389e0d 0%, #237804 100%) !important;
            box-shadow: 0 4px 12px rgba(82, 196, 26, 0.4) !important;
            transform: translateY(-1px) !important;
            color: white !important;
          }
          
          .export-button:active {
            transform: translateY(0) !important;
            box-shadow: 0 2px 6px rgba(82, 196, 26, 0.3) !important;
          }
        `}
      </style>
      <Row gutter={[32, 32]}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <Space>
                <Button 
                  type="text" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate('/dashboard')}
                >
                  Back
                </Button>
                <Title level={2} style={{ margin: 0 }}>
                  Health Records Setup
                </Title>
              </Space>
              <Space size="large">
                <Button 
                  type="primary" 
                  icon={<FileExcelOutlined style={{ fontSize: '18px' }} />}
                  onClick={handleExportHealthReport}
                  size="large"
                  style={isExportHovered ? exportButtonHoverStyle : exportButtonStyle}
                  onMouseEnter={() => setIsExportHovered(true)}
                  onMouseLeave={() => setIsExportHovered(false)}
                  className="export-button"
                >
                  <span style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    position: 'relative',
                    zIndex: 2,
                    color: '#ffffff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    Export Health Report
                  </span>
                </Button>
                <div style={{ textAlign: 'right' }}>
                  <Text type="secondary">Profile Completion</Text>
                  <Progress
                    percent={getHealthCompletionPercentage()}
                    size="small"
                    status={getHealthCompletionPercentage() === 100 ? 'success' : 'active'}
                    style={{ width: '150px', marginLeft: '8px' }}
                  />
                </div>
              </Space>
            </div>
            
            <div style={{ 
              background: '#f0f9ff', 
              border: '1px solid #91c7ff', 
              padding: '12px', 
              borderRadius: '6px', 
              marginBottom: '16px' 
            }}>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Your basic health information (height, weight, BMI) is automatically synchronized 
                with your Personal Profile. Detailed health records including vitals, measurements, 
                blood work, and medical history are stored here for comprehensive tracking.
              </Text>
            </div>
            
            <div style={{ marginBottom: '32px' }}>
              <Space wrap size="large">
                {tabItems.map(item => (
                  <Button
                    key={item.key}
                    type={activeTab === item.key ? 'primary' : 'default'}
                    icon={item.icon}
                    onClick={() => setActiveTab(item.key)}
                  >
                    {item.label}
                  </Button>
                ))}
              </Space>
            </div>

            {renderTabContent()}
          </Card>
        </Col>
      </Row>

      <Modal
        title="Add Allergy"
        open={allergyModalVisible}
        onOk={() => allergyForm.submit()}
        onCancel={() => {
          setAllergyModalVisible(false);
          allergyForm.resetFields();
        }}
      >
        <Form form={allergyForm} layout="vertical" onFinish={handleAddAllergy} style={{ marginTop: '16px' }}>
          <Form.Item
            label="Allergy Name"
            name="allergyName"
            rules={[{ required: true, message: 'Please enter allergy name' }]}
            style={{ marginBottom: '20px' }}
          >
            <Input placeholder="Enter allergy name" />
          </Form.Item>
          <Form.Item
            label="Severity"
            name="severity"
            style={{ marginBottom: '20px' }}
          >
            <Select placeholder="Select severity">
              <Option value="mild">Mild</Option>
              <Option value="moderate">Moderate</Option>
              <Option value="severe">Severe</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Reaction Description"
            name="reactionDescription"
            style={{ marginBottom: '20px' }}
          >
            <TextArea rows={3} placeholder="Describe the allergic reaction" />
          </Form.Item>
          <Form.Item
            label="Diagnosed Date"
            name="diagnosedDate"
            style={{ marginBottom: '20px' }}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Medication"
        open={medicationModalVisible}
        onOk={() => medicationForm.submit()}
        onCancel={() => {
          setMedicationModalVisible(false);
          medicationForm.resetFields();
        }}
        width={600}
      >
        <Form form={medicationForm} layout="vertical" onFinish={handleAddMedication} style={{ marginTop: '16px' }}>
          <Row gutter={[20, 16]}>
            <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
              <Form.Item
                label="Medication Name"
                name="medicationName"
                rules={[{ required: true, message: 'Please enter medication name' }]}
              >
                <Input placeholder="Medication name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
              <Form.Item
                label="Dosage"
                name="dosage"
                rules={[{ required: true, message: 'Please enter dosage' }]}
              >
                <Input placeholder="e.g. 50mg, 1 tablet" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[20, 16]} style={{ marginTop: '8px' }}>
            <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
              <Form.Item
                label="Frequency"
                name="frequency"
                rules={[{ required: true, message: 'Please select frequency' }]}
              >
                <Select placeholder="Select frequency">
                  <Option value="daily">Daily</Option>
                  <Option value="twice daily">Twice Daily</Option>
                  <Option value="three times daily">Three Times Daily</Option>
                  <Option value="weekly">Weekly</Option>
                  <Option value="as needed">As Needed</Option>
                  <Option value="monthly">Monthly</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
              <Form.Item
                label="Prescribing Doctor"
                name="prescribingDoctor"
              >
                <Input placeholder="Doctor's name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[20, 16]} style={{ marginTop: '8px' }}>
            <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
              <Form.Item
                label="Start Date"
                name="startDate"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
              <Form.Item
                label="End Date"
                name="endDate"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Purpose"
            name="purpose"
          >
            <Input placeholder="What is this medication for?" />
          </Form.Item>
          <Form.Item
            label="Side Effects"
            name="sideEffects"
          >
            <TextArea rows={2} placeholder="Known side effects or reactions" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Condition"
        open={conditionModalVisible}
        onOk={() => conditionForm.submit()}
        onCancel={() => {
          setConditionModalVisible(false);
          conditionForm.resetFields();
        }}
        width={600}
      >
        <Form form={conditionForm} layout="vertical" onFinish={handleAddCondition}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Condition Name"
                name="conditionName"
                rules={[{ required: true, message: 'Please enter condition name' }]}
              >
                <Input placeholder="Enter condition name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Diagnosis Date"
                name="diagnosisDate"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Severity"
                name="severity"
              >
                <Select placeholder="Select severity">
                  <Option value="mild">Mild</Option>
                  <Option value="moderate">Moderate</Option>
                  <Option value="severe">Severe</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Status"
                name="status"
              >
                <Select placeholder="Select status">
                  <Option value="active">Active</Option>
                  <Option value="resolved">Resolved</Option>
                  <Option value="chronic">Chronic</Option>
                  <Option value="managed">Managed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Treating Doctor"
            name="treatingDoctor"
          >
            <Input placeholder="Doctor's name" />
          </Form.Item>
          <Form.Item
            label="Treatment Notes"
            name="treatmentNotes"
          >
            <TextArea rows={3} placeholder="Treatment notes or additional information" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Family History"
        open={familyHistoryModalVisible}
        onOk={() => familyHistoryForm.submit()}
        onCancel={() => {
          setFamilyHistoryModalVisible(false);
          familyHistoryForm.resetFields();
        }}
        width={600}
      >
        <Form form={familyHistoryForm} layout="vertical" onFinish={handleAddFamilyHistory}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Relation"
                name="relation"
                rules={[{ required: true, message: 'Please select relation' }]}
              >
                <Select placeholder="Select family relation">
                  <Option value="mother">Mother</Option>
                  <Option value="father">Father</Option>
                  <Option value="sister">Sister</Option>
                  <Option value="brother">Brother</Option>
                  <Option value="grandmother">Grandmother</Option>
                  <Option value="grandfather">Grandfather</Option>
                  <Option value="aunt">Aunt</Option>
                  <Option value="uncle">Uncle</Option>
                  <Option value="cousin">Cousin</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Age of Onset"
                name="ageOfOnset"
              >
                <InputNumber style={{ width: '100%' }} placeholder="Age when condition started" min={0} max={150} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Condition Name"
            name="conditionName"
            rules={[{ required: true, message: 'Please enter condition name' }]}
          >
            <Input placeholder="Enter the medical condition" />
          </Form.Item>
          <Form.Item
            label="Notes"
            name="notes"
          >
            <TextArea rows={3} placeholder="Additional notes or details" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HealthRecordsPage;