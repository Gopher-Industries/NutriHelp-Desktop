export const validateVitals = (values) => {
  const errors = {};
  
  if (values.weight !== null && values.weight !== undefined) {
    if (values.weight < 0 || values.weight > 1000) {
      errors.weight = 'Weight must be between 0 and 1000 kg';
    }
  }
  
  if (values.height !== null && values.height !== undefined) {
    if (values.height < 30 || values.height > 300) {
      errors.height = 'Height must be between 30 and 300 cm';
    }
  }
  
  if (values.bodyFat !== null && values.bodyFat !== undefined) {
    if (values.bodyFat < 0 || values.bodyFat > 100) {
      errors.bodyFat = 'Body fat percentage must be between 0 and 100%';
    }
  }
  
  if (values.waterPercentage !== null && values.waterPercentage !== undefined) {
    if (values.waterPercentage < 0 || values.waterPercentage > 100) {
      errors.waterPercentage = 'Water percentage must be between 0 and 100%';
    }
  }
  
  if (values.boneDensity !== null && values.boneDensity !== undefined) {
    if (values.boneDensity < 0 || values.boneDensity > 10) {
      errors.boneDensity = 'Bone density must be between 0 and 10 g/cm²';
    }
  }
  
  if (values.metabolicAge !== null && values.metabolicAge !== undefined) {
    if (values.metabolicAge < 10 || values.metabolicAge > 150) {
      errors.metabolicAge = 'Metabolic age must be between 10 and 150 years';
    }
  }
  
  if (values.visceralFat !== null && values.visceralFat !== undefined) {
    if (values.visceralFat < 0 || values.visceralFat > 30) {
      errors.visceralFat = 'Visceral fat level must be between 0 and 30';
    }
  }
  
  return errors;
};

export const validateMeasurements = (values) => {
  const errors = {};
  const measurements = ['waist', 'chest', 'hips', 'neck', 'arms', 'thighs', 'shoulders', 'forearms', 'calves'];
  
  measurements.forEach(measurement => {
    const value = values[measurement];
    if (value !== null && value !== undefined) {
      if (value < 0 || value > 500) {
        errors[measurement] = `${measurement.charAt(0).toUpperCase() + measurement.slice(1)} measurement must be between 0 and 500 cm`;
      }
    }
  });
  
  return errors;
};

export const validateBloodWork = (values) => {
  const errors = {};
  
  if (values.cholesterolTotal !== null && values.cholesterolTotal !== undefined) {
    if (values.cholesterolTotal < 0 || values.cholesterolTotal > 1000) {
      errors.cholesterolTotal = 'Total cholesterol must be between 0 and 1000 mg/dL';
    }
  }
  
  if (values.cholesterolLdl !== null && values.cholesterolLdl !== undefined) {
    if (values.cholesterolLdl < 0 || values.cholesterolLdl > 1000) {
      errors.cholesterolLdl = 'LDL cholesterol must be between 0 and 1000 mg/dL';
    }
  }
  
  if (values.cholesterolHdl !== null && values.cholesterolHdl !== undefined) {
    if (values.cholesterolHdl < 0 || values.cholesterolHdl > 1000) {
      errors.cholesterolHdl = 'HDL cholesterol must be between 0 and 1000 mg/dL';
    }
  }
  
  if (values.triglycerides !== null && values.triglycerides !== undefined) {
    if (values.triglycerides < 0 || values.triglycerides > 1000) {
      errors.triglycerides = 'Triglycerides must be between 0 and 1000 mg/dL';
    }
  }
  
  if (values.glucose !== null && values.glucose !== undefined) {
    if (values.glucose < 0 || values.glucose > 1000) {
      errors.glucose = 'Glucose must be between 0 and 1000 mg/dL';
    }
  }
  
  if (values.hba1c !== null && values.hba1c !== undefined) {
    if (values.hba1c < 0 || values.hba1c > 20) {
      errors.hba1c = 'HbA1c must be between 0 and 20%';
    }
  }
  
  if (values.systolicBp !== null && values.systolicBp !== undefined) {
    if (values.systolicBp < 40 || values.systolicBp > 300) {
      errors.systolicBp = 'Systolic blood pressure must be between 40 and 300 mmHg';
    }
  }
  
  if (values.diastolicBp !== null && values.diastolicBp !== undefined) {
    if (values.diastolicBp < 20 || values.diastolicBp > 200) {
      errors.diastolicBp = 'Diastolic blood pressure must be between 20 and 200 mmHg';
    }
  }
  
  if (values.heartRate !== null && values.heartRate !== undefined) {
    if (values.heartRate < 30 || values.heartRate > 300) {
      errors.heartRate = 'Heart rate must be between 30 and 300 bpm';
    }
  }
  
  if (values.tsh !== null && values.tsh !== undefined) {
    if (values.tsh < 0 || values.tsh > 100) {
      errors.tsh = 'TSH must be between 0 and 100 mIU/L';
    }
  }
  
  if (values.t3 !== null && values.t3 !== undefined) {
    if (values.t3 < 0 || values.t3 > 20) {
      errors.t3 = 'T3 must be between 0 and 20 pg/mL';
    }
  }
  
  if (values.t4 !== null && values.t4 !== undefined) {
    if (values.t4 < 0 || values.t4 > 20) {
      errors.t4 = 'T4 must be between 0 and 20 ng/dL';
    }
  }
  
  if (values.vitaminD !== null && values.vitaminD !== undefined) {
    if (values.vitaminD < 0 || values.vitaminD > 200) {
      errors.vitaminD = 'Vitamin D must be between 0 and 200 ng/mL';
    }
  }
  
  if (values.vitaminB12 !== null && values.vitaminB12 !== undefined) {
    if (values.vitaminB12 < 0 || values.vitaminB12 > 5000) {
      errors.vitaminB12 = 'Vitamin B12 must be between 0 and 5000 pg/mL';
    }
  }
  
  if (values.iron !== null && values.iron !== undefined) {
    if (values.iron < 0 || values.iron > 1000) {
      errors.iron = 'Iron must be between 0 and 1000 μg/dL';
    }
  }
  
  if (values.folate !== null && values.folate !== undefined) {
    if (values.folate < 0 || values.folate > 100) {
      errors.folate = 'Folate must be between 0 and 100 ng/mL';
    }
  }
  
  return errors;
};

export const validateAllergy = (values) => {
  const errors = {};
  
  if (!values.allergyName || values.allergyName.trim().length === 0) {
    errors.allergyName = 'Allergy name is required';
  } else if (values.allergyName.length > 100) {
    errors.allergyName = 'Allergy name must be less than 100 characters';
  }
  
  if (values.reactionDescription && values.reactionDescription.length > 500) {
    errors.reactionDescription = 'Reaction description must be less than 500 characters';
  }
  
  return errors;
};

export const validateMedication = (values) => {
  const errors = {};
  
  if (!values.medicationName || values.medicationName.trim().length === 0) {
    errors.medicationName = 'Medication name is required';
  } else if (values.medicationName.length > 200) {
    errors.medicationName = 'Medication name must be less than 200 characters';
  }
  
  if (!values.dosage || values.dosage.trim().length === 0) {
    errors.dosage = 'Dosage is required';
  } else if (values.dosage.length > 100) {
    errors.dosage = 'Dosage must be less than 100 characters';
  }
  
  if (!values.frequency) {
    errors.frequency = 'Frequency is required';
  }
  
  if (values.prescribingDoctor && values.prescribingDoctor.length > 100) {
    errors.prescribingDoctor = 'Prescribing doctor name must be less than 100 characters';
  }
  
  if (values.purpose && values.purpose.length > 500) {
    errors.purpose = 'Purpose must be less than 500 characters';
  }
  
  if (values.sideEffects && values.sideEffects.length > 500) {
    errors.sideEffects = 'Side effects must be less than 500 characters';
  }
  
  if (values.startDate && values.endDate) {
    if (new Date(values.startDate) > new Date(values.endDate)) {
      errors.endDate = 'End date must be after start date';
    }
  }
  
  return errors;
};

export const validateCondition = (values) => {
  const errors = {};
  
  if (!values.conditionName || values.conditionName.trim().length === 0) {
    errors.conditionName = 'Condition name is required';
  } else if (values.conditionName.length > 200) {
    errors.conditionName = 'Condition name must be less than 200 characters';
  }
  
  if (values.treatingDoctor && values.treatingDoctor.length > 100) {
    errors.treatingDoctor = 'Treating doctor name must be less than 100 characters';
  }
  
  if (values.treatmentNotes && values.treatmentNotes.length > 1000) {
    errors.treatmentNotes = 'Treatment notes must be less than 1000 characters';
  }
  
  return errors;
};

export const validateFamilyHistory = (values) => {
  const errors = {};
  
  if (!values.relation) {
    errors.relation = 'Family relation is required';
  }
  
  if (!values.conditionName || values.conditionName.trim().length === 0) {
    errors.conditionName = 'Condition name is required';
  } else if (values.conditionName.length > 200) {
    errors.conditionName = 'Condition name must be less than 200 characters';
  }
  
  if (values.ageOfOnset !== null && values.ageOfOnset !== undefined) {
    if (values.ageOfOnset < 0 || values.ageOfOnset > 150) {
      errors.ageOfOnset = 'Age of onset must be between 0 and 150 years';
    }
  }
  
  if (values.notes && values.notes.length > 1000) {
    errors.notes = 'Notes must be less than 1000 characters';
  }
  
  return errors;
};

export const validateLifestyle = (values) => {
  const errors = {};
  
  if (values.exerciseFrequency !== null && values.exerciseFrequency !== undefined) {
    if (values.exerciseFrequency < 0 || values.exerciseFrequency > 50) {
      errors.exerciseFrequency = 'Exercise frequency must be between 0 and 50 times per week';
    }
  }
  
  if (values.sleepHours !== null && values.sleepHours !== undefined) {
    if (values.sleepHours < 0 || values.sleepHours > 24) {
      errors.sleepHours = 'Sleep hours must be between 0 and 24 hours';
    }
  }
  
  if (values.stressLevel !== null && values.stressLevel !== undefined) {
    if (values.stressLevel < 1 || values.stressLevel > 10) {
      errors.stressLevel = 'Stress level must be between 1 and 10';
    }
  }
  
  if (values.alcoholConsumption !== null && values.alcoholConsumption !== undefined) {
    if (values.alcoholConsumption < 0 || values.alcoholConsumption > 100) {
      errors.alcoholConsumption = 'Alcohol consumption must be between 0 and 100 drinks per week';
    }
  }
  
  if (values.waterIntake !== null && values.waterIntake !== undefined) {
    if (values.waterIntake < 0 || values.waterIntake > 50) {
      errors.waterIntake = 'Water intake must be between 0 and 50 glasses per day';
    }
  }
  
  if (values.caffeineIntake !== null && values.caffeineIntake !== undefined) {
    if (values.caffeineIntake < 0 || values.caffeineIntake > 20) {
      errors.caffeineIntake = 'Caffeine intake must be between 0 and 20 cups per day';
    }
  }
  
  return errors;
};

export const validateGoals = (values) => {
  const errors = {};
  
  if (values.weightGoal !== null && values.weightGoal !== undefined) {
    if (values.weightGoal < 0 || values.weightGoal > 1000) {
      errors.weightGoal = 'Weight goal must be between 0 and 1000 kg';
    }
  }
  
  if (values.bmiGoal !== null && values.bmiGoal !== undefined) {
    if (values.bmiGoal < 10 || values.bmiGoal > 50) {
      errors.bmiGoal = 'BMI goal must be between 10 and 50';
    }
  }
  
  if (values.bodyFatGoal !== null && values.bodyFatGoal !== undefined) {
    if (values.bodyFatGoal < 0 || values.bodyFatGoal > 100) {
      errors.bodyFatGoal = 'Body fat goal must be between 0 and 100%';
    }
  }
  
  if (values.exerciseGoal !== null && values.exerciseGoal !== undefined) {
    if (values.exerciseGoal < 0 || values.exerciseGoal > 50) {
      errors.exerciseGoal = 'Exercise goal must be between 0 and 50 times per week';
    }
  }
  
  if (values.sleepGoal !== null && values.sleepGoal !== undefined) {
    if (values.sleepGoal < 0 || values.sleepGoal > 24) {
      errors.sleepGoal = 'Sleep goal must be between 0 and 24 hours';
    }
  }
  
  if (values.waterGoal !== null && values.waterGoal !== undefined) {
    if (values.waterGoal < 0 || values.waterGoal > 50) {
      errors.waterGoal = 'Water goal must be between 0 and 50 glasses per day';
    }
  }
  
  if (values.stepsGoal !== null && values.stepsGoal !== undefined) {
    if (values.stepsGoal < 0 || values.stepsGoal > 100000) {
      errors.stepsGoal = 'Steps goal must be between 0 and 100,000 steps per day';
    }
  }
  
  if (values.caloriesBurnedGoal !== null && values.caloriesBurnedGoal !== undefined) {
    if (values.caloriesBurnedGoal < 0 || values.caloriesBurnedGoal > 10000) {
      errors.caloriesBurnedGoal = 'Calories burned goal must be between 0 and 10,000 calories per day';
    }
  }
  
  return errors;
};

export const formatErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.error_description) {
    return error.error_description;
  }
  
  return 'An unexpected error occurred';
};

export const validateRequiredFields = (values, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!values[field] || (typeof values[field] === 'string' && values[field].trim().length === 0)) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
  });
  
  return errors;
};
