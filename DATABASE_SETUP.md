# Database Setup for Authentication

## Required Supabase Setup

### 1. Authentication Setup
- Enable Email authentication in Supabase Dashboard
- Go to Authentication > Settings
- Enable "Email" provider
- Configure email templates (optional)

### 2. Row Level Security (RLS)
Add the following policies to your `water_levels` table:

```sql
-- Enable RLS on water_levels table
ALTER TABLE water_levels ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view water_levels data when authenticated
CREATE POLICY "Authenticated users can view water levels" ON water_levels
FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users can insert data (for IoT devices)
CREATE POLICY "Authenticated users can insert water levels" ON water_levels
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Optional: Allow service role to bypass RLS for admin operations
-- This is useful for your IoT devices or admin panel
```

### 3. User Management (Optional)
You can create a users profile table:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Test User Creation
You can create test users through:
- Supabase Dashboard > Authentication > Users > "Add user"
- Or use the app's signup functionality

### 5. Environment Variables (if needed)
If you want to customize authentication:
```javascript
// In supabaseClient.js, you can add:
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Custom redirect URLs for password reset
    // redirectTo: 'your-app://reset-password'
  }
};
```

## Testing Authentication

1. **Sign Up**: Use the app to create a new account
2. **Email Verification**: Check the user's email for verification link
3. **Sign In**: Use created credentials to log in
4. **Password Reset**: Test forgot password functionality
5. **Sign Out**: Test logout functionality

## Security Notes

- All database operations now require authentication
- Users can only access data when logged in
- Password reset emails are sent automatically
- Sessions are automatically managed by Supabase
