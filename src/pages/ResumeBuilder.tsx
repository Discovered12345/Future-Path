import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, Eye, Plus, Trash2, Edit, Save, FileText, User, Briefcase, GraduationCap, Award, Mail, Phone, MapPin, Calendar, ExternalLink, Sparkles, Loader2, Copy, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { geminiService } from '../services/gemini';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  date: string;
}

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
}

interface SavedResume {
  id: string;
  resume_name: string;
  personal_info: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  awards: string[];
  template: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export default function ResumeBuilder() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('personal');
  const [isPreview, setIsPreview] = useState(false);
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [lastAIRefineDate, setLastAIRefineDate] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Personal Information
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    summary: ''
  });

  // Experience
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [editingExperience, setEditingExperience] = useState<string | null>(null);

  // Education
  const [education, setEducation] = useState<Education[]>([]);
  const [editingEducation, setEditingEducation] = useState<string | null>(null);

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<string | null>(null);

  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  // Awards & Achievements
  const [awards, setAwards] = useState<string[]>([]);
  const [newAward, setNewAward] = useState('');

  useEffect(() => {
    if (user) {
      loadSavedResumes();
      loadLastAIRefineDate();
    }
  }, [user]);

  const loadLastAIRefineDate = () => {
    if (user) {
      const lastRefine = localStorage.getItem(`futurepath-last-ai-refine-${user.id}`);
      setLastAIRefineDate(lastRefine);
    }
  };

  const canUseAIRefine = (): boolean => {
    if (!lastAIRefineDate) return true;
    
    const today = new Date().toDateString();
    const lastRefineDate = new Date(lastAIRefineDate).toDateString();
    
    return today !== lastRefineDate;
  };

  const loadSavedResumes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_resumes')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (error) {
        alert('⚠️ Error Loading Resumes\n\nCould not load your saved resumes. Please refresh the page and try again.');
        return;
      }

      if (data) {
        setSavedResumes(data);
        
        // Load the most recent resume if available
        if (data.length > 0 && !currentResumeId) {
          loadResume(data[0]);
        }
      }
    } catch (error) {
      alert('💥 Unexpected Error\n\nFailed to load resumes. Please refresh the page and try again.');
    }
  };

  const loadResume = (resume: SavedResume) => {
    setCurrentResumeId(resume.id);
    setPersonalInfo(resume.personal_info || {
      fullName: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      summary: ''
    });
    setExperiences(resume.experiences || []);
    setEducation(resume.education || []);
    setProjects(resume.projects || []);
    setSkills(resume.skills || []);
    setAwards(resume.awards || []);
  };

  const saveResume = async (resumeName?: string) => {
    if (!user) return;

    setIsSaving(true);
    
    try {
      const name = resumeName || prompt('📝 Save Resume\n\nEnter a name for your resume:') || 'My Resume';
      
      const resumeData = {
        user_id: user.id,
        resume_name: name,
        personal_info: personalInfo,
        experiences,
        education,
        projects,
        skills,
        awards,
        template: 'professional',
        is_default: savedResumes.length === 0
      };

      let result;
      if (currentResumeId) {
        // Update existing resume
        result = await supabase
          .from('user_resumes')
          .update(resumeData)
          .eq('id', currentResumeId)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Create new resume
        result = await supabase
          .from('user_resumes')
          .insert(resumeData)
          .select()
          .single();
      }

      if (result.error) {
        alert(`⚠️ Save Failed\n\nError saving resume: ${result.error.message}\n\nPlease try again.`);
        return;
      }

      if (result.data) {
        setCurrentResumeId(result.data.id);
        await loadSavedResumes();
        alert('✅ Resume Saved Successfully!\n\nYour resume has been saved and can be accessed anytime.');
      }
    } catch (error) {
      alert(`💥 Unexpected Error\n\nFailed to save resume: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteResume = async (resumeId: string) => {
    if (!user) return;

    const confirmed = confirm('🗑️ Delete Resume\n\nAre you sure you want to delete this resume? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('user_resumes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', resumeId)
        .eq('user_id', user.id);

      if (error) {
        alert(`⚠️ Delete Failed\n\nError deleting resume: ${error.message}\n\nPlease try again.`);
        return;
      }

      if (currentResumeId === resumeId) {
        setCurrentResumeId(null);
      }
      
      await loadSavedResumes();
      alert('✅ Resume Deleted\n\nThe resume has been successfully deleted.');
    } catch (error) {
      alert(`💥 Unexpected Error\n\nFailed to delete resume: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`);
    }
  };

  const refineWithAI = async () => {
    if (!canUseAIRefine()) {
      alert('⏰ Daily Limit Reached\n\nYou can only use AI Refine once per day. This helps ensure quality and prevents overuse.\n\nTry again tomorrow!');
      return;
    }

    // Check if there's content to refine
    if (!personalInfo.summary && experiences.length === 0 && projects.length === 0) {
      alert('📝 No Content to Refine\n\nPlease add some content to your resume first:\n• Professional summary\n• Work experience\n• Projects\n\nThen try AI Refine again.');
      return;
    }

    setIsRefining(true);
    
    try {
      alert('🤖 AI Refinement Starting\n\nOur AI will now review and improve your resume content for grammar, clarity, and impact.\n\nThis may take a moment...');
      
      // Prepare content for AI refinement
      const contentToRefine = {
        summary: personalInfo.summary,
        experiences: experiences.map(exp => ({
          title: exp.title,
          company: exp.company,
          description: exp.description
        })),
        projects: projects.map(proj => ({
          name: proj.name,
          description: proj.description
        }))
      };

      const prompt = `You are a professional resume writer and career coach. Please review and improve the following resume content for grammar, clarity, impact, and professional presentation. Make the language more compelling and action-oriented while keeping it truthful and professional.

Current Resume Content:
${JSON.stringify(contentToRefine, null, 2)}

Please provide improved versions in the same JSON structure. Focus on:
1. Fixing any grammar or spelling errors
2. Using strong action verbs (achieved, developed, implemented, led, etc.)
3. Quantifying achievements where possible (use placeholder numbers if specific data isn't available)
4. Making descriptions more impactful and concise
5. Ensuring professional tone throughout
6. Making each bullet point start with a strong action verb
7. Removing weak words like "helped with" or "responsible for"

Return only the improved JSON structure with the same format. Do not add explanations or additional text.`;

      const response = await geminiService.generateResponse([
        { role: 'user', content: prompt }
      ]);

      // Try to parse the AI response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const improvedContent = JSON.parse(jsonMatch[0]);
          
          // Update the content with AI improvements
          if (improvedContent.summary && typeof improvedContent.summary === 'string') {
            setPersonalInfo(prev => ({ ...prev, summary: improvedContent.summary }));
          }
          
          if (improvedContent.experiences && Array.isArray(improvedContent.experiences)) {
            setExperiences(prev => prev.map((exp, index) => ({
              ...exp,
              description: improvedContent.experiences[index]?.description || exp.description
            })));
          }
          
          if (improvedContent.projects && Array.isArray(improvedContent.projects)) {
            setProjects(prev => prev.map((proj, index) => ({
              ...proj,
              description: improvedContent.projects[index]?.description || proj.description
            })));
          }
          
          // Save the date of AI refinement
          const today = new Date().toISOString();
          localStorage.setItem(`futurepath-last-ai-refine-${user?.id}`, today);
          setLastAIRefineDate(today);
          
          alert('✅ AI Refinement Complete!\n\nYour resume content has been improved for:\n• Grammar and clarity\n• Professional impact\n• Action-oriented language\n• Better formatting\n\nReview the changes and save your resume when ready.');
        } else {
          alert('⚠️ AI Response Format Error\n\nThe AI provided improvements but in an unexpected format. Please try again or manually review your content.');
        }
      } catch (parseError) {
        alert('⚠️ AI Processing Error\n\nThe AI provided suggestions but they could not be automatically applied. Please review your content manually.');
      }
    } catch (error) {
      alert(`💥 AI Refinement Failed\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your internet connection and try again.`);
    } finally {
      setIsRefining(false);
    }
  };

  const downloadPDF = async () => {
    if (!previewRef.current) {
      alert('⚠️ Preview Not Ready\n\nPlease switch to preview mode first, then try downloading.');
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      alert('📄 Generating PDF\n\nCreating your professional resume PDF. This may take a moment...');
      
      // Capture the preview as canvas
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const fileName = `${personalInfo.fullName || 'Resume'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      alert('✅ PDF Downloaded Successfully!\n\nYour resume has been saved as a PDF file. Check your downloads folder.');
    } catch (error) {
      alert(`💥 PDF Generation Failed\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or contact support.`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setExperiences([...experiences, newExp]);
    setEditingExperience(newExp.id);
  };

  const updateExperience = (id: string, updates: Partial<Experience>) => {
    setExperiences(prev => prev.map(exp => 
      exp.id === id ? { ...exp, ...updates } : exp
    ));
  };

  const deleteExperience = (id: string) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
    setEditingExperience(null);
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      location: '',
      startDate: '',
      endDate: '',
      current: true,
      gpa: ''
    };
    setEducation([...education, newEdu]);
    setEditingEducation(newEdu.id);
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    setEducation(prev => prev.map(edu => 
      edu.id === id ? { ...edu, ...updates } : edu
    ));
  };

  const deleteEducation = (id: string) => {
    setEducation(prev => prev.filter(edu => edu.id !== id));
    setEditingEducation(null);
  };

  const addProject = () => {
    const newProj: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: [],
      link: '',
      date: ''
    };
    setProjects([...projects, newProj]);
    setEditingProject(newProj.id);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(proj => 
      proj.id === id ? { ...proj, ...updates } : proj
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(proj => proj.id !== id));
    setEditingProject(null);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  const addAward = () => {
    if (newAward.trim() && !awards.includes(newAward.trim())) {
      setAwards([...awards, newAward.trim()]);
      setNewAward('');
    }
  };

  const removeAward = (index: number) => {
    setAwards(prev => prev.filter((_, i) => i !== index));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to build your resume</h1>
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

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'projects', label: 'Projects', icon: FileText },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'awards', label: 'Awards', icon: Award }
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
          <input
            type="text"
            value={personalInfo.fullName}
            onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={personalInfo.location}
            onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="City, State"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            type="url"
            value={personalInfo.website}
            onChange={(e) => setPersonalInfo({...personalInfo, website: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="https://yourwebsite.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
          <input
            type="url"
            value={personalInfo.linkedin}
            onChange={(e) => setPersonalInfo({...personalInfo, linkedin: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
        <textarea
          value={personalInfo.summary}
          onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Write a brief summary of your background, skills, and career goals..."
        />
      </div>
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Work Experience</h3>
        <button
          onClick={addExperience}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Experience</span>
        </button>
      </div>
      
      {experiences.map((exp) => (
        <div key={exp.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          {editingExperience === exp.id ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => updateExperience(exp.id, { title: e.target.value })}
                  placeholder="Job Title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                  placeholder="Company Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={exp.location}
                  onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                  placeholder="Location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => updateExperience(exp.id, { current: e.target.checked })}
                    className="rounded"
                  />
                  <label className="text-sm text-gray-700">Current Position</label>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                  placeholder="Start Date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {!exp.current && (
                  <input
                    type="month"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                    placeholder="End Date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                )}
              </div>
              <textarea
                value={exp.description}
                onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                rows={4}
                placeholder="Describe your responsibilities and achievements..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingExperience(null)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => deleteExperience(exp.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900">{exp.title || 'Job Title'}</h4>
                <button
                  onClick={() => setEditingExperience(exp.id)}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              <p className="text-gray-700 mb-2">{exp.company} • {exp.location}</p>
              <p className="text-gray-600 text-sm mb-2">
                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
              </p>
              <p className="text-gray-700">{exp.description}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Education</h3>
        <button
          onClick={addEducation}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Education</span>
        </button>
      </div>
      
      {education.map((edu) => (
        <div key={edu.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          {editingEducation === edu.id ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                  placeholder="School Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                  placeholder="Degree"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={edu.location}
                  onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                  placeholder="Location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={edu.gpa || ''}
                  onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                  placeholder="GPA (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="month"
                  value={edu.startDate}
                  onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                  placeholder="Start Date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={edu.current}
                    onChange={(e) => updateEducation(edu.id, { current: e.target.checked })}
                    className="rounded"
                  />
                  <label className="text-sm text-gray-700">Currently Enrolled</label>
                </div>
              </div>
              {!edu.current && (
                <input
                  type="month"
                  value={edu.endDate}
                  onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                  placeholder="Graduation Date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingEducation(null)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => deleteEducation(edu.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900">{edu.degree || 'Degree'}</h4>
                <button
                  onClick={() => setEditingEducation(edu.id)}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              <p className="text-gray-700 mb-2">{edu.school} • {edu.location}</p>
              <p className="text-gray-600 text-sm">
                {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                {edu.gpa && ` • GPA: ${edu.gpa}`}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Projects</h3>
        <button
          onClick={addProject}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Project</span>
        </button>
      </div>
      
      {projects.map((project) => (
        <div key={project.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          {editingProject === project.id ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => updateProject(project.id, { name: e.target.value })}
                  placeholder="Project Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="month"
                  value={project.date}
                  onChange={(e) => updateProject(project.id, { date: e.target.value })}
                  placeholder="Date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <input
                type="url"
                value={project.link || ''}
                onChange={(e) => updateProject(project.id, { link: e.target.value })}
                placeholder="Project Link (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <textarea
                value={project.description}
                onChange={(e) => updateProject(project.id, { description: e.target.value })}
                rows={3}
                placeholder="Describe the project and your role..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="text"
                value={project.technologies.join(', ')}
                onChange={(e) => updateProject(project.id, { technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                placeholder="Technologies used (comma-separated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingProject(null)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900">{project.name || 'Project Name'}</h4>
                <button
                  onClick={() => setEditingProject(project.id)}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-2">{project.date}</p>
              <p className="text-gray-700 mb-2">{project.description}</p>
              {project.technologies.length > 0 && (
                <p className="text-gray-600 text-sm mb-2">
                  <strong>Technologies:</strong> {project.technologies.join(', ')}
                </p>
              )}
              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm">
                  View Project →
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Skills</h3>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
          placeholder="Add a skill..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <button
          onClick={addSkill}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2"
          >
            <span>{skill}</span>
            <button
              onClick={() => removeSkill(index)}
              className="text-purple-600 hover:text-purple-800"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );

  const renderAwards = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Awards & Achievements</h3>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newAward}
          onChange={(e) => setNewAward(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addAward()}
          placeholder="Add an award or achievement..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <button
          onClick={addAward}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-2">
        {awards.map((award, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-3 flex items-center justify-between"
          >
            <span className="text-gray-900">{award}</span>
            <button
              onClick={() => removeAward(index)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPreview = () => (
    <div ref={previewRef} className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto" style={{ fontFamily: 'serif' }}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{personalInfo.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap justify-center gap-4 text-gray-600">
          {personalInfo.email && (
            <div className="flex items-center space-x-1">
              <Mail className="h-4 w-4" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{personalInfo.location}</span>
            </div>
          )}
        </div>
        {(personalInfo.website || personalInfo.linkedin) && (
          <div className="flex flex-wrap justify-center gap-4 text-blue-600 mt-2">
            {personalInfo.website && (
              <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                Website
              </a>
            )}
            {personalInfo.linkedin && (
              <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
                LinkedIn
              </a>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">PROFESSIONAL SUMMARY</h2>
          <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">EDUCATION</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                  <p className="text-gray-700">{edu.school}, {edu.location}</p>
                  {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
                </div>
                <div className="text-right text-gray-600">
                  <p>{edu.startDate} - {edu.current ? 'Present' : edu.endDate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">EXPERIENCE</h2>
          {experiences.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">{exp.title}</h3>
                  <p className="text-gray-700">{exp.company}, {exp.location}</p>
                </div>
                <div className="text-right text-gray-600">
                  <p>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                </div>
              </div>
              {exp.description && (
                <p className="text-gray-700 leading-relaxed">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">PROJECTS</h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900">{project.name}</h3>
                <p className="text-gray-600">{project.date}</p>
              </div>
              <p className="text-gray-700 leading-relaxed mb-2">{project.description}</p>
              {project.technologies.length > 0 && (
                <p className="text-gray-600">
                  <strong>Technologies:</strong> {project.technologies.join(', ')}
                </p>
              )}
              {project.link && (
                <p className="text-blue-600">
                  <strong>Link:</strong> {project.link}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">SKILLS</h2>
          <p className="text-gray-700">{skills.join(' • ')}</p>
        </div>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">AWARDS & ACHIEVEMENTS</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {awards.map((award, index) => (
              <li key={index}>{award}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-white/20 hover:shadow-xl transition-all"
              >
                <ArrowLeft className="h-6 w-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Resume Builder
                </h1>
                <p className="text-gray-600">Create a professional resume that stands out</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refineWithAI}
                disabled={isRefining || !canUseAIRefine()}
                className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={!canUseAIRefine() ? 'AI Refine can only be used once per day' : 'Improve your resume with AI'}
              >
                {isRefining ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                <span>{isRefining ? 'Refining...' : canUseAIRefine() ? 'AI Refine' : 'AI Refine (Used Today)'}</span>
              </button>
              <button
                onClick={() => setIsPreview(!isPreview)}
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-white/20 hover:shadow-xl transition-all"
              >
                <Eye className="h-5 w-5" />
                <span>{isPreview ? 'Edit' : 'Preview'}</span>
              </button>
              <button
                onClick={() => saveResume()}
                disabled={isSaving}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={downloadPDF}
                disabled={isGeneratingPDF || !isPreview}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isGeneratingPDF ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                <span>{isGeneratingPDF ? 'Generating...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>

          {/* Saved Resumes */}
          {savedResumes.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Saved Resumes</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedResumes.map((resume) => (
                  <div key={resume.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">{resume.resume_name}</h3>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => loadResume(resume)}
                          className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 transition-colors"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteResume(resume.id)}
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Updated: {new Date(resume.updated_at).toLocaleDateString()}
                    </p>
                    {resume.is_default && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isPreview ? (
            renderPreview()
          ) : (
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 sticky top-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Resume Sections</h2>
                  <nav className="space-y-2">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                          activeSection === section.id
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                            : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                      >
                        <section.icon className="h-5 w-5" />
                        <span>{section.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
                  {activeSection === 'personal' && renderPersonalInfo()}
                  {activeSection === 'experience' && renderExperience()}
                  {activeSection === 'education' && renderEducation()}
                  {activeSection === 'projects' && renderProjects()}
                  {activeSection === 'skills' && renderSkills()}
                  {activeSection === 'awards' && renderAwards()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}