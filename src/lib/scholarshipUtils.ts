export interface StudentProfile {
  gpa?: number | null;
  gpa_scale?: number | null;
  english_score?: number | null;
  english_test_type?: string | null;
  study_level?: string | null;
  budget_max?: number | null;
  preferred_country?: string | null;
  intake?: string | null;
}

export interface Scholarship {
  id: number;
  name: string;
  funding_type: string;
  amount?: number | null;
  funding_percentage?: number | null;
  min_gpa_required?: number | null;
  gpa_tolerance?: number | null;
  min_english_score?: number | null;
  english_test_type?: string | null;
  study_level?: string | null;
  intake?: string | null;
  application_type?: string;
  is_stackable?: boolean;
  merit_based?: boolean;
  need_based?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  deadline?: string | null;
  description?: string | null;
  eligibility?: string | null;
  additional_requirements?: string | null;
  universities?: { name: string; country: string } | null;
}

export type EligibilityStatus = 'eligible' | 'conditional' | 'not_eligible' | 'unknown';

export interface EligibilityResult {
  status: EligibilityStatus;
  reasons: string[];
  improvements: string[];
}

export function checkEligibility(
  scholarship: Scholarship,
  profile: StudentProfile
): EligibilityResult {
  const reasons: string[] = [];
  const improvements: string[] = [];
  let hardFail = false;
  let softFail = false;

  const tolerance = scholarship.gpa_tolerance ?? 0.2;

  if (scholarship.study_level && scholarship.study_level !== 'Any') {
    if (!profile.study_level) {
      softFail = true;
      improvements.push('Specify your study level in your profile');
    } else if (
      profile.study_level.toLowerCase() !== scholarship.study_level.toLowerCase()
    ) {
      hardFail = true;
      reasons.push(`Requires ${scholarship.study_level} level`);
    }
  }

  if (scholarship.min_gpa_required) {
    const profileGpa = normaliseGpa(profile.gpa, profile.gpa_scale);
    if (profileGpa === null) {
      softFail = true;
      improvements.push('Add your GPA to your profile');
    } else if (profileGpa < scholarship.min_gpa_required - tolerance) {
      hardFail = true;
      reasons.push(
        `GPA ${profileGpa.toFixed(2)} is below minimum ${scholarship.min_gpa_required}`
      );
    } else if (profileGpa < scholarship.min_gpa_required) {
      softFail = true;
      improvements.push(
        `Raise GPA to ${scholarship.min_gpa_required} (currently ${profileGpa.toFixed(2)} — within tolerance)`
      );
    }
  }

  if (scholarship.min_english_score && scholarship.english_test_type) {
    if (!profile.english_score || !profile.english_test_type) {
      softFail = true;
      improvements.push('Add your English test score to your profile');
    } else if (
      profile.english_test_type?.toLowerCase() ===
        scholarship.english_test_type?.toLowerCase() &&
      profile.english_score < scholarship.min_english_score
    ) {
      const scoreTolerance = scholarship.english_test_type?.toLowerCase() === 'ielts' ? 0.5 : 5;
      if (profile.english_score < scholarship.min_english_score - scoreTolerance) {
        hardFail = true;
        reasons.push(
          `${scholarship.english_test_type} score ${profile.english_score} is below minimum ${scholarship.min_english_score}`
        );
      } else {
        softFail = true;
        improvements.push(
          `Improve ${scholarship.english_test_type} score to ${scholarship.min_english_score} (you have ${profile.english_score})`
        );
      }
    }
  }

  if (hardFail) {
    return { status: 'not_eligible', reasons, improvements };
  }
  if (softFail) {
    return { status: 'conditional', reasons, improvements };
  }
  return { status: 'eligible', reasons: [], improvements: [] };
}

function normaliseGpa(
  gpa: number | null | undefined,
  scale: number | null | undefined
): number | null {
  if (gpa == null) return null;
  if (!scale || scale === 4) return gpa;
  return (gpa / scale) * 4;
}

export function calculateFinalTuition(
  scholarship: Scholarship,
  tuitionFee: number
): number {
  if (scholarship.funding_percentage) {
    return tuitionFee * (1 - scholarship.funding_percentage / 100);
  }
  if (scholarship.amount) {
    return Math.max(0, tuitionFee - scholarship.amount);
  }
  return tuitionFee;
}

export function getBudgetFit(
  finalTuition: number,
  budgetMax: number | null | undefined
): 'within' | 'slightly_above' | 'expensive' | 'unknown' {
  if (!budgetMax) return 'unknown';
  if (finalTuition <= budgetMax) return 'within';
  if (finalTuition <= budgetMax * 1.2) return 'slightly_above';
  return 'expensive';
}

export function getDaysRemaining(deadline: string | null | undefined): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isExpired(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  return new Date(deadline).getTime() < Date.now();
}

export function getDeadlineLabel(deadline: string | null | undefined): string {
  if (!deadline) return 'Open deadline';
  const days = getDaysRemaining(deadline);
  if (days === null) return 'Open deadline';
  if (days < 0) return 'Expired';
  if (days === 0) return 'Due today';
  if (days === 1) return '1 day left';
  if (days <= 7) return `${days} days left`;
  if (days <= 30) return `${days} days left`;
  return new Date(deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getDeadlineUrgency(deadline: string | null | undefined): 'urgent' | 'soon' | 'ok' | 'expired' | 'none' {
  if (!deadline) return 'none';
  const days = getDaysRemaining(deadline);
  if (days === null) return 'none';
  if (days < 0) return 'expired';
  if (days <= 7) return 'urgent';
  if (days <= 30) return 'soon';
  return 'ok';
}

export function priorityScore(
  scholarship: Scholarship,
  profile: StudentProfile,
  eligibility: EligibilityResult
): number {
  let score = 0;

  if (eligibility.status === 'eligible') score += 100;
  else if (eligibility.status === 'conditional') score += 40;

  if (scholarship.funding_type === 'Full') score += 50;
  else if (scholarship.funding_type === 'Partial') score += 25;
  else score += 10;

  if (scholarship.amount) score += Math.min(40, scholarship.amount / 1000);
  if (scholarship.funding_percentage) score += scholarship.funding_percentage / 2;

  if (scholarship.is_featured) score += 20;

  const days = getDaysRemaining(scholarship.deadline);
  if (days !== null && days > 0) {
    if (days <= 30) score += 15;
    else if (days <= 90) score += 8;
  }

  if (
    profile.preferred_country &&
    scholarship.universities?.country?.toLowerCase() === profile.preferred_country.toLowerCase()
  ) {
    score += 15;
  }

  if (profile.budget_max && scholarship.amount) {
    const fit = getBudgetFit(
      calculateFinalTuition(scholarship, profile.budget_max),
      profile.budget_max
    );
    if (fit === 'within') score += 20;
    else if (fit === 'slightly_above') score += 8;
  }

  return score;
}

export function rankScholarships(
  scholarships: Scholarship[],
  profile: StudentProfile
): Array<Scholarship & { _eligibility: EligibilityResult; _score: number }> {
  return scholarships
    .filter(s => s.is_active !== false && !isExpired(s.deadline))
    .map(s => {
      const _eligibility = checkEligibility(s, profile);
      const _score = priorityScore(s, profile, _eligibility);
      return { ...s, _eligibility, _score };
    })
    .sort((a, b) => b._score - a._score);
}

export function intakeMatches(
  scholarship: Scholarship,
  selectedIntake: string | null | undefined
): boolean {
  if (!selectedIntake) return true;
  if (!scholarship.intake || scholarship.intake === 'Any') return true;
  return scholarship.intake.toLowerCase().includes(selectedIntake.toLowerCase());
}
