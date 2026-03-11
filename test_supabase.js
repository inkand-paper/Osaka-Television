const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tuhhtruebqvwupitnqgc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1aGh0cnVlYnF2d3VwaXRucWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0Mzc2MTAsImV4cCI6MjA4NjAxMzYxMH0.jmxcCFm0KOEKkh2ERoIocppO7PcKqIk-t2cKdBXYp50';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching products:', error);
  } else {
    console.log('Successfully fetched data. Found records:', data);
  }
}

testFetch();
