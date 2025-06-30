import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, User, Award, BookOpen, Briefcase, Users, Clock, Target, GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';
import { AcademicProfile, useAcademicProfile } from '../hooks/useAcademicProfile';

interface AcademicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AcademicProfileModal({ isOpen, onClose }: AcademicProfileModalProps) {
  const { profile, saving, saveProfile, updateProfile, getProfileCompleteness, error } = useAcademicProfile();
  const [activeTab, setActiveTab] = useState('academics');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localProfile, setLocalProfile] = useState<AcademicProfile>({...profile});

  // Update local profile when the main profile changes
  useEffect(() => {
    setLocalProfile({...profile});
  }, [profile]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const success = await saveProfile(localProfile);
    if (success) {
      setSuccessMessage('Academic profile saved successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    }
  };

  const updateLocalProfile = (updates: Partial<AcademicProfile>) => {
    setLocalProfile(prev => ({...prev, ...updates}));
  };

  const addItem = (field: keyof AcademicProfile, defaultItem: any) => {
    const currentArray = localProfile[field] as any[];
    updateLocalProfile({
      [field]: [...currentArray, defaultItem]
    });
  };

  const removeItem = (field: keyof AcademicProfile, index: number) => {
    const currentArray = localProfile[field] as any[];
    updateLocalProfile({
      [field]: currentArray.filter((_, i) => i !== index)
    });
  };

  const updateItem = (field: keyof AcademicProfile, index: number, updates: any) => {
    const currentArray = localProfile[field] as any[];
    const updatedArray = currentArray.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    );
    updateLocalProfile({
      [field]: updatedArray
    });
  };

  const updateArrayItem = (field: keyof AcademicProfile, index: number, value: string) => {
    const currentArray = localProfile[field] as string[];
    const updatedArray = currentArray.map((item, i) => i === index ? value : item);
    updateLocalProfile({
      [field]: updatedArray
    });
  };

  const tabs = [
    { id: 'academics', label: 'Academic Stats', icon: GraduationCap },
    { id: 'activities', label: 'Activities & Awards', icon: Award },
    { id: 'experience', label: 'Experience', icon: Briefcase }
  ];

  const completeness = getProfileCompleteness();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Academic Profile</h2>
              <p className="text-purple-100">Manage your academic information for accurate college matching</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-100">Profile Completeness</span>
              <span className="text-sm font-semibold">{completeness}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${completeness}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'academics' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GPA (4.0 scale) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    value={localProfile.gpa || ''}
                    onChange={(e) => updateLocalProfile({ gpa: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="3.75"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your unweighted GPA on a 4.0 scale
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intended Major
                  </label>
                  <input
                    type="text"
                    value={localProfile.intended_major}
                    onChange={(e) => updateLocalProfile({ intended_major: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Computer Science"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SAT Score (out of 1600)
                  </label>
                  <input
                    type="number"
                    min="400"
                    max="1600"
                    value={localProfile.sat_score || ''}
                    onChange={(e) => updateLocalProfile({ sat_score: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="1350"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your total SAT score (or leave blank if you took the ACT)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ACT Score (out of 36)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={localProfile.act_score || ''}
                    onChange={(e) => updateLocalProfile({ act_score: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="30"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your composite ACT score (or leave blank if you took the SAT)
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Rank
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={localProfile.class_rank || ''}
                    onChange={(e) => updateLocalProfile({ class_rank: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="25"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Your numerical rank in your class (e.g., 5 means you're 5th in your class)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={localProfile.class_size || ''}
                    onChange={(e) => updateLocalProfile({ class_size: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="300"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Total number of students in your graduating class
                  </p>
                </div>
              </div>

              {/* AP Courses */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    AP Courses
                  </label>
                  <button
                    onClick={() => addItem('ap_courses', '')}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Add Course</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {localProfile.ap_courses.map((course, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={course}
                        onChange={(e) => updateArrayItem('ap_courses', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="AP Calculus BC"
                      />
                      <button
                        onClick={() => removeItem('ap_courses', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {localProfile.ap_courses.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No AP courses added yet</p>
                  )}
                </div>
              </div>

              {/* Honors Courses */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Honors Courses
                  </label>
                  <button
                    onClick={() => addItem('honors_courses', '')}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Add Course</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {localProfile.honors_courses.map((course, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={course}
                        onChange={(e) => updateArrayItem('honors_courses', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Honors Chemistry"
                      />
                      <button
                        onClick={() => removeItem('honors_courses', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {localProfile.honors_courses.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No honors courses added yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-6">
              {/* Extracurriculars */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Extracurricular Activities
                  </label>
                  <button
                    onClick={() => addItem('extracurriculars', '')}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Add Activity</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {localProfile.extracurriculars.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={activity}
                        onChange={(e) => updateArrayItem('extracurriculars', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Student Government, Debate Team, etc."
                      />
                      <button
                        onClick={() => removeItem('extracurriculars', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {localProfile.extracurriculars.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No extracurricular activities added yet</p>
                  )}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Awards & Achievements
                  </label>
                  <button
                    onClick={() => addItem('achievements', '')}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Add Achievement</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {localProfile.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) => updateArrayItem('achievements', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Honor Roll, Science Fair Winner, etc."
                      />
                      <button
                        onClick={() => removeItem('achievements', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {localProfile.achievements.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No achievements added yet</p>
                  )}
                </div>
              </div>

              {/* Volunteer Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volunteer Hours
                </label>
                <input
                  type="number"
                  min="0"
                  value={localProfile.volunteer_hours || ''}
                  onChange={(e) => updateLocalProfile({ volunteer_hours: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Total number of community service hours completed
                </p>
              </div>

              {/* Leadership Roles */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Leadership Roles
                  </label>
                  <button
                    onClick={() => addItem('leadership_roles', { title: '', organization: '', duration: '', description: '' })}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Add Role</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {localProfile.leadership_roles.map((role, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Leadership Role {index + 1}</h4>
                        <button
                          onClick={() => removeItem('leadership_roles', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Title/Position</label>
                          <input
                            type="text"
                            value={role.title}
                            onChange={(e) => updateItem('leadership_roles', index, { title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="President, Captain, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Organization</label>
                          <input
                            type="text"
                            value={role.organization}
                            onChange={(e) => updateItem('leadership_roles', index, { organization: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Organization name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Duration</label>
                          <input
                            type="text"
                            value={role.duration}
                            onChange={(e) => updateItem('leadership_roles', index, { duration: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="2022-2024"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Description</label>
                          <textarea
                            value={role.description}
                            onChange={(e) => updateItem('leadership_roles', index, { description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Brief description of responsibilities"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {localProfile.leadership_roles.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No leadership roles added yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-6">
              {/* Work Experience */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Work Experience
                  </label>
                  <button
                    onClick={() => addItem('work_experience', { title: '', company: '', duration: '', description: '' })}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Add Experience</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {localProfile.work_experience.map((work, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Work Experience {index + 1}</h4>
                        <button
                          onClick={() => removeItem('work_experience', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Job Title</label>
                          <input
                            type="text"
                            value={work.title}
                            onChange={(e) => updateItem('work_experience', index, { title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Job title"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Company</label>
                          <input
                            type="text"
                            value={work.company}
                            onChange={(e) => updateItem('work_experience', index, { company: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Company name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Duration</label>
                          <input
                            type="text"
                            value={work.duration}
                            onChange={(e) => updateItem('work_experience', index, { duration: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Summer 2023"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Description</label>
                          <textarea
                            value={work.description}
                            onChange={(e) => updateItem('work_experience', index, { description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Brief description of role and responsibilities"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {localProfile.work_experience.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No work experience added yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Profile {completeness}% complete • {completeness >= 80 ? 'Excellent' : completeness >= 50 ? 'Good' : 'Needs improvement'} for college matching
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}