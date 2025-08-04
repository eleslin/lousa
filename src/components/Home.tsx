import { History, Loader, Plus, User as UserIcon, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getUser, supabase } from "../core/auth";
import { useNavigate } from "react-router-dom";
import { type User } from "@supabase/supabase-js";
import type { ShoppingList } from "../core/types";

// Home.tsx - Página protegida con cierre de sesión
export default function Home() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const [user, setUser] = useState<User>();
  const navigate = useNavigate();

  // Cargar listas del usuario
  useEffect(() => {
    const fetchUserAndLists = async () => {
      const user = await getUser();
      if (user) {
        setUser(user);
        loadLists();
      }
    };
    fetchUserAndLists();
  }, []);

  const loadLists = async () => {
    try {
      // Obtener listas propias y compartidas
      const { data, error } = await supabase
        .from('shopping_lists')
        .select(`
          *,
          shopping_list_items(count),
          shopping_list_collaborators(count)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Procesar datos para mostrar información adicional
      const processedLists = data.map(list => ({
        ...list,
        items_count: list.shopping_list_items?.[0]?.count || 0,
        collaborators_count: list.shopping_list_collaborators?.[0]?.count || 0
      }));

      setLists(processedLists);
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .insert([{
          name: newListName,
          owner_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Crear usuario si no existe
      await supabase
        .from('users')
        .upsert([{
          id: user?.id,
          email: user?.email
        }]);

      setNewListName('');
      setShowCreateModal(false);
      loadLists();
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"> 
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No estás autenticado</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Por favor, inicia sesión para continuar.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🛒</div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Lousa</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/history')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <History className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Hola! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Tienes {lists.length} listas de compra activas
          </p>
        </div>

        {/* Create new list button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full mb-6 p-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Crear nueva lista
        </button>

        {/* Lists grid */}
        <div className="grid gap-4">
          {lists.map((list) => (
            <div
              key={list.id}
              onClick={() => navigate(`/list/${list.id}`)}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {list.name}
                </h3>
                {list.is_shared && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                    <Users className="w-3 h-3" />
                    Compartida
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{list.items_count} productos</span>
                <span>{new Date(list.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {lists.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No tienes listas aún
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Crea tu primera lista de compra para empezar
            </p>
          </div>
        )}
      </main>

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nueva lista de compra
            </h3>
            <input
              type="text"
              placeholder="Nombre de la lista"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4"
              autoFocus
              disabled={creating}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                disabled={creating}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateList}
                disabled={!newListName.trim() || creating}
                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {creating && <Loader className="w-4 h-4 animate-spin" />}
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
