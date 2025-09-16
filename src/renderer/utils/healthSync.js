export const syncHealthDataToProfile = (healthData, userProfile) => {
  const syncedData = {
    ...userProfile,
  };

  if (healthData.vitals?.height && healthData.vitals.height !== userProfile.height) {
    syncedData.height = healthData.vitals.height;
  }

  if (healthData.vitals?.weight && healthData.vitals.weight !== userProfile.weight) {
    syncedData.weight = healthData.vitals.weight;
  }

  if (healthData.allergies?.length > 0) {
    const allergyNames = healthData.allergies.map(allergy => allergy.allergy_name);
    if (JSON.stringify(allergyNames) !== JSON.stringify(userProfile.allergies)) {
      syncedData.allergies = allergyNames;
    }
  }

  if (healthData.conditions?.length > 0) {
    const conditionNames = healthData.conditions.map(condition => condition.condition_name);
    if (JSON.stringify(conditionNames) !== JSON.stringify(userProfile.medical_conditions)) {
      syncedData.medical_conditions = conditionNames;
    }
  }

  return syncedData;
};

export const syncProfileToHealthData = (profileData, userProfileId) => {
  const updates = [];

  if (profileData.height || profileData.weight) {
    const vitalsData = {
      user_profile_id: userProfileId,
      height: profileData.height,
      weight: profileData.weight,
      bmi: profileData.height && profileData.weight ? 
        parseFloat((profileData.weight / ((profileData.height / 100) ** 2)).toFixed(1)) : null,
      recorded_date: new Date().toISOString().split('T')[0]
    };
    updates.push({ type: 'vitals', data: vitalsData });
  }

  if (profileData.allergies?.length > 0) {
    const allergyUpdates = profileData.allergies.map(allergyName => ({
      user_profile_id: userProfileId,
      allergy_name: allergyName,
      severity: 'mild',
      is_active: true
    }));
    updates.push({ type: 'allergies', data: allergyUpdates });
  }

  if (profileData.medical_conditions?.length > 0) {
    const conditionUpdates = profileData.medical_conditions.map(conditionName => ({
      user_profile_id: userProfileId,
      condition_name: conditionName,
      status: 'active',
      is_active: true
    }));
    updates.push({ type: 'conditions', data: conditionUpdates });
  }

  return updates;
};

export const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  return parseFloat((weight / ((height / 100) ** 2)).toFixed(1));
};

export const getBMICategory = (bmi) => {
  if (!bmi) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const getBMIColor = (bmi) => {
  if (!bmi) return '#999';
  if (bmi < 18.5) return '#1890ff';
  if (bmi < 25) return '#52c41a';
  if (bmi < 30) return '#faad14';
  return '#ff4d4f';
};

export const formatHealthSummary = (healthData) => {
  const summary = {
    vitals: {
      weight: healthData.vitals?.weight || null,
      height: healthData.vitals?.height || null,
      bmi: healthData.vitals?.bmi || null,
      bodyFat: healthData.vitals?.bodyFat || null
    },
    counts: {
      allergies: healthData.allergies?.length || 0,
      medications: healthData.medications?.length || 0,
      conditions: healthData.conditions?.length || 0,
      familyHistory: healthData.familyHistory?.length || 0
    },
    lastUpdated: healthData.lastUpdated || null
  };

  return summary;
};
