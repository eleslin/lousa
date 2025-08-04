import { Loader, ChevronLeft, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../core/auth";
import { type User } from "@supabase/supabase-js";
import type { ShoppingListHistory } from "../core/types";

export default function History() {
  const [histories, setHistories] = useState<ShoppingListHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser(); 
      if (user) {
        setUser(user);
        loadHistory();
      }
    }
    fetchUser();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_list_history')
        .select(`
          *,
          shopping_lists(name, created_at)
        `)
        .eq('user_id', user?.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;
      setHistories(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyList = async (originalListId: string) => {
    try {
      // Obtener la lista original
      const { data: originalList, error: listError } = await supabase
        .from('shopping_lists')
        .select('name')
        .eq('id', originalListId)
        .single();

      if (listError) throw listError;

      // Crear nueva lista
      const { data: newList, error: newListError } = await supabase
        .from('shopping_lists')
        .insert([{
          name: `${originalList.name} (Copia)`,
          owner_id: user?.id
        }])
        .select()
        .single();

      if (newListError) throw newListError;

      // Copiar items
      const { data: originalItems, error: itemsError } = await supabase
        .from('shopping_list_items')
        .select('product_name, quantity')
        .eq('list_id', originalListId);

      if (itemsError) throw itemsError;

      if (originalItems.length > 0) {
        const newItems = originalItems.map(item => ({
          list_id: newList.id,
          product_name: item.product_name,
          quantity: item.quantity,
          added_by: user?.id
        }));

        const { error: copyError } = await supabase
          .from('shopping_list_items')
          .insert(newItems);

        if (copyError) throw copyError;
      }

      navigate(`/list/${newList.id}`);
    } catch (error) {
      console.error('Error copying list:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Historial
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {histories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Sin historial
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Las listas que guardes aparecerán aquí para reutilizar
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {histories.map((history) => (
              <div
                key={history.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {history.shopping_lists?.name || 'Lista eliminada'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Guardada el {new Date(history.saved_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => copyList(history.list_id)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}