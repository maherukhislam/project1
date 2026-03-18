const CURRENT_YEAR = new Date().getUTCFullYear();

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
  'intake',
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
  'United States': {
    min_gpa_required: 2.5,
    gpa_tolerance: 0.2,
    english_test_required: true,
    english_medium_waiver_allowed: true,
    max_gap_years: 10,
    gap_risk_threshold: 5,
    budget_tolerance_pct: 0.15
  },
  'United Kingdom': {
    min_gpa_required: 2.7,
    gpa_tolerance: 0.15,
    english_test_required: true,
    english_medium_waiver_allowed: true,
    max_gap_years: 8,
    gap_risk_threshold: 4,
    budget_tolerance_pct: 0.12
  },
  Canada: {
    min_gpa_required: 2.7,
    gpa_tolerance: 0.1,
    english_test_required: true,
    english_medium_waiver_allowed: false,
    max_gap_years: 7,
    gap_risk_threshold: 4,
    budget_tolerance_pct: 0.12
  },
  Australia: {
    min_gpa_required: 2.6,
    gpa_tolerance: 0.15,
    english_test_required: true,
    english_medium_waiver_allowed: true,
    max_gap_years: 8,
    gap_risk_threshold: 4,
    budget_tolerance_pct: 0.12
  },
  Germany: {
    min_gpa_required: 2.8,
    gpa_tolerance: 0.15,
    english_test_required: true,
    english_medium_waiver_allowed: true,
    max_gap_years: 6,
    gap_risk_threshold: 3,
    budget_tolerance_pct: 0.1
  },
  Netherlands: {
    min_gpa_required: 2.8,
    gpa_tolerance: 0.15,
    english_test_required: true,
    english_medium_waiver_allowed: true,
    max_gap_years: 6,
    gap_risk_threshold: 3,
    budget_tolerance_pct: 0.1
  },
  France: {
    min_gpa_required: 2.5,
    gpa_tolerance: 0.15,
    english_test_required: true,
    english_medium_waiver_allowed: true,
    max_gap_years: 6,
    gap_risk_threshold: 3,
    budget_tolerance_pct: 0.1
  },
  Ireland: {
    min_gpa_required: 2.6,
    gpa_tolerance: 0.15,
    english_test_required: true,
    english_medium_waiver_allowed: true,
    max_gap_years: 7,
    gap_risk_threshold: 4,
    budget_tolerance_pct: 0.12
  },
  'New Zealand': {
    min_gpa_required: 2.5,
    gpa_tolerance: 0.15,
    english_test_required: true,
    english_medium_waiver_allowed: true,
    max_gap_years: 8,
    gap_risk_threshold: 4,
    budget_tolerance_pct: 0.12
  },
  Singapore: {
    min_gpa_required: 3.0,
    gpa_tolerance: 0.1,
    english_test_required: true,
    english_medium_waiver_allowed: true,
    max_gap_years: 5,
    gap_risk_threshold: 3,
    budget_tolerance_pct: 0.1
  }
};

const DOCUMENT_BASE = ['passport', 'academic_certificate', 'transcript', 'cv'];

const DOCUMENT_BY_LEVEL = {
  Bachelor: ['sop'],
  Master: ['sop', 'recommendation'],
  PhD: ['sop', 'recommendation', 'research_proposal']
};

const DOCUMENT_BY_COUNTRY = {
  Canada: ['financial_statement'],
  Australia: ['financial_statement'],
  Germany: ['aps_certificate'],
  'United States': ['financial_statement'],
  'United Kingdom': ['financial_statement']
};

const FILE_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ENGLISH_MAX = {
  IELTS: 9,
  TOEFL: 120,
  Duolingo: 160,
  PTE: 90
};

const INTAKE_PRIORITY = ['Spring', 'Summer', 'Fall', 'Winter'];

const readNumber = (value) => (value === null || value === undefined || value === '' ? null : Number(value));

const titleCase = (value) => {
  if (!value) return value;
  return String(value)
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

export function normalizeScalarList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
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

export function calculateGapYears(profile = {}) {
  const lastEducationYear = readNumber(profile.last_education_year);
  if (!lastEducationYear) return null;
  return Math.max(CURRENT_YEAR - lastEducationYear, 0);
}

export function shouldRequireEnglishTest(profile = {}, countryRules = {}) {
  const medium = profile.medium_of_instruction;
  if (medium === 'English Medium' && countryRules.english_medium_waiver_allowed) {
    return false;
  }
  if (medium === 'Bangla Medium') {
    return true;
  }
  return Boolean(countryRules.english_test_required);
}

export function validateProfileInput(profile = {}) {
  const errors = {};

  const budgetMin = readNumber(profile.budget_min);
  const budgetMax = readNumber(profile.budget_max);
  const gpa = readNumber(profile.gpa);
  const gpaScale = readNumber(profile.gpa_scale);
  const englishScore = readNumber(profile.english_score);
  const lastEducationYear = readNumber(profile.last_education_year);
  const testType = profile.english_test_type;

  PROFILE_REQUIRED_FIELDS.forEach((field) => {
    const value = profile[field];
    if (value === null || value === undefined || value === '') {
      errors[field] = 'This field is required.';
    }
  });

  if (gpa !== null && gpaScale !== null) {
    if (gpa < 0 || gpa > gpaScale) {
      errors.gpa = `GPA must be between 0 and ${gpaScale}.`;
    }
    if (gpaScale <= 0 || gpaScale > 10) {
      errors.gpa_scale = 'GPA scale must be between 0 and 10.';
    }
  }

  if (budgetMin !== null && (budgetMin < 0 || budgetMin > 1000000)) {
    errors.budget_min = 'Budget min must be between 0 and 1,000,000.';
  }
  if (budgetMax !== null && (budgetMax < 0 || budgetMax > 1000000)) {
    errors.budget_max = 'Budget max must be between 0 and 1,000,000.';
  }
  if (budgetMin !== null && budgetMax !== null && budgetMin > budgetMax) {
    errors.budget_max = 'Budget max must be greater than or equal to budget min.';
  }

  if (testType && englishScore === null) {
    errors.english_score = 'English score is required for the selected test.';
  }
  if (!testType && englishScore !== null) {
    errors.english_test_type = 'English test type is required when a score is provided.';
  }

  const englishMax = ENGLISH_MAX[testType];
  if (englishMax && englishScore !== null && (englishScore < 0 || englishScore > englishMax)) {
    errors.english_score = `${testType} score must be between 0 and ${englishMax}.`;
  }

  if (lastEducationYear !== null && (lastEducationYear < 1980 || lastEducationYear > CURRENT_YEAR + 2)) {
    errors.last_education_year = `Last education year must be between 1980 and ${CURRENT_YEAR + 2}.`;
  }

  const allowedStudyLevels = EDUCATION_TO_STUDY_LEVEL[profile.education_level] || [];
  if (profile.education_level && profile.study_level && allowedStudyLevels.length && !allowedStudyLevels.includes(profile.study_level)) {
    errors.study_level = `${profile.education_level} does not qualify directly for ${profile.study_level}.`;
  }

  return errors;
}

export function computeProfileState(profile = {}) {
  const countryRules = deriveCountryRules(profile.preferred_country);
  const validation_errors = validateProfileInput(profile);
  const englishTestRequired = shouldRequireEnglishTest(profile, countryRules);

  const requiredFields = [...PROFILE_REQUIRED_FIELDS];
  if (englishTestRequired) {
    requiredFields.push('english_test_type', 'english_score');
  }

  const validRequiredFields = requiredFields.filter((field) => {
    const value = profile[field];
    return value !== null && value !== undefined && value !== '' && !validation_errors[field];
  });

  const completion_percentage = Math.round((validRequiredFields.length / requiredFields.length) * 100);
  const normalized_gpa = normalizeGpa(profile);
  const normalized_english = normalizeEnglishScore(profile.english_test_type, profile.english_score);
  const gap_years = calculateGapYears(profile);
  const blocking_reasons = [];
  const improvement_flags = [];

  if (Object.keys(validation_errors).length) {
    blocking_reasons.push('Profile has validation errors.');
  }
  if (completion_percentage < 100) {
    blocking_reasons.push('Required profile fields are incomplete.');
  }
  if (englishTestRequired && (!profile.english_test_type || readNumber(profile.english_score) === null)) {
    blocking_reasons.push('English test details are required for your profile.');
  }
  if (gap_years !== null && gap_years > countryRules.max_gap_years) {
    improvement_flags.push(`Study gap exceeds ${countryRules.max_gap_years} years for ${profile.preferred_country || 'the selected country'} and may need conditional review.`);
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
    ...profile,
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
    document_requirements: getDocumentRequirements(profile),
    blocking_reasons,
    improvement_flags
  };
}

export function validateDocumentUpload(documentType, fileName, fileSize) {
  const ext = String(fileName || '').split('.').pop()?.toLowerCase();
  if (!documentType) return 'Document type is required.';
  if (!fileName) return 'File name is required.';
  if (!FILE_EXTENSIONS.includes(ext)) {
    return `Allowed file types: ${FILE_EXTENSIONS.join(', ')}.`;
  }
  if (readNumber(fileSize) !== null && Number(fileSize) > MAX_FILE_SIZE) {
    return 'File size must be 10 MB or less.';
  }
  return null;
}

function parseProgramIntakes(program) {
  return normalizeScalarList(program.intake_periods);
}

function intakeMatchDetails(preferredIntake, program) {
  const programIntakes = parseProgramIntakes(program);
  if (!preferredIntake) {
    return { matched: true, nearest: programIntakes[0] || null, weight: 3, reason: 'Flexible intake preference' };
  }
  if (programIntakes.includes(preferredIntake)) {
    return { matched: true, nearest: preferredIntake, weight: 5, reason: 'Preferred intake available' };
  }

  const preferredSeason = preferredIntake.split(' ')[0];
  const sameSeason = programIntakes.find((item) => item.startsWith(preferredSeason));
  if (sameSeason) {
    return { matched: false, nearest: sameSeason, weight: 3, reason: `Nearest intake is ${sameSeason}` };
  }

  const sorted = [...programIntakes].sort((a, b) => {
    const aIndex = INTAKE_PRIORITY.indexOf(a.split(' ')[0]);
    const bIndex = INTAKE_PRIORITY.indexOf(b.split(' ')[0]);
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });

  return { matched: false, nearest: sorted[0] || null, weight: 1, reason: sorted[0] ? `Nearest intake is ${sorted[0]}` : 'No intake data available' };
}

function subjectMatchDetails(preferredSubject, program) {
  if (!preferredSubject) {
    return { tier: 'flexible', score: 8, reason: 'Subject preference not specified' };
  }

  const haystack = [
    program.name,
    program.subject_area,
    ...normalizeScalarList(program.related_subjects)
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (haystack.includes(preferredSubject.toLowerCase())) {
    return { tier: 'exact', score: 20, reason: 'Exact subject match' };
  }

  const related = SUBJECT_MAPPINGS[preferredSubject] || [];
  const foundRelated = related.find((item) => haystack.includes(item.toLowerCase()));
  if (foundRelated) {
    return { tier: 'related', score: 12, reason: `Related subject match: ${foundRelated}` };
  }

  return { tier: 'none', score: 0, reason: 'Subject mismatch' };
}

function gpaMatchDetails(profile, program, countryRules) {
  const normalizedGpa = profile.normalized_gpa;
  const programMin = readNumber(program.min_gpa_required) ?? countryRules.min_gpa_required;
  if (normalizedGpa === null) {
    return { eligible: false, score: 0, category: 'missing', reason: 'Missing GPA' };
  }
  if (normalizedGpa >= programMin + 0.2) {
    return { eligible: true, score: 30, category: 'above', reason: 'Above GPA requirement' };
  }
  if (normalizedGpa >= programMin) {
    return { eligible: true, score: 24, category: 'meets', reason: 'Meets GPA requirement' };
  }
  if (normalizedGpa >= programMin - countryRules.gpa_tolerance) {
    return { eligible: true, score: 12, category: 'tolerance', reason: 'Below GPA requirement but within tolerance' };
  }
  return { eligible: false, score: 0, category: 'below', reason: 'Below GPA requirement' };
}

function englishMatchDetails(profile, program, countryRules) {
  const required = shouldRequireEnglishTest(profile, countryRules);
  const programRequiresEnglish = program.english_test_required ?? required;
  if (!programRequiresEnglish) {
    return { eligible: true, score: 15, category: 'waived', reason: 'English test not required' };
  }

  const testType = profile.english_test_type;
  const score = readNumber(profile.english_score);
  const ieltsRequirement = readNumber(program.min_english_score) ?? 6;

  if (!testType || score === null) {
    return { eligible: false, score: 0, category: 'missing', reason: 'Missing English test score' };
  }

  const requiredScore = englishThresholdForType(ieltsRequirement, testType);
  const tolerance = testType === 'IELTS' ? 0.5 : Math.ceil(requiredScore * 0.08);

  if (score >= requiredScore) {
    return { eligible: true, score: 20, category: 'meets', reason: `${testType} meets requirement` };
  }
  if (score >= requiredScore - tolerance) {
    return { eligible: true, score: 8, category: 'tolerance', reason: `${testType} slightly below requirement` };
  }
  return { eligible: false, score: 0, category: 'below', reason: `${testType} below requirement` };
}

function budgetMatchDetails(profile, program, countryRules, hasScholarship) {
  const budgetMax = readNumber(profile.budget_max);
  const tuitionFee = readNumber(program.tuition_fee);
  if (budgetMax === null || tuitionFee === null) {
    return { category: 'unknown', score: 6, reason: 'Budget comparison unavailable' };
  }

  const toleranceBudget = budgetMax * (1 + countryRules.budget_tolerance_pct);
  if (tuitionFee <= budgetMax) {
    return { category: 'within', score: 15, reason: 'Within budget' };
  }
  if (tuitionFee <= toleranceBudget) {
    return { category: 'slightly_above', score: 8, reason: 'Slightly above budget' };
  }
  if (hasScholarship) {
    return { category: 'aid_needed', score: 4, reason: 'Requires financial aid' };
  }
  return { category: 'over', score: 0, reason: 'Over budget' };
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

export function evaluateProgram(profileState, program, countryRules, scholarships = []) {
  const programCountry = program.universities?.country || program.country;
  const subject = subjectMatchDetails(profileState.preferred_subject, program);
  const intake = intakeMatchDetails(profileState.intake, program);
  const gpa = gpaMatchDetails(profileState, program, countryRules);
  const english = englishMatchDetails(profileState, program, countryRules);
  const scholarshipMatches = buildScholarshipMatches(profileState, program, scholarships);
  const budget = budgetMatchDetails(profileState, program, countryRules, scholarshipMatches.length > 0 || program.scholarship_available);
  const country = countryPreferenceScore(profileState, programCountry);
  const gapYears = profileState.gap_years;
  const gapRisk = gapYears !== null && gapYears > countryRules.max_gap_years ? 'high' : gapYears !== null && gapYears > countryRules.gap_risk_threshold ? 'medium' : 'low';

  const qualificationAllowed = (EDUCATION_TO_STUDY_LEVEL[profileState.education_level] || []).includes(program.degree_level || profileState.study_level);
  const hardFailures = [];
  if (!qualificationAllowed) hardFailures.push('Qualification mismatch');
  if (!gpa.eligible) hardFailures.push(gpa.reason);
  if (!english.eligible) hardFailures.push(english.reason);

  const score = Math.max(
    0,
    Math.min(
      100,
      gpa.score + english.score + budget.score + subject.score + country.score + intake.weight + (scholarshipMatches.length ? 5 : 0)
    )
  );

  return {
    ...program,
    scholarship_matches: scholarshipMatches,
    qualification_allowed: qualificationAllowed,
    hard_failures: hardFailures,
    gap_risk: gapRisk,
    budget_category: budget.category,
    gpa_category: gpa.category,
    english_category: english.category,
    subject_match: subject.tier,
    intake_match: intake.matched,
    nearest_intake: intake.nearest,
    match_score: score,
    match_category: score >= 80 ? 'High match' : score >= 60 ? 'Medium match' : 'Low match',
    match_reasons: [
      gpa.reason,
      english.reason,
      budget.reason,
      subject.reason,
      country.reason,
      intake.reason,
      scholarshipMatches.length ? 'Scholarship available' : null
    ].filter(Boolean),
    eligible_for_application: hardFailures.length === 0,
    recommendation_flags: [
      !gpa.eligible ? 'Improve GPA or target lower-threshold programs.' : null,
      !english.eligible ? 'Improve English score or target programs with waivers.' : null,
      budget.category === 'over' ? 'Increase budget or prioritize funded options.' : null,
      subject.tier === 'none' ? 'Widen subject preference for more results.' : null,
      gapRisk === 'high' ? 'Long study gap may require explanation or override.' : null
    ].filter(Boolean)
  };
}

function stageMatches(programs, predicate) {
  return programs.filter(predicate);
}

export function computeMatchResults({ profile, programs, countries = [], scholarships = [] }) {
  const profileState = computeProfileState(profile);
  const countryByName = new Map((countries || []).map((country) => [country.name, country]));
  const evaluated = programs
    .map((program) => {
      const programCountry = program.universities?.country || program.country;
      const countryRules = deriveCountryRules(programCountry, countryByName.get(programCountry));
      return evaluateProgram(profileState, program, countryRules, scholarships);
    })
    .filter((program) => program.degree_level === profileState.study_level);

  const subjectFiltered = stageMatches(evaluated, (program) => program.subject_match !== 'none');
  const countryFiltered = stageMatches(subjectFiltered, (program) => {
    if (!profileState.preferred_country) return true;
    return (program.universities?.country || program.country) === profileState.preferred_country;
  });
  const intakeFiltered = stageMatches(countryFiltered, (program) => program.intake_match);
  const budgetFiltered = stageMatches(countryFiltered, (program) => ['within', 'slightly_above', 'aid_needed', 'unknown'].includes(program.budget_category));
  const eligibleOnly = (items) => items.filter((program) => program.eligible_for_application || program.hard_failures.length === 0);

  let relaxed_stage = 'none';
  let finalMatches = eligibleOnly(intakeFiltered);

  if (!finalMatches.length) {
    finalMatches = eligibleOnly(budgetFiltered);
    relaxed_stage = 'intake';
  }
  if (!finalMatches.length) {
    finalMatches = eligibleOnly(subjectFiltered.filter((program) => ['within', 'slightly_above', 'aid_needed', 'unknown'].includes(program.budget_category)));
    relaxed_stage = 'budget';
  }
  if (!finalMatches.length) {
    finalMatches = eligibleOnly(evaluated.filter((program) => program.subject_match !== 'none'));
    relaxed_stage = 'country';
  }

  finalMatches = finalMatches.sort((a, b) => b.match_score - a.match_score);

  return {
    profile: profileState,
    matches: finalMatches,
    meta: {
      relaxed_stage,
      alternatives_returned: finalMatches.length > 0,
      suggestions: profileState.improvement_flags
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
