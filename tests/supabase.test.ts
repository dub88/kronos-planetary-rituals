import { supabase } from '../config/supabase';

const integrationDescribe = process.env.RUN_INTEGRATION_TESTS ? describe : describe.skip;

integrationDescribe('Supabase integration', () => {
  it('connects and can query basic tables', async () => {
    const { error: connectionError } = await supabase.from('profiles').select('*').limit(1);
    expect(connectionError).toBeNull();

    const { error: authError } = await supabase.auth.getSession();
    expect(authError).toBeNull();
  });
});
