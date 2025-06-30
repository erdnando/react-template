// Test login functionality
console.log('Testing login...');

// Simular datos de prueba
const testCredentials = {
  email: 'admin@sistema.com',
  password: 'test123'
};

console.log('Test credentials:', testCredentials);

// Verificar que localStorage esté funcionando
localStorage.setItem('test', 'working');
console.log('LocalStorage test:', localStorage.getItem('test'));
localStorage.removeItem('test');

// Verificar que authService esté disponible
import { authService } from './services/authApiService';
console.log('AuthService methods:', Object.keys(authService));
