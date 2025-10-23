'use client';

import { useEffect, useState } from 'react';

export default function APITestPage() {
  const [result, setResult] = useState<string>('Not tested yet');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      console.log('🔄 Testing API call to companies endpoint');
      
      const response = await fetch('http://127.0.0.1:8000/api/companies/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Data received:', data);
      
      setResult(`Success! Got ${data.length} companies. First: ${JSON.stringify(data[0], null, 2)}`);
    } catch (error) {
      console.error('❌ API Test Error:', error);
      setResult(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Test automatically on page load
    testAPI();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
      
      <button 
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>
      
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Result:</h3>
        <pre className="whitespace-pre-wrap text-sm">{result}</pre>
      </div>
    </div>
  );
}