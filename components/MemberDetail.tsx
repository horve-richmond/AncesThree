import React, { useState } from 'react';
import { FamilyMember, FamilyEvent } from '../types';
import { generateBio } from '../services/geminiService';
import { User, Calendar, MapPin, Award, Heart, Edit2, Wand2, ArrowLeft, Briefcase, Smile, Star, History, Users } from 'lucide-react';

interface MemberDetailProps {
  member: FamilyMember;
  allMembers: FamilyMember[];
  events: FamilyEvent[];
  onUpdate: (updatedMember: FamilyMember) => void;
  onBack: () => void;
  isSelf: boolean;
}

const MemberDetail: React.FC<MemberDetailProps> = ({ member, allMembers, events, onUpdate, onBack, isSelf }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<FamilyMember>(member);
  const [activeTab, setActiveTab] = useState<'overview' | 'family' | 'attributes' | 'history'>('overview');

  const handleChange = (field: keyof FamilyMember, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAttributeChange = (category: 'skills' | 'roles' | 'traits', value: string) => {
    const list = value.split(',').map(s => s.trim());
    setFormData(prev => ({
        ...prev,
        attributes: { ...prev.attributes, [category]: list }
    }));
  };

  const handleGenerateBio = async () => {
    setIsGenerating(true);
    const newBio = await generateBio(formData);
    setFormData(prev => ({ ...prev, bio: newBio }));
    setIsGenerating(false);
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  // --- DERIVED DATA ---
  const memberEvents = events.filter(e => e.involvedMemberIds.includes(member.id));
  const achievementEvents = memberEvents.filter(e => e.type === 'achievement');
  const historyEvents = memberEvents.filter(e => e.type !== 'achievement' && e.type !== 'marriage');
  const marriageEvents = memberEvents.filter(e => e.type === 'marriage');

  const getMemberName = (id: string) => allMembers.find(m => m.id === id)?.name || 'Unknown';

  // --- EDIT VIEW ---
  if (isEditing) {
    return (
      <div className="h-full w-full bg-white flex flex-col animate-in fade-in">
        <div className="p-4 border-b flex justify-between items-center bg-white z-10 sticky top-0 safe-area-top">
           <button onClick={() => setIsEditing(false)} className="text-slate-500 text-sm font-medium hover:text-slate-800">Cancel</button>
           <h2 className="text-lg font-bold">Edit Profile</h2>
           <button onClick={handleSave} className="text-indigo-600 font-bold text-sm">Save</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
            <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Full Name</label>
                <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => handleChange('name', e.target.value)}
                    className="w-full p-3 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-200 outline-none"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Birth Date</label>
                    <input 
                        type="date" 
                        value={formData.birthDate} 
                        onChange={e => handleChange('birthDate', e.target.value)}
                        className="w-full p-3 border rounded-lg bg-slate-50 outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Location</label>
                    <input 
                        type="text" 
                        value={formData.location} 
                        onChange={e => handleChange('location', e.target.value)}
                        className="w-full p-3 border rounded-lg bg-slate-50 outline-none"
                    />
                </div>
            </div>

            <div>
                 <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Family Roles</label>
                 <input 
                    type="text" 
                    value={formData.attributes.roles.join(', ')} 
                    onChange={e => handleAttributeChange('roles', e.target.value)}
                    className="w-full p-3 border rounded-lg bg-slate-50 outline-none"
                    placeholder="e.g. Elder, Historian"
                />
            </div>

            <div>
                 <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Skills</label>
                 <input 
                    type="text" 
                    value={formData.attributes.skills.join(', ')} 
                    onChange={e => handleAttributeChange('skills', e.target.value)}
                    className="w-full p-3 border rounded-lg bg-slate-50 outline-none"
                    placeholder="e.g. Farming, Teaching"
                />
            </div>

             <div>
                 <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Personality Traits</label>
                 <input 
                    type="text" 
                    value={formData.attributes.traits.join(', ')} 
                    onChange={e => handleAttributeChange('traits', e.target.value)}
                    className="w-full p-3 border rounded-lg bg-slate-50 outline-none"
                    placeholder="e.g. Wise, Calm"
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Biography</label>
                    <button 
                        onClick={handleGenerateBio} 
                        disabled={isGenerating}
                        className="flex items-center text-xs text-indigo-600 font-medium"
                    >
                        <Wand2 size={12} className="mr-1" />
                        {isGenerating ? 'Writing...' : 'AI Writer'}
                    </button>
                </div>
                <textarea 
                    value={formData.bio} 
                    onChange={e => handleChange('bio', e.target.value)}
                    className="w-full p-3 border rounded-lg bg-slate-50 min-h-[150px] outline-none"
                />
            </div>
        </div>
      </div>
    );
  }

  // --- VIEW LAYOUT ---
  return (
    <div className="flex flex-col h-full bg-slate-50">
      
      {/* 1. Header Area (Fixed Top) */}
      <div className="flex-shrink-0 bg-white shadow-sm z-20">
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-700 relative">
            <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-black/20 rounded-full text-white backdrop-blur hover:bg-black/30 transition-colors">
                <ArrowLeft size={20} />
            </button>
            {isSelf && (
                <button 
                    onClick={() => setIsEditing(true)} 
                    className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white backdrop-blur hover:bg-white/30 transition-colors"
                >
                    <Edit2 size={18} />
                </button>
            )}
          </div>
          <div className="px-6 pb-4 relative">
             <div className="flex justify-between items-end -mt-12 mb-3">
                 <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex-shrink-0">
                    {member.photoUrl ? (
                        <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-3xl text-slate-400 font-bold">
                            {member.name.charAt(0)}
                        </div>
                    )}
                 </div>
             </div>
             
             <div>
                <h1 className="text-2xl font-bold text-slate-900 leading-tight">{member.name}</h1>
                <p className="text-indigo-600 font-medium text-sm mt-0.5">{member.attributes.roles[0] || 'Family Member'}</p>
                <div className="flex items-center text-slate-500 mt-2 text-xs font-medium">
                    <span className="flex items-center mr-4"><MapPin size={12} className="mr-1"/> {member.location}</span>
                    {member.deathDate && <span className="text-slate-400">Deceased</span>}
                </div>
             </div>
          </div>
      </div>

      {/* 2. Horizontal Tabs (Sticky) - Pill Style */}
      <div className="flex-shrink-0 bg-white sticky top-0 z-30 py-3">
          <div className="flex px-4 gap-3 overflow-x-auto no-scrollbar snap-x">
            <TabButton 
                active={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')} 
                icon={<User size={16} />} 
                label="Overview" 
            />
            <TabButton 
                active={activeTab === 'family'} 
                onClick={() => setActiveTab('family')} 
                icon={<Heart size={16} />} 
                label="Family" 
            />
            <TabButton 
                active={activeTab === 'attributes'} 
                onClick={() => setActiveTab('attributes')} 
                icon={<Star size={16} />} 
                label="Traits" 
            />
            <TabButton 
                active={activeTab === 'history'} 
                onClick={() => setActiveTab('history')} 
                icon={<History size={16} />} 
                label="Timeline" 
            />
          </div>
      </div>

      {/* 3. Content Pane (Scrollable) */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 pb-24">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Biography */}
                  <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center">
                          <User size={14} className="mr-2 text-indigo-500"/> Biography
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                          {member.bio || "No biography provided."}
                      </p>
                  </section>

                  {/* Personal Info */}
                  <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center">
                          <Calendar size={14} className="mr-2 text-indigo-500"/> Personal Details
                      </h3>
                      <div className="space-y-3">
                           <InfoRow label="Born" value={member.birthDate} />
                           {member.deathDate && <InfoRow label="Died" value={member.deathDate} />}
                           <InfoRow label="Gender" value={member.gender} capitalize />
                           <InfoRow label="Location" value={member.location} />
                           <InfoRow label="Generation" value={`Gen ${member.generation}`} />
                      </div>
                  </section>
              </div>
          )}

          {/* TAB: FAMILY */}
          {activeTab === 'family' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  
                  {/* Marriage Details */}
                  <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center">
                          <Heart size={14} className="mr-2 text-rose-500"/> Marriage Details
                      </h3>
                      {member.spouses.length > 0 ? (
                          <ul className="space-y-3">
                              {member.spouses.map(spouseId => {
                                  const spouseName = getMemberName(spouseId);
                                  const event = marriageEvents.find(e => e.involvedMemberIds.includes(spouseId));
                                  return (
                                      <li key={spouseId} className="flex items-start">
                                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 mr-2 flex-shrink-0"></div>
                                          <div>
                                              <span className="text-slate-800 font-medium block">Spouse: {spouseName}</span>
                                              {event && (
                                                  <span className="text-xs text-slate-500 block mt-0.5">
                                                      Married on {event.date} • {event.title}
                                                  </span>
                                              )}
                                          </div>
                                      </li>
                                  );
                              })}
                          </ul>
                      ) : (
                          <p className="text-slate-500 text-sm italic">No marriage records found.</p>
                      )}
                  </section>

                  {/* Parents & Children */}
                  <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center">
                          <Users size={14} className="mr-2 text-indigo-500"/> Lineage
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                          <div>
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Parents</h4>
                              {member.parents.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                      {member.parents.map(pid => (
                                          <span key={pid} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                                              {getMemberName(pid)}
                                          </span>
                                      ))}
                                  </div>
                              ) : <span className="text-sm text-slate-400 italic">Unknown</span>}
                          </div>
                          
                          <div className="border-t border-slate-50 pt-4">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Children</h4>
                              {member.children.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                      {member.children.map(cid => (
                                          <span key={cid} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                                              {getMemberName(cid)}
                                          </span>
                                      ))}
                                  </div>
                              ) : <span className="text-sm text-slate-400 italic">No children listed</span>}
                          </div>
                      </div>
                  </section>
              </div>
          )}

          {/* TAB: ATTRIBUTES */}
          {activeTab === 'attributes' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  
                  {/* Family Roles */}
                  <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center">
                          <Award size={14} className="mr-2 text-amber-500"/> Roles in Family
                      </h3>
                      <div className="flex flex-wrap gap-2">
                          {member.attributes.roles.length > 0 ? member.attributes.roles.map(role => (
                              <span key={role} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold border border-amber-100">
                                  {role}
                              </span>
                          )) : <span className="text-slate-500 text-sm">No specific roles defined.</span>}
                      </div>
                  </section>

                  {/* Skills & Talents */}
                  <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center">
                          <Briefcase size={14} className="mr-2 text-indigo-500"/> Skills & Talents
                      </h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {member.attributes.skills.length > 0 ? member.attributes.skills.map(skill => (
                              <li key={skill} className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></div>
                                  {skill}
                              </li>
                          )) : <span className="text-slate-500 text-sm">No skills listed.</span>}
                      </ul>
                  </section>

                  {/* Personality */}
                  <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center">
                          <Smile size={14} className="mr-2 text-teal-500"/> Personality Traits
                      </h3>
                      <div className="flex flex-wrap gap-2">
                          {member.attributes.traits.length > 0 ? member.attributes.traits.map(trait => (
                              <span key={trait} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium border border-teal-100">
                                  {trait}
                              </span>
                          )) : <span className="text-slate-500 text-sm">No traits listed.</span>}
                      </div>
                  </section>
              </div>
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'history' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  
                  {/* Achievements */}
                  <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center">
                          <Star size={14} className="mr-2 text-yellow-500"/> Achievements
                      </h3>
                      {achievementEvents.length > 0 ? (
                          <div className="space-y-4">
                              {achievementEvents.map(event => (
                                  <div key={event.id} className="relative pl-4 border-l-2 border-yellow-200">
                                      <div className="text-[10px] font-bold text-yellow-600 mb-0.5">{event.date}</div>
                                      <div className="font-bold text-slate-800 text-sm">{event.title}</div>
                                      <div className="text-xs text-slate-600 mt-1">{event.description}</div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <p className="text-slate-500 text-sm italic">No specific achievements recorded.</p>
                      )}
                  </section>

                  {/* Historical Events */}
                  <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center">
                          <History size={14} className="mr-2 text-indigo-500"/> Historical Events
                      </h3>
                      {historyEvents.length > 0 ? (
                          <div className="space-y-4">
                              {historyEvents.map(event => (
                                  <div key={event.id} className="bg-slate-50 p-3 rounded-xl">
                                      <div className="flex justify-between items-start mb-1">
                                          <span className="font-bold text-slate-800 text-sm">{event.title}</span>
                                          <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded shadow-sm text-slate-500">{event.date}</span>
                                      </div>
                                      <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <p className="text-slate-500 text-sm italic">No other historical events recorded.</p>
                      )}
                  </section>
              </div>
          )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button
        onClick={onClick}
        className={`flex items-center px-5 py-2.5 rounded-full transition-all duration-300 whitespace-nowrap flex-shrink-0 gap-2 snap-center ${
            active
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105 ring-2 ring-indigo-600 ring-offset-1'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
        }`}
    >
        <div className={active ? "text-white" : "text-slate-400"}>
           {icon}
        </div>
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </button>
);

const InfoRow = ({ label, value, capitalize }: { label: string, value: string, capitalize?: boolean }) => (
    <div className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
        <span className="text-xs font-bold text-slate-400 uppercase">{label}</span>
        <span className={`text-sm font-medium text-slate-800 ${capitalize ? 'capitalize' : ''}`}>{value || 'N/A'}</span>
    </div>
);

export default MemberDetail;