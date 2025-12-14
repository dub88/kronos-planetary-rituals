import { supabase } from '../config/supabase';

type RitualLog = {
  id: string;
  user_id: string;
  ritual_id: string;
  completed_at: string;
  notes?: string;
  rating: number;
  created_at: string;
};

const integrationDescribe = process.env.RUN_INTEGRATION_TESTS ? describe : describe.skip;

integrationDescribe('Ritual logging integration', () => {
  it('can sign in and insert/fetch ritual logs', async () => {
    const password = process.env.USER_PASSWORD;
    if (!password) {
      throw new Error('Missing USER_PASSWORD environment variable');
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'mpwharton@gmail.com',
      password,
    });

    if (signInError || !data.session) {
      throw new Error(signInError?.message || 'Authentication failed');
    }

    const { data: addedLog, error: addError } = await supabase
      .from('ritual_logs')
      .insert({
        user_id: data.session.user.id,
        ritual_id: 'sun',
        notes: 'Test ritual completion - feeling energized and connected to solar energies!',
        rating: 5,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single<RitualLog>();

    expect(addError).toBeNull();
    expect(addedLog).toBeTruthy();

    const { data: fetchedLogs, error: fetchError } = await supabase
      .from('ritual_logs')
      .select('*')
      .eq('user_id', data.session.user.id)
      .order('completed_at', { ascending: false });

    expect(fetchError).toBeNull();
    expect(fetchedLogs && fetchedLogs.length).toBeGreaterThan(0);
  });
});
