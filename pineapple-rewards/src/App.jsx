import React, { useState, useEffect } from 'react';
import { Plus, Award, Users, TrendingUp, Clock, Lock, Eye, EyeOff, Palette, X } from 'lucide-react';
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
  
  // Nowe stany dla logowania
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Nowe stany dla customizacji kolorów
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedUserForColor, setSelectedUserForColor] = useState(null);
  const [tempGradientFrom, setTempGradientFrom] = useState('');
  const [tempGradientTo, setTempGradientTo] = useState('');

  // Hasło aplikacji - w produkcji powinna być w zmiennej środowiskowej
  const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD

  // Predefiniowane zestawy kolorów
  const colorPresets = [
    { name: 'Niebieski', from: 'blue-100', to: 'cyan-100', border: 'blue-300', shadow: 'blue-200/50' },
    { name: 'Szary', from: 'gray-100', to: 'slate-100', border: 'gray-300', shadow: 'gray-200/50' },
    { name: 'Złoty', from: 'amber-100', to: 'yellow-100', border: 'amber-300', shadow: 'amber-200/50' },
    { name: 'Zielony', from: 'emerald-100', to: 'green-100', border: 'emerald-300', shadow: 'emerald-200/50' },
    { name: 'Fioletowy', from: 'purple-100', to: 'pink-100', border: 'purple-300', shadow: 'purple-200/50' },
    { name: 'Czerwony', from: 'red-100', to: 'rose-100', border: 'red-300', shadow: 'red-200/50' },
    { name: 'Różowy Delikatny', from: 'pink-50', to: 'rose-100', border: 'pink-200', shadow: 'pink-200/50' },
    { name: 'Różowy Intensywny', from: 'pink-100', to: 'fuchsia-100', border: 'pink-300', shadow: 'pink-200/50' },
    { name: 'Różowy Magenta', from: 'fuchsia-100', to: 'pink-200', border: 'fuchsia-300', shadow: 'fuchsia-200/50' },
    { name: 'Różowy Ciepły', from: 'rose-100', to: 'pink-100', border: 'rose-300', shadow: 'rose-200/50' },
    { name: 'Różowy Lawendowy', from: 'pink-100', to: 'purple-100', border: 'pink-300', shadow: 'pink-200/50' },
    { name: 'Różowy Baby', from: 'pink-50', to: 'pink-100', border: 'pink-200', shadow: 'pink-100/50' },
    { name: 'Pomarańczowy', from: 'orange-100', to: 'amber-100', border: 'orange-300', shadow: 'orange-200/50' },
    { name: 'Turkusowy', from: 'teal-100', to: 'cyan-100', border: 'teal-300', shadow: 'teal-200/50' },
    { name: 'Limonkowy', from: 'lime-100', to: 'green-100', border: 'lime-300', shadow: 'lime-200/50' }
  ];

  // Sprawdź czy użytkownik jest zalogowany przy starcie
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('pineapple_auth') === 'true';
    setIsAuthenticated(isLoggedIn);
    if (!isLoggedIn) {
      setLoading(false);
    }
  }, []);

  // Funkcja logowania
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    // Symulacja opóźnienia (opcjonalne)
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === APP_PASSWORD) {
      sessionStorage.setItem('pineapple_auth', 'true');
      setIsAuthenticated(true);
      setPassword('');
      fetchUsers(); // Załaduj dane po zalogowaniu
    } else {
      setLoginError('Niepoprawne hasło! 🔒');
    }
    setIsLoggingIn(false);
  };

  // Funkcja wylogowania
  const handleLogout = () => {
    sessionStorage.removeItem('pineapple_auth');
    setIsAuthenticated(false);
    setUsers([]);
    setLoading(false);
  };

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
        .insert([{ 
          pseudonym: newUserName.trim(), 
          pineapples: 0,
          gradient_from: null,
          gradient_to: null,
          border_color: null,
          shadow_color: null
        }])
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

  // Funkcja otwierania color pickera
  const openColorPicker = (user) => {
    setSelectedUserForColor(user);
    setTempGradientFrom(user.gradient_from || '');
    setTempGradientTo(user.gradient_to || '');
    setShowColorPicker(true);
  };

  // Funkcja zapisywania kolorów
  const saveUserColors = async () => {
    if (!selectedUserForColor) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          gradient_from: tempGradientFrom || null,
          gradient_to: tempGradientTo || null,
          border_color: tempGradientFrom ? `${tempGradientFrom.replace('-100', '-300')}` : null,
          shadow_color: tempGradientFrom ? `${tempGradientFrom.replace('-100', '-200/50')}` : null
        })
        .eq('id', selectedUserForColor.id);

      if (error) throw error;
      
      await fetchUsers();
      setShowColorPicker(false);
      setSelectedUserForColor(null);
    } catch (error) {
      console.error('Błąd podczas zapisywania kolorów:', error);
      alert('Błąd: ' + error.message);
    }
  };

  // Funkcja resetowania kolorów do domyślnych
  const resetUserColors = async () => {
    if (!selectedUserForColor) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          gradient_from: null,
          gradient_to: null,
          border_color: null,
          shadow_color: null
        })
        .eq('id', selectedUserForColor.id);

      if (error) throw error;
      
      await fetchUsers();
      setShowColorPicker(false);
      setSelectedUserForColor(null);
    } catch (error) {
      console.error('Błąd podczas resetowania kolorów:', error);
      alert('Błąd: ' + error.message);
    }
  };

  // Funkcja do uzyskania stylów użytkownika
  const getUserStyles = (user, index) => {
    // Jeśli użytkownik ma niestandardowe kolory
    if (user.gradient_from && user.gradient_to) {
      return {
        style: {
          background: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))`,
          '--tw-gradient-from': getTailwindColor(user.gradient_from),
          '--tw-gradient-to': getTailwindColor(user.gradient_to),
          borderWidth: '2px',
          borderColor: getTailwindColor(user.border_color || user.gradient_from?.replace('-100', '-300')),
          boxShadow: `0 10px 15px -3px ${getTailwindColor(user.shadow_color || user.gradient_from?.replace('-100', '-200'))}40`
        },
        isCustom: true
      };
    }

    // Domyślne kolory na podstawie pozycji
    if (index === 0) {
      return {
        className: 'bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300 shadow-lg shadow-blue-200/50',
        isCustom: false
      };
    } else if (index === 1) {
      return {
        className: 'bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-300 shadow-lg shadow-gray-200/50',
        isCustom: false
      };
    } else if (index === 2) {
      return {
        className: 'bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300 shadow-lg shadow-amber-200/50',
        isCustom: false
      };
    } else {
      return {
        className: 'bg-white/60 border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg',
        isCustom: false
      };
    }
  };

  // Funkcja do konwersji klas Tailwind na wartości CSS
  const getTailwindColor = (tailwindClass) => {
    const colorMap = {
      'blue-50': '#eff6ff', 'blue-100': '#dbeafe', 'blue-200': '#bfdbfe', 'blue-300': '#93c5fd',
      'cyan-50': '#ecfeff', 'cyan-100': '#cffafe', 'cyan-200': '#a5f3fc', 'cyan-300': '#67e8f9',
      'gray-50': '#f9fafb', 'gray-100': '#f3f4f6', 'gray-200': '#e5e7eb', 'gray-300': '#d1d5db',
      'slate-50': '#f8fafc', 'slate-100': '#f1f5f9', 'slate-200': '#e2e8f0', 'slate-300': '#cbd5e1',
      'amber-50': '#fffbeb', 'amber-100': '#fef3c7', 'amber-200': '#fde68a', 'amber-300': '#fcd34d',
      'yellow-50': '#fefce8', 'yellow-100': '#fef9c3', 'yellow-200': '#fef08a', 'yellow-300': '#facc15',
      'emerald-50': '#ecfdf5', 'emerald-100': '#d1fae5', 'emerald-200': '#a7f3d0', 'emerald-300': '#6ee7b7',
      'green-50': '#f0fdf4', 'green-100': '#dcfce7', 'green-200': '#bbf7d0', 'green-300': '#86efac',
      'purple-50': '#faf5ff', 'purple-100': '#f3e8ff', 'purple-200': '#e9d5ff', 'purple-300': '#d8b4fe',
      'pink-50': '#fdf2f8', 'pink-100': '#fce7f3', 'pink-200': '#fbcfe8', 'pink-300': '#f9a8d4',
      'red-50': '#fef2f2', 'red-100': '#fee2e2', 'red-200': '#fecaca', 'red-300': '#fca5a5',
      'rose-50': '#fff1f2', 'rose-100': '#ffe4e6', 'rose-200': '#fecdd3', 'rose-300': '#fda4af',
      'fuchsia-50': '#fdf4ff', 'fuchsia-100': '#fae8ff', 'fuchsia-200': '#f5d0fe', 'fuchsia-300': '#f0abfc',
      'orange-50': '#fff7ed', 'orange-100': '#ffedd5', 'orange-200': '#fed7aa', 'orange-300': '#fdba74',
      'teal-50': '#f0fdfa', 'teal-100': '#ccfbf1', 'teal-200': '#99f6e4', 'teal-300': '#5eead4',
      'lime-50': '#f7fee7', 'lime-100': '#ecfccb', 'lime-200': '#d9f99d', 'lime-300': '#bef264'
    };
    return colorMap[tailwindClass] || '#f3f4f6';
  };

  // Ładuj dane przy starcie tylko jeśli zalogowany
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const totalPineapples = users.reduce((sum, user) => sum + user.pineapples, 0);

  // Ekran logowania
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-200 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-blue-200/50">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <div className="text-4xl mb-4">🍍</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Ananasowe Nagrody
            </h1>
            <p className="text-gray-600">Wprowadź hasło, aby uzyskać dostęp</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Hasło dostępu..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError('');
                }}
                className="w-full p-4 pr-12 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                disabled={isLoggingIn}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoggingIn}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={!password.trim() || isLoggingIn}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sprawdzam...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Zaloguj się
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              🔐 Bezpieczny dostęp do systemu nagród
            </p>
          </div>
        </div>
      </div>
    );
  }

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
      {/* Header z przyciskiem wylogowania */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <Lock className="w-4 h-4" />
            Wyloguj
          </button>
        </div>

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

        {/* Leaderboard z customizacją kolorów */}
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
              {users.map((user, index) => {
                const userStyles = getUserStyles(user, index);
                return (
                  <div 
                    key={user.id}
                    className={`flex items-center justify-between p-6 rounded-2xl transition-all duration-300 hover:scale-102 ${userStyles.className || ''}`}
                    style={userStyles.style || {}}
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
                        <p className="text-gray-500">
                          Pozycja #{index + 1}
                          {userStyles.isCustom && <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">🎨 Custom</span>}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openColorPicker(user)}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-600 p-3 rounded-xl transition-all duration-200 flex items-center gap-2"
                        title="Zmień kolory"
                      >
                        <Palette className="w-4 h-4" />
                        <span className="text-sm font-medium">Kolory</span>
                      </button>
                      
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
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && selectedUserForColor && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-purple-200/50 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Personalizuj Kolory</h3>
              <p className="text-gray-600">
                <span className="font-semibold text-purple-600">{selectedUserForColor.pseudonym}</span>
              </p>
            </div>

            {/* Predefiniowane zestawy kolorów */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Wybierz zestaw kolorów:</h4>
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {colorPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setTempGradientFrom(preset.from);
                      setTempGradientTo(preset.to);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      tempGradientFrom === preset.from && tempGradientTo === preset.to
                        ? 'border-purple-500 ring-2 ring-purple-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      background: `linear-gradient(to right, ${getTailwindColor(preset.from)}, ${getTailwindColor(preset.to)})`
                    }}
                  >
                    <span className="text-xs font-medium text-gray-700 block text-center">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Podgląd */}
            {tempGradientFrom && tempGradientTo && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Podgląd:</h4>
                <div 
                  className="p-4 rounded-xl shadow-lg border-2"
                  style={{
                    background: `linear-gradient(to right, ${getTailwindColor(tempGradientFrom)}, ${getTailwindColor(tempGradientTo)})`,
                    borderColor: getTailwindColor(tempGradientFrom.replace('-100', '-300'))
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700">{selectedUserForColor.pseudonym}</h3>
                        <p className="text-gray-500 text-sm">Przykładowy widok</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-700">{selectedUserForColor.pineapples}</span>
                      <span className="text-2xl">🍍</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowColorPicker(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-xl font-semibold transition-all duration-200 border border-gray-200"
              >
                Anuluj
              </button>
              <button
                onClick={resetUserColors}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-6 py-4 rounded-xl font-semibold transition-all duration-200 border border-red-200"
              >
                Reset
              </button>
              <button
                onClick={saveUserColors}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105"
              >
                <Palette className="w-5 h-5 inline mr-2" />
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}

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