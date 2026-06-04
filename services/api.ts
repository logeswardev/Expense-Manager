const BASE_URL = 'http://localhost:2020';

export async function initiateService() {
  const res = await fetch(`${BASE_URL}/initiate`);
  return res.json();
}
