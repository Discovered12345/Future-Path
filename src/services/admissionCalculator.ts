import { geminiService } from './gemini';
import { AcademicProfile } from '../hooks/useAcademicProfile';

interface AdmissionAnalysis {
  admissionChance: number;
  chanceCategory: 'Safety' | 'Target' | 'Reach';
  strengths: string[];
  improvements: string[];
  reasoning: string;
}

class AdmissionCalculatorService {
  async calculateAdmissionChance(
    college: any, 
    profile: AcademicProfile
  ): Promise<AdmissionAnalysis> {
    try {
      // Use AI for more sophisticated analysis
      const aiAnalysis = await this.getAIAnalysis(college, profile);
      if (aiAnalysis) {
        return aiAnalysis;
      }
    } catch (error) {
      console.warn('AI analysis failed, falling back to statistical model:', error);
    }

    // Fallback to statistical model
    return this.getStatisticalAnalysis(college, profile);
  }

  private async getAIAnalysis(
    college: any, 
    profile: AcademicProfile
  ): Promise<AdmissionAnalysis | null> {
    try {
      const prompt = `You are an expert college admissions counselor. Analyze this student's admission chances to the specified college and provide a detailed assessment.

COLLEGE INFORMATION:
- Name: ${college.name}
- Acceptance Rate: ${college.acceptanceRate}%
- Average SAT: ${college.averageSAT}
- Type: ${college.type}
- Location: ${college.location}

STUDENT PROFILE:
- GPA: ${profile.gpa}/4.0
- SAT Score: ${profile.sat_score || 'Not taken'}
- ACT Score: ${profile.act_score || 'Not taken'}
- Class Rank: ${profile.class_rank}/${profile.class_size}
- Intended Major: ${profile.intended_major || 'Undecided'}
- AP Courses: ${profile.ap_courses.length} (${profile.ap_courses.join(', ') || 'None'})
- Honors Courses: ${profile.honors_courses.length} (${profile.honors_courses.join(', ') || 'None'})
- Extracurriculars: ${profile.extracurriculars.join(', ') || 'None listed'}
- Achievements: ${profile.achievements.join(', ') || 'None listed'}
- Leadership Roles: ${profile.leadership_roles.length}
- Work Experience: ${profile.work_experience.length}
- Volunteer Hours: ${profile.volunteer_hours}

Please provide your analysis in this exact JSON format:
{
  "admissionChance": [number between 5-95],
  "chanceCategory": "[Safety/Target/Reach]",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2"],
  "reasoning": "Brief explanation of the assessment considering academic stats, extracurriculars, and college selectivity"
}

Consider:
1. Academic fit (GPA, test scores vs college averages)
2. Extracurricular strength and leadership
3. Course rigor (AP/Honors)
4. College selectivity and acceptance rate
5. Major competitiveness
6. Geographic factors
7. Overall profile strength

Be realistic but encouraging. Safety = 70%+, Target = 40-70%, Reach = <40%.`;

      const response = await geminiService.generateResponse([
        { role: 'user', content: prompt }
      ]);

      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        
        // Validate the response structure
        if (analysis.admissionChance && analysis.chanceCategory && 
            analysis.strengths && analysis.improvements && analysis.reasoning) {
          return {
            admissionChance: Math.max(5, Math.min(95, analysis.admissionChance)),
            chanceCategory: analysis.chanceCategory,
            strengths: analysis.strengths.slice(0, 4), // Limit to 4 strengths
            improvements: analysis.improvements.slice(0, 3), // Limit to 3 improvements
            reasoning: analysis.reasoning
          };
        }
      }

      return null;
    } catch (error) {
      console.error('AI analysis error:', error);
      return null;
    }
  }

  private getStatisticalAnalysis(
    college: any, 
    profile: AcademicProfile
  ): AdmissionAnalysis {
    let chance = 50; // Base chance
    const strengths: string[] = [];
    const improvements: string[] = [];
    
    // GPA Analysis (40% weight)
    const estimatedCollegeGPA = Math.max(2.5, 4.0 - (college.acceptanceRate / 100) * 1.5);
    if (profile.gpa >= estimatedCollegeGPA + 0.3) {
      chance += 20;
      strengths.push('Strong GPA above college average');
    } else if (profile.gpa >= estimatedCollegeGPA) {
      chance += 10;
      strengths.push('Competitive GPA');
    } else if (profile.gpa < estimatedCollegeGPA - 0.3) {
      chance -= 20;
      improvements.push('Improve GPA to be more competitive');
    }
    
    // Test Scores (30% weight)
    const collegeSATMin = parseInt(college.averageSAT.split('-')[0]);
    const studentSAT = profile.sat_score || (profile.act_score * 40 + 150); // ACT to SAT conversion
    
    if (studentSAT > 0) {
      if (studentSAT >= collegeSATMin + 100) {
        chance += 15;
        strengths.push('Excellent test scores');
      } else if (studentSAT >= collegeSATMin - 50) {
        chance += 5;
        strengths.push('Competitive test scores');
      } else if (studentSAT < collegeSATMin - 100) {
        chance -= 15;
        improvements.push('Consider retaking SAT/ACT for higher scores');
      }
    } else {
      improvements.push('Take SAT or ACT for better evaluation');
    }
    
    // Course Rigor (15% weight)
    const totalRigorousCourses = profile.ap_courses.length + profile.honors_courses.length;
    if (totalRigorousCourses >= 8) {
      chance += 10;
      strengths.push('Excellent course rigor with many AP/Honors classes');
    } else if (totalRigorousCourses >= 4) {
      chance += 5;
      strengths.push('Good course rigor');
    } else if (totalRigorousCourses < 2) {
      improvements.push('Take more AP or Honors courses');
    }
    
    // Extracurriculars and Leadership (10% weight)
    const activityScore = profile.extracurriculars.length + 
                         profile.leadership_roles.length * 2 + 
                         profile.work_experience.length;
    if (activityScore >= 8) {
      chance += 8;
      strengths.push('Strong extracurricular involvement and leadership');
    } else if (activityScore >= 4) {
      chance += 4;
    } else {
      improvements.push('Increase extracurricular involvement and seek leadership roles');
    }
    
    // Achievements and Awards (5% weight)
    if (profile.achievements.length >= 3) {
      chance += 5;
      strengths.push('Notable achievements and awards');
    } else if (profile.achievements.length === 0) {
      improvements.push('Pursue academic or extracurricular achievements');
    }
    
    // Acceptance rate factor
    chance = chance * (college.acceptanceRate / 100) * 2;
    
    // Class rank bonus
    if (profile.class_rank > 0 && profile.class_size > 0) {
      const percentile = (profile.class_size - profile.class_rank) / profile.class_size;
      if (percentile >= 0.9) {
        chance += 10;
        strengths.push('Top 10% class rank');
      } else if (percentile >= 0.75) {
        chance += 5;
        strengths.push('Top 25% class rank');
      }
    }
    
    // Volunteer work bonus
    if (profile.volunteer_hours >= 100) {
      chance += 3;
      strengths.push('Significant community service');
    }
    
    // Cap between 5% and 95%
    chance = Math.max(5, Math.min(95, Math.round(chance)));
    
    // Determine category
    let chanceCategory: 'Safety' | 'Target' | 'Reach';
    if (chance >= 70) {
      chanceCategory = 'Safety';
    } else if (chance >= 40) {
      chanceCategory = 'Target';
    } else {
      chanceCategory = 'Reach';
    }
    
    // Ensure we have some content
    if (strengths.length === 0) {
      strengths.push('Solid academic foundation');
    }
    if (improvements.length === 0) {
      improvements.push('Continue maintaining strong academic performance');
    }
    
    const reasoning = `Based on your ${profile.gpa} GPA, ${studentSAT > 0 ? studentSAT + ' SAT score' : 'test scores'}, and ${totalRigorousCourses} rigorous courses, compared to ${college.name}'s ${college.acceptanceRate}% acceptance rate, you have a ${chance}% admission chance. This makes it a ${chanceCategory.toLowerCase()} school for your profile.`;
    
    return {
      admissionChance: chance,
      chanceCategory,
      strengths: strengths.slice(0, 4),
      improvements: improvements.slice(0, 3),
      reasoning
    };
  }
}

export const admissionCalculator = new AdmissionCalculatorService();