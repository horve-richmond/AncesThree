import React, { useState, useEffect } from 'react';
import { FamilyMember, FamilyEvent, ViewState } from './types';
import FamilyTreeD3 from './components/FamilyTreeD3';
import MemberDetail from './components/MemberDetail';
import Timeline from './components/Timeline';
import { askFamilyHistorian } from './services/geminiService';
import { Users, UserCircle, History, Sparkles, MessageSquare, Search, X, ChevronRight, MapPin, ArrowLeft, Calendar, PlusSquare, Check } from 'lucide-react';

// --- MOCK DATA ---
const MOCK_MEMBERS: FamilyMember[] = [
  {
    id: '1',
    name: 'Ophelia Grand',
    relation: 'root',
    gender: 'female',
    birthDate: '1945-05-12',
    location: 'Accra, Ghana',
    generation: 1,
    parents: [],
    spouses: ['2'],
    children: ['3', '4'],
    attributes: { roles: ['Matriarch', 'Weaver'], skills: ['Textiles', 'Cooking'], traits: ['Wise', 'Patient'] },
    bio: 'The beloved grandmother who started the textile business in Accra.'
  },
  {
    id: '2',
    name: 'Arthur Grand',
    relation: 'spouse',
    gender: 'male',
    birthDate: '1942-03-10',
    deathDate: '2015-11-20',
    location: 'Accra, Ghana',
    generation: 1,
    parents: [],
    spouses: ['1'],
    children: ['3', '4'],
    attributes: { roles: ['Patriarch'], skills: ['Carpentry'], traits: ['Strong', 'Quiet'] },
    bio: 'A master carpenter known for building half the furniture in the neighborhood.'
  },
  {
    id: '3',
    name: 'Joseph Grand',
    relation: 'child',
    gender: 'male',
    birthDate: '1970-08-15',
    location: 'London, UK',
    generation: 2,
    parents: ['1', '2'],
    spouses: [],
    children: ['5'],
    attributes: { roles: ['Provider'], skills: ['Finance'], traits: ['Ambitious'] },
    bio: 'Moved to London in the 90s to pursue banking.'
  },
  {
    id: '4',
    name: 'Sarah Grand',
    relation: 'child',
    gender: 'female',
    birthDate: '1975-02-20',
    location: 'Accra, Ghana',
    generation: 2,
    parents: ['1', '2'],
    spouses: [],
    children: [],
    attributes: { roles: ['Family Historian'], skills: ['Writing'], traits: ['Curious'] },
    bio: 'Keeps the family records and organizes the annual reunion.'
  },
  {
    id: '5',
    name: 'Leo Grand',
    relation: 'child',
    gender: 'male',
    birthDate: '2000-11-05',
    location: 'London, UK',
    generation: 3,
    parents: ['3'],
    spouses: [],
    children: [],
    attributes: { roles: ['The Baby'], skills: ['Coding', 'Music'], traits: ['Creative'] },
    bio: 'Studying Computer Science and loves jazz.'
  }
];

const MOCK_EVENTS: FamilyEvent[] = [
    { id: '1', title: 'Grand Family Moves to Accra', date: '1940-01-01', description: 'The ancestors settled in the Osu district.', type: 'migration', involvedMemberIds: ['1', '2'] },
    { id: '2', title: 'Ophelia & Arthur Marriage', date: '1965-06-12', description: 'A beautiful ceremony attended by the whole village.', type: 'marriage', involvedMemberIds: ['1', '2'] },
    { id: '3', title: 'Joseph Moves to UK', date: '1995-09-01', description: 'Joseph left for university in London.', type: 'migration', involvedMemberIds: ['3'] },
    { id: '4', title: 'Textile Business Founded', date: '1970-03-15', description: 'Ophelia opened her first shop in Makola Market.', type: 'achievement', involvedMemberIds: ['1'] },
];

// Initial state for adding a member
const INITIAL_NEW_MEMBER = {
    name: '',
    gender: 'male',
    birthDate: '',
    location: '',
    relationType: 'child', // child | spouse | parent
    relatedToId: '',
    role: ''
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('tree');
  const [members, setMembers] = useState<FamilyMember[]>(MOCK_MEMBERS);
  const [events, setEvents] = useState<FamilyEvent[]>(MOCK_EVENTS);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FamilyMember>(MOCK_MEMBERS[4]); // Leo as logged in user
  
  // AI Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Member State
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState(INITIAL_NEW_MEMBER);

  const handleMemberSelect = (id: string) => {
    setSelectedMemberId(id);
    setView('profile');
    // Close search/add if open
    setIsSearchOpen(false); 
    setIsAddMemberOpen(false);
  };

  const handleUpdateMember = (updated: FamilyMember) => {
    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
    if (currentUser.id === updated.id) setCurrentUser(updated);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    const response = await askFamilyHistorian(userMsg, members);
    setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
    setIsChatLoading(false);
  };

  const handleAddMemberSubmit = () => {
      if (!newMemberData.name || !newMemberData.relatedToId) return;

      const relatedMember = members.find(m => m.id === newMemberData.relatedToId);
      if (!relatedMember) return;

      const newId = Date.now().toString(); // Simple ID generation
      let newGeneration = relatedMember.generation;

      const newMember: FamilyMember = {
          id: newId,
          name: newMemberData.name,
          gender: newMemberData.gender as 'male' | 'female',
          birthDate: newMemberData.birthDate,
          location: newMemberData.location,
          relation: 'relative', // Default
          parents: [],
          children: [],
          spouses: [],
          attributes: {
              roles: newMemberData.role ? [newMemberData.role] : [],
              skills: [],
              traits: []
          },
          bio: '',
          generation: relatedMember.generation // Placeholder
      };

      // Relationship Logic
      const updatedMembers = [...members];
      const relatedMemberIndex = updatedMembers.findIndex(m => m.id === relatedMember.id);
      
      if (newMemberData.relationType === 'child') {
          // Add as child to selected member
          newMember.parents = [relatedMember.id];
          newMember.generation = relatedMember.generation + 1;
          // Update parent
          updatedMembers[relatedMemberIndex] = {
              ...updatedMembers[relatedMemberIndex],
              children: [...updatedMembers[relatedMemberIndex].children, newId]
          };
      } else if (newMemberData.relationType === 'spouse') {
          // Add as spouse
          newMember.spouses = [relatedMember.id];
          newMember.generation = relatedMember.generation;
          // Update spouse
          updatedMembers[relatedMemberIndex] = {
              ...updatedMembers[relatedMemberIndex],
              spouses: [...updatedMembers[relatedMemberIndex].spouses, newId]
          };
      } else if (newMemberData.relationType === 'parent') {
          // Add as parent
          newMember.children = [relatedMember.id];
          newMember.generation = relatedMember.generation - 1;
          // Update child
          updatedMembers[relatedMemberIndex] = {
              ...updatedMembers[relatedMemberIndex],
              parents: [...updatedMembers[relatedMemberIndex].parents, newId]
          };
      }

      setMembers([...updatedMembers, newMember]);
      setIsAddMemberOpen(false);
      setNewMemberData(INITIAL_NEW_MEMBER);
      
      // Navigate to new member
      setTimeout(() => {
          setSelectedMemberId(newId);
          setView('profile');
      }, 300);
  };

  const isHistoryView = view === 'timeline';

  // Search Filtering Logic
  const filteredMembers = members.filter(member => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
        member.name.toLowerCase().includes(q) ||
        member.location.toLowerCase().includes(q) ||
        member.attributes.roles.some(r => r.toLowerCase().includes(q))
    );
  });

  const filteredEvents = events.filter(event => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
        event.title.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q) ||
        event.date.includes(q)
    );
  });

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* HEADER: Always show, Profile Drawer covers it */}
      <header className="h-16 bg-white flex items-center justify-between px-4 shadow-sm z-50 flex-shrink-0 border-b border-slate-100">
        <h1 className="text-2xl font-black text-indigo-600 tracking-tighter">AncesTree</h1>
        <div className="flex items-center gap-2">
            {/* Add Member Button - Only visible on Tree View (and when not covered by profile) */}
            {view === 'tree' && (
                <button 
                    onClick={() => {
                        setNewMemberData(INITIAL_NEW_MEMBER);
                        setIsAddMemberOpen(true);
                    }}
                    className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <PlusSquare size={20} />
                </button>
            )}
            <button 
                onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(true);
                }}
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
            >
                <Search size={20} />
            </button>
        </div>
      </header>

      {/* FULL PAGE SEARCH DRAWER */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3 bg-white shadow-sm flex-shrink-0">
                <button 
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        autoFocus
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isHistoryView ? "Search family history..." : "Search family lineage..."}
                        className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-full text-base outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {searchQuery.trim() === '' ? (
                    <div className="text-center text-slate-400 mt-20">
                        {isHistoryView ? (
                            <div className="flex flex-col items-center">
                                <History size={48} className="mb-4 opacity-20"/>
                                <p className="text-sm font-medium">Search family milestones, events, and stories.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Users size={48} className="mb-4 opacity-20"/>
                                <p className="text-sm font-medium">Search family members by name, role, or location.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* VIEW: HISTORY/TIMELINE RESULTS */}
                        {isHistoryView && (
                            filteredEvents.length === 0 ? (
                                <p className="text-center text-slate-500 mt-10">No history events found.</p>
                            ) : (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">History Results</h3>
                                    {filteredEvents.map(event => (
                                        <div key={event.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-4">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                    <Calendar size={18} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center mb-1">
                                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                                        {event.date}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-slate-800 text-lg">{event.title}</h4>
                                                <p className="text-slate-600 text-sm mt-1 leading-relaxed">{event.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {/* VIEW: LINEAGE/TREE RESULTS */}
                        {!isHistoryView && (
                            filteredMembers.length === 0 ? (
                                <p className="text-center text-slate-500 mt-10">No members found.</p>
                            ) : (
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lineage Results</h3>
                                    {filteredMembers.map(member => (
                                        <button 
                                            key={member.id}
                                            onClick={() => handleMemberSelect(member.id)}
                                            className="w-full flex items-center p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group border border-transparent hover:border-slate-100"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-4 border-2 border-indigo-50 shadow-sm">
                                                {member.photoUrl ? (
                                                    <img src={member.photoUrl} alt={member.name} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <span className="text-lg">{member.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-800 truncate text-lg group-hover:text-indigo-700">{member.name}</h4>
                                                <div className="flex items-center text-sm text-slate-500 truncate mt-0.5">
                                                    <span className="font-medium text-indigo-500 mr-2">{member.attributes.roles[0] || 'Member'}</span>
                                                    {member.location && (
                                                        <span className="flex items-center text-slate-400 text-xs">
                                                            <MapPin size={10} className="mr-0.5" /> {member.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-500" />
                                        </button>
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
            </div>
        </div>
      )}

      {/* ADD MEMBER DRAWER - Modern Slide In */}
      <div className={`fixed inset-0 z-[60] transition-all duration-300 ${isAddMemberOpen ? 'visible' : 'invisible'}`}>
          {/* Backdrop */}
          <div 
              className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isAddMemberOpen ? 'opacity-100' : 'opacity-0'}`} 
              onClick={() => setIsAddMemberOpen(false)}
          />
          
          {/* Drawer Panel */}
          <div className={`absolute inset-y-0 right-0 w-full sm:max-w-md bg-white flex flex-col shadow-2xl transition-transform duration-500 ease-out ${isAddMemberOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="p-4 border-b flex items-center justify-between bg-white shadow-sm flex-shrink-0">
                  <div className="flex items-center">
                    <button 
                        onClick={() => setIsAddMemberOpen(false)}
                        className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors mr-2"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-lg font-bold text-slate-800">Add Family Member</h2>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Section 1: Connection */}
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                      <h3 className="text-sm font-bold text-indigo-800 mb-3 flex items-center">
                          <Users size={16} className="mr-2" /> Family Connection
                      </h3>
                      <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-indigo-700 uppercase block mb-1">Related To</label>
                            <select 
                                className="w-full p-3 bg-white border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={newMemberData.relatedToId}
                                onChange={e => setNewMemberData({...newMemberData, relatedToId: e.target.value})}
                            >
                                <option value="">Select a family member...</option>
                                {members.map(m => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.attributes.roles[0] || 'Member'})</option>
                                ))}
                            </select>
                        </div>
                        
                        {newMemberData.relatedToId && (
                            <div>
                                <label className="text-xs font-semibold text-indigo-700 uppercase block mb-1">Relationship</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['child', 'spouse', 'parent'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewMemberData({...newMemberData, relationType: type})}
                                            className={`p-2 rounded-lg text-sm font-medium border transition-all ${newMemberData.relationType === type ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                      </div>
                  </div>

                  {/* Section 2: Details */}
                  <div className="space-y-4">
                       <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Full Name</label>
                            <input 
                                type="text"
                                placeholder="e.g., Kofi Mensah"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={newMemberData.name}
                                onChange={e => setNewMemberData({...newMemberData, name: e.target.value})}
                            />
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                           <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Gender</label>
                                <select 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newMemberData.gender}
                                    onChange={e => setNewMemberData({...newMemberData, gender: e.target.value})}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                           </div>
                           <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Birth Date</label>
                                <input 
                                    type="date"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newMemberData.birthDate}
                                    onChange={e => setNewMemberData({...newMemberData, birthDate: e.target.value})}
                                />
                           </div>
                       </div>

                       <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Location</label>
                            <input 
                                type="text"
                                placeholder="City, Country"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={newMemberData.location}
                                onChange={e => setNewMemberData({...newMemberData, location: e.target.value})}
                            />
                       </div>

                       <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Family Role</label>
                            <input 
                                type="text"
                                placeholder="e.g., The Musician"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={newMemberData.role}
                                onChange={e => setNewMemberData({...newMemberData, role: e.target.value})}
                            />
                       </div>
                  </div>
              </div>

              <div className="p-4 border-t bg-white safe-area-bottom">
                  <button 
                    onClick={handleAddMemberSubmit}
                    disabled={!newMemberData.name || !newMemberData.relatedToId}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:active:scale-100"
                  >
                      <Check size={20} className="mr-2" /> Add to Lineage
                  </button>
              </div>
          </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        {/* Render Tree if NOT in timeline view (so it stays in background for Profile slide-over) */}
        {view !== 'timeline' && (
             <FamilyTreeD3 members={members} onSelectMember={handleMemberSelect} />
        )}
        
        {view === 'timeline' && (
            <Timeline events={events} />
        )}

        {/* AI Chat Overlay */}
        {chatOpen && (
            <div className="absolute inset-0 bg-white/95 z-50 flex flex-col backdrop-blur-sm animate-in fade-in slide-in-from-bottom-10">
                <div className="p-4 border-b flex justify-between items-center bg-indigo-600 text-white shadow-md">
                    <h2 className="font-bold flex items-center"><Sparkles size={18} className="mr-2"/> Family Historian AI</h2>
                    <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-white/20 rounded">Close</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.length === 0 && (
                        <div className="text-center text-slate-400 mt-10">
                            <p className="mb-2">Ask me anything about the family history!</p>
                            <p className="text-xs">"Who is the oldest member?"<br/>"When did the family move to Accra?"</p>
                        </div>
                    )}
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-200 text-slate-800 rounded-tl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isChatLoading && <div className="text-xs text-slate-400 animate-pulse">Historian is thinking...</div>}
                </div>
                <form onSubmit={handleChatSubmit} className="p-4 border-t bg-white">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            placeholder="Ask about family history..."
                            className="flex-1 p-3 bg-slate-100 rounded-full border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button type="submit" disabled={isChatLoading} className="p-3 bg-indigo-600 text-white rounded-full shadow-lg disabled:opacity-50">
                            <MessageSquare size={20} />
                        </button>
                    </div>
                </form>
            </div>
        )}
      </main>

      {/* PROFILE DRAWER - Slide Over */}
      <div className={`fixed inset-0 z-[70] bg-white transition-transform duration-500 ease-out ${view === 'profile' ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="h-full w-full overflow-hidden">
            {selectedMemberId && (
                <MemberDetail 
                    member={members.find(m => m.id === selectedMemberId)!} 
                    allMembers={members}
                    events={events}
                    onUpdate={handleUpdateMember}
                    onBack={() => setView('tree')}
                    isSelf={currentUser.id === selectedMemberId}
                />
            )}
         </div>
      </div>

      {/* Floating Action Button for Chat (only visible when chat closed and profile closed) */}
      {!chatOpen && view !== 'profile' && (
          <button 
            onClick={() => setChatOpen(true)}
            className="absolute bottom-24 right-4 w-12 h-12 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-indigo-700 hover:scale-105 transition-all z-40"
          >
              <Sparkles size={24} />
          </button>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="h-20 bg-white border-t border-slate-200 flex justify-around items-center px-2 pb-2 z-50 shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
        <button 
            onClick={() => setView('tree')}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${view === 'tree' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <div className={`p-1 rounded-full ${view === 'tree' ? 'bg-indigo-50' : ''}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21v-8"/><path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/><path d="M5 21v-4.15a4 4 0 0 1 2.4-3.7L12 11"/><path d="M19 21v-4.15a4 4 0 0 0-2.4-3.7L12 11"/></svg>
            </div>
            <span className="text-[10px] font-medium mt-1">Lineage</span>
        </button>

        <button 
            onClick={() => setView('timeline')}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${view === 'timeline' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
             <div className={`p-1 rounded-full ${view === 'timeline' ? 'bg-indigo-50' : ''}`}>
                <History size={24} />
            </div>
            <span className="text-[10px] font-medium mt-1">History</span>
        </button>

        <button 
            onClick={() => {
                setSelectedMemberId(currentUser.id);
                setView('profile');
            }}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${(view === 'profile' && selectedMemberId === currentUser.id) ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
             <div className={`p-1 rounded-full ${(view === 'profile' && selectedMemberId === currentUser.id) ? 'bg-indigo-50' : ''}`}>
                <UserCircle size={24} />
            </div>
            <span className="text-[10px] font-medium mt-1">My Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default App;