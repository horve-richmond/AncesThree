import React, { useState, useEffect } from 'react';
import { FamilyMember, FamilyEvent, ViewState } from './types';
import FamilyTreeD3 from './components/FamilyTreeD3';
import MemberDetail from './components/MemberDetail';
import Timeline from './components/Timeline';
import { askFamilyHistorian } from './services/geminiService';
import { Users, UserCircle, History, Sparkles, MessageSquare, Search } from 'lucide-react';

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

  const handleMemberSelect = (id: string) => {
    setSelectedMemberId(id);
    setView('profile');
  };

  const handleUpdateMember = (updated: FamilyMember) => {
    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
    // Also update current user if self
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

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* HEADER: Facebook Style */}
      <header className="h-16 bg-white flex items-center justify-between px-4 shadow-sm z-50 flex-shrink-0 border-b border-slate-100">
        <h1 className="text-2xl font-black text-indigo-600 tracking-tighter">AncesTree</h1>
        <button 
          onClick={() => { alert("Search feature coming soon!"); }}
          className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
        >
           <Search size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        {view === 'tree' && (
            <FamilyTreeD3 members={members} onSelectMember={handleMemberSelect} />
        )}
        
        {view === 'profile' && selectedMemberId && (
            <MemberDetail 
                member={members.find(m => m.id === selectedMemberId)!} 
                onUpdate={handleUpdateMember}
                onBack={() => setView('tree')}
                isSelf={currentUser.id === selectedMemberId}
            />
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

      {/* Floating Action Button for Chat (only visible when chat closed) */}
      {!chatOpen && (
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