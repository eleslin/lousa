-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create shopping_lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on shopping_lists
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

-- Create shopping_items table
CREATE TABLE IF NOT EXISTS shopping_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  category TEXT DEFAULT 'other',
  is_completed BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_days INTEGER,
  last_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on shopping_items
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

-- Create list_members table for sharing lists
CREATE TABLE IF NOT EXISTS list_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, user_id)
);

-- Enable RLS on list_members
ALTER TABLE list_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view lists they own or are members of" ON shopping_lists;
DROP POLICY IF EXISTS "Users can create their own lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can update lists they own" ON shopping_lists;
DROP POLICY IF EXISTS "Users can delete lists they own" ON shopping_lists;

DROP POLICY IF EXISTS "Users can view items from accessible lists" ON shopping_items;
DROP POLICY IF EXISTS "Users can manage items from accessible lists" ON shopping_items;

DROP POLICY IF EXISTS "Users can view members of accessible lists" ON list_members;
DROP POLICY IF EXISTS "List owners can manage members" ON list_members;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for shopping_lists
CREATE POLICY "Users can view lists they own or are members of" ON shopping_lists 
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    id IN (SELECT list_id FROM list_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create their own lists" ON shopping_lists 
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update lists they own" ON shopping_lists 
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete lists they own" ON shopping_lists 
  FOR DELETE USING (owner_id = auth.uid());

-- RLS Policies for shopping_items
CREATE POLICY "Users can view items from accessible lists" ON shopping_items 
  FOR SELECT USING (
    list_id IN (
      SELECT id FROM shopping_lists WHERE 
      owner_id = auth.uid() OR 
      id IN (SELECT list_id FROM list_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage items from accessible lists" ON shopping_items 
  FOR ALL USING (
    list_id IN (
      SELECT id FROM shopping_lists WHERE 
      owner_id = auth.uid() OR 
      id IN (SELECT list_id FROM list_members WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for list_members
CREATE POLICY "Users can view members of accessible lists" ON list_members 
  FOR SELECT USING (
    list_id IN (
      SELECT id FROM shopping_lists WHERE 
      owner_id = auth.uid() OR 
      id IN (SELECT list_id FROM list_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "List owners can manage members" ON list_members 
  FOR ALL USING (
    list_id IN (SELECT id FROM shopping_lists WHERE owner_id = auth.uid())
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE shopping_lists;
ALTER PUBLICATION supabase_realtime ADD TABLE shopping_items;
ALTER PUBLICATION supabase_realtime ADD TABLE list_members;
