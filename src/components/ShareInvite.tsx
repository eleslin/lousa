import { Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../core/auth";
import type { User } from "@supabase/supabase-js";
import type { ShoppingList } from "../core/types";

export default function ShareInvite() {
  const { id } = useParams();
  const [list, setList] = useState<ShoppingList>();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<boolean>(false);
  const [user, setUser] = useState<User>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    }
    fetchUser();
    if (id) {
      loadList();
    }
  }, [id]);

  const loadList = async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select(`
          *,
          users(name, email)
        `)
        .eq('id', id)
        .eq('is_shared', true)
        .single();

      if (error) throw error;
      setList(data);
    } catch (error) {
      console.error('Error loading shared list:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinList = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    setJoining(true);
    try {
      // Crear usuario si no existe
      await supabase
        .from('users')
        .upsert([{
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0],
          email: user.email
        }]);

      // Añadir como colaborador
      const { error } = await supabase
        .from('shopping_list_collaborators')
        .insert([{
          list_id: id,
          user_id: user.id
        }]);

      if (error && error.code !== '23505') { // 23505 = duplicate key error
        throw error;
      }

      navigate(`/list/${id}`);
    } catch (error) {
      console.error('Error joining list:', error);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Lista no encontrada o no compartida
          </h2>
          <button
            onClick={() => navigate('/home')}
            className="text-blue-500 hover:text-blue-600"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Te han invitado a colaborar
          </h1>
          <p className="text-white/80 text-lg mb-4">
            Lista: <strong>{list.name}</strong>
          </p>
          {/* <p className="text-white/60">
            Creada por {list.users?.name || list.users?.email}
          </p> */}
        </div>

        {user ? (
          <button
            onClick={joinList}
            disabled={joining}
            className="w-full py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-semibold rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/30 flex items-center justify-center gap-2"
          >
            {joining && <Loader className="w-4 h-4 animate-spin" />}
            {joining ? 'Uniéndose...' : 'Unirse a la lista'}
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-white/80 text-center mb-4">
              Inicia sesión para unirte a esta lista
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/30"
            >
              Iniciar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
