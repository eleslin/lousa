export interface ShoppingList {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  items_count?: number; // Número de elementos en la lista
  collaborators_count?: number; // Número de colaboradores en la lista
  is_shared?: boolean; // Indica si la lista es compartida
}

export interface ShoppingListItem {
  id: string;
  list_id: string;
  product_name: string;
  quantity: string;
  is_checked: boolean;
  added_by: string;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  created_at?: string; // Fecha de creación del perfil
  updated_at?: string; // Fecha de última actualización del perfil
}

export interface ShoppingListHistory {
  id: string;
  user_id: string;
  list_id: string;
  saved_at: string;
  shopping_lists?: ShoppingList; // Detalles de la lista guardada
}