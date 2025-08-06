import React, { useState, useEffect } from 'react';
import { Plus, Award, Users, TrendingUp, Clock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Inicjalizacja Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const PineappleRewardsApp = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUserName, setNewUserName] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [rewardReason, setRewardReason] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showGiveReward, setShowGiveReward] = useState(false);
  const [showUserHistory, setShowUserHistory] = useState(false);
  const [selectedUserHistory, setSelectedUserHistory] = useState(null);
  const [userRewards, setUserRewards] = useState([]);

  // Ustaw tytuł strony
  useEffect(() => {
    document.title = '🍍 Ananasowe Nagrody - System Motywacyjny';
  }, []);

  // Pobierz historię nagród dla użytkownika
  const fetchUserRewards = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', userId)
        .order('given_at', { ascending: false });

      if (error) throw error;
      setUserRewards(data || []);
    } catch (error) {
      console.error('Błąd podczas ładowania historii nagród:', error);
    }
  };

  // Pokaż historię użytkownika
  const showHistory = async (user) => {
    setSelectedUserHistory(user);
    await fetchUserRewards(user.id);
    setShowUserHistory(true);
  };

  // Ładuj użytkowników z Supabase
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('pineapples', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Błąd podczas ładowania użytkowników:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dodaj użytkownika do Supabase
  const addUser = async () => {
    if (!newUserName.trim()) return;

    try {
      const { error } = await supabase
        .from('users')
        .insert([{ pseudonym: newUserName.trim(), pineapples: 0 }])
        .select();

      if (error) throw error;
      
      await fetchUsers(); // Odśwież listę
      setNewUserName('');
      setShowAddUser(false);
    } catch (error) {
      console.error('Błąd podczas dodawania użytkownika:', error);
      alert('Błąd: ' + error.message);
    }
  };

  // Przyznaj ananasa w Supabase
  const givePineapple = async () => {
    if (!selectedUser || !rewardReason.trim()) return;

    try {
      // Znajdź użytkownika
      const user = users.find(u => u.id === parseInt(selectedUser));
      if (!user) return;

      // Zaktualizuj liczbę ananasów
      const { error: updateError } = await supabase
        .from('users')
        .update({ pineapples: user.pineapples + 1 })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Dodaj historię nagrody
      const { error: rewardError } = await supabase
        .from('rewards')
        .insert([{
          user_id: user.id,
          reason: rewardReason.trim()
        }]);

      if (rewardError) throw rewardError;

      await fetchUsers(); // Odśwież listę
      setSelectedUser('');
      setRewardReason('');
      setShowGiveReward(false);
    } catch (error) {
      console.error('Błąd podczas przyznawania nagrody:', error);
      alert('Błąd: ' + error.message);
    }
  };

  // Ładuj dane przy starcie
  useEffect(() => {
    fetchUsers();
  }, []);

  const totalPineapples = users.reduce((sum, user) => sum + user.pineapples, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🍍</div>
          <p className="text-xl text-gray-600">Ładowanie ananasów...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-200 text-gray-800">
      {/* Header */}
      <div className="container mx-auto px-6 py-4">
        <div className="text-center mb-8 mt-4">
          <div className="text-6xl mb-4 animate-pulse">🍍</div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Ananasowe Nagrody
          </h1>
          <p className="text-xl text-gray-600">System motywacyjny dla zespołu</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/50 hover:border-blue-400/50 transition-all duration-300 shadow-lg hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Zespół</h3>
                <p className="text-3xl font-bold text-blue-600">{users.length}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-yellow-200/50 hover:border-yellow-400/50 transition-all duration-300 shadow-lg hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Ananasy</h3>
                <p className="text-3xl font-bold text-yellow-600">{totalPineapples}</p>
              </div>
              <div className="text-4xl">🍍</div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-emerald-200/50 hover:border-emerald-400/50 transition-all duration-300 shadow-lg hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Średnia</h3>
                <p className="text-3xl font-bold text-emerald-600">{users.length ? (totalPineapples / users.length).toFixed(1) : 0}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <button
            onClick={() => setShowAddUser(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-4 rounded-2xl font-semibold text-white shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
          >
            <Plus className="w-5 h-5" />
            Dodaj Pracownika
          </button>
          
          <button
            onClick={() => setShowGiveReward(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-8 py-4 rounded-2xl font-semibold text-white shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
          >
            <Award className="w-5 h-5" />
            Przyznaj Ananasa
          </button>
        </div>

        {/* Leaderboard */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            🏆 Ranking Ananasowy
          </h2>
          
          {users.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 opacity-50">🍍</div>
              <p className="text-gray-500 text-lg">Brak użytkowników. Dodaj pierwszego pracownika!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user, index) => (
                <div 
                  key={user.id}
                  className={`flex items-center justify-between p-6 rounded-2xl transition-all duration-300 hover:scale-102 ${
                    index === 0 ? 'bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300 shadow-lg shadow-blue-200/50' :
                    index === 1 ? 'bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-300 shadow-lg shadow-gray-200/50' :
                    index === 2 ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300 shadow-lg shadow-amber-200/50' :
                    'bg-white/60 border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg' :
                      index === 1 ? 'bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg' :
                      index === 2 ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg' :
                      'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-700">{user.pseudonym}</h3>
                      <p className="text-gray-500">Pozycja #{index + 1}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => showHistory(user)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-xl transition-all duration-200 flex items-center gap-2"
                      title="Historia nagród"
                    >
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">Historia</span>
                    </button>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-700">{user.pineapples}</span>
                      <span className="text-3xl">🍍</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal - Poprawiony styling */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-blue-200/50">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Dodaj Pracownika</h3>
              <p className="text-gray-600">Wprowadź pseudonim nowego członka zespołu</p>
            </div>
            
            <input
              type="text"
              placeholder="np. CyberNinja, DataWizard..."
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-800 placeholder-gray-400 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
              onKeyPress={(e) => e.key === 'Enter' && addUser()}
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddUser(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-xl font-semibold transition-all duration-200 border border-gray-200"
              >
                Anuluj
              </button>
              <button
                onClick={addUser}
                disabled={!newUserName.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105 disabled:transform-none"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Dodaj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Give Reward Modal - Poprawiony styling */}
      {showGiveReward && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-yellow-200/50">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🍍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Przyznaj Ananasa</h3>
              <p className="text-gray-600">Docień dobrej pracy swojego zespołu</p>
            </div>
            
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-800 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-lg"
            >
              <option value="">👤 Wybierz pracownika...</option>
              {users.map(user => (
                <option key={user.id} value={user.id} className="bg-white py-2">
                  {user.pseudonym} ({user.pineapples} 🍍)
                </option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Za co nagroda? (np. 'Świetny kod', 'Pomoc koledze')"
              value={rewardReason}
              onChange={(e) => setRewardReason(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-800 placeholder-gray-400 mb-6 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-lg"
              onKeyPress={(e) => e.key === 'Enter' && givePineapple()}
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowGiveReward(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-xl font-semibold transition-all duration-200 border border-gray-200"
              >
                Anuluj
              </button>
              <button
                onClick={givePineapple}
                disabled={!selectedUser || !rewardReason.trim()}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105 disabled:transform-none"
              >
                <Award className="w-5 h-5 inline mr-2" />
                Daj Ananasa!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User History Modal */}
      {showUserHistory && selectedUserHistory && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-purple-200/50 max-h-[80vh] overflow-hidden">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Historia Nagród</h3>
              <p className="text-gray-600">
                <span className="font-semibold text-purple-600">{selectedUserHistory.pseudonym}</span>
                <span className="mx-2">•</span>
                <span>{selectedUserHistory.pineapples} 🍍</span>
              </p>
            </div>
            
            <div className="max-h-80 overflow-y-auto mb-6">
              {userRewards.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4 opacity-50">🤷‍♂️</div>
                  <p className="text-gray-500">Brak historii nagród</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userRewards.map((reward) => (
                    <div 
                      key={reward.id}
                      className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">🍍</div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium mb-1">{reward.reason}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(reward.given_at).toLocaleDateString('pl-PL', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowUserHistory(false)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PineappleRewardsApp;