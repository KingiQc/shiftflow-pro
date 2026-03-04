CREATE POLICY "Anyone can check username availability"
ON public.profiles
FOR SELECT
TO anon
USING (true);