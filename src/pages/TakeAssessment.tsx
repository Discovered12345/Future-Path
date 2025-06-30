import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Brain, Target, Sparkles, Users, Code, Heart, Lightbulb, Briefcase, Save, Trash2, Microscope, Gavel, Calculator, Palette, Music, Globe, Camera, Wrench, DollarSign, TrendingUp, Award, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserStats } from '../hooks/useUserStats';
import { supabase } from '../lib/supabase';

interface AssessmentResult {
  id: string;
  name: string;
  date: string;
  careers: string[];
  answers: string[];
  questions: any[];
  results: any;
  score: number;
}

interface CareerInfo {
  name: string;
  salary: string;
  growth: string;
  description: string;
  skills: string[];
  education: string;
  workEnvironment: string;
  topCompanies: string[];
}

export default function TakeAssessment() {
  const { user } = useAuth();
  const { incrementStat } = useUserStats();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [savedAssessments, setSavedAssessments] = useState<AssessmentResult[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);

  // Load saved assessments from Supabase on component mount
  React.useEffect(() => {
    if (user) {
      loadSavedAssessments();
    }
  }, [user]);

  const loadSavedAssessments = async () => {
    if (!user) return;

    try {
      const { data: assessmentsData, error } = await supabase
        .from('user_assessments')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading assessments from Supabase:', error);
      } else if (assessmentsData) {
        const formattedAssessments = assessmentsData.map(assessment => ({
          id: assessment.id,
          name: assessment.assessment_name,
          date: new Date(assessment.created_at).toLocaleDateString(),
          careers: assessment.results?.careers || [],
          answers: assessment.answers || [],
          questions: assessment.questions || [],
          results: assessment.results || {},
          score: assessment.score || 0
        }));
        setSavedAssessments(formattedAssessments);
      }
    } catch (error) {
      console.error('Error loading assessments:', error);
    }
  };

  const saveAssessmentsToSupabase = async (assessment: AssessmentResult) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_assessments')
        .upsert({
          id: assessment.id,
          user_id: user.id,
          assessment_name: assessment.name,
          assessment_type: 'career',
          questions: assessment.questions,
          answers: assessment.answers,
          results: {
            careers: assessment.careers,
            ...assessment.results
          },
          score: assessment.score,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error saving assessment to Supabase:', error);
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  };

  const careerDatabase: { [key: string]: CareerInfo } = {
    "Software Engineer": {
      name: "Software Engineer",
      salary: "$70,000 - $200,000+",
      growth: "+22% (Much faster than average)",
      description: "Design, develop, and maintain software applications and systems. Work with programming languages, frameworks, and tools to create solutions for various industries.",
      skills: ["Programming", "Problem Solving", "System Design", "Debugging", "Version Control"],
      education: "Bachelor's degree in Computer Science or related field (or equivalent experience)",
      workEnvironment: "Office, remote work, or hybrid. Collaborative team environment with flexible hours.",
      topCompanies: ["Google", "Microsoft", "Apple", "Amazon", "Meta", "Netflix", "Spotify"]
    },
    "Data Scientist": {
      name: "Data Scientist",
      salary: "$80,000 - $180,000+",
      growth: "+31% (Much faster than average)",
      description: "Analyze complex data to help organizations make informed decisions. Use statistical methods, machine learning, and programming to extract insights from data.",
      skills: ["Python/R", "Statistics", "Machine Learning", "Data Visualization", "SQL"],
      education: "Bachelor's in Statistics, Math, Computer Science, or related field. Master's preferred.",
      workEnvironment: "Office or remote. Mix of independent analysis and team collaboration.",
      topCompanies: ["Google", "Facebook", "Netflix", "Airbnb", "Uber", "Tesla", "IBM"]
    },
    "UX/UI Designer": {
      name: "UX/UI Designer",
      salary: "$60,000 - $150,000+",
      growth: "+13% (Faster than average)",
      description: "Create user-friendly interfaces and experiences for digital products. Research user needs and design solutions that are both functional and aesthetically pleasing.",
      skills: ["Design Thinking", "Prototyping", "User Research", "Figma/Sketch", "HTML/CSS"],
      education: "Bachelor's in Design, Psychology, or related field. Portfolio is crucial.",
      workEnvironment: "Creative studios, tech companies, or freelance. Collaborative with developers and product teams.",
      topCompanies: ["Apple", "Google", "Adobe", "Airbnb", "Spotify", "Dropbox", "Figma"]
    },
    "Product Manager": {
      name: "Product Manager",
      salary: "$90,000 - $200,000+",
      growth: "+19% (Much faster than average)",
      description: "Guide the development of products from conception to launch. Work with cross-functional teams to define product strategy and ensure successful delivery.",
      skills: ["Strategic Thinking", "Communication", "Data Analysis", "Project Management", "User Empathy"],
      education: "Bachelor's degree in Business, Engineering, or related field. MBA often preferred.",
      workEnvironment: "Fast-paced office environment. Heavy collaboration with engineering, design, and marketing teams.",
      topCompanies: ["Google", "Microsoft", "Amazon", "Meta", "Uber", "Slack", "Zoom"]
    },
    "Marketing Specialist": {
      name: "Marketing Specialist",
      salary: "$45,000 - $120,000+",
      growth: "+10% (Faster than average)",
      description: "Develop and execute marketing campaigns to promote products or services. Analyze market trends and customer behavior to optimize marketing strategies.",
      skills: ["Digital Marketing", "Content Creation", "Analytics", "SEO/SEM", "Social Media"],
      education: "Bachelor's degree in Marketing, Communications, or related field.",
      workEnvironment: "Office, agency, or remote. Creative and data-driven environment with tight deadlines.",
      topCompanies: ["Google", "Facebook", "HubSpot", "Salesforce", "Adobe", "Nike", "Coca-Cola"]
    },
    "Research Scientist": {
      name: "Research Scientist",
      salary: "$75,000 - $160,000+",
      growth: "+8% (As fast as average)",
      description: "Conduct scientific research to advance knowledge in specific fields. Design experiments, analyze data, and publish findings in academic journals.",
      skills: ["Scientific Method", "Data Analysis", "Research Design", "Technical Writing", "Critical Thinking"],
      education: "PhD in relevant scientific field. Postdoctoral experience often required.",
      workEnvironment: "Universities, research institutions, or corporate R&D labs. Independent and collaborative work.",
      topCompanies: ["Google Research", "Microsoft Research", "IBM Research", "MIT", "Stanford", "Harvard"]
    },
    "Teacher/Educator": {
      name: "Teacher/Educator",
      salary: "$40,000 - $80,000+",
      growth: "+8% (As fast as average)",
      description: "Educate students in various subjects and grade levels. Develop curriculum, assess student progress, and create engaging learning experiences.",
      skills: ["Communication", "Patience", "Curriculum Development", "Classroom Management", "Empathy"],
      education: "Bachelor's degree in Education or subject area. Teaching certification required.",
      workEnvironment: "Schools, colleges, or online platforms. Structured schedule with summers off.",
      topCompanies: ["Public School Districts", "Private Schools", "Khan Academy", "Coursera", "Teach for America"]
    },
    "Healthcare Professional": {
      name: "Healthcare Professional",
      salary: "$50,000 - $300,000+",
      growth: "+15% (Much faster than average)",
      description: "Provide medical care and support to patients. Includes various roles from nurses to doctors to therapists, all focused on improving health outcomes.",
      skills: ["Medical Knowledge", "Empathy", "Communication", "Problem Solving", "Attention to Detail"],
      education: "Varies by role: Associate's (nursing) to Doctoral (medicine) degrees. Licensing required.",
      workEnvironment: "Hospitals, clinics, private practice. Can be high-stress with irregular hours.",
      topCompanies: ["Mayo Clinic", "Cleveland Clinic", "Johns Hopkins", "Kaiser Permanente", "Johnson & Johnson"]
    },
    "Business Analyst": {
      name: "Business Analyst",
      salary: "$60,000 - $130,000+",
      growth: "+14% (Much faster than average)",
      description: "Analyze business processes and systems to identify improvements. Bridge the gap between IT and business stakeholders to optimize operations.",
      skills: ["Data Analysis", "Process Improvement", "Communication", "SQL", "Project Management"],
      education: "Bachelor's degree in Business, Economics, or related field.",
      workEnvironment: "Office environment with mix of independent analysis and stakeholder meetings.",
      topCompanies: ["McKinsey", "Deloitte", "Accenture", "IBM", "Microsoft", "Amazon", "JPMorgan Chase"]
    },
    "Entrepreneur": {
      name: "Entrepreneur",
      salary: "$0 - $1,000,000+ (Highly variable)",
      growth: "Variable (Depends on industry and success)",
      description: "Start and run your own business ventures. Identify market opportunities, develop products or services, and build companies from the ground up.",
      skills: ["Leadership", "Risk Management", "Innovation", "Networking", "Financial Management"],
      education: "No specific requirement, though business education can be helpful.",
      workEnvironment: "Highly flexible but often demanding. Mix of independent work and team building.",
      topCompanies: ["Self-employed", "Startups", "Y Combinator", "Techstars", "500 Startups"]
    },
    "Mechanical Engineer": {
      name: "Mechanical Engineer",
      salary: "$65,000 - $140,000+",
      growth: "+7% (As fast as average)",
      description: "Design, develop, and test mechanical devices and systems. Work on everything from engines to robots to manufacturing equipment.",
      skills: ["CAD Software", "Problem Solving", "Mathematics", "Physics", "Project Management"],
      education: "Bachelor's degree in Mechanical Engineering. Professional Engineer (PE) license beneficial.",
      workEnvironment: "Offices, laboratories, and manufacturing facilities. Mix of computer work and hands-on testing.",
      topCompanies: ["Boeing", "General Electric", "Tesla", "Ford", "SpaceX", "Lockheed Martin"]
    },
    "Graphic Designer": {
      name: "Graphic Designer",
      salary: "$40,000 - $90,000+",
      growth: "+3% (Slower than average)",
      description: "Create visual concepts to communicate ideas that inspire, inform, and captivate consumers. Design logos, websites, advertisements, and marketing materials.",
      skills: ["Adobe Creative Suite", "Typography", "Color Theory", "Branding", "Layout Design"],
      education: "Bachelor's degree in Graphic Design or related field. Strong portfolio essential.",
      workEnvironment: "Design studios, advertising agencies, or freelance. Creative environment with client deadlines.",
      topCompanies: ["Adobe", "Nike", "Apple", "Pentagram", "IDEO", "Frog Design"]
    },
    "Social Worker": {
      name: "Social Worker",
      salary: "$45,000 - $80,000+",
      growth: "+12% (Much faster than average)",
      description: "Help individuals, families, and communities overcome challenges and improve their well-being. Provide counseling, connect people with resources, and advocate for social justice.",
      skills: ["Empathy", "Communication", "Problem Solving", "Cultural Competency", "Case Management"],
      education: "Bachelor's in Social Work (BSW) minimum. Master's (MSW) required for clinical practice.",
      workEnvironment: "Offices, hospitals, schools, community centers. Can be emotionally demanding but rewarding.",
      topCompanies: ["Government Agencies", "Nonprofits", "Hospitals", "Schools", "United Way"]
    },
    "Financial Analyst": {
      name: "Financial Analyst",
      salary: "$60,000 - $150,000+",
      growth: "+6% (As fast as average)",
      description: "Evaluate investment opportunities, analyze financial data, and provide recommendations for business decisions. Help organizations and individuals make informed financial choices.",
      skills: ["Financial Modeling", "Excel", "Data Analysis", "Communication", "Attention to Detail"],
      education: "Bachelor's degree in Finance, Economics, or related field. CFA certification beneficial.",
      workEnvironment: "Office environment with regular client or stakeholder presentations. Can be high-pressure.",
      topCompanies: ["Goldman Sachs", "JPMorgan Chase", "Morgan Stanley", "BlackRock", "Vanguard"]
    },
    "Content Creator": {
      name: "Content Creator",
      salary: "$30,000 - $200,000+ (Highly variable)",
      growth: "+14% (Much faster than average)",
      description: "Create engaging content for digital platforms including social media, blogs, videos, and podcasts. Build audiences and monetize content through various channels.",
      skills: ["Writing", "Video Editing", "Social Media", "SEO", "Personal Branding"],
      education: "No specific requirement, though communications or marketing background helpful.",
      workEnvironment: "Highly flexible, often remote or home-based. Self-directed with irregular income.",
      topCompanies: ["YouTube", "TikTok", "Instagram", "Twitch", "Patreon", "Substack"]
    },
    "Cybersecurity Specialist": {
      name: "Cybersecurity Specialist",
      salary: "$80,000 - $180,000+",
      growth: "+33% (Much faster than average)",
      description: "Protect organizations from cyber threats by implementing security measures, monitoring for breaches, and responding to incidents.",
      skills: ["Network Security", "Ethical Hacking", "Risk Assessment", "Incident Response", "Security Tools"],
      education: "Bachelor's in Computer Science, Cybersecurity, or related field. Security certifications valuable.",
      workEnvironment: "Office or remote. Can involve on-call responsibilities and high-stress incident response.",
      topCompanies: ["CrowdStrike", "Palo Alto Networks", "FireEye", "IBM", "Microsoft", "Government Agencies"]
    },
    "Environmental Scientist": {
      name: "Environmental Scientist",
      salary: "$55,000 - $120,000+",
      growth: "+8% (As fast as average)",
      description: "Study the environment and solve problems related to pollution, climate change, and conservation. Conduct research and develop policies to protect natural resources.",
      skills: ["Research Methods", "Data Analysis", "Environmental Regulations", "Field Work", "Report Writing"],
      education: "Bachelor's degree in Environmental Science or related field. Master's often preferred.",
      workEnvironment: "Mix of office work, laboratory analysis, and outdoor fieldwork. Government and consulting firms.",
      topCompanies: ["EPA", "NOAA", "Environmental Consulting Firms", "National Parks Service", "Tesla"]
    },
    "Psychologist": {
      name: "Psychologist",
      salary: "$60,000 - $150,000+",
      growth: "+3% (As fast as average)",
      description: "Study human behavior and mental processes. Provide therapy, conduct research, or work in organizational settings to improve mental health and well-being.",
      skills: ["Active Listening", "Empathy", "Research Methods", "Assessment", "Communication"],
      education: "Doctoral degree in Psychology (PhD or PsyD). Licensing required for practice.",
      workEnvironment: "Private practice, hospitals, schools, or research institutions. Regular client interaction.",
      topCompanies: ["Private Practice", "Hospitals", "Universities", "Government Agencies", "Consulting Firms"]
    },
    "Lawyer": {
      name: "Lawyer",
      salary: "$70,000 - $300,000+",
      growth: "+4% (As fast as average)",
      description: "Represent clients in legal matters, provide legal advice, and advocate for justice. Specialize in areas like corporate law, criminal defense, or civil rights.",
      skills: ["Legal Research", "Writing", "Oral Advocacy", "Critical Thinking", "Negotiation"],
      education: "Law degree (JD) from accredited law school. Must pass bar exam to practice.",
      workEnvironment: "Law firms, government agencies, or corporate legal departments. Often long hours and high pressure.",
      topCompanies: ["BigLaw Firms", "Government", "Corporate Legal Departments", "Public Interest Organizations"]
    },
    "Doctor": {
      name: "Doctor",
      salary: "$200,000 - $500,000+",
      growth: "+3% (As fast as average)",
      description: "Diagnose and treat illnesses, injuries, and medical conditions. Provide preventive care and health education to patients across various specialties.",
      skills: ["Medical Knowledge", "Diagnostic Skills", "Communication", "Empathy", "Decision Making"],
      education: "Medical degree (MD or DO) plus residency training. Board certification in specialty.",
      workEnvironment: "Hospitals, clinics, private practice. Long hours, on-call responsibilities, high stress but rewarding.",
      topCompanies: ["Hospitals", "Private Practice", "Medical Groups", "Academic Medical Centers"]
    }
  };

  const questions = [
    {
      question: "What type of activities energize you the most?",
      options: [
        "Solving complex problems and puzzles",
        "Creating art, music, or writing",
        "Helping and working with people",
        "Building or fixing things with my hands",
        "Analyzing data and finding patterns",
        "Leading teams and organizing projects",
        "Exploring nature and the environment",
        "Performing or entertaining others"
      ]
    },
    {
      question: "In a group project, you typically:",
      options: [
        "Take the lead and organize everyone",
        "Come up with creative ideas and solutions",
        "Make sure everyone gets along and feels included",
        "Focus on the technical details and execution",
        "Research and gather information thoroughly",
        "Present the final results to others",
        "Mediate conflicts and find compromises",
        "Document and analyze the process"
      ]
    },
    {
      question: "What motivates you most in your future career?",
      options: [
        "Making a positive impact on society",
        "Financial success and stability",
        "Recognition and achievement",
        "Personal growth and continuous learning",
        "Creative expression and innovation",
        "Work-life balance and flexibility",
        "Helping individuals overcome challenges",
        "Advancing human knowledge and understanding"
      ]
    },
    {
      question: "Your ideal work environment would be:",
      options: [
        "A bustling office with lots of collaboration",
        "A quiet space where I can focus deeply",
        "Outdoors or in different locations",
        "A lab or workshop with specialized equipment",
        "From home with flexible hours",
        "A mix of different environments",
        "A hospital or healthcare setting",
        "A courtroom or legal office"
      ]
    },
    {
      question: "Which subject interests you most?",
      options: [
        "Science and Mathematics",
        "Arts and Literature",
        "Social Studies and Psychology",
        "Technology and Engineering",
        "Business and Economics",
        "Health and Medicine",
        "Philosophy and Ethics",
        "Environmental Studies"
      ]
    },
    {
      question: "When facing a challenge, you prefer to:",
      options: [
        "Break it down into logical steps",
        "Think outside the box for creative solutions",
        "Collaborate with others to find answers",
        "Research extensively before acting",
        "Jump in and learn by doing",
        "Seek guidance from mentors or experts",
        "Consider the ethical implications first",
        "Look for precedents and established methods"
      ]
    },
    {
      question: "What type of impact do you want to make?",
      options: [
        "Advance scientific knowledge and discovery",
        "Create beautiful or meaningful content",
        "Help individuals overcome challenges",
        "Build systems that improve efficiency",
        "Influence business decisions and strategy",
        "Improve health and quality of life",
        "Promote justice and fairness",
        "Protect the environment and wildlife"
      ]
    },
    {
      question: "Which activity sounds most appealing for a weekend?",
      options: [
        "Coding a personal project or app",
        "Writing, drawing, or making music",
        "Volunteering in your community",
        "Building something with your hands",
        "Reading about business or investing",
        "Learning a new skill online",
        "Debating philosophical questions",
        "Exploring nature or hiking"
      ]
    },
    {
      question: "What's your preferred way to communicate ideas?",
      options: [
        "Through detailed written reports",
        "Visual presentations with graphics",
        "Face-to-face conversations",
        "Demonstrations and prototypes",
        "Data and statistical analysis",
        "Storytelling and narratives",
        "Logical arguments and reasoning",
        "Artistic or creative expression"
      ]
    },
    {
      question: "Which of these future scenarios excites you most?",
      options: [
        "Leading a team at a major tech company",
        "Having your artwork displayed in galleries",
        "Running a nonprofit that helps others",
        "Inventing something that changes the world",
        "Starting your own successful business",
        "Discovering a cure for a major disease",
        "Arguing a case before the Supreme Court",
        "Directing an award-winning film"
      ]
    },
    {
      question: "How do you prefer to learn new things?",
      options: [
        "Reading books and research papers",
        "Watching videos and tutorials",
        "Hands-on practice and experimentation",
        "Discussion and collaboration with others",
        "Taking structured courses",
        "Learning from mentors and experts",
        "Reflecting and contemplating deeply",
        "Trial and error with immediate feedback"
      ]
    },
    {
      question: "What kind of recognition matters most to you?",
      options: [
        "Peer recognition from experts in my field",
        "Public acknowledgment and fame",
        "Personal satisfaction and self-fulfillment",
        "Financial rewards and bonuses",
        "Making a difference in people's lives",
        "Building something that lasts",
        "Intellectual respect and credibility",
        "Awards and formal honors"
      ]
    },
    {
      question: "Which type of problem-solving appeals to you?",
      options: [
        "Mathematical and logical puzzles",
        "Creative and artistic challenges",
        "Social and interpersonal issues",
        "Technical and engineering problems",
        "Strategic and business decisions",
        "Health and wellness concerns",
        "Ethical and moral dilemmas",
        "Environmental and sustainability issues"
      ]
    },
    {
      question: "What's your ideal team size for projects?",
      options: [
        "Working alone with full control",
        "Small team of 2-3 close collaborators",
        "Medium team of 4-8 diverse members",
        "Large team with specialized roles",
        "Leading a team of any size",
        "Being part of a massive organization",
        "One-on-one mentoring relationships",
        "Community-wide collaborative efforts"
      ]
    },
    {
      question: "Which aspect of technology interests you most?",
      options: [
        "Programming and software development",
        "Design and user experience",
        "Data analysis and artificial intelligence",
        "Hardware and engineering",
        "Cybersecurity and privacy",
        "Technology's impact on society",
        "Ethical implications of AI",
        "Environmental impact of technology"
      ]
    },
    {
      question: "What type of books or content do you enjoy most?",
      options: [
        "Science fiction and technical manuals",
        "Art books and creative writing",
        "Biographies and human interest stories",
        "How-to guides and instructional content",
        "Business and self-improvement books",
        "Medical journals and health articles",
        "Philosophy and ethics texts",
        "Nature documentaries and travel guides"
      ]
    },
    {
      question: "Which historical figure inspires you most?",
      options: [
        "Albert Einstein (Scientist)",
        "Leonardo da Vinci (Artist/Inventor)",
        "Mother Teresa (Humanitarian)",
        "Steve Jobs (Entrepreneur)",
        "Marie Curie (Researcher)",
        "Nelson Mandela (Leader)",
        "Socrates (Philosopher)",
        "Jane Goodall (Environmentalist)"
      ]
    },
    {
      question: "What's your approach to making important decisions?",
      options: [
        "Analyze all available data thoroughly",
        "Trust my intuition and gut feelings",
        "Consult with friends and family",
        "Research best practices and precedents",
        "Consider the financial implications",
        "Think about who will be affected",
        "Examine the ethical considerations",
        "Consider long-term consequences"
      ]
    },
    {
      question: "Which work schedule appeals to you most?",
      options: [
        "Traditional 9-5 with clear structure",
        "Flexible hours based on inspiration",
        "Varied schedule with different activities",
        "Project-based with intense focus periods",
        "Results-oriented with full autonomy",
        "Shift work helping people 24/7",
        "Academic calendar with research time",
        "Seasonal work aligned with nature"
      ]
    },
    {
      question: "What legacy do you want to leave behind?",
      options: [
        "Groundbreaking scientific discoveries",
        "Beautiful art that moves people",
        "Lives changed through direct help",
        "Innovative products that improve life",
        "A successful business empire",
        "Advances in medical treatment",
        "Contributions to human wisdom",
        "A healthier planet for future generations"
      ]
    }
  ];

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsComplete(true);
      incrementStat('assessmentsTaken', 1, 'Completed career assessment', 'assessment');
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    } else {
      window.location.href = '/dashboard';
    }
  };

  const saveAssessment = async () => {
    const assessmentName = prompt('Enter a name for this assessment:') || `Assessment ${savedAssessments.length + 1}`;
    const careers = getCareerRecommendations();
    const score = Math.round((careers.length / 5) * 100);
    
    const newAssessment: AssessmentResult = {
      id: crypto.randomUUID(),
      name: assessmentName,
      date: new Date().toLocaleDateString(),
      careers: careers,
      answers: answers,
      questions: questions,
      results: {
        careers: careers,
        completedAt: new Date().toISOString(),
        totalQuestions: questions.length
      },
      score: score
    };
    
    const updatedAssessments = [...savedAssessments, newAssessment];
    setSavedAssessments(updatedAssessments);
    await saveAssessmentsToSupabase(newAssessment);
    alert('Assessment saved successfully!');
  };

  const deleteAssessment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_assessments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting assessment from Supabase:', error);
      }

      const updatedAssessments = savedAssessments.filter(assessment => assessment.id !== id);
      setSavedAssessments(updatedAssessments);
    } catch (error) {
      console.error('Error deleting assessment:', error);
    }
  };

  const loadAssessment = (assessment: AssessmentResult) => {
    setAnswers(assessment.answers);
    setCurrentQuestion(assessment.answers.length);
    setIsComplete(true);
  };

  const getCareerRecommendations = () => {
    // Enhanced career matching with more careers
    const careerScores: { [key: string]: number } = {
      "Software Engineer": 0,
      "Data Scientist": 0,
      "UX/UI Designer": 0,
      "Product Manager": 0,
      "Marketing Specialist": 0,
      "Research Scientist": 0,
      "Teacher/Educator": 0,
      "Healthcare Professional": 0,
      "Business Analyst": 0,
      "Entrepreneur": 0,
      "Mechanical Engineer": 0,
      "Graphic Designer": 0,
      "Social Worker": 0,
      "Financial Analyst": 0,
      "Content Creator": 0,
      "Cybersecurity Specialist": 0,
      "Environmental Scientist": 0,
      "Psychologist": 0,
      "Lawyer": 0,
      "Doctor": 0
    };

    // Advanced scoring logic based on answers
    answers.forEach((answer, index) => {
      switch (index) {
        case 0: // Activities that energize
          if (answer.includes("Solving complex problems")) {
            careerScores["Software Engineer"] += 4;
            careerScores["Data Scientist"] += 4;
            careerScores["Research Scientist"] += 3;
            careerScores["Cybersecurity Specialist"] += 3;
          }
          if (answer.includes("Creating art")) {
            careerScores["UX/UI Designer"] += 4;
            careerScores["Graphic Designer"] += 4;
            careerScores["Content Creator"] += 4;
          }
          if (answer.includes("Helping and working")) {
            careerScores["Teacher/Educator"] += 4;
            careerScores["Healthcare Professional"] += 4;
            careerScores["Social Worker"] += 4;
            careerScores["Psychologist"] += 3;
          }
          if (answer.includes("Building or fixing")) {
            careerScores["Mechanical Engineer"] += 4;
            careerScores["Software Engineer"] += 3;
          }
          if (answer.includes("Analyzing data")) {
            careerScores["Data Scientist"] += 4;
            careerScores["Business Analyst"] += 4;
            careerScores["Financial Analyst"] += 4;
            careerScores["Research Scientist"] += 3;
          }
          if (answer.includes("Leading teams")) {
            careerScores["Product Manager"] += 4;
            careerScores["Entrepreneur"] += 4;
            careerScores["Business Analyst"] += 3;
          }
          if (answer.includes("Exploring nature")) {
            careerScores["Environmental Scientist"] += 4;
          }
          if (answer.includes("Performing")) {
            careerScores["Content Creator"] += 4;
          }
          break;

        case 4: // Subject interest
          if (answer.includes("Science and Mathematics")) {
            careerScores["Research Scientist"] += 4;
            careerScores["Data Scientist"] += 3;
            careerScores["Software Engineer"] += 3;
            careerScores["Environmental Scientist"] += 3;
          }
          if (answer.includes("Arts and Literature")) {
            careerScores["Content Creator"] += 4;
            careerScores["Graphic Designer"] += 3;
            careerScores["UX/UI Designer"] += 3;
          }
          if (answer.includes("Technology and Engineering")) {
            careerScores["Software Engineer"] += 4;
            careerScores["Mechanical Engineer"] += 4;
            careerScores["Product Manager"] += 3;
            careerScores["Cybersecurity Specialist"] += 3;
          }
          if (answer.includes("Business and Economics")) {
            careerScores["Business Analyst"] += 4;
            careerScores["Financial Analyst"] += 4;
            careerScores["Entrepreneur"] += 3;
            careerScores["Marketing Specialist"] += 3;
          }
          if (answer.includes("Health and Medicine")) {
            careerScores["Healthcare Professional"] += 4;
            careerScores["Doctor"] += 4;
            careerScores["Research Scientist"] += 3;
          }
          if (answer.includes("Social Studies and Psychology")) {
            careerScores["Psychologist"] += 4;
            careerScores["Social Worker"] += 3;
            careerScores["Teacher/Educator"] += 3;
          }
          if (answer.includes("Philosophy and Ethics")) {
            careerScores["Lawyer"] += 3;
            careerScores["Teacher/Educator"] += 3;
          }
          if (answer.includes("Environmental Studies")) {
            careerScores["Environmental Scientist"] += 4;
          }
          break;

        case 6: // Type of impact
          if (answer.includes("Advance scientific knowledge")) {
            careerScores["Research Scientist"] += 4;
            careerScores["Data Scientist"] += 3;
          }
          if (answer.includes("Create beautiful")) {
            careerScores["Graphic Designer"] += 4;
            careerScores["UX/UI Designer"] += 4;
            careerScores["Content Creator"] += 4;
          }
          if (answer.includes("Help individuals")) {
            careerScores["Psychologist"] += 4;
            careerScores["Social Worker"] += 4;
            careerScores["Healthcare Professional"] += 4;
            careerScores["Doctor"] += 3;
          }
          if (answer.includes("Build systems")) {
            careerScores["Software Engineer"] += 4;
            careerScores["Product Manager"] += 3;
            careerScores["Business Analyst"] += 3;
          }
          if (answer.includes("Influence business")) {
            careerScores["Business Analyst"] += 4;
            careerScores["Entrepreneur"] += 4;
            careerScores["Marketing Specialist"] += 3;
          }
          if (answer.includes("Improve health")) {
            careerScores["Doctor"] += 4;
            careerScores["Healthcare Professional"] += 4;
          }
          if (answer.includes("Promote justice")) {
            careerScores["Lawyer"] += 4;
            careerScores["Social Worker"] += 3;
          }
          if (answer.includes("Protect the environment")) {
            careerScores["Environmental Scientist"] += 4;
          }
          break;

        case 16: // Historical figure inspiration
          if (answer.includes("Einstein")) {
            careerScores["Research Scientist"] += 4;
            careerScores["Data Scientist"] += 3;
          }
          if (answer.includes("da Vinci")) {
            careerScores["Graphic Designer"] += 4;
            careerScores["Mechanical Engineer"] += 3;
          }
          if (answer.includes("Mother Teresa")) {
            careerScores["Social Worker"] += 4;
            careerScores["Healthcare Professional"] += 4;
          }
          if (answer.includes("Steve Jobs")) {
            careerScores["Entrepreneur"] += 4;
            careerScores["Product Manager"] += 4;
            careerScores["UX/UI Designer"] += 3;
          }
          if (answer.includes("Marie Curie")) {
            careerScores["Research Scientist"] += 4;
            careerScores["Doctor"] += 3;
            careerScores["Data Scientist"] += 3;
          }
          if (answer.includes("Nelson Mandela")) {
            careerScores["Lawyer"] += 4;
            careerScores["Social Worker"] += 3;
          }
          if (answer.includes("Socrates")) {
            careerScores["Teacher/Educator"] += 4;
            careerScores["Lawyer"] += 3;
          }
          if (answer.includes("Jane Goodall")) {
            careerScores["Environmental Scientist"] += 4;
            careerScores["Research Scientist"] += 3;
          }
          break;
      }
    });

    // Return top 5 careers
    return Object.entries(careerScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([career]) => career);
  };

  const getCareerIcon = (career: string) => {
    if (career.includes("Software") || career.includes("Data") || career.includes("Cybersecurity")) return Code;
    if (career.includes("Designer") || career.includes("Creator")) return Lightbulb;
    if (career.includes("Healthcare") || career.includes("Doctor")) return Heart;
    if (career.includes("Business") || career.includes("Entrepreneur") || career.includes("Financial")) return Briefcase;
    if (career.includes("Teacher") || career.includes("Research")) return Brain;
    if (career.includes("Lawyer")) return Gavel;
    if (career.includes("Environmental")) return Globe;
    if (career.includes("Engineer")) return Wrench;
    if (career.includes("Musician") || career.includes("Artist")) return Music;
    if (career.includes("Photographer") || career.includes("Film")) return Camera;
    if (career.includes("Philosopher") || career.includes("Psychologist")) return Brain;
    return Users;
  };

  const viewCareerDetails = (career: string) => {
    setSelectedCareer(career);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to take the assessment</h1>
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={goBack}
              className="bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-white/20 hover:shadow-xl transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Career Assessment
              </h1>
              <p className="text-gray-600">Discover careers that match your interests and personality</p>
            </div>
          </div>

          {/* Saved Assessments */}
          {savedAssessments.length > 0 && !isComplete && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Saved Assessments</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {savedAssessments.map((assessment) => (
                  <div key={assessment.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{assessment.name}</h3>
                      <p className="text-sm text-gray-600">{assessment.date}</p>
                      <p className="text-xs text-purple-600">{assessment.careers.slice(0, 3).join(', ')}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => loadAssessment(assessment)}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteAssessment(assessment.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isComplete ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {questions[currentQuestion].question}
                </h2>
                <div className="space-y-4">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full group-hover:border-purple-500 transition-colors"></div>
                        <span className="text-gray-700 group-hover:text-purple-700 font-medium">
                          {option}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : selectedCareer ? (
            // Career Details View
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
              <button 
                onClick={() => setSelectedCareer(null)}
                className="mb-6 flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to results</span>
              </button>
              
              {careerDatabase[selectedCareer] && (
                <div>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-xl">
                      {getCareerIcon(selectedCareer) && React.createElement(getCareerIcon(selectedCareer), { className: "h-8 w-8 text-white" })}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">{careerDatabase[selectedCareer].name}</h2>
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center space-x-1 text-green-600">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium">{careerDatabase[selectedCareer].salary}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center space-x-1 text-blue-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-medium">{careerDatabase[selectedCareer].growth}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{careerDatabase[selectedCareer].description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Key Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {careerDatabase[selectedCareer].skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Education Required</h3>
                        <p className="text-gray-700">{careerDatabase[selectedCareer].education}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Work Environment</h3>
                        <p className="text-gray-700">{careerDatabase[selectedCareer].workEnvironment}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Top Companies</h3>
                      <div className="flex flex-wrap gap-2">
                        {careerDatabase[selectedCareer].topCompanies.map((company, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                      <h3 className="text-xl font-bold text-purple-900 mb-2 flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Next Steps
                      </h3>
                      <p className="text-purple-800 mb-4">Ready to explore this career path? Here's how to get started:</p>
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                          <p className="text-purple-800">View your personalized learning roadmap for this career</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                          <p className="text-purple-800">Explore scholarships and internships in this field</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                          <p className="text-purple-800">Connect with mentors and professionals through our network</p>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-4">
                        <button
                          onClick={() => window.location.href = '/view-roadmap'}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                          View Roadmap
                        </button>
                        <button
                          onClick={() => window.location.href = '/explore-opportunities'}
                          className="border border-purple-300 text-purple-700 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-all"
                        >
                          Find Opportunities
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
              <div className="text-center mb-8">
                <div className="bg-green-100 rounded-full p-4 w-fit mx-auto mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Assessment Complete!</h2>
                <p className="text-gray-600 text-lg">
                  Based on your responses, here are some career paths that might interest you:
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {getCareerRecommendations().map((career, index) => {
                  const IconComponent = getCareerIcon(career);
                  const isTopMatch = index === 0;
                  
                  return (
                    <div 
                      key={index} 
                      className={`bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border ${isTopMatch ? 'border-purple-500 ring-2 ring-purple-300' : 'border-purple-200'} cursor-pointer hover:shadow-lg transition-all`}
                      onClick={() => viewCareerDetails(career)}
                    >
                      {isTopMatch && (
                        <div className="flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full w-fit mb-3">
                          <Star className="h-3 w-3" />
                          <span className="text-xs font-medium">Best Match</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900">{career}</h3>
                      </div>
                      {careerDatabase[career] && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-gray-700">{careerDatabase[career].salary}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-gray-700">{careerDatabase[career].growth}</span>
                          </div>
                          <button className="text-purple-600 text-sm hover:text-purple-800 mt-2 flex items-center space-x-1">
                            <span>View details</span>
                            <ArrowLeft className="h-3 w-3 rotate-180" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={saveAssessment}
                  className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-all"
                >
                  <Save className="h-5 w-5" />
                  <span>Save Assessment</span>
                </button>
                <button
                  onClick={() => window.location.href = '/view-roadmap'}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  View Learning Roadmap
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:border-purple-300 hover:text-purple-600 transition-all"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}