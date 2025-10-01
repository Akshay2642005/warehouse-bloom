import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = { vus: 25, duration: '30s' };

export default function () {
  const token = __ENV.TOKEN;
  const res = http.get(`${__ENV.BASE_URL || 'http://localhost:3000'}/api/analytics/summary`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  check(res, { 'status 200': r => r.status === 200 });
  sleep(1);
}
