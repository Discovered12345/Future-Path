interface CollegeApiResponse {
  metadata: {
    page: number;
    per_page: number;
    total: number;
  };
  results: CollegeData[];
}

interface CollegeData {
  id: number;
  'school.name': string;
  'school.city': string;
  'school.state': string;
  'school.zip': string;
  'school.school_url': string;
  'school.price_calculator_url': string;
  'school.ownership': number;
  'latest.admissions.admission_rate.overall': number;
  'latest.student.size': number;
  'latest.cost.tuition.in_state': number;
  'latest.cost.tuition.out_of_state': number;
  'latest.admissions.sat_scores.average.overall': number;
  'latest.admissions.act_scores.midpoint.cumulative': number;
  'latest.academics.program_percentage.business_marketing': number;
  'latest.academics.program_percentage.engineering': number;
  'latest.academics.program_percentage.computer': number;
  'latest.academics.program_percentage.health': number;
  'latest.academics.program_percentage.psychology': number;
  'latest.academics.program_percentage.social_science': number;
  'latest.academics.program_percentage.biological': number;
  'latest.academics.program_percentage.visual_performing': number;
  'latest.academics.program_percentage.education': number;
  'latest.academics.program_percentage.english': number;
}

export interface College {
  id: number;
  name: string;
  location: string;
  state: string;
  city: string;
  zip: string;
  website: string;
  priceCalculatorUrl: string;
  admissionRate: number;
  studentSize: number;
  tuitionInState: number;
  tuitionOutOfState: number;
  averageSAT: number;
  averageACT: number;
  topPrograms: string[];
  type: 'Public' | 'Private' | 'For-Profit';
  size: 'Small' | 'Medium' | 'Large';
  matchScore?: number;
}

class CollegeApiService {
  private baseUrl = 'https://api.data.gov/ed/collegescorecard/v1/schools';
  private apiKey = import.meta.env.VITE_COLLEGE_SCORECARD_API_KEY;

  private buildUrl(params: Record<string, any>): string {
    const url = new URL(this.baseUrl);
    
    // Add API key if available
    if (this.apiKey) {
      url.searchParams.append('api_key', this.apiKey);
    } else {
      // Use demo key if no API key is provided
      url.searchParams.append('api_key', 'DEMO_KEY');
    }
    
    // Add default fields we want
    const fields = [
      'id',
      'school.name',
      'school.city',
      'school.state',
      'school.zip',
      'school.school_url',
      'school.price_calculator_url',
      'school.ownership',
      'latest.admissions.admission_rate.overall',
      'latest.student.size',
      'latest.cost.tuition.in_state',
      'latest.cost.tuition.out_of_state',
      'latest.admissions.sat_scores.average.overall',
      'latest.admissions.act_scores.midpoint.cumulative',
      'latest.academics.program_percentage.business_marketing',
      'latest.academics.program_percentage.engineering',
      'latest.academics.program_percentage.computer',
      'latest.academics.program_percentage.health',
      'latest.academics.program_percentage.psychology',
      'latest.academics.program_percentage.social_science',
      'latest.academics.program_percentage.biological',
      'latest.academics.program_percentage.visual_performing',
      'latest.academics.program_percentage.education',
      'latest.academics.program_percentage.english'
    ];
    
    url.searchParams.append('fields', fields.join(','));
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value.toString());
      }
    });
    
    return url.toString();
  }

  private transformCollegeData(data: CollegeData): College {
    const getTopPrograms = (data: CollegeData): string[] => {
      const programs = [
        { name: 'Business & Marketing', percentage: data['latest.academics.program_percentage.business_marketing'] },
        { name: 'Engineering', percentage: data['latest.academics.program_percentage.engineering'] },
        { name: 'Computer Science', percentage: data['latest.academics.program_percentage.computer'] },
        { name: 'Health Sciences', percentage: data['latest.academics.program_percentage.health'] },
        { name: 'Psychology', percentage: data['latest.academics.program_percentage.psychology'] },
        { name: 'Social Sciences', percentage: data['latest.academics.program_percentage.social_science'] },
        { name: 'Biological Sciences', percentage: data['latest.academics.program_percentage.biological'] },
        { name: 'Visual & Performing Arts', percentage: data['latest.academics.program_percentage.visual_performing'] },
        { name: 'Education', percentage: data['latest.academics.program_percentage.education'] },
        { name: 'English & Literature', percentage: data['latest.academics.program_percentage.english'] }
      ];
      
      return programs
        .filter(p => p.percentage && p.percentage > 0.05) // At least 5% of students
        .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
        .slice(0, 4)
        .map(p => p.name);
    };

    const getCollegeSize = (size: number): 'Small' | 'Medium' | 'Large' => {
      if (size < 5000) return 'Small';
      if (size < 15000) return 'Medium';
      return 'Large';
    };

    const getCollegeType = (ownership: number): 'Public' | 'Private' | 'For-Profit' => {
      switch (ownership) {
        case 1: return 'Public';
        case 2: return 'Private';
        case 3: return 'For-Profit';
        default: return 'Private';
      }
    };

    return {
      id: data.id,
      name: data['school.name'] || 'Unknown',
      location: `${data['school.city'] || ''}, ${data['school.state'] || ''}`.trim().replace(/^,\s*/, ''),
      state: data['school.state'] || '',
      city: data['school.city'] || '',
      zip: data['school.zip'] || '',
      website: data['school.school_url'] || '',
      priceCalculatorUrl: data['school.price_calculator_url'] || '',
      admissionRate: (data['latest.admissions.admission_rate.overall'] || 0) * 100,
      studentSize: data['latest.student.size'] || 0,
      tuitionInState: data['latest.cost.tuition.in_state'] || 0,
      tuitionOutOfState: data['latest.cost.tuition.out_of_state'] || 0,
      averageSAT: data['latest.admissions.sat_scores.average.overall'] || 0,
      averageACT: data['latest.admissions.act_scores.midpoint.cumulative'] || 0,
      topPrograms: getTopPrograms(data),
      type: getCollegeType(data['school.ownership']),
      size: getCollegeSize(data['latest.student.size'] || 0)
    };
  }

  async searchColleges(query: {
    name?: string;
    state?: string;
    city?: string;
    maxTuition?: number;
    minSize?: number;
    maxSize?: number;
    ownership?: number; // 1=Public, 2=Private, 3=For-Profit
    page?: number;
    perPage?: number;
  }): Promise<{ colleges: College[]; total: number; page: number }> {
    try {
      const params: Record<string, any> = {
        per_page: query.perPage || 20,
        page: query.page || 0
      };

      // Add search filters
      if (query.name) {
        params['school.name'] = query.name;
      }
      
      if (query.state && query.state !== 'all') {
        params['school.state'] = query.state.toUpperCase();
      }
      
      if (query.city) {
        params['school.city'] = query.city;
      }
      
      if (query.maxTuition) {
        params['latest.cost.tuition.out_of_state__lte'] = query.maxTuition;
      }
      
      if (query.minSize) {
        params['latest.student.size__gte'] = query.minSize;
      }
      
      if (query.maxSize) {
        params['latest.student.size__lte'] = query.maxSize;
      }

      if (query.ownership) {
        params['school.ownership'] = query.ownership;
      }

      // Only include currently operating schools with students
      params['latest.student.size__gt'] = 0;
      params['school.operating'] = 1;

      // Sort by student size (larger schools first) for better results
      params['sort'] = 'latest.student.size:desc';

      const url = this.buildUrl(params);
      console.log('College API URL:', url); // For debugging
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`College API error: ${response.status} - ${response.statusText}`);
      }

      const data: CollegeApiResponse = await response.json();
      
      const colleges = data.results
        .filter(college => college['school.name'] && college['latest.student.size'] > 0) // Filter out colleges without names or students
        .map(college => this.transformCollegeData(college));

      return {
        colleges,
        total: data.metadata.total,
        page: data.metadata.page
      };
    } catch (error) {
      console.error('Error searching colleges:', error);
      throw new Error('Failed to search colleges. Please check your internet connection and try again.');
    }
  }

  async getCollegeById(id: number): Promise<College | null> {
    try {
      const params = { 'id': id };
      const url = this.buildUrl(params);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`College API error: ${response.status}`);
      }

      const data: CollegeApiResponse = await response.json();
      
      if (data.results.length === 0) {
        return null;
      }

      return this.transformCollegeData(data.results[0]);
    } catch (error) {
      console.error('Error fetching college:', error);
      return null;
    }
  }

  async getCollegesByState(state: string, limit: number = 50): Promise<College[]> {
    try {
      const result = await this.searchColleges({
        state,
        perPage: limit
      });
      return result.colleges;
    } catch (error) {
      console.error('Error fetching colleges by state:', error);
      return [];
    }
  }

  async getPopularColleges(limit: number = 20): Promise<College[]> {
    try {
      // Get popular colleges by sorting by student size
      const result = await this.searchColleges({
        perPage: limit,
        minSize: 10000 // Large colleges tend to be well-known
      });
      return result.colleges;
    } catch (error) {
      console.error('Error fetching popular colleges:', error);
      return [];
    }
  }

  async searchCollegesByMajor(major: string, limit: number = 20): Promise<College[]> {
    try {
      // Map common majors to program percentage fields
      const majorMappings: Record<string, string> = {
        'business': 'latest.academics.program_percentage.business_marketing__gte',
        'engineering': 'latest.academics.program_percentage.engineering__gte',
        'computer science': 'latest.academics.program_percentage.computer__gte',
        'health': 'latest.academics.program_percentage.health__gte',
        'psychology': 'latest.academics.program_percentage.psychology__gte',
        'social science': 'latest.academics.program_percentage.social_science__gte',
        'biology': 'latest.academics.program_percentage.biological__gte',
        'arts': 'latest.academics.program_percentage.visual_performing__gte',
        'education': 'latest.academics.program_percentage.education__gte',
        'english': 'latest.academics.program_percentage.english__gte'
      };

      const params: Record<string, any> = {
        per_page: limit
      };

      // Find matching major field
      const majorKey = Object.keys(majorMappings).find(key => 
        major.toLowerCase().includes(key)
      );

      if (majorKey) {
        params[majorMappings[majorKey]] = 0.1; // At least 10% of students in this major
      }

      const result = await this.searchColleges(params);
      return result.colleges;
    } catch (error) {
      console.error('Error searching colleges by major:', error);
      return [];
    }
  }
}

export const collegeApiService = new CollegeApiService();