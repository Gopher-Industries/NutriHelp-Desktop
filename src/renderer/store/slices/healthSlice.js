import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabaseService } from '../../services/supabase';

export const fetchHealthData = createAsyncThunk(
  'health/fetchHealthData',
  async (_, { rejectWithValue }) => {
    try {
      const healthData = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            vitals: {
              weight: 70,
              height: 175,
              bmi: 22.9,
              bodyFat: 15,
              muscleMass: 32,
              waterPercentage: 60,
              boneDensity: 2.8,
            },
            measurements: {
              waist: 80,
              chest: 95,
              hips: 90,
              neck: 35,
              arms: 30,
              thighs: 55,
            },
            bloodWork: {
              cholesterol: {
                total: 180,
                ldl: 100,
                hdl: 60,
                triglycerides: 100,
              },
              glucose: 90,
              hba1c: 5.2,
              bloodPressure: {
                systolic: 120,
                diastolic: 80,
              },
              heartRate: 72,
            },
            allergies: ['peanuts', 'shellfish'],
            medications: [
              {
                name: 'Vitamin D3',
                dosage: '1000 IU',
                frequency: 'daily',
                startDate: '2024-01-01',
              },
            ],
            conditions: ['none'],
            lastUpdated: '2024-01-15T10:00:00Z',
          });
        }, 1000);
      });
      return healthData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateHealthData = createAsyncThunk(
  'health/updateHealthData',
  async (healthData, { rejectWithValue }) => {
    try {
      const updatedData = {
        ...healthData,
        lastUpdated: new Date().toISOString(),
      };
      return updatedData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addHealthEntry = createAsyncThunk(
  'health/addHealthEntry',
  async (entryData, { rejectWithValue }) => {
    try {
      const entry = {
        id: Date.now().toString(),
        ...entryData,
        timestamp: new Date().toISOString(),
      };
      return entry;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchHealthHistory = createAsyncThunk(
  'health/fetchHealthHistory',
  async ({ metric, period }, { rejectWithValue }) => {
    try {
      const history = await new Promise(resolve => {
        setTimeout(() => {
          const data = [];
          const now = new Date();
          const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
          
          for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            let value;
            switch (metric) {
              case 'weight':
                value = 70 + Math.random() * 2 - 1; 
                break;
              case 'bmi':
                value = 22.9 + Math.random() * 0.4 - 0.2;
                break;
              case 'bodyFat':
                value = 15 + Math.random() * 2 - 1;
                break;
              case 'bloodPressure':
                value = {
                  systolic: 120 + Math.random() * 10 - 5,
                  diastolic: 80 + Math.random() * 8 - 4,
                };
                break;
              default:
                value = Math.random() * 100;
            }
            
            data.push({
              date: date.toISOString().split('T')[0],
              value,
            });
          }
          
          resolve(data);
        }, 800);
      });
      return { metric, period, data: history };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const calculateHealthScore = createAsyncThunk(
  'health/calculateHealthScore',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { health } = getState();
      const { vitals, bloodWork, lifestyle } = health;
      
      let score = 100;
      
      if (vitals.bmi < 18.5 || vitals.bmi > 24.9) {
        score -= 10;
      }

      if (vitals.bodyFat < 10 || vitals.bodyFat > 25) {
        score -= 8;
      }
      
      if (bloodWork.bloodPressure.systolic > 120 || bloodWork.bloodPressure.diastolic > 80) {
        score -= 12;
      }

      if (bloodWork.cholesterol.total > 200 || bloodWork.cholesterol.hdl < 40) {
        score -= 10;
      }
      
      if (lifestyle.exerciseFrequency < 3) {
        score -= 15;
      }
      if (lifestyle.sleepHours < 7 || lifestyle.sleepHours > 9) {
        score -= 10;
      }
      if (lifestyle.stressLevel > 6) {
        score -= 8;
      }
      if (lifestyle.smokingStatus !== 'never') {
        score -= 20;
      }
      if (lifestyle.alcoholConsumption > 7) {
        score -= 10;
      }
      
      return Math.max(0, Math.min(100, score));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

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
    waist: null,
    chest: null,
    hips: null,
    neck: null,
    arms: null,
    thighs: null,
    shoulders: null,
    forearms: null,
    calves: null,
  },
  
  bloodWork: {
    cholesterol: {
      total: null,
      ldl: null,
      hdl: null,
      triglycerides: null,
    },
    glucose: null,
    hba1c: null,
    bloodPressure: {
      systolic: null,
      diastolic: null,
    },
    heartRate: null,
    thyroid: {
      tsh: null,
      t3: null,
      t4: null,
    },
    vitamins: {
      vitaminD: null,
      vitaminB12: null,
      iron: null,
      folate: null,
    },
  },
  
  allergies: [],
  medications: [],
  conditions: [],
  familyHistory: [],
  surgeries: [],
  
  lifestyle: {
    exerciseFrequency: 0, // times per week
    exerciseTypes: [],
    sleepHours: 8,
    sleepQuality: 5, // 1-10 scale
    stressLevel: 5, // 1-10 scale
    smokingStatus: 'never', // 'never', 'former', 'current'
    alcoholConsumption: 0, // drinks per week
    waterIntake: 8, // glasses per day
    caffeineIntake: 1, // cups per day
  },
  
  goals: {
    weightGoal: null,
    bmiGoal: null,
    bodyFatGoal: null,
    exerciseGoal: 3, // times per week
    sleepGoal: 8, // hours per night
    waterGoal: 8, // glasses per day
    stepsGoal: 10000, // steps per day
    caloriesBurnedGoal: 2000, // calories per day
  },
  
  dailyEntries: [],
  weeklyEntries: [],
  monthlyEntries: [],
  
  history: {
    weight: [],
    bmi: [],
    bodyFat: [],
    bloodPressure: [],
    heartRate: [],
    sleepHours: [],
    exerciseMinutes: [],
    stepsCount: [],
    waterIntake: [],
  },

  healthScore: null,
  insights: [],
  recommendations: [],
  alerts: [],

  fitness: {
    currentWorkout: null,
    workoutHistory: [],
    exerciseLibrary: [],
    personalRecords: {},
    fitnessLevel: 'beginner', // 'beginner', 'intermediate', 'advanced'
  },

  sleep: {
    bedtime: '22:00',
    wakeTime: '06:00',
    sleepEfficiency: null,
    deepSleepPercentage: null,
    remSleepPercentage: null,
    sleepDisruptions: 0,
  },

  menstrualCycle: {
    enabled: false,
    cycleLength: 28,
    periodLength: 5,
    lastPeriodStart: null,
    symptoms: [],
    mood: [],
  },

  reminders: {
    medication: [],
    appointments: [],
    measurements: [],
    checkups: [],
  },
  
  connectedDevices: [],
  dataSync: {
    lastSync: null,
    syncEnabled: false,
    syncSources: [],
  },
  
  activeTab: 'overview', // 'overview', 'vitals', 'fitness', 'sleep', 'nutrition'
  selectedMetric: 'weight',
  selectedPeriod: 'month', // 'week', 'month', 'quarter', 'year'
  showGoals: true,
  showInsights: true,
  
  isLoading: false,
  isUpdating: false,
  isSyncing: false,
  isCalculatingScore: false,

  error: null,
  syncError: null,
  validationErrors: {},
  
  lastUpdated: null,
  dataVersion: '1.0',
};

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    updateVitals: (state, action) => {
      state.vitals = { ...state.vitals, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    },
    
    updateMeasurements: (state, action) => {
      state.measurements = { ...state.measurements, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    },

    updateBloodWork: (state, action) => {
      state.bloodWork = { ...state.bloodWork, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    },

    addAllergy: (state, action) => {
      const allergy = action.payload;
      if (!state.allergies.includes(allergy)) {
        state.allergies.push(allergy);
      }
    },
    removeAllergy: (state, action) => {
      const allergy = action.payload;
      state.allergies = state.allergies.filter(a => a !== allergy);
    },
    addMedication: (state, action) => {
      const medication = {
        id: Date.now().toString(),
        ...action.payload,
        addedAt: new Date().toISOString(),
      };
      state.medications.push(medication);
    },
    updateMedication: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.medications.findIndex(med => med.id === id);
      if (index !== -1) {
        state.medications[index] = { ...state.medications[index], ...updates };
      }
    },
    removeMedication: (state, action) => {
      const id = action.payload;
      state.medications = state.medications.filter(med => med.id !== id);
    },
    addCondition: (state, action) => {
      const condition = action.payload;
      if (!state.conditions.includes(condition)) {
        state.conditions.push(condition);
      }
    },
    removeCondition: (state, action) => {
      const condition = action.payload;
      state.conditions = state.conditions.filter(c => c !== condition);
    },

    updateLifestyle: (state, action) => {
      state.lifestyle = { ...state.lifestyle, ...action.payload };
    },
    
    updateGoals: (state, action) => {
      state.goals = { ...state.goals, ...action.payload };
    },
    
    addDailyEntry: (state, action) => {
      const entry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        ...action.payload,
        timestamp: new Date().toISOString(),
      };
      
      state.dailyEntries = state.dailyEntries.filter(
        e => !(e.date === entry.date && e.metric === entry.metric)
      );
      
      state.dailyEntries.push(entry);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      state.dailyEntries = state.dailyEntries.filter(
        e => new Date(e.date) >= cutoffDate
      );
    },
    
    addInsight: (state, action) => {
      const insight = {
        id: Date.now().toString(),
        ...action.payload,
        createdAt: new Date().toISOString(),
      };
      state.insights.unshift(insight);
      
      if (state.insights.length > 50) {
        state.insights = state.insights.slice(0, 50);
      }
    },
    clearInsights: (state) => {
      state.insights = [];
    },
    
    addRecommendation: (state, action) => {
      const recommendation = {
        id: Date.now().toString(),
        ...action.payload,
        createdAt: new Date().toISOString(),
      };
      state.recommendations.unshift(recommendation);

      if (state.recommendations.length > 20) {
        state.recommendations = state.recommendations.slice(0, 20);
      }
    },
    dismissRecommendation: (state, action) => {
      const id = action.payload;
      state.recommendations = state.recommendations.filter(r => r.id !== id);
    },

    addAlert: (state, action) => {
      const alert = {
        id: Date.now().toString(),
        ...action.payload,
        createdAt: new Date().toISOString(),
        read: false,
      };
      state.alerts.unshift(alert);
    },
    markAlertAsRead: (state, action) => {
      const id = action.payload;
      const alert = state.alerts.find(a => a.id === id);
      if (alert) {
        alert.read = true;
      }
    },
    dismissAlert: (state, action) => {
      const id = action.payload;
      state.alerts = state.alerts.filter(a => a.id !== id);
    },
    
    addReminder: (state, action) => {
      const { type, reminder } = action.payload;
      const newReminder = {
        id: Date.now().toString(),
        ...reminder,
        createdAt: new Date().toISOString(),
        active: true,
      };
      
      if (state.reminders[type]) {
        state.reminders[type].push(newReminder);
      }
    },
    updateReminder: (state, action) => {
      const { type, id, updates } = action.payload;
      if (state.reminders[type]) {
        const index = state.reminders[type].findIndex(r => r.id === id);
        if (index !== -1) {
          state.reminders[type][index] = { ...state.reminders[type][index], ...updates };
        }
      }
    },
    removeReminder: (state, action) => {
      const { type, id } = action.payload;
      if (state.reminders[type]) {
        state.reminders[type] = state.reminders[type].filter(r => r.id !== id);
      }
    },

    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setSelectedMetric: (state, action) => {
      state.selectedMetric = action.payload;
    },
    setSelectedPeriod: (state, action) => {
      state.selectedPeriod = action.payload;
    },
    toggleShowGoals: (state) => {
      state.showGoals = !state.showGoals;
    },
    toggleShowInsights: (state) => {
      state.showInsights = !state.showInsights;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSyncError: (state, action) => {
      state.syncError = action.payload;
    },
    clearSyncError: (state) => {
      state.syncError = null;
    },
    setValidationErrors: (state, action) => {
      state.validationErrors = action.payload;
    },
    clearValidationErrors: (state) => {
      state.validationErrors = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealthData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHealthData.fulfilled, (state, action) => {
        state.isLoading = false;
        const { vitals, measurements, bloodWork, allergies, medications, conditions } = action.payload;
        state.vitals = { ...state.vitals, ...vitals };
        state.measurements = { ...state.measurements, ...measurements };
        state.bloodWork = { ...state.bloodWork, ...bloodWork };
        state.allergies = allergies || [];
        state.medications = medications || [];
        state.conditions = conditions || [];
        state.lastUpdated = action.payload.lastUpdated;
        state.error = null;
      })
      .addCase(fetchHealthData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(updateHealthData.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateHealthData.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.lastUpdated = action.payload.lastUpdated;
        state.error = null;
      })
      .addCase(updateHealthData.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      .addCase(addHealthEntry.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(addHealthEntry.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.dailyEntries.push(action.payload);
        state.error = null;
      })
      .addCase(addHealthEntry.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      .addCase(fetchHealthHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHealthHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        const { metric, data } = action.payload;
        state.history[metric] = data;
        state.error = null;
      })
      .addCase(fetchHealthHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(calculateHealthScore.pending, (state) => {
        state.isCalculatingScore = true;
        state.error = null;
      })
      .addCase(calculateHealthScore.fulfilled, (state, action) => {
        state.isCalculatingScore = false;
        state.healthScore = action.payload;
        state.error = null;
      })
      .addCase(calculateHealthScore.rejected, (state, action) => {
        state.isCalculatingScore = false;
        state.error = action.payload;
      });
  },
});

export const {
  updateVitals,
  updateMeasurements,
  updateBloodWork,
  addAllergy,
  removeAllergy,
  addMedication,
  updateMedication,
  removeMedication,
  addCondition,
  removeCondition,
  updateLifestyle,
  updateGoals,
  addDailyEntry,
  addInsight,
  clearInsights,
  addRecommendation,
  dismissRecommendation,
  addAlert,
  markAlertAsRead,
  dismissAlert,
  addReminder,
  updateReminder,
  removeReminder,
  setActiveTab,
  setSelectedMetric,
  setSelectedPeriod,
  toggleShowGoals,
  toggleShowInsights,
  setError,
  clearError,
  setSyncError,
  clearSyncError,
  setValidationErrors,
  clearValidationErrors,
} = healthSlice.actions;

export default healthSlice.reducer;

export const selectHealth = (state) => state.health;
export const selectVitals = (state) => state.health.vitals;
export const selectMeasurements = (state) => state.health.measurements;
export const selectBloodWork = (state) => state.health.bloodWork;
export const selectLifestyle = (state) => state.health.lifestyle;
export const selectGoals = (state) => state.health.goals;
export const selectHealthScore = (state) => state.health.healthScore;
export const selectInsights = (state) => state.health.insights;
export const selectRecommendations = (state) => state.health.recommendations;
export const selectAlerts = (state) => state.health.alerts;
export const selectReminders = (state) => state.health.reminders;
export const selectHealthHistory = (state) => state.health.history;
export const selectIsLoading = (state) => state.health.isLoading;
export const selectError = (state) => state.health.error;