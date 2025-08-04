import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUser, supabase } from "../core/auth";
import { type User } from "@supabase/supabase-js";
import { Check, ChevronLeft, Copy, Loader, Plus, QrCode, Share2, Trash2, Minus, PlusCircle } from "lucide-react";
import { type ShoppingList, type ShoppingListItem } from "../core/types";
import { toast } from 'react-hot-toast';

export default function ListView() {
  const { id } = useParams();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [productList, setProductList] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', quantity: '1' });
  const [adding, setAdding] = useState(false);
  const [user, setUser] = useState<User | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser(); 
        if (user) {
            setUser(user);
            if (id && user) {
              loadListData();
            }
        } else {
            navigate('/login'); // Redirigir si no hay usuario
        }
    }
    fetchUser();
  }, [id]);

  const loadListData = async () => {
    try {
      // Cargar productos del usuario
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('name')
        .eq('user_id', user?.id);

      if (productsError) throw productsError;
      setProductList(productsData?.map(p => p.name) || []);
      // Cargar información de la lista
      const { data: listData, error: listError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('id', id)
        .single();

      if (listError) throw listError;

      // Cargar items de la lista
      const { data: itemsData, error: itemsError } = await supabase
        .from('shopping_list_items')
        .select('*')
        .eq('list_id', id)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      setList({
        ...listData,
        is_shared: listData.is_shared || false,
        items_count: itemsData.length,
        collaborators_count: listData.collaborators_count || 0
      });

      itemsData.map(item => ({
        ...item,
        is_checked: item.is_checked,
        quantity: item.quantity || '1 unidad', // Asegurar que siempre haya una cantidad
        product_name: item.product_name || 'Producto sin nombre',
        added_by: item.added_by || 'Desconocido',
        created_at: new Date(item.created_at).toLocaleDateString('es-ES', {
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit'
        }),
        id: item.id,
        list_id: item.list_id
      }));
      setItems(itemsData);
    } catch (error) {
      console.error('Error loading list:', error);
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = async ({itemId, currentState}: {itemId: string, currentState: boolean}) => {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .update({ is_checked: !currentState })
        .eq('id', itemId);

      if (error) throw error;

      // Actualizar estado local
      setItems(items.map(item => 
        item.id === itemId ? { ...item, is_checked: !currentState } : item
      ));
    } catch (error) {
      console.error('Error toggling product:', error);
    }
  };

  const addProduct = async () => {
    if (!newProduct.name.trim()) return;
    
    // Verificar si el producto ya existe en la lista
    const existingProduct = items.find(item => item.product_name.toLowerCase() === newProduct.name.toLowerCase());
    if (existingProduct) {
      toast.error('Este producto ya está en la lista');
      return;
    }

    setAdding(true);
    try {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert([{
          list_id: id,
          product_name: newProduct.name,
          quantity: parseInt(newProduct.quantity) || 1,
          added_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Actualizar lista local
      setItems([data, ...items]);
      
      // Guardar producto en historial del usuario
      await supabase
        .from('products')
        .upsert([{
          user_id: user?.id,
          name: newProduct.name
        }], { 
          onConflict: 'user_id,name',
          ignoreDuplicates: false 
        });

      setNewProduct({ name: '', quantity: '1' });
      setShowAddProduct(false);
      toast.success('Producto añadido');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error al añadir el producto');
    } finally {
      setAdding(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .update({ quantity: newQuantity.toString() })
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity.toString() } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Error al actualizar la cantidad');
    }
  };

  const deleteProduct = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const shareList = async () => {
    try {
      const { error } = await supabase
        .from('shopping_lists')
        .update({ is_shared: true })
        .eq('id', id);

      if (error) throw error;

      setList(list ? { ...list, is_shared: true } : list);
    } catch (error) {
      console.error('Error sharing list:', error);
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
            Lista no encontrada
          </h2>
          <button
            onClick={() => navigate('/home')}
            className="text-blue-500 hover:text-blue-600"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const pendingItems = items.filter(item => !item.is_checked);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/home')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {list.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {pendingItems.length} pendientes
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Add product button */}
        <button
          onClick={() => setShowAddProduct(true)}
          className="w-full mb-6 p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Añadir producto
        </button>

        {/* Product selection dropdown */}
        <div className="mb-6">
          <select
            value={selectedProduct}
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              setNewProduct({ ...newProduct, name: e.target.value });
            }}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Seleccionar producto...</option>
            {productList.map((product) => (
              <option key={product} value={product}>
                {product}
              </option>
            ))}
          </select>
        </div>

        {/* Products list */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-3 ${
                item.is_checked ? 'opacity-60' : ''
              }`}
            >
              <button
                onClick={() => toggleProduct({itemId: item.id, currentState: item.is_checked})}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  item.is_checked
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                }`}
              >
                {item.is_checked && <Check className="w-4 h-4" />}
              </button>
              
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${
                    item.is_checked 
                      ? 'line-through text-gray-500 dark:text-gray-400' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {item.product_name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, parseInt(item.quantity) - 1)}
                      className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      disabled={parseInt(item.quantity) <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, parseInt(item.quantity) + 1)}
                      className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteProduct(item.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Lista vacía
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Añade tu primer producto para empezar
            </p>
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Añadir producto
            </h3>
            <div className="space-y-3 mb-4">
              <input
                type="text"
                placeholder="Nombre del producto"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                autoFocus
                disabled={adding}
                onKeyPress={(e) => e.key === 'Enter' && addProduct()}
              />
              <input
                type="text"
                placeholder="Cantidad (opcional)"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={adding}
                onKeyPress={(e) => e.key === 'Enter' && addProduct()}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddProduct(false)}
                className="flex-1 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                disabled={adding}
              >
                Cancelar
              </button>
              <button
                onClick={addProduct}
                disabled={!newProduct.name.trim() || adding}
                className="flex-1 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {adding && <Loader className="w-4 h-4 animate-spin" />}
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Compartir lista
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Enlace de invitación:</p>
                <p className="text-sm font-mono bg-white dark:bg-gray-800 p-2 rounded border text-gray-800 dark:text-gray-200">
                  {window.location.origin}/share/{id}
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/share/${id}`);
                  }}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </button>
                <button 
                  onClick={shareList}
                  className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  QR
                </button>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
