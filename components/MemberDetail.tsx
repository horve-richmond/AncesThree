import React, { useState } from 'react';
import { FamilyMember } from '../types';
import { generateBio } from '../services/geminiService';
import { User, Calendar, MapPin, Award, Heart, Edit2, Wand2, ArrowLeft } from 'lucide-react';

interface MemberDetailProps {
  member: FamilyMember;
  onUpdate: (updatedMember: FamilyMember) => void;
  onBack: () => void;
  isSelf: boolean;
}

const MemberDetail: React.FC<MemberDetailProps> = ({ member, onUpdate, onBack, isSelf }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<FamilyMember>(member);

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

  if (isEditing) {
    return (
      <div className="p-4 pb-24 space-y-4 bg-white min-h-full animate-in fade-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center mb-4">
           <button onClick={() => setIsEditing(false)} className="text-slate-500">Cancel</button>
           <h2 className="text-xl font-bold">Edit Profile</h2>
           <button onClick={handleSave} className="text-indigo-600 font-bold">Save</button>
        </div>

        <div className="space-y-4">
            <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Full Name</label>
                <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => handleChange('name', e.target.value)}
                    className="w-full p-3 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-200 outline-none"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Birth Date</label>
                    <input 
                        type="date" 
                        value={formData.birthDate} 
                        onChange={e => handleChange('birthDate', e.target.value)}
                        className="w-full p-3 border rounded-lg bg-slate-50 outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Location</label>
                    <input 
                        type="text" 
                        value={formData.location} 
                        onChange={e => handleChange('location', e.target.value)}
                        className="w-full p-3 border rounded-lg bg-slate-50 outline-none"
                    />
                </div>
            </div>

            <div>
                 <label className="text-xs font-semibold text-slate-500 uppercase">Family Roles (comma separated)</label>
                 <input 
                    type="text" 
                    value={formData.attributes.roles.join(', ')} 
                    onChange={e => handleAttributeChange('roles', e.target.value)}
                    className="w-full p-3 border rounded-lg bg-slate-50 outline-none"
                    placeholder="e.g. Elder, Historian"
                />
            </div>

            <div>
                 <label className="text-xs font-semibold text-slate-500 uppercase">Skills (comma separated)</label>
                 <input 
                    type="text" 
                    value={formData.attributes.skills.join(', ')} 
                    onChange={e => handleAttributeChange('skills', e.target.value)}
                    className="w-full p-3 border rounded-lg bg-slate-50 outline-none"
                    placeholder="e.g. Farming, Teaching"
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

  return (
    <div className="bg-slate-50 min-h-full pb-24">
      {/* Header Image */}
      <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
        <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-black/20 rounded-full text-white backdrop-blur">
            <ArrowLeft size={20} />
        </button>
        {isSelf && (
            <button 
                onClick={() => setIsEditing(true)} 
                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white backdrop-blur hover:bg-white/30"
            >
                <Edit2 size={18} />
            </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 -mt-16 relative z-10">
        <div className="flex justify-between items-end">
             <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-4xl text-slate-400 font-bold">
                        {member.name.charAt(0)}
                    </div>
                )}
             </div>
        </div>

        <div className="mt-4">
            <h1 className="text-2xl font-bold text-slate-900">{member.name}</h1>
            <div className="flex items-center text-slate-500 mt-1 space-x-4 text-sm">
                <span className="flex items-center"><Calendar size={14} className="mr-1"/> {member.birthDate}</span>
                <span className="flex items-center"><MapPin size={14} className="mr-1"/> {member.location}</span>
            </div>
        </div>

        {/* Roles Badges */}
        <div className="mt-4 flex flex-wrap gap-2">
            {member.attributes.roles.map(role => (
                <span key={role} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium border border-indigo-200">
                    {role}
                </span>
            ))}
        </div>

        {/* Bio Section */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                <User size={18} className="mr-2 text-indigo-500"/> Biography
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm">
                {member.bio || "No biography added yet."}
            </p>
        </div>

        {/* Details Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-md font-bold text-slate-800 mb-3 flex items-center">
                    <Award size={18} className="mr-2 text-amber-500"/> Skills & Talents
                </h3>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    {member.attributes.skills.map(s => <li key={s}>{s}</li>)}
                    {member.attributes.skills.length === 0 && <li>No skills listed.</li>}
                </ul>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-md font-bold text-slate-800 mb-3 flex items-center">
                    <Heart size={18} className="mr-2 text-rose-500"/> Traits
                </h3>
                <div className="flex flex-wrap gap-2">
                     {member.attributes.traits.map(s => (
                         <span key={s} className="px-2 py-1 bg-rose-50 text-rose-600 rounded text-xs">
                             {s}
                         </span>
                     ))}
                     {member.attributes.traits.length === 0 && <span className="text-sm text-slate-500">No traits listed.</span>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;
