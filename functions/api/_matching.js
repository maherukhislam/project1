const detectedUtcYear = new Date().getUTCFullYear();
const detectedLocalYear = new Date().getFullYear();
const CURRENT_YEAR =
  [detectedUtcYear, detectedLocalYear].find((year) => Number.isInteger(year) && year >= 2024 && year <= 2100) ||
  2026;
const MIN_LAST_EDUCATION_YEAR = 1980;
const MAX_LAST_EDUCATION_YEAR = CURRENT_YEAR + 2;
const MIN_PREFERRED_INTAKE_YEAR = CURRENT_YEAR - 1;
const MAX_PREFERRED_INTAKE_YEAR = CURRENT_YEAR + 4;
const INTAKE_NAMES = ['Spring', 'Summer', 'Fall', 'Winter'];

export const PROFILE_REQUIRED_FIELDS = [
  'name',
  'phone',
  'nationality',
  'preferred_country',
  'education_level',
  'academic_system',
  'gpa',
  'gpa_scale',
  'medium_of_instruction',
  'study_level',
  'preferred_subject',
  'budget_min',
  'budget_max',
  'preferred_intake_name',
  'preferred_intake_year',
  'last_education_year'
];

export const SUBJECT_MAPPINGS = {
  'Computer Science': ['Software Engineering', 'Information Technology', 'Data Science', 'Artificial Intelligence'],
  'Business Administration': ['Management', 'Finance', 'Marketing', 'Accounting', 'Economics'],
  Engineering: ['Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Industrial Engineering'],
  Medicine: ['Public Health', 'Biomedical Science', 'Pharmacy'],
  'Arts & Design': ['Graphic Design', 'Architecture', 'Fashion Design', 'Fine Arts'],
  'Social Sciences': ['Psychology', 'International Relations', 'Sociology', 'Political Science'],
  'Natural Sciences': ['Biology', 'Chemistry', 'Physics', 'Environmental Science'],
  Education: ['TESOL', 'Curriculum Studies', 'Educational Leadership'],
  Law: ['International Law', 'Human Rights Law', 'Commercial Law']
};

const EDUCATION_TO_STUDY_LEVEL = {
  'High School': ['Bachelor'],
  Bachelor: ['Master', 'Postgraduate Diploma'],
  Master: ['PhD', 'Postgraduate Diploma'],
  PhD: ['Postdoctoral']
};

const DEFAULT_COUNTRY_RULES = {
  'United States': { min_gpa_required: 2.5, gpa_tolerance: 0.2, english_test_required: true, english_medium_waiver_allowed: true, max_gap_years: 10, gap_risk_threshold: 5, budget_tolerance_pct: 0.15 },
  'United Kingdom': { min_gpa_required: 2.7, gpa_tolerance: 0.15, english_test_required: true, english_medium_waiver_allowed: true, max_gap_years: 8, gap_risk_threshold: 4, budget_tolerance_pct: 0.12 },
  Canada: { min_gpa_required: 2.7, gpa_tolerance: 0.1, english_test_required: true, english_medium_waiver_allowed: false, max_gap_years: 7, gap_risk_threshold: 4, budget_tolerance_pct: 0.12 },
  Australia: { min_gpa_required: 2.6, gpa_tolerance: 0.15, english_test_required: true, english_medium_waiver_allowed: true, max_gap_years: 8, gap_risk_threshold: 4, budget_tolerance_pct: 0.12 },
  Germany: { min_gpa_required: 2.8, gpa_tolerance: 0.15, english_test_required: true, english_medium_waiver_allowed: true, max_gap_years: 6, gap_risk_threshold: 3, budget_tolerance_pct: 0.1 },
  Netherlands: { min_gpa_required: 2.8, gpa_tolerance: 0.15, english_test_required: true, english_medium_waiver_allowed: true, max_gap_years: 6, gap_risk_threshold: 3, budget_tolerance_pct: 0.1 },
  France: { min_gpa_required: 2.5, gpa_tolerance: 0.15, english_test_required: true, english_medium_waiver_allowed: true, max_gap_years: 6, gap_risk_threshold: 3, budget_tolerance_pct: 0.1 },
  Ireland: { min_gpa_required: 2.6, gpa_tolerance: 0.15, english_test_required: true, english_medium_waiver_allowed: true, max_gap_years: 7, gap_risk_threshold: 4, budget_tolerance_pct: 0.12 },
  'New Zealand': { min_gpa_required: 2.5, gpa_tolerance: 0.15, english_test_required: true, english_medium_waiver_allowed: true, max_gap_years: 8, gap_risk_threshold: 4, budget_tolerance_pct: 0.12 },
  Singapore: { min_gpa_required: 3.0, gpa_tolerance: 0.1, english_test_required: true, english_medium_waiver_allowed: true, max_gap_years: 5, gap_risk_threshold: 3, budget_tolerance_pct: 0.1 }
};

const COUNTRY_VISA_PROFILES = {
  'United States': {
    processing_days: 45,
    living_cost_estimate: 14000,
    interview_weight: 18,
    financial_weight: 12,
    emphasis: 'Interview-heavy'
  },
  'United Kingdom': {
    processing_days: 21,
    living_cost_estimate: 12000,
    interview_weight: 8,
    financial_weight: 18,
    emphasis: 'Financial review'
  },
  Canada: {
    processing_days: 56,
    living_cost_estimate: 12000,
    interview_weight: 6,
    financial_weight: 16,
    emphasis: 'SDS / Non-SDS sensitivity'
  },
  Australia: {
    processing_days: 35,
    living_cost_estimate: 13000,
    interview_weight: 6,
    financial_weight: 16,
    emphasis: 'Financial capacity review'
  },
  Germany: {
    processing_days: 42,
    living_cost_estimate: 11000,
    interview_weight: 4,
    financial_weight: 18,
    emphasis: 'Blocked-account affordability'
  }
};

const REMATCH_TRIGGER_FIELDS = new Set([
  'preferred_country',
  'preferred_subject',
  'study_level',
  'education_level',
  'gpa',
  'gpa_scale',
  'english_score',
  'english_test_type',
  'budget_min',
  'budget_max',
  'preferred_intake_name',
  'preferred_intake_year',
  'intake',
  'medium_of_instruction',
  'last_education_year'
]);

const BACKUP_COUNTRY_FALLBACKS = {
  'United Kingdom': ['Malaysia', 'Hungary', 'China'],
  Canada: ['Malaysia', 'Germany', 'Hungary'],
  'United States': ['Malaysia', 'Hungary', 'Australia'],
  Australia: ['Malaysia', 'Germany', 'China']
};

const DOCUMENT_BASE = ['passport', 'academic_certificate', 'transcript', 'cv'];
const DOCUMENT_BY_LEVEL = { Bachelor: ['sop'], Master: ['sop', 'recommendation'], PhD: ['sop', 'recommendation', 'research_proposal'] };
const DOCUMENT_BY_COUNTRY = { Canada: ['financial_statement'], Australia: ['financial_statement'], Germany: ['aps_certificate'], 'United States': ['financial_statement'], 'United Kingdom': ['financial_statement'] };
const FILE_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ENGLISH_MAX = { IELTS: 9, TOEFL: 120, Duolingo: 160, PTE: 90 };
const INTAKE_PRIORITY = ['Spring', 'Summer', 'Fall', 'Winter'];

const readNumber = (value) => (value === null || value === undefined || value === '' ? null : Number(value));
const toDate = (value) => (value ? new Date(value) : null);
const daysUntil = (value) => {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86400000);
};

function normalizeIntakeName(value) {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  return INTAKE_NAMES.find((item) => item.toLowerCase() === normalized) || null;
}

function parseLegacyIntakeLabel(value) {
  if (!value) return { name: null, year: null };
  const match = String(value).trim().match(/^(Spring|Summer|Fall|Winter)(?:\s+(\d{4}))?$/i);
  if (!match) return { name: null, year: null };
  return {
    name: normalizeIntakeName(match[1]),
    year: match[2] ? Number(match[2]) : null
  };
}

function formatIntakeLabel(name, year) {
  if (!name) return null;
  return year ? `${name} ${year}` : name;
}

function getProfileIntakePreference(profile = {}) {
  const legacy = parseLegacyIntakeLabel(profile.intake);
  const name = normalizeIntakeName(profile.preferred_intake_name) || legacy.name;
  const year = readNumber(profile.preferred_intake_year) ?? legacy.year;

  return {
    name,
    year,
    intake: formatIntakeLabel(name, year)
  };
}

function withNormalizedProfileIntake(profile = {}) {
  const preference = getProfileIntakePreference(profile);
  return {
    ...profile,
    preferred_intake_name: preference.name,
    preferred_intake_year: preference.year,
    intake: preference.intake
  };
}

export function normalizeScalarList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function sameScalarValue(left, right) {
  if (left === right) return true;
  if ((left === null || left === undefined || left === '') && (right === null || right === undefined || right === '')) return true;
  return String(left) === String(right);
}

export function shouldTriggerRematch(existingProfile = {}, updates = {}) {
  return Object.entries(updates).some(([key, value]) => REMATCH_TRIGGER_FIELDS.has(key) && !sameScalarValue(existingProfile?.[key], value));
}

export function getRematchState(profile = {}) {
  if (profile.role === 'admin') {
    return {
      needs_rematch: false,
      last_matched_at: profile.last_matched_at || null,
      reason: null
    };
  }

  const needsRematch = Boolean(profile.needs_rematch || !profile.last_matched_at);

  return {
    needs_rematch: needsRematch,
    last_matched_at: profile.last_matched_at || null,
    reason: needsRematch
      ? profile.needs_rematch
        ? 'Matching inputs changed after the last recommendation run.'
        : 'Profile was updated after the last recommendation run.'
      : null
  };
}

export function deriveCountryRules(countryName, countryRecord = null) {
  const defaults = DEFAULT_COUNTRY_RULES[countryName] || {
    min_gpa_required: 2.5,
    gpa_tolerance: 0.15,
    english_test_required: true,
    english_medium_waiver_allowed: true,
    max_gap_years: 6,
    gap_risk_threshold: 3,
    budget_tolerance_pct: 0.12
  };

  return {
    ...defaults,
    ...(countryRecord?.requirements || {}),
    min_gpa_required: readNumber(countryRecord?.min_gpa_required) ?? defaults.min_gpa_required,
    gpa_tolerance: readNumber(countryRecord?.gpa_tolerance) ?? defaults.gpa_tolerance,
    english_test_required: countryRecord?.english_test_required ?? defaults.english_test_required,
    english_medium_waiver_allowed:
      countryRecord?.english_medium_waiver_allowed ?? defaults.english_medium_waiver_allowed,
    max_gap_years: readNumber(countryRecord?.max_gap_years) ?? defaults.max_gap_years,
    gap_risk_threshold: readNumber(countryRecord?.gap_risk_threshold) ?? defaults.gap_risk_threshold,
    budget_tolerance_pct: readNumber(countryRecord?.budget_tolerance_pct) ?? defaults.budget_tolerance_pct
  };
}

export function normalizeGpa(profile = {}) {
  const gpa = readNumber(profile.gpa);
  if (gpa === null) return null;

  const inferredScale =
    readNumber(profile.gpa_scale) ??
    ({
      SSC: 5,
      HSC: 5,
      'SSC/HSC': 5,
      'A Levels': 5,
      A_LEVELS: 5,
      Others: 4,
      Other: 4
    }[profile.academic_system] || 4);

  if (inferredScale <= 0) return null;
  return Number(((gpa / inferredScale) * 4).toFixed(2));
}

export function normalizeEnglishScore(testType, score) {
  const numericScore = readNumber(score);
  if (!testType || numericScore === null) return null;

  switch (testType) {
    case 'IELTS':
      return Number(((numericScore / 9) * 9).toFixed(2));
    case 'TOEFL':
      return Number(((numericScore / 120) * 9).toFixed(2));
    case 'Duolingo':
      return Number(((numericScore / 160) * 9).toFixed(2));
    case 'PTE':
      return Number(((numericScore / 90) * 9).toFixed(2));
    default:
      return null;
  }
}

function englishThresholdForType(ieltsEquivalent, testType) {
  if (ieltsEquivalent === null || ieltsEquivalent === undefined) return null;
  switch (testType) {
    case 'IELTS':
      return Number(Number(ieltsEquivalent).toFixed(1));
    case 'TOEFL':
      return Math.round((Number(ieltsEquivalent) / 9) * 120);
    case 'Duolingo':
      return Math.round((Number(ieltsEquivalent) / 9) * 160);
    case 'PTE':
      return Math.round((Number(ieltsEquivalent) / 9) * 90);
    default:
      return Number(Number(ieltsEquivalent).toFixed(1));
  }
}

export function calculateGapYears(profile = {}) {
  const lastEducationYear = readNumber(profile.last_education_year);
  if (!lastEducationYear) return null;
  return Math.max(CURRENT_YEAR - lastEducationYear, 0);
}

export function shouldRequireEnglishTest(profile = {}, countryRules = {}) {
  const medium = profile.medium_of_instruction;
  if (medium === 'English Medium' && countryRules.english_medium_waiver_allowed) return false;
  if (medium === 'Bangla Medium') return true;
  return Boolean(countryRules.english_test_required);
}

export function getDocumentRequirements(profile = {}) {
  const studyLevel = profile.study_level || 'Bachelor';
  const country = profile.preferred_country;
  const englishTestNeeded = shouldRequireEnglishTest(profile, deriveCountryRules(country));
  const requirements = new Set(DOCUMENT_BASE);

  (DOCUMENT_BY_LEVEL[studyLevel] || []).forEach((item) => requirements.add(item));
  (DOCUMENT_BY_COUNTRY[country] || []).forEach((item) => requirements.add(item));
  if (englishTestNeeded) requirements.add('english_test');

  return [...requirements];
}

export function getCountryVisaProfile(countryName) {
  return COUNTRY_VISA_PROFILES[countryName] || {
    processing_days: 35,
    living_cost_estimate: 10000,
    interview_weight: 8,
    financial_weight: 12,
    emphasis: 'Standard visa review'
  };
}

export function computeDocumentReadiness(profile = {}, documents = []) {
  const state =
    profile.profile_completion !== undefined && Array.isArray(profile.document_requirements)
      ? profile
      : computeProfileState(profile);
  const requiredDocuments = state.document_requirements || getDocumentRequirements(state);
  const usableDocuments = (documents || []).filter((doc) => doc?.status !== 'rejected');
  const uploadedTypes = new Set(usableDocuments.map((doc) => doc?.document_type).filter(Boolean));
  const pendingCount = usableDocuments.filter((doc) => doc?.status === 'pending').length;
  const rejectedCount = (documents || []).filter((doc) => doc?.status === 'rejected').length;
  const verifiedCount = usableDocuments.filter((doc) => doc?.status === 'verified').length;
  const uploadedRequiredDocuments = requiredDocuments.filter((docType) => uploadedTypes.has(docType));
  const missingDocuments = requiredDocuments.filter((docType) => !uploadedTypes.has(docType));
  const completeness = requiredDocuments.length
    ? Math.round((uploadedRequiredDocuments.length / requiredDocuments.length) * 100)
    : 100;
  const quality_flags = [];

  if (missingDocuments.includes('sop')) quality_flags.push('Missing SOP');
  if (missingDocuments.includes('cv')) quality_flags.push('Missing CV');
  if (rejectedCount > 0) quality_flags.push('One or more documents were rejected');
  if (pendingCount > uploadedRequiredDocuments.length / 2 && uploadedRequiredDocuments.length > 0) {
    quality_flags.push('Many required documents are still pending review');
  }

  usableDocuments.forEach((doc) => {
    const manualFlags = normalizeScalarList(doc?.quality_flags || doc?.quality_flag || doc?.admin_flag);
    manualFlags.forEach((flag) => quality_flags.push(flag));
  });

  let score = completeness;
  score -= Math.min(rejectedCount * 12, 24);
  score -= Math.min(pendingCount * 4, 12);
  if (verifiedCount >= requiredDocuments.length && requiredDocuments.length > 0) score += 5;
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    readiness_level: score >= 85 ? 'ready' : score >= 60 ? 'in_progress' : 'weak',
    required_documents: requiredDocuments,
    uploaded_required_documents: uploadedRequiredDocuments,
    missing_documents: missingDocuments,
    completeness,
    verified_count: verifiedCount,
    pending_count: pendingCount,
    rejected_count: rejectedCount,
    quality_flags: [...new Set(quality_flags)]
  };
}

export function validateProfileInput(profile = {}) {
  const normalizedProfile = withNormalizedProfileIntake(profile);
  const errors = {};
  const budgetMin = readNumber(normalizedProfile.budget_min);
  const budgetMax = readNumber(normalizedProfile.budget_max);
  const gpa = readNumber(normalizedProfile.gpa);
  const gpaScale = readNumber(normalizedProfile.gpa_scale);
  const englishScore = readNumber(normalizedProfile.english_score);
  const lastEducationYear = readNumber(normalizedProfile.last_education_year);
  const preferredIntakeYear = readNumber(normalizedProfile.preferred_intake_year);
  const testType = normalizedProfile.english_test_type;

  PROFILE_REQUIRED_FIELDS.forEach((field) => {
    const value = normalizedProfile[field];
    if (value === null || value === undefined || value === '') errors[field] = 'This field is required.';
  });

  if (gpa !== null && gpaScale !== null) {
    if (gpa < 0 || gpa > gpaScale) errors.gpa = `GPA must be between 0 and ${gpaScale}.`;
    if (gpaScale <= 0 || gpaScale > 10) errors.gpa_scale = 'GPA scale must be between 0 and 10.';
  }

  if (budgetMin !== null && (budgetMin < 0 || budgetMin > 1000000)) errors.budget_min = 'Budget min must be between 0 and 1,000,000.';
  if (budgetMax !== null && (budgetMax < 0 || budgetMax > 1000000)) errors.budget_max = 'Budget max must be between 0 and 1,000,000.';
  if (budgetMin !== null && budgetMax !== null && budgetMin > budgetMax) errors.budget_max = 'Budget max must be greater than or equal to budget min.';

  if (testType && englishScore === null) errors.english_score = 'English score is required for the selected test.';
  if (!testType && englishScore !== null) errors.english_test_type = 'English test type is required when a score is provided.';

  const englishMax = ENGLISH_MAX[testType];
  if (englishMax && englishScore !== null && (englishScore < 0 || englishScore > englishMax)) {
    errors.english_score = `${testType} score must be between 0 and ${englishMax}.`;
  }

  if (
    lastEducationYear !== null &&
    (lastEducationYear < MIN_LAST_EDUCATION_YEAR || lastEducationYear > MAX_LAST_EDUCATION_YEAR)
  ) {
    errors.last_education_year = `Last education year must be between ${MIN_LAST_EDUCATION_YEAR} and ${MAX_LAST_EDUCATION_YEAR}.`;
  }

  if (normalizedProfile.preferred_intake_name && !INTAKE_NAMES.includes(normalizedProfile.preferred_intake_name)) {
    errors.preferred_intake_name = `Preferred intake must be one of: ${INTAKE_NAMES.join(', ')}.`;
  }

  if (
    preferredIntakeYear !== null &&
    (preferredIntakeYear < MIN_PREFERRED_INTAKE_YEAR || preferredIntakeYear > MAX_PREFERRED_INTAKE_YEAR)
  ) {
    errors.preferred_intake_year = `Preferred intake year must be between ${MIN_PREFERRED_INTAKE_YEAR} and ${MAX_PREFERRED_INTAKE_YEAR}.`;
  }

  const allowedStudyLevels = EDUCATION_TO_STUDY_LEVEL[normalizedProfile.education_level] || [];
  if (
    normalizedProfile.education_level &&
    normalizedProfile.study_level &&
    allowedStudyLevels.length &&
    !allowedStudyLevels.includes(normalizedProfile.study_level)
  ) {
    errors.study_level = `${normalizedProfile.education_level} does not qualify directly for ${normalizedProfile.study_level}.`;
  }

  return errors;
}

function getBudgetRealism(profile = {}, profileState = null) {
  const normalizedGpa = profileState?.normalized_gpa ?? normalizeGpa(profile);
  const budgetMax = readNumber(profile.budget_max);
  if (budgetMax === null) return { score: 0, category: 'unknown', reason: 'Budget missing' };
  if (budgetMax >= 25000) return { score: 20, category: 'strong', reason: 'Budget supports most mainstream destinations' };
  if (budgetMax >= 15000) return { score: 14, category: 'realistic', reason: 'Budget supports selective but realistic options' };
  if (budgetMax >= 9000 && normalizedGpa !== null && normalizedGpa >= 3.2) {
    return { score: 9, category: 'scholarship_reliant', reason: 'Budget may work with scholarships or cheaper countries' };
  }
  return { score: 4, category: 'risky', reason: 'Budget is financially tight for common pathways' };
}

export function computeProfileState(profile = {}) {
  const normalizedProfile = withNormalizedProfileIntake(profile);
  const countryRules = deriveCountryRules(normalizedProfile.preferred_country);
  const validation_errors = validateProfileInput(normalizedProfile);
  const englishTestRequired = shouldRequireEnglishTest(normalizedProfile, countryRules);
  const requiredFields = [...PROFILE_REQUIRED_FIELDS];
  if (englishTestRequired) requiredFields.push('english_test_type', 'english_score');

  const validRequiredFields = requiredFields.filter((field) => {
    const value = normalizedProfile[field];
    return value !== null && value !== undefined && value !== '' && !validation_errors[field];
  });

  const completion_percentage = Math.round((validRequiredFields.length / requiredFields.length) * 100);
  const normalized_gpa = normalizeGpa(normalizedProfile);
  const normalized_english = normalizeEnglishScore(normalizedProfile.english_test_type, normalizedProfile.english_score);
  const gap_years = calculateGapYears(normalizedProfile);
  const blocking_reasons = [];
  const improvement_flags = [];

  if (Object.keys(validation_errors).length) blocking_reasons.push('Profile has validation errors.');
  if (completion_percentage < 100) blocking_reasons.push('Required profile fields are incomplete.');
  if (englishTestRequired && (!normalizedProfile.english_test_type || readNumber(normalizedProfile.english_score) === null)) {
    blocking_reasons.push('English test details are required for your profile.');
  }
  if (gap_years !== null && gap_years > countryRules.max_gap_years) {
    improvement_flags.push(`Study gap exceeds ${countryRules.max_gap_years} years for ${normalizedProfile.preferred_country || 'the selected country'} and may need conditional review.`);
  } else if (gap_years !== null && gap_years > countryRules.gap_risk_threshold) {
    improvement_flags.push('Study gap is above the low-risk range and may require explanation.');
  }
  if (normalized_gpa !== null && normalized_gpa < countryRules.min_gpa_required) {
    improvement_flags.push('Increase GPA strength or target programs with lower GPA thresholds.');
  }
  if (englishTestRequired && normalized_english !== null && normalized_english < 6) {
    improvement_flags.push('A stronger English score will unlock more programs.');
  }

  return {
    ...normalizedProfile,
    normalized_gpa,
    normalized_english,
    gap_years,
    english_test_required: englishTestRequired,
    profile_completion: completion_percentage,
    profile_status: blocking_reasons.length === 0 ? 'complete' : 'incomplete',
    validation_errors,
    completion_details: {
      required_fields: requiredFields,
      valid_required_fields: validRequiredFields,
      missing_required_fields: requiredFields.filter((field) => !validRequiredFields.includes(field))
    },
    document_requirements: getDocumentRequirements(normalizedProfile),
    budget_realism: getBudgetRealism(normalizedProfile, { normalized_gpa }),
    blocking_reasons,
    improvement_flags
  };
}

export function computeLeadScore(profile = {}, applicationCount = 0) {
  const state =
    profile.profile_completion !== undefined && profile.normalized_gpa !== undefined
      ? profile
      : computeProfileState(profile);

  let score = 0;
  score += Math.round((state.profile_completion || 0) * 0.35);

  const gpa = readNumber(state.normalized_gpa);
  if (gpa !== null) {
    if (gpa >= 3.5) score += 24;
    else if (gpa >= 3.0) score += 18;
    else if (gpa >= 2.6) score += 10;
    else score += 4;
  }

  const english = readNumber(state.normalized_english);
  if (!state.english_test_required) {
    score += 14;
  } else if (english !== null) {
    if (english >= 7) score += 18;
    else if (english >= 6) score += 12;
    else if (english >= 5.5) score += 7;
    else score += 2;
  }

  score += state.budget_realism?.score || 0;
  if (applicationCount > 0) score += Math.min(applicationCount * 5, 15);

  const finalScore = Math.max(0, Math.min(100, score));
  const temperature = finalScore >= 75 ? 'Hot Lead' : finalScore >= 50 ? 'Warm Lead' : 'Cold Lead';

  return {
    score: finalScore,
    temperature,
    factors: {
      profile_completion: state.profile_completion || 0,
      budget_realism: state.budget_realism?.category || 'unknown',
      normalized_gpa: state.normalized_gpa,
      normalized_english: state.normalized_english,
      application_count: applicationCount
    }
  };
}

export function computeProfileStrength({ leadScore = 0, visaRiskScore = 0, documentReadinessScore = null, matchScore = null }) {
  let score = leadScore * 0.45 + (100 - visaRiskScore) * 0.3;
  if (documentReadinessScore !== null && documentReadinessScore !== undefined) score += documentReadinessScore * 0.15;
  if (matchScore !== null && matchScore !== undefined) score += matchScore * 0.1;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function detectDropOffStage({ profileState, applicationCount = 0, documentReadiness = null }) {
  if ((profileState?.profile_completion || 0) < 60 && applicationCount === 0) return 'signed_up_no_profile';
  if ((profileState?.profile_completion || 0) >= 80 && applicationCount === 0) return 'profile_ready_no_application';
  if (applicationCount > 0 && documentReadiness && documentReadiness.score < 100) return 'applied_missing_documents';
  if ((profileState?.profile_completion || 0) >= 60 && applicationCount === 0) return 'profile_in_progress';
  return 'active';
}

export function computeVisaTimelineRisk(countryName, deadlineSnapshot = {}) {
  const countryProfile = getCountryVisaProfile(countryName);
  const startDaysLeft = deadlineSnapshot?.start_days_left;
  const bufferDays =
    startDaysLeft === null || startDaysLeft === undefined
      ? null
      : startDaysLeft - countryProfile.processing_days;

  let level = 'Unknown';
  let late_application = false;
  let reason = 'Start date unavailable for visa timeline estimate.';

  if (bufferDays !== null) {
    if (bufferDays < 0) {
      level = 'High';
      late_application = true;
      reason = `Estimated visa processing (${countryProfile.processing_days} days) is longer than time left before intake.`;
    } else if (bufferDays <= 14) {
      level = 'Medium';
      reason = `Visa timing is tight with only ${bufferDays} days of buffer.`;
    } else {
      level = 'Low';
      reason = `Visa timing buffer is healthy at ${bufferDays} days.`;
    }
  }

  return {
    level,
    late_application,
    processing_days: countryProfile.processing_days,
    living_cost_estimate: countryProfile.living_cost_estimate,
    emphasis: countryProfile.emphasis,
    start_days_left: startDaysLeft ?? null,
    buffer_days: bufferDays,
    reason
  };
}

export function computeVisaRisk(profile = {}, countryRules = null, options = {}) {
  const state =
    profile.profile_completion !== undefined && profile.normalized_gpa !== undefined
      ? profile
      : computeProfileState(profile);
  const countryName = options.countryName || state.preferred_country;
  const rules = countryRules || deriveCountryRules(countryName);
  const countryProfile = getCountryVisaProfile(countryName);
  const documentReadiness = options.documentReadiness || state.document_readiness || null;
  const visaTimeline = computeVisaTimelineRisk(countryName, options.deadlineSnapshot || {});
  let riskPoints = 0;
  const reasons = [];

  if ((state.budget_realism?.category || 'unknown') === 'risky') {
    riskPoints += 35;
    reasons.push('Budget is tight for tuition and living costs.');
  } else if (state.budget_realism?.category === 'scholarship_reliant') {
    riskPoints += 18;
    reasons.push('Budget depends on scholarships or cheaper routes.');
  }

  if ((state.normalized_gpa ?? 4) < rules.min_gpa_required) {
    riskPoints += 25;
    reasons.push('Academic profile is below the common threshold.');
  } else if ((state.normalized_gpa ?? 0) < rules.min_gpa_required + 0.2) {
    riskPoints += 10;
    reasons.push('Academic profile is borderline for the target market.');
  }

  if (state.gap_years !== null && state.gap_years > rules.max_gap_years) {
    riskPoints += 25;
    reasons.push('Study gap is above country tolerance.');
  } else if (state.gap_years !== null && state.gap_years > rules.gap_risk_threshold) {
    riskPoints += 12;
    reasons.push('Study gap may require additional explanation.');
  }

  if (state.english_test_required && (state.normalized_english ?? 0) < 6) {
    riskPoints += 15;
    reasons.push('English score is weak for visa confidence.');
  }

  if ((state.profile_completion || 0) < 80) {
    riskPoints += 12;
    reasons.push('Profile is incomplete and documents may be weak.');
  }

  if (documentReadiness) {
    if (documentReadiness.score < 60) {
      riskPoints += 18;
      reasons.push('Document readiness is weak for visa confidence.');
    } else if (documentReadiness.score < 85) {
      riskPoints += 8;
      reasons.push('Document readiness is still incomplete.');
    }
  }

  if (countryName === 'United States') {
    riskPoints += countryProfile.interview_weight * ((state.normalized_english ?? 0) < 6 ? 0.6 : 0.25);
    reasons.push('USA cases are interview-heavy and require strong interview readiness.');
  } else if (countryName === 'United Kingdom') {
    if ((state.budget_realism?.category || 'unknown') !== 'strong') {
      riskPoints += countryProfile.financial_weight * 0.6;
      reasons.push('UK visa review is sensitive to financial evidence.');
    }
  } else if (countryName === 'Canada') {
    const sdsReady = (state.normalized_english ?? 0) >= 6 && (state.budget_realism?.category || 'unknown') !== 'risky';
    if (!sdsReady) {
      riskPoints += 14;
      reasons.push('Canada profile looks closer to Non-SDS and may face slower processing.');
    }
  }

  if (visaTimeline.late_application) {
    riskPoints += 22;
    reasons.push('Visa timeline is too tight for the selected intake.');
  } else if (visaTimeline.level === 'Medium') {
    riskPoints += 10;
    reasons.push('Visa timeline buffer is narrow.');
  }

  const score = Math.max(0, Math.min(100, riskPoints));
  const level = score <= 25 ? 'Low risk' : score <= 55 ? 'Medium risk' : 'High risk';
  return {
    score,
    level,
    reasons,
    country_profile: {
      country: countryName || null,
      processing_days: countryProfile.processing_days,
      emphasis: countryProfile.emphasis,
      living_cost_estimate: countryProfile.living_cost_estimate
    },
    timeline: visaTimeline
  };
}

export function detectDuplicateSignals({ profile = {}, existingProfiles = [], recentProfiles = [] }) {
  const duplicate_flags = [];
  const fraud_flags = [];
  const normalizedEmail = String(profile.email || '').trim().toLowerCase();
  const normalizedPhone = String(profile.phone || '').trim();

  if (normalizedEmail && existingProfiles.some((item) => String(item.email || '').trim().toLowerCase() === normalizedEmail)) {
    duplicate_flags.push('Duplicate email');
  }
  if (normalizedPhone && existingProfiles.some((item) => String(item.phone || '').trim() === normalizedPhone)) {
    duplicate_flags.push('Duplicate phone');
  }

  const gpaScale = readNumber(profile.gpa_scale);
  const gpa = readNumber(profile.gpa);
  if (gpaScale !== null && gpa !== null && gpa > gpaScale) fraud_flags.push('Unrealistic GPA');

  if (readNumber(profile.english_score) !== null && profile.english_test_type) {
    const max = ENGLISH_MAX[profile.english_test_type];
    if (max && Number(profile.english_score) > max) fraud_flags.push('Unrealistic English score');
  }

  if (recentProfiles.length >= 3 && normalizedPhone) {
    fraud_flags.push('Multiple rapid signups around the same period');
  }

  return { duplicate_flags, fraud_flags };
}

export function validateDocumentUpload(documentType, fileName, fileSize) {
  const ext = String(fileName || '').split('.').pop()?.toLowerCase();
  if (!documentType) return 'Document type is required.';
  if (!fileName) return 'File name is required.';
  if (!FILE_EXTENSIONS.includes(ext)) return `Allowed file types: ${FILE_EXTENSIONS.join(', ')}.`;
  if (readNumber(fileSize) !== null && Number(fileSize) > MAX_FILE_SIZE) return 'File size must be 10 MB or less.';
  return null;
}

function parseProgramIntakes(program) {
  if (Array.isArray(program.intakes) && program.intakes.length) {
    return program.intakes
      .map((item, index) => {
        const name = normalizeIntakeName(item?.name);
        const year = readNumber(item?.year);
        if (!name || year === null) return null;

        return {
          key: item?.key || `${name}-${year}-${index}`,
          name,
          year,
          label: formatIntakeLabel(name, year),
          application_deadline: item?.application_deadline || null,
          start_date: item?.start_date || null,
          status: ['Open', 'Closed', 'Upcoming'].includes(item?.status) ? item.status : null
        };
      })
      .filter(Boolean);
  }

  return normalizeScalarList(program.intake_periods)
    .map((item, index) => {
      const parsed = parseLegacyIntakeLabel(item);
      const name = parsed.name || normalizeIntakeName(item);
      if (!name) return null;
      const year = parsed.year || CURRENT_YEAR;

      return {
        key: `${name}-${year}-${index}`,
        name,
        year,
        label: formatIntakeLabel(name, year),
        application_deadline: program.application_deadline || null,
        start_date: null,
        status: null
      };
    })
    .filter(Boolean);
}

function intakeStatusRank(status) {
  if (status === 'Open') return 0;
  if (status === 'Upcoming') return 1;
  if (status === 'Closed') return 3;
  return 2;
}

function isIntakeAvailable(intake) {
  if (intake?.status === 'Closed') return false;
  const deadlineDays = daysUntil(intake?.application_deadline);
  if (deadlineDays !== null && deadlineDays < 0) return false;
  return true;
}

function sortIntakes(intakes = []) {
  return [...intakes].sort((a, b) => {
    if ((a.year || 0) !== (b.year || 0)) return (a.year || 0) - (b.year || 0);
    const seasonDelta = INTAKE_PRIORITY.indexOf(a.name) - INTAKE_PRIORITY.indexOf(b.name);
    if (seasonDelta !== 0) return seasonDelta;
    return intakeStatusRank(a.status) - intakeStatusRank(b.status);
  });
}

function intakeMatchDetails(preferredIntakeName, preferredIntakeYear, program) {
  const programIntakes = sortIntakes(parseProgramIntakes(program));
  const availableIntakes = programIntakes.filter(isIntakeAvailable);
  const candidateIntakes = availableIntakes.length ? availableIntakes : programIntakes;
  const nearest = candidateIntakes[0] || null;
  const priorityDetails = (selected) => {
    const selectedIndex = candidateIntakes.findIndex((item) => item?.key === selected?.key);
    const deadlineDays = daysUntil(selected?.application_deadline);
    const priority = selectedIndex <= 0 ? 'current' : selectedIndex === 1 ? 'next' : 'future';
    const priority_score = selectedIndex <= 0 ? 6 : selectedIndex === 1 ? 4 : 2;
    const urgency_score =
      deadlineDays === null ? 1 : deadlineDays <= 14 ? 5 : deadlineDays <= 30 ? 4 : deadlineDays <= 60 ? 2 : 0;

    return {
      priority,
      priority_score,
      urgency_score,
      deadline_days_left: deadlineDays
    };
  };

  if (!preferredIntakeName) {
    const details = priorityDetails(nearest);
    return {
      matched: true,
      nearest: nearest?.label || null,
      selected: nearest,
      weight: nearest ? 3 + details.priority_score + details.urgency_score : 1,
      priority: details.priority,
      urgency_score: details.urgency_score,
      deadline_days_left: details.deadline_days_left,
      reason: nearest ? 'Flexible intake preference' : 'No intake data available'
    };
  }

  const exact = candidateIntakes.find((item) => item.name === preferredIntakeName && (preferredIntakeYear === null || item.year === preferredIntakeYear));
  if (exact) {
    const details = priorityDetails(exact);
    return {
      matched: true,
      nearest: exact.label,
      selected: exact,
      weight: 5 + details.priority_score + details.urgency_score,
      priority: details.priority,
      urgency_score: details.urgency_score,
      deadline_days_left: details.deadline_days_left,
      reason: exact.status === 'Upcoming' ? 'Preferred intake is upcoming' : 'Preferred intake available'
    };
  }

  const sameSeason = candidateIntakes.find((item) => item.name === preferredIntakeName);
  if (sameSeason) {
    const details = priorityDetails(sameSeason);
    return {
      matched: false,
      nearest: sameSeason.label,
      selected: sameSeason,
      weight: 3 + details.priority_score + details.urgency_score,
      priority: details.priority,
      urgency_score: details.urgency_score,
      deadline_days_left: details.deadline_days_left,
      reason: `Nearest intake is ${sameSeason.label}`
    };
  }

  const details = priorityDetails(nearest);
  return {
    matched: false,
    nearest: nearest?.label || null,
    selected: nearest,
    weight: nearest ? 1 + details.priority_score + details.urgency_score : 0,
    priority: details.priority,
    urgency_score: details.urgency_score,
    deadline_days_left: details.deadline_days_left,
    reason: nearest ? `Nearest intake is ${nearest.label}` : 'No intake data available'
  };
}

function subjectMatchDetails(preferredSubject, program) {
  if (!preferredSubject) return { tier: 'flexible', score: 8, reason: 'Subject preference not specified' };

  const haystack = [program.name, program.subject_area, ...normalizeScalarList(program.related_subjects)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (haystack.includes(preferredSubject.toLowerCase())) return { tier: 'exact', score: 20, reason: 'Exact subject match' };

  const related = SUBJECT_MAPPINGS[preferredSubject] || [];
  const foundRelated = related.find((item) => haystack.includes(item.toLowerCase()));
  if (foundRelated) return { tier: 'related', score: 12, reason: `Related subject match: ${foundRelated}` };
  return { tier: 'none', score: 0, reason: 'Subject mismatch' };
}

function gpaMatchDetails(profile, program, countryRules) {
  const normalizedGpa = profile.normalized_gpa;
  const programMin = readNumber(program.min_gpa_required) ?? countryRules.min_gpa_required;
  if (normalizedGpa === null) return { eligible: false, score: 0, category: 'missing', reason: 'Missing GPA' };
  if (normalizedGpa >= programMin + 0.2) return { eligible: true, score: 30, category: 'above', reason: 'Above GPA requirement' };
  if (normalizedGpa >= programMin) return { eligible: true, score: 24, category: 'meets', reason: 'Meets GPA requirement' };
  if (normalizedGpa >= programMin - countryRules.gpa_tolerance) return { eligible: true, score: 12, category: 'tolerance', reason: 'Conditional GPA match' };
  return { eligible: false, score: 0, category: 'below', reason: 'Below GPA requirement' };
}

function englishMatchDetails(profile, program, countryRules) {
  const required = shouldRequireEnglishTest(profile, countryRules);
  const programRequiresEnglish = program.english_test_required ?? required;
  if (!programRequiresEnglish) return { eligible: true, score: 15, category: 'waived', reason: 'English test not required' };

  const testType = profile.english_test_type;
  const score = readNumber(profile.english_score);
  const ieltsRequirement = readNumber(program.min_english_score) ?? 6;
  if (!testType || score === null) return { eligible: false, score: 0, category: 'missing', reason: 'Missing English test score' };

  const requiredScore = englishThresholdForType(ieltsRequirement, testType);
  const tolerance = testType === 'IELTS' ? 0.5 : Math.ceil(requiredScore * 0.08);
  if (score >= requiredScore) return { eligible: true, score: 20, category: 'meets', reason: `${testType} meets requirement` };
  if (score >= requiredScore - tolerance) return { eligible: true, score: 8, category: 'tolerance', reason: 'Conditional English match' };
  return { eligible: false, score: 0, category: 'below', reason: `${testType} below requirement` };
}

function budgetMatchDetails(profile, program, countryRules, hasScholarship) {
  const budgetMax = readNumber(profile.budget_max);
  const tuitionFee = readNumber(program.tuition_fee);
  const countryVisaProfile = getCountryVisaProfile(program.universities?.country || program.country || profile.preferred_country);
  const livingCost = readNumber(program.estimated_living_cost) ?? countryVisaProfile.living_cost_estimate;
  const totalCost = tuitionFee !== null ? tuitionFee + livingCost : null;
  if (budgetMax === null || totalCost === null) return { category: 'unknown', score: 6, reason: 'Budget comparison unavailable', total_cost: totalCost };

  const toleranceBudget = budgetMax * (1 + countryRules.budget_tolerance_pct);
  if (totalCost <= budgetMax) return { category: 'affordable', score: 18, reason: 'Tuition and living cost fit the budget', total_cost: totalCost };
  if (totalCost <= toleranceBudget) return { category: 'stretch', score: 9, reason: 'Total cost is slightly above budget', total_cost: totalCost };
  if (hasScholarship) return { category: 'aid_needed', score: 5, reason: 'Requires scholarship support to become viable', total_cost: totalCost };
  return { category: 'risky', score: 0, reason: 'Total cost is over budget', total_cost: totalCost };
}

function countryPreferenceScore(profile, programCountry) {
  if (!profile.preferred_country) return { score: 5, reason: 'Country flexible' };
  if (profile.preferred_country === programCountry) return { score: 10, reason: 'Preferred country match' };
  return { score: 0, reason: 'Country outside preference' };
}

export function buildScholarshipMatches(profile, program, scholarships = []) {
  return scholarships
    .filter((scholarship) => {
      if (scholarship.program_id && scholarship.program_id !== program.id) return false;
      if (scholarship.university_id && scholarship.university_id !== program.university_id) return false;
      const minGpa = readNumber(scholarship.min_gpa_required);
      if (minGpa !== null && (profile.normalized_gpa ?? -1) < minGpa) return false;
      return true;
    })
    .map((scholarship) => ({
      id: scholarship.id,
      name: scholarship.name,
      funding_type: scholarship.funding_type,
      amount: scholarship.amount
    }));
}

export function buildDeadlineSnapshot(program = {}, selectedIntake = null) {
  const orderedIntakes = sortIntakes(parseProgramIntakes(program));
  const fallbackIntake = orderedIntakes.find((item) => isIntakeAvailable(item)) || orderedIntakes[0] || null;
  const activeIntake = selectedIntake || fallbackIntake;
  const applicationDeadline = activeIntake?.application_deadline || program.application_deadline || null;
  const startDate = activeIntake?.start_date || null;
  const intakeStatus = activeIntake?.status || null;
  const application_days_left = daysUntil(applicationDeadline);
  const start_days_left = daysUntil(startDate);
  const scholarship_days_left = daysUntil(program.scholarship_deadline);
  const intakeClosed = intakeStatus === 'Closed';

  return {
    intake_name: activeIntake?.name || null,
    intake_year: activeIntake?.year || null,
    intake_label: activeIntake?.label || null,
    intake_status: intakeStatus,
    start_date: startDate,
    start_days_left,
    application_deadline: applicationDeadline,
    scholarship_deadline: program.scholarship_deadline || null,
    application_days_left,
    scholarship_days_left,
    alerts: [
      application_days_left !== null && application_days_left <= 30 ? `Application deadline in ${application_days_left} days` : null,
      start_days_left !== null && start_days_left <= 45 ? `Program starts in ${start_days_left} days` : null,
      intakeClosed ? 'Selected intake is closed' : null,
      scholarship_days_left !== null && scholarship_days_left <= 21 ? `Scholarship deadline in ${scholarship_days_left} days` : null
    ].filter(Boolean),
    expired: Boolean(intakeClosed || (application_days_left !== null && application_days_left < 0) || program.is_active === false)
  };
}

export function isProgramExpired(program = {}) {
  return buildDeadlineSnapshot(program).expired;
}

export function determineNextSteps({
  status,
  offerType,
  visaRiskLevel,
  missingDocuments = [],
  deadlineSnapshot = {},
  rejectionSuggestions = []
}) {
  if (status === 'rejected') {
    return rejectionSuggestions.length ? rejectionSuggestions : ['Review feedback and shortlist alternative programs.'];
  }

  const steps = [];
  if (missingDocuments.length) steps.push(`Upload missing documents: ${missingDocuments.join(', ')}`);
  if (status === 'draft') steps.push('Finalize SOP, documents, and counselor review before submission.');
  if (status === 'submitted' || status === 'under_review') steps.push('Monitor university updates and respond to document requests quickly.');
  if (status === 'accepted') {
    steps.push(offerType === 'conditional' ? 'Satisfy the offer conditions before final acceptance.' : 'Accept the offer and prepare tuition deposit.');
    steps.push(`Visa preparation priority: ${visaRiskLevel}`);
  }
  if (status === 'visa_processing') steps.push('Prepare visa file, finances, and interview readiness.');
  if (deadlineSnapshot.application_days_left !== null && deadlineSnapshot.application_days_left <= 14) {
    steps.unshift(`Deadline urgency: only ${deadlineSnapshot.application_days_left} days left.`);
  }
  return steps.slice(0, 5);
}

export function upsertTimelineEvent(timeline = [], event) {
  const events = Array.isArray(timeline) ? [...timeline] : [];
  const key = event.key || `${event.stage}:${event.label}`;
  const existingIndex = events.findIndex((item) => (item.key || `${item.stage}:${item.label}`) === key);
  const normalized = { ...event, key, at: event.at || new Date().toISOString() };

  if (existingIndex >= 0) events[existingIndex] = { ...events[existingIndex], ...normalized };
  else events.push(normalized);

  return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export async function suggestAlternatives(supabase, profileState, rejectedProgram, limit = 3) {
  const degreeLevel = rejectedProgram.degree_level || profileState.study_level;
  const { data: programs, error } = await supabase
    .from('programs')
    .select('*, universities(id, name, country, logo_url)')
    .eq('degree_level', degreeLevel)
    .neq('id', rejectedProgram.id)
    .limit(20);

  if (error) throw error;

  return (programs || [])
    .map((program) => evaluateProgram(profileState, program, deriveCountryRules(program.universities?.country || profileState.preferred_country), []))
    .filter((program) => ['affordable', 'stretch', 'aid_needed', 'unknown'].includes(program.budget_category))
    .filter((program) => program.subject_match !== 'none')
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, limit)
    .map((program) => `${program.name} at ${program.universities?.name || 'University'} (${program.universities?.country || 'Country'})`);
}

export async function assignCounselor(supabase, { preferredCountry, preferredSubject } = {}) {
  const { data: counselors, error } = await supabase
    .from('profiles')
    .select('user_id, name, preferred_country, counselor_specializations, counselor_capacity')
    .eq('role', 'counselor');

  if (error) throw error;
  if (!counselors?.length) return null;

  const counselorIds = counselors.map((item) => item.user_id).filter(Boolean);
  const { data: workloads, error: workloadError } = await supabase
    .from('applications')
    .select('counselor_id, status')
    .in('counselor_id', counselorIds);

  if (workloadError) throw workloadError;

  const workloadCount = new Map();
  (workloads || []).forEach((item) => {
    workloadCount.set(item.counselor_id, (workloadCount.get(item.counselor_id) || 0) + 1);
  });

  const scored = counselors.map((counselor) => {
    const specializations = normalizeScalarList(counselor.counselor_specializations);
    const workload = workloadCount.get(counselor.user_id) || 0;
    const capacity = readNumber(counselor.counselor_capacity) || 30;
    let score = 100 - Math.min(workload * 3, 60);

    if (preferredCountry && (counselor.preferred_country === preferredCountry || specializations.includes(preferredCountry))) score += 20;
    if (preferredSubject && specializations.some((item) => String(item).toLowerCase() === String(preferredSubject).toLowerCase())) score += 15;
    if (workload >= capacity) score -= 30;

    return { counselor, workload, capacity, score };
  });

  return scored.sort((a, b) => b.score - a.score || a.workload - b.workload)[0] || null;
}

function computeAcceptanceProbability({
  gpa,
  english,
  budget,
  subject,
  intake,
  scholarshipMatches,
  hardFailures,
  documentReadiness,
  visaTimeline,
  program
}) {
  let percent = 42;

  percent += { above: 18, meets: 12, tolerance: 4, missing: -18, below: -28 }[gpa.category] || 0;
  percent += { waived: 10, meets: 12, tolerance: 4, missing: -15, below: -22 }[english.category] || 0;
  percent += { affordable: 10, stretch: 4, aid_needed: 0, risky: -12, unknown: 0 }[budget.category] || 0;
  percent += { exact: 8, related: 4, flexible: 2, none: -10 }[subject.tier] || 0;
  percent += intake.matched ? 6 : 1;
  percent += Math.min(intake.urgency_score || 0, 4);
  percent += Math.min((scholarshipMatches || []).length * 2, 6);

  if (documentReadiness) {
    if (documentReadiness.score >= 85) percent += 8;
    else if (documentReadiness.score < 60) percent -= 12;
  }

  if (visaTimeline?.late_application) percent -= 16;
  if (visaTimeline?.level === 'Medium') percent -= 6;

  const historicalSuccessRate =
    readNumber(program.offer_success_rate) ??
    readNumber(program.acceptance_rate) ??
    readNumber(program.universities?.acceptance_rate);
  if (historicalSuccessRate !== null) {
    percent = Math.round(percent * 0.7 + historicalSuccessRate * 0.3);
  }

  percent -= Math.min((hardFailures || []).length * 8, 24);
  percent = Math.max(5, Math.min(95, Math.round(percent)));

  return {
    percent,
    band: percent >= 75 ? 'High' : percent >= 55 ? 'Medium' : 'Low'
  };
}

function getUniversityPerformance(program = {}) {
  const acceptanceRate =
    readNumber(program.offer_success_rate) ??
    readNumber(program.acceptance_rate) ??
    readNumber(program.universities?.acceptance_rate);
  const visaSuccessRate =
    readNumber(program.visa_success_rate) ??
    readNumber(program.universities?.visa_success_rate);

  let score = 0;
  let reason = 'No historical performance data available';

  if (acceptanceRate !== null) {
    if (acceptanceRate >= 65) {
      score += 8;
      reason = 'University has strong offer conversion history';
    } else if (acceptanceRate >= 45) {
      score += 5;
      reason = 'University has balanced offer conversion history';
    } else if (acceptanceRate >= 25) {
      score += 2;
      reason = 'University is relatively selective';
    } else {
      score -= 2;
      reason = 'University is highly selective based on past offer rates';
    }
  }

  if (visaSuccessRate !== null) {
    if (visaSuccessRate >= 75) score += 3;
    else if (visaSuccessRate < 50) score -= 2;
  }

  return {
    score,
    acceptance_rate: acceptanceRate,
    visa_success_rate: visaSuccessRate,
    reason
  };
}

function buildApplicationStrategy(matches = []) {
  const safePool = matches.filter((item) => item.match_score >= 75);
  const moderatePool = matches.filter((item) => item.match_score >= 60 && item.match_score < 75);
  const ambitiousPool = matches.filter((item) => item.match_score < 60);
  const fallbackSorted = [...matches].sort((a, b) => b.match_score - a.match_score);

  const safe = safePool.slice(0, 2);
  const moderate = moderatePool.slice(0, 2);
  const ambitious = ambitiousPool.slice(0, 1);

  const used = new Set([...safe, ...moderate, ...ambitious].map((item) => item.id));
  const fallback = fallbackSorted.filter((item) => !used.has(item.id));

  while (safe.length < 2 && fallback.length) safe.push(fallback.shift());
  while (moderate.length < 2 && fallback.length) moderate.push(fallback.shift());
  while (ambitious.length < 1 && fallback.length) ambitious.push(fallback.pop());

  return {
    safe: safe.map((item) => item.id),
    moderate: moderate.map((item) => item.id),
    ambitious: ambitious.map((item) => item.id)
  };
}

function suggestBackupCountries(profileState, countries = [], evaluatedPrograms = []) {
  if (!profileState.preferred_country) return [];

  const highMatchesInPreferredCountry = evaluatedPrograms.filter(
    (program) =>
      (program.universities?.country || program.country) === profileState.preferred_country &&
      program.match_score >= 75
  );
  if (highMatchesInPreferredCountry.length >= 2) return [];

  const grouped = new Map();
  evaluatedPrograms
    .filter((program) => (program.universities?.country || program.country) && (program.universities?.country || program.country) !== profileState.preferred_country)
    .filter((program) => program.subject_match !== 'none')
    .filter((program) => ['affordable', 'stretch', 'aid_needed', 'unknown'].includes(program.budget_category))
    .filter((program) => program.match_score >= 55)
    .forEach((program) => {
      const country = program.universities?.country || program.country;
      const current = grouped.get(country) || { score: 0, count: 0, examples: [] };
      current.score += program.match_score + (program.visa_risk_level === 'Low risk' ? 6 : program.visa_risk_level === 'Medium risk' ? 2 : -2);
      current.count += 1;
      if (current.examples.length < 2) current.examples.push(program.name);
      grouped.set(country, current);
    });

  const ranked = [...grouped.entries()]
    .map(([country, value]) => ({
      country,
      avg_score: Number((value.score / value.count).toFixed(1)),
      examples: value.examples
    }))
    .sort((a, b) => b.avg_score - a.avg_score)
    .slice(0, 3);

  if (ranked.length) return ranked;

  return (BACKUP_COUNTRY_FALLBACKS[profileState.preferred_country] || [])
    .filter((country) => (countries || []).some((item) => item.name === country) || !countries.length)
    .slice(0, 3)
    .map((country) => ({ country, avg_score: null, examples: [] }));
}

export function evaluateProgram(profileState, program, countryRules, scholarships = [], options = {}) {
  const programCountry = program.universities?.country || program.country;
  const subject = subjectMatchDetails(profileState.preferred_subject, program);
  const intake = intakeMatchDetails(profileState.preferred_intake_name, readNumber(profileState.preferred_intake_year), program);
  const gpa = gpaMatchDetails(profileState, program, countryRules);
  const english = englishMatchDetails(profileState, program, countryRules);
  const scholarshipMatches = buildScholarshipMatches(profileState, program, scholarships);
  const budget = budgetMatchDetails(profileState, program, countryRules, scholarshipMatches.length > 0 || program.scholarship_available);
  const country = countryPreferenceScore(profileState, programCountry);
  const universityPerformance = getUniversityPerformance(program);
  const gapYears = profileState.gap_years;
  const gapRisk = gapYears !== null && gapYears > countryRules.max_gap_years ? 'high' : gapYears !== null && gapYears > countryRules.gap_risk_threshold ? 'medium' : 'low';
  const deadlineSnapshot = buildDeadlineSnapshot(program, intake.selected);
  const documentReadiness = options.documentReadiness || null;
  const visaRisk = computeVisaRisk(profileState, countryRules, {
    countryName: programCountry,
    documentReadiness,
    deadlineSnapshot
  });
  const seatsTotal = readNumber(program.seats_total);
  const seatsFilled = readNumber(program.seats_filled) ?? 0;
  const nearlyFull = seatsTotal !== null && seatsTotal > 0 && seatsFilled / seatsTotal >= 0.85;

  const qualificationAllowed = (EDUCATION_TO_STUDY_LEVEL[profileState.education_level] || []).includes(program.degree_level || profileState.study_level);
  const hardFailures = [];
  if (!qualificationAllowed) hardFailures.push('Qualification mismatch');
  if (!gpa.eligible) hardFailures.push(gpa.reason);
  if (!english.eligible) hardFailures.push(english.reason);
  if (deadlineSnapshot.expired) hardFailures.push('Program deadline expired');
  if (documentReadiness?.missing_documents?.length) hardFailures.push(`Missing required documents: ${documentReadiness.missing_documents.join(', ')}`);
  if (visaRisk.timeline?.late_application) hardFailures.push('Visa timeline is too tight for the selected intake');

  const score = Math.max(
    0,
    Math.min(
      100,
      gpa.score +
        english.score +
        budget.score +
        subject.score +
        country.score +
        universityPerformance.score +
        intake.weight +
        (scholarshipMatches.length ? Math.min(5 + scholarshipMatches.length * 2, 10) : 0) -
        (nearlyFull ? 8 : 0) -
        (visaRisk.timeline?.late_application ? 10 : 0)
    )
  );
  const conditional_match = gpa.category === 'tolerance' || english.category === 'tolerance';
  const acceptanceProbability = computeAcceptanceProbability({
    gpa,
    english,
    budget,
    subject,
    intake,
    scholarshipMatches,
    hardFailures,
    documentReadiness,
    visaTimeline: visaRisk.timeline,
    program
  });
  const profileStrengthScore = computeProfileStrength({
    leadScore: profileState.lead_score || 0,
    visaRiskScore: visaRisk.score,
    documentReadinessScore: documentReadiness?.score ?? null,
    matchScore: score
  });

  return {
    ...program,
    scholarship_matches: scholarshipMatches,
    qualification_allowed: qualificationAllowed,
    hard_failures: hardFailures,
    gap_risk: gapRisk,
    budget_category: budget.category,
    financial_fit: budget.category,
    financial_estimate: {
      total_cost: budget.total_cost || null,
      student_budget_max: readNumber(profileState.budget_max),
      living_cost_estimate: getCountryVisaProfile(programCountry).living_cost_estimate
    },
    gpa_category: gpa.category,
    english_category: english.category,
    subject_match: subject.tier,
    intake_match: intake.matched,
    nearest_intake: intake.nearest,
    selected_intake: intake.selected,
    intake_priority: intake.priority,
    intake_urgency_score: intake.urgency_score,
    deadline_snapshot: deadlineSnapshot,
    financial_risk: budget.category === 'risky' ? 'high' : budget.category === 'aid_needed' ? 'medium' : 'low',
    visa_risk_level: visaRisk.level,
    visa_risk_score: visaRisk.score,
    visa_timeline: visaRisk.timeline,
    conditional_match,
    match_score: score,
    match_category: score >= 80 ? 'High match' : score >= 60 ? 'Medium match' : 'Low match',
    acceptance_probability: acceptanceProbability,
    document_readiness: documentReadiness,
    profile_strength_score: profileStrengthScore,
    university_performance: universityPerformance,
    match_reasons: [
      gpa.reason,
      english.reason,
      budget.reason,
      subject.reason,
      country.reason,
      universityPerformance.reason,
      intake.reason,
      scholarshipMatches.length ? 'Scholarship available' : null,
      nearlyFull ? 'Intake nearly full' : null,
      visaRisk.timeline?.reason || null
    ].filter(Boolean),
    eligible_for_application: hardFailures.length === 0,
    recommendation_flags: [
      !gpa.eligible ? 'Improve GPA or target lower-threshold programs.' : null,
      !english.eligible ? 'Improve English score or target programs with waivers.' : null,
      budget.category === 'risky' ? 'Increase budget or prioritize funded options.' : null,
      subject.tier === 'none' ? 'Widen subject preference for more results.' : null,
      gapRisk === 'high' ? 'Long study gap may require explanation or override.' : null,
      conditional_match ? 'Conditional match: slight requirement relaxation applied.' : null,
      documentReadiness?.missing_documents?.length ? `Upload required documents: ${documentReadiness.missing_documents.join(', ')}` : null,
      visaRisk.timeline?.late_application ? 'Visa timeline is tight for this intake.' : null
    ].filter(Boolean)
  };
}

function stageMatches(programs, predicate) {
  return programs.filter(predicate);
}

export function computeMatchResults({ profile, programs, countries = [], scholarships = [] }) {
  const profileState = computeProfileState(profile);
  const lead = computeLeadScore(profileState);
  const visaRisk = computeVisaRisk(profileState);
  const profileWithSignals = {
    ...profileState,
    lead_score: lead.score,
    lead_temperature: lead.temperature
  };
  const countryByName = new Map((countries || []).map((country) => [country.name, country]));

  const evaluated = programs
    .filter((program) => !isProgramExpired(program))
    .map((program) => {
      const programCountry = program.universities?.country || program.country;
      const countryRules = deriveCountryRules(programCountry, countryByName.get(programCountry));
      return evaluateProgram(profileWithSignals, program, countryRules, scholarships);
    })
    .filter((program) => program.degree_level === profileState.study_level);

  const subjectFiltered = stageMatches(evaluated, (program) => program.subject_match !== 'none');
  const countryFiltered = stageMatches(subjectFiltered, (program) => !profileState.preferred_country || (program.universities?.country || program.country) === profileState.preferred_country);
  const intakeFiltered = stageMatches(countryFiltered, (program) => program.intake_match);
  const budgetFiltered = stageMatches(countryFiltered, (program) => ['affordable', 'stretch', 'aid_needed', 'unknown'].includes(program.budget_category));
  const eligibleOnly = (items) => items.filter((program) => program.eligible_for_application || program.hard_failures.length === 0);

  let relaxed_stage = 'none';
  let finalMatches = eligibleOnly(intakeFiltered);
  if (!finalMatches.length) {
    finalMatches = eligibleOnly(budgetFiltered);
    relaxed_stage = 'intake';
  }
  if (!finalMatches.length) {
    finalMatches = eligibleOnly(subjectFiltered.filter((program) => ['affordable', 'stretch', 'aid_needed', 'unknown'].includes(program.budget_category)));
    relaxed_stage = 'budget';
  }
  if (!finalMatches.length) {
    finalMatches = eligibleOnly(evaluated.filter((program) => program.subject_match !== 'none'));
    relaxed_stage = 'country';
  }

  finalMatches = finalMatches.sort((a, b) => b.match_score - a.match_score);
  const backupCountries = suggestBackupCountries(profileState, countries, evaluated);

  return {
    profile: {
      ...profileState,
      lead_score: lead.score,
      lead_temperature: lead.temperature,
      visa_risk_score: visaRisk.score,
      visa_risk_level: visaRisk.level,
      profile_strength_score: computeProfileStrength({
        leadScore: lead.score,
        visaRiskScore: visaRisk.score
      })
    },
    matches: finalMatches,
    meta: {
      relaxed_stage,
      alternatives_returned: finalMatches.length > 0,
      suggestions: profileState.improvement_flags,
      backup_countries: backupCountries,
      application_strategy: buildApplicationStrategy(finalMatches)
    }
  };
}

export async function logAuditEvent(supabase, payload) {
  try {
    await supabase.from('audit_logs').insert(payload);
  } catch (error) {
    console.warn('Audit log insert skipped:', error?.message || error);
  }
}
