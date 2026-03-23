/**
 * Returns the maximum scores for periodic test and exam
 * based on the student's class.
 *
 * JSS1 – JSS3 and SS1 – SS3: test max = 40, exam max = 60
 * All other classes:           test max = 30, exam max = 70
 */

const SECONDARY_CLASSES = ['jss1', 'jss2', 'jss3', 'ss1', 'ss2', 'ss3'];

export function getMaxScores(className: string): { testMax: number; examMax: number } {
  const normalised = className.trim().toLowerCase();
  if (SECONDARY_CLASSES.includes(normalised)) {
    return { testMax: 40, examMax: 60 };
  }
  return { testMax: 30, examMax: 70 };
}
