import type { User } from '../types/userType';

// Datos hardcodeados
const users: User[] = [
  { id: '1', name: 'Natalia', color: '#3B82F6' },
  { id: '2', name: 'Beto', color: '#10B981' },
];

export const getUsers = () => users;
