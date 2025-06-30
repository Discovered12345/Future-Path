import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, Star, BookOpen, Video, FileText, Code, Award, Target, Zap, ExternalLink, Save, Trash2, Plus, Brain, Users, Heart, Briefcase, Lightbulb, Microscope, Calculator, Palette, Music, Globe, Gavel, Wrench, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserStats } from '../hooks/useUserStats';
import { supabase } from '../lib/supabase';
import { geminiService } from '../services/gemini';

interface SavedRoadmap {
  id: string;
  name: string;
  track: string;
  date: string;
  progress: number;
  steps: any[];
}

interface AssessmentResult {
  careers: string[];
  answers: string[];
}

interface AIRoadmapStep {
  title: string;
  description: string;
  duration: string;
  skills: string[];
  resources: {
    type: string;
    title: string;
    platform: string;
    difficulty: string;
    url: string;
  }[];
  status?: string;
}

export default function ViewRoadmap() {
  const { user } = useAuth();
  const { incrementStat } = useUserStats();
  const [selectedTrack, setSelectedTrack] = useState('software-engineering');
  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult | null>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [customRoadmapSteps, setCustomRoadmapSteps] = useState<AIRoadmapStep[]>([]);
  const [generationProgress, setGenerationProgress] = useState('');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);

  // Load saved roadmaps and assessment results
  useEffect(() => {
    if (user) {
      loadSavedRoadmaps();
      loadLatestAssessment();
    }
  }, [user]);

  const loadLatestAssessment = async () => {
    if (!user) return;

    try {
      const { data: assessmentData, error } = await supabase
        .from('user_assessments')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading assessment:', error);
      } else if (assessmentData && assessmentData.length > 0) {
        const latest = assessmentData[0];
        setAssessmentResults({
          careers: latest.results?.careers || [],
          answers: latest.answers || []
        });
        
        // Auto-select the first recommended career track
        if (latest.results?.careers && latest.results.careers.length > 0) {
          const firstCareer = latest.results.careers[0];
          const trackKey = getTrackKeyFromCareer(firstCareer);
          if (trackKey) {
            setSelectedTrack(trackKey);
          }
        }
      }
    } catch (error) {
      console.error('Error loading assessment:', error);
    }
  };

  const getTrackKeyFromCareer = (career: string): string | null => {
    const careerMappings: { [key: string]: string } = {
      'Software Engineer': 'software-engineering',
      'Data Scientist': 'data-science',
      'UX/UI Designer': 'product-design',
      'Product Manager': 'product-management',
      'Marketing Specialist': 'marketing',
      'Research Scientist': 'research-science',
      'Teacher/Educator': 'education',
      'Healthcare Professional': 'healthcare',
      'Business Analyst': 'business-analysis',
      'Entrepreneur': 'entrepreneurship',
      'Mechanical Engineer': 'mechanical-engineering',
      'Graphic Designer': 'graphic-design',
      'Social Worker': 'social-work',
      'Financial Analyst': 'finance',
      'Content Creator': 'content-creation',
      'Cybersecurity Specialist': 'cybersecurity',
      'Environmental Scientist': 'environmental-science',
      'Psychologist': 'psychology',
      'Lawyer': 'law',
      'Doctor': 'medicine',
      'Architect': 'architecture',
      'Journalist': 'journalism',
      'Chef': 'culinary-arts',
      'Photographer': 'photography',
      'Musician': 'music',
      'Film Director': 'film-production',
      'Game Developer': 'game-development'
    };

    return careerMappings[career] || null;
  };

  const cleanJsonString = (jsonString: string): string => {
    // Remove any text before the first {
    const startIndex = jsonString.indexOf('{');
    if (startIndex === -1) return jsonString;
    
    // Remove any text after the last }
    const endIndex = jsonString.lastIndexOf('}');
    if (endIndex === -1) return jsonString;
    
    let cleanedJson = jsonString.substring(startIndex, endIndex + 1);
    
    // Fix common JSON issues
    cleanedJson = cleanedJson
      // Remove markdown code blocks
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      // Fix unescaped backslashes (but not already escaped ones)
      .replace(/(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\')
      // Fix trailing commas
      .replace(/,(\s*[}\]])/g, '$1')
      // Fix unescaped quotes in strings (more careful approach)
      .replace(/([^\\])"([^"]*[^\\])"([^,}\]:])/g, '$1"$2\\"$3')
      // Remove any control characters
      .replace(/[\x00-\x1F\x7F]/g, '');
    
    return cleanedJson;
  };

  const parseAIResponse = (response: string): any => {
    try {
      // First, try to find JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      let jsonString = jsonMatch[0];
      
      // Clean the JSON string
      jsonString = cleanJsonString(jsonString);
      
      // Try to parse the cleaned JSON
      const parsed = JSON.parse(jsonString);
      
      // Validate the structure
      if (!parsed.steps || !Array.isArray(parsed.steps)) {
        throw new Error('Invalid roadmap structure: missing or invalid steps array');
      }
      
      // Validate each step
      for (let i = 0; i < parsed.steps.length; i++) {
        const step = parsed.steps[i];
        if (!step.title || !step.description || !step.skills || !step.resources) {
          throw new Error(`Invalid step structure at index ${i}`);
        }
        
        if (!Array.isArray(step.skills) || !Array.isArray(step.resources)) {
          throw new Error(`Invalid arrays in step ${i}`);
        }
      }
      
      return parsed;
    } catch (error) {
      console.error('JSON parsing error:', error);
      console.error('Original response:', response);
      throw error;
    }
  };

  const generateFallbackRoadmap = (career: string): any => {
    return {
      roadmapTitle: `High School Path to ${career}`,
      description: `A comprehensive 4-year high school roadmap for ${career}`,
      steps: [
        {
          title: "9th Grade Foundation",
          description: "Build strong academic fundamentals and explore your interests",
          duration: "1 year",
          skills: ["Study Skills", "Time Management", "Basic Research", "Communication"],
          resources: [
            {
              type: "course",
              title: "Khan Academy Study Skills",
              platform: "Khan Academy",
              difficulty: "Beginner",
              url: "https://www.khanacademy.org"
            },
            {
              type: "book",
              title: "How to Study Effectively",
              platform: "Library",
              difficulty: "Beginner",
              url: "#"
            }
          ]
        },
        {
          title: "10th Grade Skill Building",
          description: "Develop core skills and begin specialization",
          duration: "1 year",
          skills: ["Critical Thinking", "Problem Solving", "Collaboration", "Leadership"],
          resources: [
            {
              type: "course",
              title: "Introduction to Critical Thinking",
              platform: "Coursera",
              difficulty: "Intermediate",
              url: "https://www.coursera.org"
            }
          ]
        },
        {
          title: "11th Grade Specialization",
          description: "Focus on your chosen field and build expertise",
          duration: "1 year",
          skills: ["Advanced Research", "Project Management", "Presentation Skills"],
          resources: [
            {
              type: "project",
              title: "Independent Research Project",
              platform: "Self-guided",
              difficulty: "Advanced",
              url: "#"
            }
          ]
        },
        {
          title: "12th Grade College Prep",
          description: "Prepare for college and advanced studies",
          duration: "1 year",
          skills: ["College Readiness", "Advanced Writing", "Interview Skills"],
          resources: [
            {
              type: "course",
              title: "College Preparation Course",
              platform: "Local College",
              difficulty: "Advanced",
              url: "#"
            }
          ]
        }
      ]
    };
  };

  const generateAIRoadmap = async () => {
    if (!assessmentResults || !assessmentResults.careers.length) {
      alert('Please take an assessment first to generate a personalized roadmap!');
      return;
    }

    setIsGeneratingRoadmap(true);
    setGenerationProgress('Analyzing your assessment results...');
    
    try {
      const primaryCareer = assessmentResults.careers[0];
      const userInterests = assessmentResults.answers.slice(0, 8).join(', ');
      
      setGenerationProgress('Creating personalized learning path...');
      
      const prompt = `Create a comprehensive high school learning roadmap for a teenager interested in becoming a ${primaryCareer}.

Based on their assessment responses showing interests in: ${userInterests}

Please provide a detailed JSON response with this EXACT structure (no additional text, just valid JSON):

{
  "roadmapTitle": "High School Path to ${primaryCareer}",
  "description": "A comprehensive 4-year high school roadmap",
  "steps": [
    {
      "title": "9th Grade Foundation",
      "description": "Build strong academic fundamentals",
      "duration": "1 year",
      "skills": ["skill1", "skill2", "skill3", "skill4"],
      "resources": [
        {
          "type": "course",
          "title": "Course Name",
          "platform": "Platform Name",
          "difficulty": "Beginner",
          "url": "https://example.com"
        }
      ]
    }
  ]
}

Requirements:
- Create exactly 4 steps for grades 9-12
- Each step must have 4-6 skills
- Each step must have 3-5 resources
- Use real URLs when possible (Khan Academy, Coursera, edX, YouTube)
- Resource types: course, book, project, practice, video
- Difficulty levels: Beginner, Intermediate, Advanced
- Focus on ${primaryCareer} career path
- Make it realistic for high school students

Return ONLY valid JSON, no markdown formatting or additional text.`;

      setGenerationProgress('Generating roadmap with AI...');
      
      const response = await geminiService.generateResponse([
        { role: 'user', content: prompt }
      ]);

      setGenerationProgress('Processing AI response...');

      let roadmapData;
      try {
        roadmapData = parseAIResponse(response);
      } catch (parseError) {
        console.warn('AI response parsing failed, using fallback roadmap:', parseError);
        setGenerationProgress('AI response had issues, creating fallback roadmap...');
        roadmapData = generateFallbackRoadmap(primaryCareer);
      }
      
      // Add status to steps
      const stepsWithStatus = roadmapData.steps.map((step: any, index: number) => ({
        ...step,
        status: index === 0 ? 'current' : 'upcoming'
      }));
      
      setCustomRoadmapSteps(stepsWithStatus);
      setSelectedTrack('ai-generated');
      
      setGenerationProgress('Roadmap generated successfully!');
      
      // Auto-save the AI roadmap
      setTimeout(async () => {
        await saveAIRoadmap(roadmapData.roadmapTitle || `AI Roadmap for ${primaryCareer}`, stepsWithStatus);
        setGenerationProgress('');
      }, 1000);
      
    } catch (error) {
      console.error('Error generating AI roadmap:', error);
      
      // Use fallback roadmap if AI completely fails
      const primaryCareer = assessmentResults.careers[0];
      setGenerationProgress('AI service unavailable, creating fallback roadmap...');
      
      const fallbackData = generateFallbackRoadmap(primaryCareer);
      const stepsWithStatus = fallbackData.steps.map((step: any, index: number) => ({
        ...step,
        status: index === 0 ? 'current' : 'upcoming'
      }));
      
      setCustomRoadmapSteps(stepsWithStatus);
      setSelectedTrack('ai-generated');
      
      setTimeout(async () => {
        await saveAIRoadmap(fallbackData.roadmapTitle, stepsWithStatus);
        setGenerationProgress('');
        alert('AI service was unavailable, but we created a basic roadmap for you! You can always try generating a new one later.');
      }, 1000);
      
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const saveAIRoadmap = async (title: string, steps: AIRoadmapStep[]) => {
    if (!user) return;

    const newRoadmap: SavedRoadmap = {
      id: crypto.randomUUID(),
      name: title,
      track: 'ai-generated',
      date: new Date().toLocaleDateString(),
      progress: 0,
      steps: steps
    };

    try {
      await supabase
        .from('user_roadmaps')
        .upsert({
          id: newRoadmap.id,
          user_id: user.id,
          roadmap_name: newRoadmap.name,
          career_track: newRoadmap.track,
          steps: newRoadmap.steps,
          progress_percentage: newRoadmap.progress,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      const updatedRoadmaps = [...savedRoadmaps, newRoadmap];
      setSavedRoadmaps(updatedRoadmaps);
      setSelectedRoadmapId(newRoadmap.id);
      
      incrementStat('roadmapsCreated', 1, `Created AI Roadmap: ${title}`, 'roadmap');
      
    } catch (error) {
      console.error('Error saving AI roadmap:', error);
      alert('Roadmap was generated but there was an error saving it. Please try again.');
    }
  };

  const loadSavedRoadmaps = async () => {
    if (!user) return;

    try {
      const { data: roadmapsData, error } = await supabase
        .from('user_roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading roadmaps from Supabase:', error);
      } else if (roadmapsData) {
        const formattedRoadmaps = roadmapsData.map(roadmap => ({
          id: roadmap.id,
          name: roadmap.roadmap_name,
          track: roadmap.career_track,
          date: new Date(roadmap.created_at).toLocaleDateString(),
          progress: roadmap.progress_percentage,
          steps: roadmap.steps || []
        }));
        setSavedRoadmaps(formattedRoadmaps);
        
        // If there are roadmaps, select the first one by default
        if (formattedRoadmaps.length > 0) {
          setSelectedRoadmapId(formattedRoadmaps[0].id);
          
          // If it's an AI-generated roadmap, set the custom steps
          if (formattedRoadmaps[0].track === 'ai-generated') {
            setCustomRoadmapSteps(formattedRoadmaps[0].steps);
            setSelectedTrack('ai-generated');
          } else {
            setSelectedTrack(formattedRoadmaps[0].track);
            setCustomRoadmapSteps([]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading roadmaps:', error);
    }
  };

  const tracks = {
    'software-engineering': {
      title: 'Software Engineering',
      description: 'Full-stack development and computer science fundamentals',
      duration: '12-18 months',
      difficulty: 'Intermediate',
      color: 'from-blue-500 to-cyan-500',
      icon: Code
    },
    'data-science': {
      title: 'Data Science & AI',
      description: 'Machine learning, statistics, and data analysis',
      duration: '15-20 months',
      difficulty: 'Advanced',
      color: 'from-purple-500 to-pink-500',
      icon: Brain
    },
    'product-design': {
      title: 'Product Design',
      description: 'UX/UI design and user research',
      duration: '10-14 months',
      difficulty: 'Beginner',
      color: 'from-green-500 to-emerald-500',
      icon: Lightbulb
    },
    'business-analysis': {
      title: 'Business & Entrepreneurship',
      description: 'Business strategy, marketing, and leadership',
      duration: '8-12 months',
      difficulty: 'Beginner',
      color: 'from-orange-500 to-red-500',
      icon: Briefcase
    },
    'medicine': {
      title: 'Medicine & Healthcare',
      description: 'Medical sciences and patient care',
      duration: '8+ years',
      difficulty: 'Advanced',
      color: 'from-red-500 to-pink-500',
      icon: Heart
    },
    'law': {
      title: 'Law & Legal Studies',
      description: 'Legal principles, advocacy, and justice',
      duration: '7+ years',
      difficulty: 'Advanced',
      color: 'from-indigo-500 to-purple-500',
      icon: Gavel
    },
    'psychology': {
      title: 'Psychology',
      description: 'Human behavior and mental health',
      duration: '6-8 years',
      difficulty: 'Intermediate',
      color: 'from-teal-500 to-blue-500',
      icon: Brain
    },
    'ai-generated': {
      title: 'AI Generated Roadmap',
      description: 'Personalized roadmap created by AI based on your assessment',
      duration: '4 years',
      difficulty: 'Personalized',
      color: 'from-gradient-to-r from-purple-600 via-pink-600 to-blue-600',
      icon: Brain
    }
  };

  // Enhanced roadmap steps with more comprehensive content
  const roadmapSteps = {
    'software-engineering': [
      {
        title: "Programming Fundamentals",
        description: "Master the basics of programming and computer science",
        status: "completed",
        duration: "2-3 months",
        skills: ["Python/JavaScript", "Data Structures", "Algorithms", "Git/GitHub"],
        resources: [
          { type: "course", title: "CS50: Introduction to Computer Science", platform: "Harvard/edX", url: "https://cs50.harvard.edu/x/", difficulty: "Beginner" },
          { type: "practice", title: "LeetCode Easy Problems", platform: "LeetCode", url: "https://leetcode.com/", difficulty: "Beginner" },
          { type: "project", title: "Build a Calculator App", platform: "Self-guided", url: "#", difficulty: "Beginner" },
          { type: "book", title: "Automate the Boring Stuff with Python", platform: "Online", url: "https://automatetheboringstuff.com/", difficulty: "Beginner" },
          { type: "video", title: "Python Programming Tutorial", platform: "YouTube", url: "#", difficulty: "Beginner" }
        ]
      },
      {
        title: "Web Development Basics",
        description: "Learn HTML, CSS, and JavaScript fundamentals",
        status: "current",
        duration: "3-4 months",
        skills: ["HTML5", "CSS3", "JavaScript ES6+", "Responsive Design"],
        resources: [
          { type: "course", title: "The Complete Web Developer Course", platform: "Udemy", url: "#", difficulty: "Intermediate" },
          { type: "practice", title: "Frontend Mentor Challenges", platform: "Frontend Mentor", url: "https://www.frontendmentor.io/", difficulty: "Intermediate" },
          { type: "project", title: "Personal Portfolio Website", platform: "Self-guided", url: "#", difficulty: "Intermediate" },
          { type: "video", title: "JavaScript Crash Course", platform: "YouTube", url: "#", difficulty: "Beginner" },
          { type: "book", title: "Eloquent JavaScript", platform: "Online", url: "https://eloquentjavascript.net/", difficulty: "Intermediate" }
        ]
      }
    ]
  };

  const saveRoadmap = async () => {
    const roadmapName = prompt('Enter a name for this roadmap:') || `${tracks[selectedTrack]?.title || 'Custom'} Roadmap`;
    
    const newRoadmap: SavedRoadmap = {
      id: crypto.randomUUID(),
      name: roadmapName,
      track: selectedTrack,
      date: new Date().toLocaleDateString(),
      progress: 20,
      steps: currentSteps
    };
    
    try {
      await supabase
        .from('user_roadmaps')
        .upsert({
          id: newRoadmap.id,
          user_id: user?.id,
          roadmap_name: newRoadmap.name,
          career_track: newRoadmap.track,
          steps: newRoadmap.steps,
          progress_percentage: newRoadmap.progress,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      const updatedRoadmaps = [...savedRoadmaps, newRoadmap];
      setSavedRoadmaps(updatedRoadmaps);
      setSelectedRoadmapId(newRoadmap.id);
      
      incrementStat('roadmapsCreated', 1, `Created ${roadmapName}`, 'roadmap');
      alert('Roadmap saved successfully!');
    } catch (error) {
      console.error('Error saving roadmap:', error);
      alert('Error saving roadmap. Please try again.');
    }
  };

  const deleteRoadmap = async (id: string) => {
    try {
      await supabase
        .from('user_roadmaps')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user?.id);

      const updatedRoadmaps = savedRoadmaps.filter(roadmap => roadmap.id !== id);
      setSavedRoadmaps(updatedRoadmaps);
      
      // If the deleted roadmap was selected, select another one
      if (selectedRoadmapId === id) {
        if (updatedRoadmaps.length > 0) {
          setSelectedRoadmapId(updatedRoadmaps[0].id);
          
          // Update track and steps based on the newly selected roadmap
          if (updatedRoadmaps[0].track === 'ai-generated') {
            setCustomRoadmapSteps(updatedRoadmaps[0].steps);
            setSelectedTrack('ai-generated');
          } else {
            setSelectedTrack(updatedRoadmaps[0].track);
            setCustomRoadmapSteps([]);
          }
        } else {
          setSelectedRoadmapId(null);
          setSelectedTrack('software-engineering');
          setCustomRoadmapSteps([]);
        }
      }
    } catch (error) {
      console.error('Error deleting roadmap:', error);
    }
  };

  const loadRoadmap = (roadmap: SavedRoadmap) => {
    setSelectedRoadmapId(roadmap.id);
    setSelectedTrack(roadmap.track);
    
    if (roadmap.track === 'ai-generated') {
      setCustomRoadmapSteps(roadmap.steps);
    } else {
      setCustomRoadmapSteps([]);
    }
  };

  // Get the current roadmap steps based on selection
  const getCurrentRoadmapSteps = () => {
    // If a roadmap is selected, find it in the saved roadmaps
    if (selectedRoadmapId) {
      const selectedRoadmap = savedRoadmaps.find(r => r.id === selectedRoadmapId);
      if (selectedRoadmap) {
        return selectedRoadmap.steps;
      }
    }
    
    // Otherwise, use custom steps if available or default steps
    if (customRoadmapSteps.length > 0) {
      return customRoadmapSteps;
    }
    
    return roadmapSteps[selectedTrack as keyof typeof roadmapSteps] || [];
  };

  const currentSteps = getCurrentRoadmapSteps();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'current': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'upcoming': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'book': return <FileText className="h-4 w-4" />;
      case 'project': return <Code className="h-4 w-4" />;
      case 'practice': return <Target className="h-4 w-4" />;
      case 'documentation': return <FileText className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      case 'Personalized': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your roadmap</h1>
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

  const currentTrack = tracks[selectedTrack] || tracks['software-engineering'];

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
                Learning Roadmap
              </h1>
              <p className="text-gray-600">Choose your career track and follow your personalized path</p>
            </div>
          </div>

          {/* AI Roadmap Generator */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="h-8 w-8" />
                <h2 className="text-2xl font-bold">AI Roadmap Generator</h2>
              </div>
              <p className="text-purple-100 mb-6">
                {assessmentResults 
                  ? "Generate a personalized high school roadmap based on your career assessment results!"
                  : "Take a career assessment first to unlock personalized AI roadmaps."
                }
              </p>
              
              {isGeneratingRoadmap ? (
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="font-medium">{generationProgress}</span>
                </div>
              ) : (
                <button
                  onClick={assessmentResults ? generateAIRoadmap : () => window.location.href = '/take-assessment'}
                  className="bg-white text-purple-600 px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center space-x-2"
                >
                  <Brain className="h-5 w-5" />
                  <span>
                    {assessmentResults ? 'Generate AI Roadmap' : 'Take Assessment First'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Assessment-Based Recommendations */}
          {assessmentResults && assessmentResults.careers.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Based on Your Assessment</h2>
              <p className="text-gray-600 mb-4">We recommend these career tracks based on your interests and personality:</p>
              <div className="flex flex-wrap gap-3">
                {assessmentResults.careers.slice(0, 5).map((career, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const trackKey = getTrackKeyFromCareer(career);
                      if (trackKey && tracks[trackKey]) {
                        setSelectedTrack(trackKey);
                        setCustomRoadmapSteps([]);
                        setSelectedRoadmapId(null);
                      }
                    }}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded-full text-sm font-medium transition-all"
                  >
                    {career}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Saved Roadmaps */}
          {savedRoadmaps.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Saved Roadmaps</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedRoadmaps.map((roadmap) => (
                  <div 
                    key={roadmap.id} 
                    className={`bg-gray-50 rounded-lg p-4 border-2 transition-all ${
                      selectedRoadmapId === roadmap.id ? 'border-purple-500' : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{roadmap.name}</h3>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => loadRoadmap(roadmap)}
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            selectedRoadmapId === roadmap.id 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                          }`}
                        >
                          {selectedRoadmapId === roadmap.id ? 'Selected' : 'Select'}
                        </button>
                        <button
                          onClick={() => deleteRoadmap(roadmap.id)}
                          className="bg-red-100 text-red-800 hover:bg-red-200 px-2 py-1 rounded text-xs font-semibold"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{roadmap.date}</p>
                    {roadmap.track === 'ai-generated' && (
                      <div className="flex items-center space-x-1 mb-2">
                        <Brain className="h-3 w-3 text-purple-600" />
                        <span className="text-xs text-purple-600 font-medium">AI Generated</span>
                      </div>
                    )}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                        style={{ width: `${roadmap.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{roadmap.progress}% Complete</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Track Selection */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Choose Your Career Track</h2>
              <button
                onClick={saveRoadmap}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
              >
                <Save className="h-4 w-4" />
                <span>Save Roadmap</span>
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(tracks).map(([key, track]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedTrack(key);
                    setSelectedRoadmapId(null);
                    if (key !== 'ai-generated') {
                      setCustomRoadmapSteps([]);
                    }
                  }}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedTrack === key && !selectedRoadmapId
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${track.color} mb-3 flex items-center justify-center`}>
                    <track.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{track.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{track.description}</p>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className={`px-2 py-1 rounded-full ${getDifficultyColor(track.difficulty)}`}>
                      {track.difficulty}
                    </span>
                    <span className="text-gray-500">{track.duration}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{currentTrack.title} Progress</h2>
              <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${currentTrack.color} text-white font-semibold`}>
                {selectedRoadmapId ? 
                  `${savedRoadmaps.find(r => r.id === selectedRoadmapId)?.progress || 0}% Complete` : 
                  selectedTrack === 'ai-generated' ? '0% Complete' : '20% Complete'}
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {currentSteps.filter(s => s.status === 'completed').length}
                </div>
                <div className="text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {currentSteps.filter(s => s.status === 'current').length}
                </div>
                <div className="text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600 mb-2">
                  {currentSteps.filter(s => s.status === 'upcoming' || !s.status).length}
                </div>
                <div className="text-gray-600">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{currentTrack.duration}</div>
                <div className="text-gray-600">Total Duration</div>
              </div>
            </div>
          </div>

          {/* Roadmap Steps */}
          {currentSteps.length > 0 ? (
            <div className="space-y-6">
              {currentSteps.map((step, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${getStatusColor(step.status || 'upcoming')}`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : step.status === 'current' ? (
                          <Clock className="h-6 w-6" />
                        ) : (
                          <span className="font-bold">{index + 1}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{step.duration}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{step.description}</p>
                      
                      {/* Skills */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Skills You'll Learn:</h4>
                        <div className="flex flex-wrap gap-2">
                          {step.skills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Resources */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Learning Resources:</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {step.resources.map((resource, resourceIndex) => (
                            <div key={resourceIndex} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                              <div className="flex items-start space-x-3">
                                <div className="text-purple-600 mt-1">
                                  {getResourceIcon(resource.type)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="font-semibold text-gray-900 text-sm">{resource.title}</h5>
                                    {resource.url && resource.url !== '#' && (
                                      <ExternalLink className="h-3 w-3 text-gray-400" />
                                    )}
                                  </div>
                                  <p className="text-gray-600 text-xs mb-2">{resource.platform}</p>
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                                    {resource.difficulty}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 text-center">
              <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Roadmap Available</h3>
              <p className="text-gray-600 mb-6">
                {selectedTrack === 'ai-generated' 
                  ? 'Generate an AI roadmap to see your personalized learning path!'
                  : 'This career track roadmap is coming soon. Try generating an AI roadmap instead!'
                }
              </p>
              {assessmentResults ? (
                <button
                  onClick={generateAIRoadmap}
                  disabled={isGeneratingRoadmap}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all flex items-center space-x-2 mx-auto"
                >
                  <Brain className="h-5 w-5" />
                  <span>{isGeneratingRoadmap ? 'Generating...' : 'Generate AI Roadmap'}</span>
                </button>
              ) : (
                <button
                  onClick={() => window.location.href = '/take-assessment'}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Take Assessment First
                </button>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => window.location.href = '/explore-opportunities'}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Award className="h-5 w-5" />
              <span>Find Opportunities</span>
            </button>
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