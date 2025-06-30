import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, GraduationCap, MapPin, Users, DollarSign, Star, TrendingUp, Award, BookOpen, Heart, ExternalLink, Trash2, AlertCircle, Loader2, Edit, Save, X, CheckCircle, Target, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserStats } from '../hooks/useUserStats';
import { useAcademicProfile } from '../hooks/useAcademicProfile';
import { collegeApiService, College } from '../services/collegeApi';
import { admissionCalculator } from '../services/admissionCalculator';
import { supabase } from '../lib/supabase';

interface CollegeWithAdmission extends College {
  admissionChance?: number;
  chanceCategory?: 'Safety' | 'Target' | 'Reach';
  isSaved?: boolean;
  imageUrl?: string;
}

// Top 20 colleges with real data and your specified images
const TOP_COLLEGES: CollegeWithAdmission[] = [
  {
    id: 1,
    name: "Harvard University",
    location: "Cambridge, MA",
    state: "MA",
    city: "Cambridge",
    zip: "02138",
    website: "https://www.harvard.edu",
    priceCalculatorUrl: "https://college.harvard.edu/financial-aid/net-price-calculator",
    admissionRate: 3.4,
    studentSize: 23000,
    tuitionInState: 57261,
    tuitionOutOfState: 57261,
    averageSAT: 1520,
    averageACT: 34,
    topPrograms: ["Economics", "Government", "Computer Science", "Psychology"],
    type: "Private",
    size: "Large",
    imageUrl: "https://images.unsplash.com/photo-1622397333309-3056849bc70b?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGFydmFyZCUyMHVuaXZlcnNpdHl8ZW58MHx8MHx8fDA%3D"
  },
  {
    id: 2,
    name: "Stanford University",
    location: "Stanford, CA",
    state: "CA",
    city: "Stanford",
    zip: "94305",
    website: "https://www.stanford.edu",
    priceCalculatorUrl: "https://financialaid.stanford.edu/undergrad/how/calculator/",
    admissionRate: 3.9,
    studentSize: 17000,
    tuitionInState: 56169,
    tuitionOutOfState: 56169,
    averageSAT: 1510,
    averageACT: 34,
    topPrograms: ["Engineering", "Computer Science", "Business", "Biology"],
    type: "Private",
    size: "Large",
    imageUrl: "https://olmsted.org/wp-content/uploads/2023/06/Main-Quad-from-Palm-Dive-by-Linda-Cicero.png"
  },
  {
    id: 3,
    name: "Massachusetts Institute of Technology",
    location: "Cambridge, MA",
    state: "MA",
    city: "Cambridge",
    zip: "02139",
    website: "https://www.mit.edu",
    priceCalculatorUrl: "https://sfs.mit.edu/undergraduate-financial-aid/the-cost-of-attendance/",
    admissionRate: 4.1,
    studentSize: 11520,
    tuitionInState: 57986,
    tuitionOutOfState: 57986,
    averageSAT: 1535,
    averageACT: 35,
    topPrograms: ["Engineering", "Computer Science", "Physics", "Mathematics"],
    type: "Private",
    size: "Medium",
    imageUrl: "https://assets.amazon.science/dims4/default/263512f/2147483647/strip/true/crop/1552x873+93+0/resize/1200x675!/quality/90/?url=http%3A%2F%2Famazon-topics-brightspot.s3.amazonaws.com%2Fscience%2Fa8%2F54%2F7c5f06444330a846b68cce8792cb%2Fmit-campus.jpg"
  },
  {
    id: 4,
    name: "Yale University",
    location: "New Haven, CT",
    state: "CT",
    city: "New Haven",
    zip: "06520",
    website: "https://www.yale.edu",
    priceCalculatorUrl: "https://finaid.yale.edu/costs-affordability/cost-attendance",
    admissionRate: 4.6,
    studentSize: 13433,
    tuitionInState: 62250,
    tuitionOutOfState: 62250,
    averageSAT: 1515,
    averageACT: 34,
    topPrograms: ["Economics", "Political Science", "History", "Psychology"],
    type: "Private",
    size: "Medium",
    imageUrl: "https://www.sparkadmissions.com/wp-content/uploads/2020/03/Yale_Acceptance_Rate.jpg"
  },
  {
    id: 5,
    name: "Princeton University",
    location: "Princeton, NJ",
    state: "NJ",
    city: "Princeton",
    zip: "08544",
    website: "https://www.princeton.edu",
    priceCalculatorUrl: "https://www.princeton.edu/meet-princeton/facts-figures/tuition-aid",
    admissionRate: 4.0,
    studentSize: 5428,
    tuitionInState: 57410,
    tuitionOutOfState: 57410,
    averageSAT: 1520,
    averageACT: 34,
    topPrograms: ["Economics", "Engineering", "Public Policy", "Computer Science"],
    type: "Private",
    size: "Small",
    imageUrl: "https://empowerly.com/nitropack_static/fNwAVEdhfyTXoxrEPpRwhOKFWOKqLsNg/assets/images/optimized/rev-536f587/empowerly.com/wp-content/uploads/2023/01/princeton_university-1024x768.png"
  },
  {
    id: 6,
    name: "University of Chicago",
    location: "Chicago, IL",
    state: "IL",
    city: "Chicago",
    zip: "60637",
    website: "https://www.uchicago.edu",
    priceCalculatorUrl: "https://collegeadmissions.uchicago.edu/costs-aid/net-price-calculator",
    admissionRate: 5.4,
    studentSize: 17834,
    tuitionInState: 62940,
    tuitionOutOfState: 62940,
    averageSAT: 1520,
    averageACT: 34,
    topPrograms: ["Economics", "Mathematics", "Political Science", "Biology"],
    type: "Private",
    size: "Large",
    imageUrl: "https://a.storyblok.com/f/64062/1920x800/35cb4f4c4b/uchicago-banner.jpg"
  },
  {
    id: 7,
    name: "Columbia University",
    location: "New York, NY",
    state: "NY",
    city: "New York",
    zip: "10027",
    website: "https://www.columbia.edu",
    priceCalculatorUrl: "https://cc-seas.financialaid.columbia.edu/how/calculator",
    admissionRate: 3.7,
    studentSize: 33413,
    tuitionInState: 65524,
    tuitionOutOfState: 65524,
    averageSAT: 1510,
    averageACT: 34,
    topPrograms: ["Engineering", "Economics", "Political Science", "English"],
    type: "Private",
    size: "Large",
    imageUrl: "https://www.columbia.edu/content/sites/default/files/styles/cu_crop/public/content/Campus%20Images/Low_Library_NYC_skyline_night_lights.jpg?h=df0fa240&itok=M4yELnWC"
  },
  {
    id: 8,
    name: "University of Pennsylvania",
    location: "Philadelphia, PA",
    state: "PA",
    city: "Philadelphia",
    zip: "19104",
    website: "https://www.upenn.edu",
    priceCalculatorUrl: "https://www.sfs.upenn.edu/paying/net-price-calculator",
    admissionRate: 5.7,
    studentSize: 28201,
    tuitionInState: 63452,
    tuitionOutOfState: 63452,
    averageSAT: 1510,
    averageACT: 34,
    topPrograms: ["Business", "Engineering", "Economics", "Nursing"],
    type: "Private",
    size: "Large",
    imageUrl: "https://www.lps.upenn.edu/sites/default/files/2020-03/about-lps-campus-life.jpg"
  },
  {
    id: 9,
    name: "Dartmouth College",
    location: "Hanover, NH",
    state: "NH",
    city: "Hanover",
    zip: "03755",
    website: "https://www.dartmouth.edu",
    priceCalculatorUrl: "https://www.dartmouth.edu/admissions/cost-aid/calculator/",
    admissionRate: 6.2,
    studentSize: 6761,
    tuitionInState: 62430,
    tuitionOutOfState: 62430,
    averageSAT: 1500,
    averageACT: 33,
    topPrograms: ["Economics", "Government", "Engineering", "Psychology"],
    type: "Private",
    size: "Medium",
    imageUrl: "https://i.abcnewsfe.com/a/4c8b2cd5-b3c9-498a-8fcd-91036dfe3264/Dartmouth-2-gty-jm-240206_1707228115723_hpEmbed_3x2.jpg"
  },
  {
    id: 10,
    name: "Brown University",
    location: "Providence, RI",
    state: "RI",
    city: "Providence",
    zip: "02912",
    website: "https://www.brown.edu",
    priceCalculatorUrl: "https://www.brown.edu/admission/undergraduate/cost-aid/net-price-calculator",
    admissionRate: 5.4,
    studentSize: 10696,
    tuitionInState: 65656,
    tuitionOutOfState: 65656,
    averageSAT: 1510,
    averageACT: 34,
    topPrograms: ["Computer Science", "Economics", "Biology", "International Relations"],
    type: "Private",
    size: "Medium",
    imageUrl: "https://www.appily.com/sites/default/files/styles/max_1200/public/images/hero/college/217156_hero.jpg?itok=p20i-w6v"
  },
  {
    id: 11,
    name: "Cornell University",
    location: "Ithaca, NY",
    state: "NY",
    city: "Ithaca",
    zip: "14853",
    website: "https://www.cornell.edu",
    priceCalculatorUrl: "https://www.finaid.cornell.edu/cost-attend/net-price-calculator",
    admissionRate: 8.7,
    studentSize: 25593,
    tuitionInState: 63200,
    tuitionOutOfState: 63200,
    averageSAT: 1480,
    averageACT: 33,
    topPrograms: ["Engineering", "Agriculture", "Business", "Veterinary Medicine"],
    type: "Private",
    size: "Large",
    imageUrl: "https://www.metromont.com/wp-content/uploads/elementor/thumbs/11010-21_web-q6bhk5x11m808jqtxm9v7xofbmgjwww9ypaguik5k8.jpg"
  },
  {
    id: 12,
    name: "Duke University",
    location: "Durham, NC",
    state: "NC",
    city: "Durham",
    zip: "27708",
    website: "https://www.duke.edu",
    priceCalculatorUrl: "https://financialaid.duke.edu/undergraduate/cost",
    admissionRate: 6.2,
    studentSize: 17148,
    tuitionInState: 63450,
    tuitionOutOfState: 63450,
    averageSAT: 1520,
    averageACT: 34,
    topPrograms: ["Economics", "Public Policy", "Biology", "Psychology"],
    type: "Private",
    size: "Large",
    imageUrl: "https://questbridge.imgix.net/content/uploads/partners/duke-university/20240422_chapel_sunset002-2.jpg?auto=compress%2Cformat&fit=clip&q=90&w=1600&s=d01dbbb4914be12e07efa3d65aae54f2"
  },
  {
    id: 13,
    name: "Northwestern University",
    location: "Evanston, IL",
    state: "IL",
    city: "Evanston",
    zip: "60208",
    website: "https://www.northwestern.edu",
    priceCalculatorUrl: "https://undergradaid.northwestern.edu/net-price-calculator/",
    admissionRate: 7.0,
    studentSize: 22603,
    tuitionInState: 63983,
    tuitionOutOfState: 63983,
    averageSAT: 1490,
    averageACT: 33,
    topPrograms: ["Engineering", "Economics", "Journalism", "Psychology"],
    type: "Private",
    size: "Large",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Northwestern_University_Aerial.jpg/500px-Northwestern_University_Aerial.jpg"
  },
  {
    id: 14,
    name: "Johns Hopkins University",
    location: "Baltimore, MD",
    state: "MD",
    city: "Baltimore",
    zip: "21218",
    website: "https://www.jhu.edu",
    priceCalculatorUrl: "https://finaid.jhu.edu/net-price-calculator/",
    admissionRate: 7.3,
    studentSize: 28890,
    tuitionInState: 62840,
    tuitionOutOfState: 62840,
    averageSAT: 1520,
    averageACT: 34,
    topPrograms: ["Biomedical Engineering", "Public Health", "International Studies", "Medicine"],
    type: "Private",
    size: "Large",
    imageUrl: "https://www.cumuonline.org/wp-content/uploads/2018/07/johns-hopkins-university.jpeg"
  },
  {
    id: 15,
    name: "California Institute of Technology",
    location: "Pasadena, CA",
    state: "CA",
    city: "Pasadena",
    zip: "91125",
    website: "https://www.caltech.edu",
    priceCalculatorUrl: "https://www.caltech.edu/about/news/financial-aid-calculator",
    admissionRate: 3.9,
    studentSize: 2397,
    tuitionInState: 60864,
    tuitionOutOfState: 60864,
    averageSAT: 1560,
    averageACT: 35,
    topPrograms: ["Engineering", "Physics", "Mathematics", "Computer Science"],
    type: "Private",
    size: "Small",
    imageUrl: "https://caltech-prod.s3.amazonaws.com/main/images/2021-Campus-Aerials-00513-WE.336e18bc.fill-1600x810-c100.jpg"
  },
  {
    id: 16,
    name: "University of California, Berkeley",
    location: "Berkeley, CA",
    state: "CA",
    city: "Berkeley",
    zip: "94720",
    website: "https://www.berkeley.edu",
    priceCalculatorUrl: "https://financialaid.berkeley.edu/cost-attendance",
    admissionRate: 11.4,
    studentSize: 45057,
    tuitionInState: 14226,
    tuitionOutOfState: 44007,
    averageSAT: 1430,
    averageACT: 32,
    topPrograms: ["Engineering", "Computer Science", "Business", "Economics"],
    type: "Public",
    size: "Large",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/da/cc/cd/campanile-tower-uc-berkeley.jpg?w=1100&h=1100&s=1"
  },
  {
    id: 17,
    name: "University of California, Los Angeles",
    location: "Los Angeles, CA",
    state: "CA",
    city: "Los Angeles",
    zip: "90095",
    website: "https://www.ucla.edu",
    priceCalculatorUrl: "https://www.financialaid.ucla.edu/net-price-calculator",
    admissionRate: 9.0,
    studentSize: 47518,
    tuitionInState: 13804,
    tuitionOutOfState: 43473,
    averageSAT: 1430,
    averageACT: 32,
    topPrograms: ["Business Economics", "Psychology", "Political Science", "Engineering"],
    type: "Public",
    size: "Large",
    imageUrl: "https://media.nbclosangeles.com/2019/09/GettyImages-606330033-1.jpg?quality=85&strip=all&crop=0px%2C99px%2C5616px%2C3159px&resize=1200%2C675"
  },
  {
    id: 18,
    name: "University of Southern California",
    location: "Los Angeles, CA",
    state: "CA",
    city: "Los Angeles",
    zip: "90089",
    website: "https://www.usc.edu",
    priceCalculatorUrl: "https://financialaid.usc.edu/undergraduates/prospective/calculator.html",
    admissionRate: 12.0,
    studentSize: 47310,
    tuitionInState: 64726,
    tuitionOutOfState: 64726,
    averageSAT: 1470,
    averageACT: 33,
    topPrograms: ["Business", "Engineering", "Communications", "Film"],
    type: "Private",
    size: "Large",
    imageUrl: "https://employees.usc.edu/wp-content/uploads/2024/05/USC-EG-GC-Campus-3@2x.jpg"
  },
  {
    id: 19,
    name: "Carnegie Mellon University",
    location: "Pittsburgh, PA",
    state: "PA",
    city: "Pittsburgh",
    zip: "15213",
    website: "https://www.cmu.edu",
    priceCalculatorUrl: "https://www.cmu.edu/sfs/financial-aid/undergraduate/calculator/",
    admissionRate: 11.3,
    studentSize: 15818,
    tuitionInState: 63829,
    tuitionOutOfState: 63829,
    averageSAT: 1520,
    averageACT: 34,
    topPrograms: ["Computer Science", "Engineering", "Business", "Drama"],
    type: "Private",
    size: "Large",
    imageUrl: "https://f50d772ec1e2a4347264-964b3324d77f313a724faa237152e95f.ssl.cf2.rackcdn.com/stories/202410090066/1140x_a10-7_cTC/20200415arCMUAerial_1743150668.jpg"
  },
  {
    id: 20,
    name: "University of Michigan",
    location: "Ann Arbor, MI",
    state: "MI",
    city: "Ann Arbor",
    zip: "48109",
    website: "https://www.umich.edu",
    priceCalculatorUrl: "https://finaid.umich.edu/net-price-calculator/",
    admissionRate: 18.0,
    studentSize: 51225,
    tuitionInState: 17786,
    tuitionOutOfState: 57273,
    averageSAT: 1450,
    averageACT: 33,
    topPrograms: ["Engineering", "Business", "Psychology", "Economics"],
    type: "Public",
    size: "Large",
    imageUrl: "https://cdn.sanity.io/images/anl9abaw/production/30a630d2f8561a88c748ba17d6456997b269a7a2-1920x1280.png?w=3840&q=75&fit=clip&auto=format"
  }
];

export default function CollegeMatching() {
  const { user } = useAuth();
  const { incrementStat } = useUserStats();
  const { profile: academicProfile } = useAcademicProfile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [maxTuition, setMaxTuition] = useState('all');
  const [colleges, setColleges] = useState<CollegeWithAdmission[]>(TOP_COLLEGES);
  const [savedColleges, setSavedColleges] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<CollegeWithAdmission | null>(null);
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [admissionAnalysis, setAdmissionAnalysis] = useState<any>(null);
  const [analyzingAdmission, setAnalyzingAdmission] = useState(false);
  const [showAcademicProfile, setShowAcademicProfile] = useState(false);

  // Load saved colleges
  useEffect(() => {
    if (user) {
      loadSavedColleges();
    }
  }, [user]);

  const loadSavedColleges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_colleges')
        .select('college_id, college_name')
        .eq('user_id', user.id)
        .is('deleted_at', null);

      if (error) {
        console.error('Error loading saved colleges:', error);
        return;
      }

      if (data) {
        setSavedColleges(data.map(item => ({
          id: item.college_id,
          name: item.college_name
        })));
        
        // Update isSaved flag for any loaded colleges
        setColleges(prev => prev.map(college => ({
          ...college,
          isSaved: data.some(saved => saved.college_id === college.id)
        })));
      }
    } catch (error) {
      console.error('Error loading saved colleges:', error);
    }
  };

  const handleSaveCollege = async (college: CollegeWithAdmission) => {
    if (!user) return;

    try {
      // Check if already saved
      if (college.isSaved) {
        // Remove from saved colleges
        const { error } = await supabase
          .from('saved_colleges')
          .update({ deleted_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('college_id', college.id);

        if (error) {
          console.error('Error removing college from saved list:', error);
          return;
        }

        // Update local state
        setSavedColleges(prev => prev.filter(saved => saved.id !== college.id));
        setColleges(prev => prev.map(c => 
          c.id === college.id ? { ...c, isSaved: false } : c
        ));
        
        // Update selected college if it's the one being unsaved
        if (selectedCollege && selectedCollege.id === college.id) {
          setSelectedCollege({ ...selectedCollege, isSaved: false });
        }
      } else {
        // Add to saved colleges
        const { error } = await supabase
          .from('saved_colleges')
          .upsert({
            user_id: user.id,
            college_id: college.id,
            college_name: college.name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error saving college:', error);
          return;
        }

        // Update local state
        setSavedColleges(prev => [...prev, { id: college.id, name: college.name }]);
        setColleges(prev => prev.map(c => 
          c.id === college.id ? { ...c, isSaved: true } : c
        ));
        
        // Update selected college if it's the one being saved
        if (selectedCollege && selectedCollege.id === college.id) {
          setSelectedCollege({ ...selectedCollege, isSaved: true });
        }
        
        // Increment stat
        incrementStat('opportunitiesFound', 1, `Saved college: ${college.name}`, 'opportunity');
      }
    } catch (error) {
      console.error('Error saving/removing college:', error);
    }
  };

  const analyzeAdmissionChances = async (college: CollegeWithAdmission) => {
    if (!academicProfile) {
      alert('Please complete your academic profile first to get admission analysis!');
      setShowAcademicProfile(true);
      return;
    }
    
    setSelectedCollege(college);
    setShowAdmissionModal(true);
    setAnalyzingAdmission(true);
    
    try {
      const analysis = await admissionCalculator.calculateAdmissionChance(college, academicProfile);
      setAdmissionAnalysis(analysis);
    } catch (error) {
      console.error('Error calculating admission chances:', error);
      setAdmissionAnalysis({
        admissionChance: 50,
        chanceCategory: 'Target',
        strengths: ['Unable to analyze strengths'],
        improvements: ['Unable to analyze improvements'],
        reasoning: 'Could not calculate detailed admission chances. Please try again later.'
      });
    } finally {
      setAnalyzingAdmission(false);
    }
  };

  const handleSearch = () => {
    const filtered = TOP_COLLEGES.filter(college => {
      const matchesSearch = !searchTerm || 
        college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.topPrograms.some(program => program.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = selectedType === 'all' || college.type === selectedType;
      const matchesSize = selectedSize === 'all' || college.size === selectedSize;
      const matchesTuition = maxTuition === 'all' || college.tuitionOutOfState <= parseInt(maxTuition);
      
      return matchesSearch && matchesType && matchesSize && matchesTuition;
    });
    
    setColleges(filtered.map(college => ({
      ...college,
      isSaved: savedColleges.some(saved => saved.id === college.id)
    })));
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedType, selectedSize, maxTuition, savedColleges]);

  const collegeTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'Public', label: 'Public' },
    { value: 'Private', label: 'Private' }
  ];

  const collegeSizes = [
    { value: 'all', label: 'All Sizes' },
    { value: 'Small', label: 'Small (< 5,000)' },
    { value: 'Medium', label: 'Medium (5,000-15,000)' },
    { value: 'Large', label: 'Large (> 15,000)' }
  ];

  const tuitionRanges = [
    { value: 'all', label: 'Any Budget' },
    { value: '20000', label: 'Under $20,000' },
    { value: '40000', label: 'Under $40,000' },
    { value: '60000', label: 'Under $60,000' }
  ];

  const getAcceptanceColor = (rate: number) => {
    if (rate <= 10) return 'text-red-600';
    if (rate <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getChanceColor = (category: string) => {
    switch (category) {
      case 'Safety': return 'bg-green-100 text-green-800';
      case 'Target': return 'bg-yellow-100 text-yellow-800';
      case 'Reach': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to find your perfect college match</h1>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-white/20 hover:shadow-xl transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Top 20 Colleges & Universities
              </h1>
              <p className="text-gray-600">Discover America's most prestigious institutions with AI-powered admission analysis</p>
            </div>
            <button
              onClick={() => setShowAcademicProfile(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Edit className="h-5 w-5" />
              <span>Edit Academic Profile</span>
            </button>
          </div>

          {/* Academic Profile Status */}
          {academicProfile && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Your Academic Profile</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">GPA:</span>
                      <span className="ml-2 font-semibold">{academicProfile.gpa || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">SAT:</span>
                      <span className="ml-2 font-semibold">{academicProfile.sat_score || 'Not taken'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">ACT:</span>
                      <span className="ml-2 font-semibold">{academicProfile.act_score || 'Not taken'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Major:</span>
                      <span className="ml-2 font-semibold">{academicProfile.intended_major || 'Undecided'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAcademicProfile(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search colleges, locations, majors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {collegeTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {collegeSizes.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
              <select
                value={maxTuition}
                onChange={(e) => setMaxTuition(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {tuitionRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {colleges.length} colleges found
                </h2>
                <p className="text-gray-600">America's most prestigious universities with real admission data</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{savedColleges.length}</div>
                  <div className="text-sm text-gray-600">Saved Colleges</div>
                </div>
              </div>
            </div>
          </div>

          {/* College Cards */}
          <div className="space-y-6">
            {colleges.map((college) => (
              <div key={college.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all overflow-hidden">
                <div className="md:flex">
                  {/* College Image */}
                  <div className="md:w-1/3">
                    <img
                      src={college.imageUrl}
                      alt={college.name}
                      className="w-full h-64 md:h-full object-cover"
                      onError={(e) => {
                        // Fallback to a default image if the provided image fails to load
                        e.currentTarget.src = "https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=400";
                      }}
                    />
                  </div>
                  
                  {/* College Info */}
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{college.name}</h3>
                        <div className="flex items-center space-x-2 text-gray-600 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{college.location}</span>
                          <span>•</span>
                          <span>{college.type}</span>
                          <span>•</span>
                          <span>{college.size}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-4">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className={`font-semibold ${getAcceptanceColor(college.admissionRate)}`}>
                            {college.admissionRate.toFixed(1)}% Acceptance Rate
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className={`font-bold ${getAcceptanceColor(college.admissionRate)}`}>
                          {college.admissionRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Acceptance Rate</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="font-bold text-gray-900">{college.studentSize.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Students</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="font-bold text-gray-900">
                          {college.averageSAT > 0 ? college.averageSAT : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-600">Avg. SAT</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <DollarSign className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="font-bold text-gray-900">
                          ${Math.round(college.tuitionOutOfState).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Out-of-State Tuition</div>
                      </div>
                    </div>

                    {/* Popular Majors */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Popular Programs:</h4>
                      <div className="flex flex-wrap gap-2">
                        {college.topPrograms.map((major, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            {major}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleSaveCollege(college)}
                        className={`flex items-center space-x-2 ${
                          college.isSaved 
                            ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                        } px-6 py-2 rounded-lg font-semibold transition-all`}
                      >
                        <Heart className={`h-4 w-4 ${college.isSaved ? 'fill-current' : ''}`} />
                        <span>{college.isSaved ? 'Saved' : 'Save College'}</span>
                      </button>
                      <button
                        onClick={() => analyzeAdmissionChances(college)}
                        className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all"
                      >
                        <Award className="h-4 w-4" />
                        <span>AI Analysis</span>
                      </button>
                      {college.website && (
                        <button 
                          onClick={() => window.open(college.website, '_blank')}
                          className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:border-purple-300 hover:text-purple-600 transition-all"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Website</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Back Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:border-purple-300 hover:text-purple-600 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Academic Profile Modal */}
      {showAcademicProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Academic Profile</h2>
                <button
                  onClick={() => setShowAcademicProfile(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                  <strong>Complete your academic profile</strong> to get personalized admission chances and recommendations for each college.
                </p>
              </div>
              
              <div className="text-center py-8">
                <GraduationCap className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">Academic Profile Setup</h3>
                <p className="text-gray-600 mb-6">
                  Your academic profile helps us calculate accurate admission chances and provide personalized college recommendations.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  This feature uses your dashboard's Academic Profile. Please complete it there for the best experience.
                </p>
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={() => {
                      setShowAcademicProfile(false);
                      window.location.href = '/dashboard';
                    }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => setShowAcademicProfile(false)}
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-purple-300 hover:text-purple-600 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admission Chances Modal */}
      {showAdmissionModal && selectedCollege && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedCollege.name}</h2>
                <button
                  onClick={() => setShowAdmissionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {analyzingAdmission ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-purple-600" />
                  <p className="text-lg text-gray-700">Analyzing your admission chances...</p>
                  <p className="text-sm text-gray-500">Our AI is evaluating your profile against {selectedCollege.name}'s admission criteria</p>
                </div>
              ) : admissionAnalysis ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-block rounded-full p-4 bg-gray-100 mb-4">
                      <div className="relative w-32 h-32">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl font-bold">{admissionAnalysis.admissionChance}%</span>
                        </div>
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="10"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={
                              admissionAnalysis.chanceCategory === 'Safety' ? '#10b981' :
                              admissionAnalysis.chanceCategory === 'Target' ? '#f59e0b' : '#ef4444'
                            }
                            strokeWidth="10"
                            strokeDasharray={`${2 * Math.PI * 45 * admissionAnalysis.admissionChance / 100} ${2 * Math.PI * 45 * (1 - admissionAnalysis.admissionChance / 100)}`}
                          />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Admission Chances</h3>
                    <div className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${getChanceColor(admissionAnalysis.chanceCategory)}`}>
                      {admissionAnalysis.chanceCategory} School
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Analysis</h4>
                    <p className="text-gray-700">{admissionAnalysis.reasoning}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Star className="h-4 w-4 text-green-600 mr-2" />
                        Your Strengths
                      </h4>
                      <ul className="space-y-2">
                        {admissionAnalysis.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                            <span className="text-gray-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Target className="h-4 w-4 text-blue-600 mr-2" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-2">
                        {admissionAnalysis.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <ArrowRight className="h-4 w-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                            <span className="text-gray-700">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 text-blue-800">
                    <p className="text-sm">
                      <strong>Note:</strong> This analysis is based on your academic profile and historical admission data. 
                      Actual admission decisions consider many factors including essays, recommendations, and institutional priorities.
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleSaveCollege(selectedCollege)}
                      className={`flex-1 flex items-center justify-center space-x-2 ${
                        selectedCollege.isSaved 
                          ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                      } px-6 py-3 rounded-lg font-semibold transition-all`}
                    >
                      <Heart className={`h-5 w-5 ${selectedCollege.isSaved ? 'fill-current' : ''}`} />
                      <span>{selectedCollege.isSaved ? 'Remove from Saved' : 'Save College'}</span>
                    </button>
                    <button
                      onClick={() => setShowAdmissionModal(false)}
                      className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-purple-300 hover:text-purple-600 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                  <p className="text-lg text-gray-700">Unable to analyze admission chances</p>
                  <p className="text-sm text-gray-500 mb-6">Please complete your academic profile first</p>
                  <button
                    onClick={() => {
                      setShowAdmissionModal(false);
                      setShowAcademicProfile(true);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Complete Academic Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}