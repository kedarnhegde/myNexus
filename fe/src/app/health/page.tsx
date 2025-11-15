export default async function HealthPage() {
  const res = await fetch('http://localhost:3000/api/health');
  const data = await res.json();
  
  return (
    <div>
      <h1>Health Status</h1>
      <p>Status: {data.status}</p>
    </div>
  );
}