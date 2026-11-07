// Adresa e backend-it Spring Boot.
// Lokalisht është http://localhost:8080. Online (Vercel) vendoset vetë nga
// variabla BACKEND_URL, përmes scripts/set-server-url.mjs para build-it.
import { BACKEND_URL } from './server-url';

export const SERVER_URL = BACKEND_URL.replace(/\/+$/, '');
export const API_URL = `${SERVER_URL}/api`;

// true  = punon pa backend: një "server demo" brenda shfletuesit (të dhënat ruhen në localStorage)
// false = përdor backend-in e vërtetë Spring Boot në API_URL
export const USE_MOCK_API = false;
