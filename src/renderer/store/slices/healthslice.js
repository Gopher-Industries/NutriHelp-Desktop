import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  vitals: {
    weight: null,
    height: null,
    bmi: null,
    bodyFat: null,
    muscleMass: null,
    waterPercentage: null,
    boneDensity: null,
    metabolicAge: null,
    visceralFat: null,
  },
  measurements: {
    chest: null,
    waist: null,
    hips: null,
    thighs: null,
    arms: null,
    neck: null,
    shoulders: null,
    forearms: null,
    calves: null,
  },
  bloodWork: {
    cholesterolTotal: null,
    cholesterolLdl: null,
    cholesterolHdl: null,
    triglycerides: null,
    glucose: null,
    hba1c: null,
    systolicBp: null,
    diastolicBp: null,
    heartRate: null,
    tsh: null,
    t3: null,
    t4: null,
    vitaminD: null,
    vitaminB12: null,
    iron: null,
    folate: null,
    testDate: null,
    labName: null,
    notes: null,
  },
  lifestyle: {
    sleepHours: null,
    exerciseFrequency: null,
    stressLevel: null,
    smokingStatus: null,
    alcoholConsumption: null,
    waterIntake: null,
    dietType: null,
    supplementsUsed: [],
    allergies: [],
    medications: [],
  },
  goals: {
    targetWeight: null,
    targetBodyFat: null,
    fitnessGoals: [],
    nutritionGoals: [],
    healthGoals: [],
    timeframe: null,
    notes: null,
  },
};

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    setVitals: (state, action) => {
      state.vitals = { ...state.vitals, ...action.payload };
    },
    setMeasurements: (state, action) => {
      state.measurements = { ...state.measurements, ...action.payload };
    },
    setBloodWork: (state, action) => {
      state.bloodWork = { ...state.bloodWork, ...action.payload };
    },
    setLifestyle: (state, action) => {
      state.lifestyle = { ...state.lifestyle, ...action.payload };
    },
    setGoals: (state, action) => {
      state.goals = { ...state.goals, ...action.payload };
    },
    resetHealthData: (state) => {
      return initialState;
    },
  },
});

export const {
  setVitals,
  setMeasurements,
  setBloodWork,
  setLifestyle,
  setGoals,
  resetHealthData,
} = healthSlice.actions;

export const selectVitals = (state) => state.health.vitals;
export const selectMeasurements = (state) => state.health.measurements;
export const selectBloodWork = (state) => state.health.bloodWork;
export const selectLifestyle = (state) => state.health.lifestyle;
export const selectGoals = (state) => state.health.goals;

export default healthSlice.reducer;