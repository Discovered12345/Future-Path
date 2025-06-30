import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { ArrowLeft, Search, Filter, Award, Calendar, DollarSign, MapPin, ExternalLink, Users, Code, Heart, Briefcase, Lightbulb, Zap, Target, Globe, Microscope, Palette, Music, Camera, Wrench, Calculator, BookOpen, Gamepad2, Plane, Leaf, Gavel, Stethoscope } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserStats } from '../hooks/useUserStats';

const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 39.8283,
  lng: -98.5795
};

const mapOptions = {
  mapTypeId: 'roadmap' as google.maps.MapTypeId,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

export default function ExploreOpportunities() {
  const { user } = useAuth();
  const { incrementStat } = useUserStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCareer, setSelectedCareer] = useState('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchRadius, setSearchRadius] = useState(25);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(4);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const careerTracks = [
    { value: 'all', label: 'All Careers' },
    { value: 'software-engineering', label: 'Software Engineering' },
    { value: 'data-science', label: 'Data Science & AI' },
    { value: 'product-design', label: 'Product Design' },
    { value: 'business', label: 'Business & Entrepreneurship' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'arts', label: 'Arts & Media' },
    { value: 'science', label: 'Science & Research' },
    { value: 'law', label: 'Law & Government' },
    { value: 'environment', label: 'Environmental Science' },
    { value: 'aviation', label: 'Aviation & Aerospace' },
    { value: 'gaming', label: 'Gaming & Technology' }
  ];

  const opportunities = [
    // National Scholarships
    {
      id: 1,
      title: "Coca-Cola Scholars Program",
      type: "Scholarship",
      category: "scholarship",
      careerTrack: "business",
      amount: "$20,000",
      deadline: "2024-10-31",
      location: "Atlanta, GA",
      coordinates: { lat: 33.7490, lng: -84.3880 },
      description: "Merit-based scholarship for high school seniors demonstrating leadership and academic excellence.",
      requirements: ["High school senior", "3.0+ GPA", "Leadership experience", "Community service"],
      skills: ["Leadership", "Community Service", "Academic Excellence"],
      difficulty: "Advanced",
      participants: "1,400+ recipients annually",
      link: "https://www.coca-colascholarsfoundation.org"
    },
    {
      id: 2,
      title: "Gates Scholarship",
      type: "Scholarship",
      category: "scholarship",
      careerTrack: "education",
      amount: "Full Tuition",
      deadline: "2024-09-15",
      location: "Seattle, WA",
      coordinates: { lat: 47.6062, lng: -122.3321 },
      description: "Full scholarship for outstanding minority students with significant financial need.",
      requirements: ["Minority student", "Pell Grant eligible", "3.3+ GPA", "Leadership potential"],
      skills: ["Academic Excellence", "Leadership", "Community Impact"],
      difficulty: "Advanced",
      participants: "300 recipients annually",
      link: "https://www.thegatesscholarship.org"
    },
    {
      id: 3,
      title: "National Merit Scholarship",
      type: "Scholarship",
      category: "scholarship",
      careerTrack: "education",
      amount: "$2,500",
      deadline: "2024-10-15",
      location: "Evanston, IL",
      coordinates: { lat: 42.0451, lng: -87.6877 },
      description: "Merit scholarship based on PSAT/NMSQT performance and academic achievement.",
      requirements: ["High PSAT scores", "Academic excellence", "High school senior"],
      skills: ["Test Taking", "Academic Performance"],
      difficulty: "Advanced",
      participants: "7,500+ recipients annually",
      link: "https://www.nationalmerit.org"
    },
    {
      id: 4,
      title: "Jack Kent Cooke Foundation Scholarship",
      type: "Scholarship",
      category: "scholarship",
      careerTrack: "education",
      amount: "$55,000",
      deadline: "2024-11-15",
      location: "Lansdowne, VA",
      coordinates: { lat: 39.2037, lng: -77.5636 },
      description: "Scholarship for high-achieving students with financial need.",
      requirements: ["Financial need", "3.5+ GPA", "Leadership", "Academic excellence"],
      skills: ["Academic Excellence", "Leadership", "Financial Management"],
      difficulty: "Advanced",
      participants: "65 recipients annually",
      link: "https://www.jkcf.org"
    },

    // STEM Competitions & Programs
    {
      id: 5,
      title: "Google Code-in Contest",
      type: "Competition",
      category: "technology",
      careerTrack: "software-engineering",
      amount: "$1,000",
      deadline: "2024-12-01",
      location: "Mountain View, CA",
      coordinates: { lat: 37.4419, lng: -122.1430 },
      description: "Open source programming contest for students aged 13-17.",
      requirements: ["Age 13-17", "Basic programming knowledge", "GitHub account"],
      skills: ["Programming", "Open Source", "Git"],
      difficulty: "Intermediate",
      participants: "500+ students",
      link: "https://codein.withgoogle.com"
    },
    {
      id: 6,
      title: "NASA USRP Internship",
      type: "Internship",
      category: "stem",
      careerTrack: "science",
      amount: "$6,000 stipend",
      deadline: "2024-03-01",
      location: "Houston, TX",
      coordinates: { lat: 29.7604, lng: -95.3698 },
      description: "Summer internship program for high school students interested in space technology.",
      requirements: ["Age 16+", "Strong academic record", "US citizenship", "STEM background"],
      skills: ["Engineering", "Research", "Technology"],
      difficulty: "Advanced",
      participants: "50+ interns",
      link: "https://intern.nasa.gov"
    },
    {
      id: 7,
      title: "Intel International Science Fair",
      type: "Competition",
      category: "stem",
      careerTrack: "science",
      amount: "$75,000",
      deadline: "2024-01-15",
      location: "Los Angeles, CA",
      coordinates: { lat: 34.0522, lng: -118.2437 },
      description: "World's largest international pre-college science competition.",
      requirements: ["Original research project", "Regional fair qualification", "Age 14-18"],
      skills: ["Research", "Scientific Method", "Presentation"],
      difficulty: "Advanced",
      participants: "1,800+ students globally",
      link: "https://www.societyforscience.org/isef"
    },
    {
      id: 8,
      title: "Siemens Competition",
      type: "Competition",
      category: "stem",
      careerTrack: "science",
      amount: "$100,000",
      deadline: "2024-10-01",
      location: "Washington, DC",
      coordinates: { lat: 38.9072, lng: -77.0369 },
      description: "National research competition in math, science, and technology.",
      requirements: ["Original research", "High school student", "STEM focus"],
      skills: ["Research", "STEM", "Innovation"],
      difficulty: "Advanced",
      participants: "300+ finalists",
      link: "https://www.siemens-foundation.org"
    },
    {
      id: 9,
      title: "Science Olympiad",
      type: "Competition",
      category: "stem",
      careerTrack: "science",
      amount: "$7,500",
      deadline: "2024-02-15",
      location: "Various States",
      coordinates: { lat: 39.8283, lng: -98.5795 },
      description: "National STEM competition with 23 different events.",
      requirements: ["Team participation", "School registration", "STEM knowledge"],
      skills: ["STEM", "Teamwork", "Problem Solving"],
      difficulty: "Intermediate",
      participants: "120,000+ students",
      link: "https://www.soinc.org"
    },
    {
      id: 10,
      title: "FIRST Robotics Competition",
      type: "Competition",
      category: "technology",
      careerTrack: "engineering",
      amount: "$5,000",
      deadline: "2024-01-08",
      location: "Manchester, NH",
      coordinates: { lat: 42.9956, lng: -71.4548 },
      description: "International robotics competition combining sports excitement with science and technology.",
      requirements: ["Team registration", "Robot design and build", "Age 14-18"],
      skills: ["Robotics", "Engineering", "Programming", "Teamwork"],
      difficulty: "Advanced",
      participants: "3,000+ teams globally",
      link: "https://www.firstinspires.org"
    },

    // Technology & Programming
    {
      id: 11,
      title: "Congressional App Challenge",
      type: "Competition",
      category: "technology",
      careerTrack: "software-engineering",
      amount: "Recognition",
      deadline: "2024-11-01",
      location: "Washington, DC",
      coordinates: { lat: 38.9072, lng: -77.0369 },
      description: "Nationwide competition encouraging students to learn coding and create apps.",
      requirements: ["High school student", "Original app", "Congressional district participation"],
      skills: ["App Development", "Programming", "Innovation"],
      difficulty: "Intermediate",
      participants: "10,000+ students",
      link: "https://www.congressionalappchallenge.us"
    },
    {
      id: 12,
      title: "CyberPatriot Competition",
      type: "Competition",
      category: "technology",
      careerTrack: "software-engineering",
      amount: "$2,000",
      deadline: "2024-10-15",
      location: "San Antonio, TX",
      coordinates: { lat: 29.4241, lng: -98.4936 },
      description: "National youth cyber defense competition.",
      requirements: ["Team of 2-6 students", "Cybersecurity knowledge", "High school level"],
      skills: ["Cybersecurity", "Networking", "Problem Solving"],
      difficulty: "Advanced",
      participants: "5,000+ teams",
      link: "https://www.uscyberpatriot.org"
    },
    {
      id: 13,
      title: "SkillsUSA Championships",
      type: "Competition",
      category: "technology",
      careerTrack: "engineering",
      amount: "$1,000",
      deadline: "2024-04-01",
      location: "Louisville, KY",
      coordinates: { lat: 38.2527, lng: -85.7585 },
      description: "National competition in technical, skilled, and service careers.",
      requirements: ["SkillsUSA membership", "State competition qualification", "Technical skills"],
      skills: ["Technical Skills", "Career Readiness", "Leadership"],
      difficulty: "Intermediate",
      participants: "15,000+ students",
      link: "https://www.skillsusa.org"
    },
    {
      id: 14,
      title: "Hackathon for Social Good",
      type: "Competition",
      category: "technology",
      careerTrack: "software-engineering",
      amount: "$5,000",
      deadline: "2024-09-30",
      location: "San Francisco, CA",
      coordinates: { lat: 37.7749, lng: -122.4194 },
      description: "48-hour coding competition focused on solving social problems.",
      requirements: ["Programming skills", "Team of 2-4", "Social impact focus"],
      skills: ["Programming", "Social Impact", "Innovation"],
      difficulty: "Intermediate",
      participants: "200+ participants",
      link: "https://hackforsocialgood.org"
    },

    // Business & Entrepreneurship
    {
      id: 15,
      title: "DECA International Competition",
      type: "Competition",
      category: "business",
      careerTrack: "business",
      amount: "$5,000",
      deadline: "2024-04-15",
      location: "Orlando, FL",
      coordinates: { lat: 28.5383, lng: -81.3792 },
      description: "International competition for marketing, finance, hospitality, and management students.",
      requirements: ["DECA membership", "State competition qualification", "Business knowledge"],
      skills: ["Business Strategy", "Marketing", "Finance", "Leadership"],
      difficulty: "Advanced",
      participants: "20,000+ students",
      link: "https://www.deca.org"
    },
    {
      id: 16,
      title: "Young Entrepreneur Academy",
      type: "Program",
      category: "business",
      careerTrack: "business",
      amount: "Varies",
      deadline: "2024-08-15",
      location: "Rochester, NY",
      coordinates: { lat: 43.1566, lng: -77.6088 },
      description: "Year-long program teaching students to start and run their own businesses.",
      requirements: ["Age 11-18", "Application process", "Commitment to full program"],
      skills: ["Entrepreneurship", "Business Planning", "Leadership"],
      difficulty: "Intermediate",
      participants: "5,000+ students annually",
      link: "https://www.yeausa.org"
    },
    {
      id: 17,
      title: "Future Business Leaders of America",
      type: "Competition",
      category: "business",
      careerTrack: "business",
      amount: "$2,500",
      deadline: "2024-03-15",
      location: "Chicago, IL",
      coordinates: { lat: 41.8781, lng: -87.6298 },
      description: "National competition for business and leadership skills.",
      requirements: ["FBLA membership", "Business coursework", "Leadership experience"],
      skills: ["Business", "Leadership", "Public Speaking"],
      difficulty: "Intermediate",
      participants: "230,000+ members",
      link: "https://www.fbla-pbl.org"
    },
    {
      id: 18,
      title: "Junior Achievement Company Program",
      type: "Program",
      category: "business",
      careerTrack: "business",
      amount: "Experience",
      deadline: "2024-09-01",
      location: "Colorado Springs, CO",
      coordinates: { lat: 38.8339, lng: -104.8214 },
      description: "Students create and manage their own business for a school year.",
      requirements: ["High school student", "School participation", "Business interest"],
      skills: ["Entrepreneurship", "Business Management", "Teamwork"],
      difficulty: "Beginner",
      participants: "10,000+ students annually",
      link: "https://www.juniorachievement.org"
    },

    // Arts & Media
    {
      id: 19,
      title: "Scholastic Art & Writing Awards",
      type: "Competition",
      category: "arts",
      careerTrack: "arts",
      amount: "$10,000",
      deadline: "2024-12-15",
      location: "New York, NY",
      coordinates: { lat: 40.7128, lng: -74.0060 },
      description: "National competition recognizing creative teenagers in visual arts and writing.",
      requirements: ["Age 13-18", "Original artwork or writing", "Regional submission"],
      skills: ["Creative Writing", "Visual Arts", "Creativity"],
      difficulty: "Intermediate",
      participants: "350,000+ submissions",
      link: "https://www.artandwriting.org"
    },
    {
      id: 20,
      title: "National YoungArts Foundation",
      type: "Competition",
      category: "arts",
      careerTrack: "arts",
      amount: "$10,000",
      deadline: "2024-10-15",
      location: "Miami, FL",
      coordinates: { lat: 25.7617, lng: -80.1918 },
      description: "National competition for emerging artists in various disciplines.",
      requirements: ["Age 15-18", "Artistic portfolio", "US citizen or resident"],
      skills: ["Artistic Excellence", "Performance", "Creativity"],
      difficulty: "Advanced",
      participants: "700+ winners annually",
      link: "https://www.youngarts.org"
    },
    {
      id: 21,
      title: "Adobe Design Achievement Awards",
      type: "Competition",
      category: "arts",
      careerTrack: "product-design",
      amount: "$25,000",
      deadline: "2024-05-31",
      location: "San Jose, CA",
      coordinates: { lat: 37.3382, lng: -121.8863 },
      description: "Global competition recognizing student achievement in digital media.",
      requirements: ["Student status", "Adobe software proficiency", "Original design work"],
      skills: ["Digital Design", "Adobe Creative Suite", "Innovation"],
      difficulty: "Advanced",
      participants: "10,000+ submissions",
      link: "https://www.adobeawards.com"
    },
    {
      id: 22,
      title: "National Film Festival for Talented Youth",
      type: "Competition",
      category: "arts",
      careerTrack: "arts",
      amount: "$5,000",
      deadline: "2024-01-15",
      location: "Seattle, WA",
      coordinates: { lat: 47.6062, lng: -122.3321 },
      description: "Film festival showcasing work by filmmakers 22 and under.",
      requirements: ["Age 22 and under", "Original film", "Various categories"],
      skills: ["Filmmaking", "Storytelling", "Video Production"],
      difficulty: "Intermediate",
      participants: "4,000+ submissions",
      link: "https://www.nffty.org"
    },

    // Healthcare & Medicine
    {
      id: 23,
      title: "Health Occupations Students of America",
      type: "Competition",
      category: "healthcare",
      careerTrack: "healthcare",
      amount: "$1,000",
      deadline: "2024-04-01",
      location: "Dallas, TX",
      coordinates: { lat: 32.7767, lng: -96.7970 },
      description: "National competition for students in health science education.",
      requirements: ["HOSA membership", "Health science coursework", "Competition qualification"],
      skills: ["Medical Knowledge", "Healthcare Skills", "Leadership"],
      difficulty: "Intermediate",
      participants: "250,000+ members",
      link: "https://www.hosa.org"
    },
    {
      id: 24,
      title: "American Red Cross Youth Volunteer",
      type: "Volunteer",
      category: "healthcare",
      careerTrack: "healthcare",
      amount: "Experience",
      deadline: "Ongoing",
      location: "Washington, DC",
      coordinates: { lat: 38.9072, lng: -77.0369 },
      description: "Volunteer opportunities in disaster relief, blood drives, and community health.",
      requirements: ["Age 14+", "Training completion", "Background check"],
      skills: ["Community Service", "Emergency Response", "Healthcare"],
      difficulty: "Beginner",
      participants: "90,000+ youth volunteers",
      link: "https://www.redcross.org/volunteer/youth"
    },
    {
      id: 25,
      title: "Future Health Professionals Scholarship",
      type: "Scholarship",
      category: "healthcare",
      careerTrack: "healthcare",
      amount: "$3,000",
      deadline: "2024-03-31",
      location: "Chicago, IL",
      coordinates: { lat: 41.8781, lng: -87.6298 },
      description: "Scholarship for students pursuing healthcare careers.",
      requirements: ["Healthcare career intent", "3.0+ GPA", "Community service"],
      skills: ["Academic Excellence", "Healthcare Interest", "Community Service"],
      difficulty: "Intermediate",
      participants: "500+ applicants",
      link: "https://www.healthcarescholarships.org"
    },

    // Environmental & Science
    {
      id: 26,
      title: "Envirothon Competition",
      type: "Competition",
      category: "environment",
      careerTrack: "environment",
      amount: "$5,000",
      deadline: "2024-05-15",
      location: "Various States",
      coordinates: { lat: 39.8283, lng: -98.5795 },
      description: "Environmental education competition testing knowledge of natural resources.",
      requirements: ["Team of 5 students", "Environmental knowledge", "High school level"],
      skills: ["Environmental Science", "Ecology", "Conservation"],
      difficulty: "Intermediate",
      participants: "500+ teams",
      link: "https://www.envirothon.org"
    },
    {
      id: 27,
      title: "EPA Environmental Justice Challenge",
      type: "Competition",
      category: "environment",
      careerTrack: "environment",
      amount: "$1,500",
      deadline: "2024-04-22",
      location: "Washington, DC",
      coordinates: { lat: 38.9072, lng: -77.0369 },
      description: "Student competition addressing environmental justice issues.",
      requirements: ["Team project", "Environmental focus", "Community impact"],
      skills: ["Environmental Justice", "Research", "Community Engagement"],
      difficulty: "Advanced",
      participants: "100+ teams",
      link: "https://www.epa.gov/education"
    },
    {
      id: 28,
      title: "National Ocean Sciences Bowl",
      type: "Competition",
      category: "environment",
      careerTrack: "science",
      amount: "$2,000",
      deadline: "2024-02-28",
      location: "Various Coastal Cities",
      coordinates: { lat: 36.7783, lng: -119.4179 },
      description: "Academic competition testing knowledge of ocean sciences.",
      requirements: ["Team of 4 students", "Ocean science knowledge", "Regional qualification"],
      skills: ["Marine Science", "Oceanography", "Environmental Science"],
      difficulty: "Advanced",
      participants: "2,000+ students",
      link: "https://www.nosb.org"
    },

    // Engineering & Technology
    {
      id: 29,
      title: "National Engineers Week Competition",
      type: "Competition",
      category: "engineering",
      careerTrack: "engineering",
      amount: "$3,000",
      deadline: "2024-02-15",
      location: "Alexandria, VA",
      coordinates: { lat: 38.8048, lng: -77.0469 },
      description: "Engineering design challenges for K-12 students.",
      requirements: ["Engineering project", "Design process", "Team or individual"],
      skills: ["Engineering Design", "Problem Solving", "Innovation"],
      difficulty: "Intermediate",
      participants: "50,000+ students",
      link: "https://www.eweek.org"
    },
    {
      id: 30,
      title: "Society of Women Engineers Competition",
      type: "Competition",
      category: "engineering",
      careerTrack: "engineering",
      amount: "$15,000",
      deadline: "2024-02-15",
      location: "Chicago, IL",
      coordinates: { lat: 41.8781, lng: -87.6298 },
      description: "Scholarship and competition for women in engineering.",
      requirements: ["Female student", "Engineering major intent", "Academic excellence"],
      skills: ["Engineering", "STEM", "Leadership"],
      difficulty: "Advanced",
      participants: "5,000+ applicants",
      link: "https://www.swe.org"
    },

    // Aviation & Aerospace
    {
      id: 31,
      title: "Aircraft Owners and Pilots Association Scholarship",
      type: "Scholarship",
      category: "aviation",
      careerTrack: "aviation",
      amount: "$10,000",
      deadline: "2024-03-31",
      location: "Frederick, MD",
      coordinates: { lat: 39.4143, lng: -77.4105 },
      description: "Scholarship for students pursuing aviation careers.",
      requirements: ["Aviation career intent", "Academic achievement", "Flight training"],
      skills: ["Aviation", "Flight Training", "STEM"],
      difficulty: "Advanced",
      participants: "1,000+ applicants",
      link: "https://www.aopa.org/training-and-safety/students/flight-training-scholarships"
    },
    {
      id: 32,
      title: "Team America Rocketry Challenge",
      type: "Competition",
      category: "aviation",
      careerTrack: "aviation",
      amount: "$20,000",
      deadline: "2024-01-31",
      location: "Plains, VA",
      coordinates: { lat: 38.8462, lng: -77.7811 },
      description: "National rocket competition for middle and high school students.",
      requirements: ["Team of 3-10 students", "Rocket design and build", "Safety certification"],
      skills: ["Aerospace Engineering", "Rocketry", "Physics"],
      difficulty: "Advanced",
      participants: "5,000+ students",
      link: "https://rocketcontest.org"
    },

    // Gaming & Technology
    {
      id: 33,
      title: "National STEM Video Game Challenge",
      type: "Competition",
      category: "gaming",
      careerTrack: "gaming",
      amount: "$2,000",
      deadline: "2024-01-08",
      location: "New York, NY",
      coordinates: { lat: 40.7128, lng: -74.0060 },
      description: "Competition for student-created video games with STEM themes.",
      requirements: ["Age 5-18", "Original game design", "STEM focus"],
      skills: ["Game Development", "Programming", "STEM"],
      difficulty: "Intermediate",
      participants: "4,000+ submissions",
      link: "https://www.stemchallenge.org"
    },
    {
      id: 34,
      title: "Esports High School Championship",
      type: "Competition",
      category: "gaming",
      careerTrack: "gaming",
      amount: "$50,000",
      deadline: "2024-12-01",
      location: "Los Angeles, CA",
      coordinates: { lat: 34.0522, lng: -118.2437 },
      description: "National esports competition for high school students.",
      requirements: ["High school team", "Game proficiency", "School registration"],
      skills: ["Gaming", "Strategy", "Teamwork"],
      difficulty: "Advanced",
      participants: "200,000+ students",
      link: "https://www.highschoolesportsleague.com"
    },

    // Law & Government
    {
      id: 35,
      title: "Mock Trial National Championship",
      type: "Competition",
      category: "law",
      careerTrack: "law",
      amount: "$3,000",
      deadline: "2024-05-15",
      location: "Various Cities",
      coordinates: { lat: 39.8283, lng: -98.5795 },
      description: "National competition simulating court trials for high school students.",
      requirements: ["School team", "Legal knowledge", "Public speaking skills"],
      skills: ["Legal Reasoning", "Public Speaking", "Critical Thinking"],
      difficulty: "Advanced",
      participants: "5,000+ students",
      link: "https://www.nationalmocktrial.org"
    },
    {
      id: 36,
      title: "Youth in Government Program",
      type: "Program",
      category: "law",
      careerTrack: "law",
      amount: "Experience",
      deadline: "2024-09-15",
      location: "Various State Capitals",
      coordinates: { lat: 38.9072, lng: -77.0369 },
      description: "Hands-on government simulation program for high school students.",
      requirements: ["High school student", "Interest in government", "Application process"],
      skills: ["Government", "Leadership", "Public Policy"],
      difficulty: "Intermediate",
      participants: "40,000+ students",
      link: "https://www.ymca.net/youth-in-government"
    },

    // Mathematics
    {
      id: 37,
      title: "American Mathematics Competitions",
      type: "Competition",
      category: "mathematics",
      careerTrack: "science",
      amount: "$2,500",
      deadline: "2024-02-15",
      location: "Lincoln, NE",
      coordinates: { lat: 40.8136, lng: -96.7026 },
      description: "Series of mathematics competitions for middle and high school students.",
      requirements: ["Mathematical aptitude", "School registration", "Competition qualification"],
      skills: ["Mathematics", "Problem Solving", "Logic"],
      difficulty: "Advanced",
      participants: "300,000+ students",
      link: "https://www.maa.org/math-competitions"
    },
    {
      id: 38,
      title: "MATHCOUNTS Competition",
      type: "Competition",
      category: "mathematics",
      careerTrack: "science",
      amount: "$20,000",
      deadline: "2024-02-01",
      location: "Orlando, FL",
      coordinates: { lat: 28.5383, lng: -81.3792 },
      description: "National middle school mathematics competition.",
      requirements: ["6th-8th grade", "Mathematical skills", "Team and individual rounds"],
      skills: ["Mathematics", "Mental Math", "Problem Solving"],
      difficulty: "Advanced",
      participants: "100,000+ students",
      link: "https://www.mathcounts.org"
    },

    // Music & Performing Arts
    {
      id: 39,
      title: "National Association for Music Education Competition",
      type: "Competition",
      category: "music",
      careerTrack: "arts",
      amount: "$5,000",
      deadline: "2024-03-01",
      location: "Reston, VA",
      coordinates: { lat: 38.9687, lng: -77.3411 },
      description: "National music competition for student musicians.",
      requirements: ["Musical proficiency", "School participation", "Audition process"],
      skills: ["Musical Performance", "Music Theory", "Artistic Expression"],
      difficulty: "Advanced",
      participants: "500,000+ students",
      link: "https://www.nafme.org"
    },
    {
      id: 40,
      title: "National Speech and Debate Tournament",
      type: "Competition",
      category: "communication",
      careerTrack: "law",
      amount: "$2,000",
      deadline: "2024-06-15",
      location: "Louisville, KY",
      coordinates: { lat: 38.2527, lng: -85.7585 },
      description: "National competition for speech and debate students.",
      requirements: ["Speech/debate experience", "Qualification through local tournaments"],
      skills: ["Public Speaking", "Debate", "Critical Thinking"],
      difficulty: "Advanced",
      participants: "140,000+ students",
      link: "https://www.speechanddebate.org"
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'scholarship', label: 'Scholarships' },
    { value: 'technology', label: 'Technology' },
    { value: 'stem', label: 'STEM' },
    { value: 'business', label: 'Business' },
    { value: 'arts', label: 'Arts & Media' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'environment', label: 'Environment' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'aviation', label: 'Aviation' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'law', label: 'Law & Government' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'music', label: 'Music & Arts' },
    { value: 'communication', label: 'Communication' }
  ];

  // Map legend configuration
  const mapLegend = [
    { type: 'S', label: 'Scholarships', color: '#10B981', category: 'scholarship' },
    { type: 'C', label: 'Competitions', color: '#3B82F6', category: 'technology' },
    { type: 'I', label: 'Internships', color: '#8B5CF6', category: 'stem' },
    { type: 'P', label: 'Programs', color: '#F59E0B', category: 'business' },
    { type: 'V', label: 'Volunteer', color: '#EF4444', category: 'healthcare' },
    { type: 'W', label: 'Workshops', color: '#06B6D4', category: 'arts' },
    { type: 'E', label: 'Environment', color: '#22C55E', category: 'environment' },
    { type: 'T', label: 'Tech/Gaming', color: '#A855F7', category: 'gaming' },
    { type: 'L', label: 'Law/Gov', color: '#DC2626', category: 'law' },
    { type: 'M', label: 'Math/Science', color: '#0EA5E9', category: 'mathematics' },
    { type: 'A', label: 'Aviation', color: '#F97316', category: 'aviation' },
    { type: 'R', label: 'Arts/Music', color: '#EC4899', category: 'music' }
  ];

  const getMarkerInfo = (opportunity: any) => {
    const legendItem = mapLegend.find(item => 
      opportunity.category === item.category || 
      (opportunity.type === 'Scholarship' && item.category === 'scholarship') ||
      (opportunity.type === 'Competition' && item.category === 'technology') ||
      (opportunity.type === 'Internship' && item.category === 'stem') ||
      (opportunity.type === 'Program' && item.category === 'business') ||
      (opportunity.type === 'Volunteer' && item.category === 'healthcare')
    );
    
    return legendItem || mapLegend[0];
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || opp.category === selectedCategory;
    const matchesCareer = selectedCareer === 'all' || opp.careerTrack === selectedCareer;
    return matchesSearch && matchesCategory && matchesCareer;
  });

  const handleUseMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
          setMapZoom(10);
        },
        (error) => {
          alert('Unable to get your location. Please enter a location manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleLocationSearch = useCallback(() => {
    if (!searchLocation.trim() || !isLoaded) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchLocation }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const coords = { lat: location.lat(), lng: location.lng() };
        setUserLocation(coords);
        setMapCenter(coords);
        setMapZoom(10);
      } else {
        alert('Location not found. Please try a different search term.');
      }
    });
  }, [searchLocation, isLoaded]);

  const handleApply = (opportunityId: number) => {
    incrementStat('opportunitiesFound', 1);
    alert('This would open the application link in a real app!');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Scholarship': return 'bg-green-100 text-green-800';
      case 'Competition': return 'bg-blue-100 text-blue-800';
      case 'Internship': return 'bg-purple-100 text-purple-800';
      case 'Program': return 'bg-orange-100 text-orange-800';
      case 'Volunteer': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCareerIcon = (careerTrack: string) => {
    switch (careerTrack) {
      case 'software-engineering': return <Code className="h-4 w-4" />;
      case 'data-science': return <Zap className="h-4 w-4" />;
      case 'product-design': return <Lightbulb className="h-4 w-4" />;
      case 'business': return <Briefcase className="h-4 w-4" />;
      case 'healthcare': return <Stethoscope className="h-4 w-4" />;
      case 'education': return <BookOpen className="h-4 w-4" />;
      case 'engineering': return <Wrench className="h-4 w-4" />;
      case 'arts': return <Palette className="h-4 w-4" />;
      case 'science': return <Microscope className="h-4 w-4" />;
      case 'law': return <Gavel className="h-4 w-4" />;
      case 'environment': return <Leaf className="h-4 w-4" />;
      case 'aviation': return <Plane className="h-4 w-4" />;
      case 'gaming': return <Gamepad2 className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const renderMap = () => {
    if (loadError) {
      return <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Error loading maps</p>
      </div>;
    }

    if (!isLoaded) {
      return <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading maps...</p>
      </div>;
    }

    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={mapZoom}
        center={mapCenter}
        options={mapOptions}
      >
        {filteredOpportunities.map(opportunity => {
          if (!opportunity.coordinates) return null;
          
          const markerInfo = getMarkerInfo(opportunity);
          
          return (
            <Marker
              key={opportunity.id}
              position={opportunity.coordinates}
              onClick={() => setSelectedMarker(opportunity.id)}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 15,
                fillColor: markerInfo.color,
                fillOpacity: 0.9,
                strokeColor: '#ffffff',
                strokeWeight: 2
              }}
              label={{
                text: markerInfo.type,
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            />
          );
        })}
        
        {selectedMarker && (
          <InfoWindow
            position={opportunities.find(o => o.id === selectedMarker)?.coordinates}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div style={{ maxWidth: '300px', padding: '10px' }}>
              {(() => {
                const opportunity = opportunities.find(o => o.id === selectedMarker);
                if (!opportunity) return null;
                const markerInfo = getMarkerInfo(opportunity);
                
                return (
                  <>
                    <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '16px', fontWeight: 'bold' }}>
                      {opportunity.title}
                    </h3>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ 
                        background: markerInfo.color, 
                        color: 'white', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: 'bold' 
                      }}>
                        {opportunity.type}
                      </span>
                      <span style={{ 
                        background: '#f3f4f6', 
                        color: '#374151', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        marginLeft: '4px' 
                      }}>
                        {opportunity.amount}
                      </span>
                    </div>
                    <p style={{ margin: '8px 0', color: '#6b7280', fontSize: '14px', lineHeight: '1.4' }}>
                      {opportunity.description}
                    </p>
                    <div style={{ marginTop: '8px' }}>
                      <strong style={{ color: '#374151', fontSize: '12px' }}>Deadline:</strong> 
                      <span style={{ color: '#6b7280', fontSize: '12px' }}> {opportunity.deadline}</span>
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <strong style={{ color: '#374151', fontSize: '12px' }}>Skills:</strong> 
                      <span style={{ color: '#6b7280', fontSize: '12px' }}> {opportunity.skills.join(', ')}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to explore opportunities</h1>
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
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Explore Opportunities
              </h1>
              <p className="text-gray-600">40+ real scholarships, competitions, and internships for teens</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCareer}
                  onChange={(e) => setSelectedCareer(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                >
                  {careerTracks.map(track => (
                    <option key={track.value} value={track.value}>
                      {track.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Opportunities Near You</h2>
              <button
                onClick={handleUseMyLocation}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2"
              >
                <MapPin className="h-4 w-4" />
                <span>Use My Location</span>
              </button>
            </div>
            
            {/* Location Search */}
            <div className="flex space-x-2 mb-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter city, state, or zip code"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-gray-400" />
                <select
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={25}>25 miles</option>
                  <option value={50}>50 miles</option>
                  <option value={100}>100 miles</option>
                  <option value={250}>250 miles</option>
                </select>
              </div>
              <button
                onClick={handleLocationSearch}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all"
              >
                Search
              </button>
            </div>

            {/* Map Legend */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Map Legend</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {mapLegend.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.type}
                    </div>
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Google Map */}
            <div className="rounded-lg border border-gray-300 overflow-hidden">
              {renderMap()}
            </div>
            
            <p className="text-sm text-gray-500 mt-2 flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>Use the search or "Use My Location" to find nearby opportunities</span>
            </p>
          </div>

          {/* Results Summary */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {filteredOpportunities.length} opportunities available
                </h2>
                <p className="text-gray-600">Real scholarships, competitions, and programs for teens</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredOpportunities.filter(o => o.type === 'Scholarship').length}
                  </div>
                  <div className="text-sm text-gray-600">Scholarships</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredOpportunities.filter(o => o.type === 'Competition').length}
                  </div>
                  <div className="text-sm text-gray-600">Competitions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredOpportunities.filter(o => o.type === 'Internship').length}
                  </div>
                  <div className="text-sm text-gray-600">Internships</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {filteredOpportunities.filter(o => o.type === 'Program').length}
                  </div>
                  <div className="text-sm text-gray-600">Programs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Opportunities Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{opportunity.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(opportunity.type)}`}>
                        {opportunity.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{opportunity.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">{opportunity.amount}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-700">{opportunity.deadline}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-700">{opportunity.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getCareerIcon(opportunity.careerTrack)}
                    <span className="text-sm text-gray-700 capitalize">{opportunity.careerTrack.replace('-', ' ')}</span>
                  </div>
                </div>

                {/* Skills and Difficulty */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Skills:</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(opportunity.difficulty)}`}>
                      {opportunity.difficulty}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {opportunity.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{opportunity.participants}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                  <ul className="space-y-1">
                    {opportunity.requirements.map((req, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApply(opportunity.id)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:border-purple-300 hover:text-purple-600 transition-all">
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredOpportunities.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No opportunities found matching your criteria.</p>
                <p className="text-sm">Try adjusting your search or filter settings.</p>
              </div>
            </div>
          )}

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
    </div>
  );
}