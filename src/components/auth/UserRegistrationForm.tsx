import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { userRegistrationService } from '../../services/userRegistrationService';
import type { UserRegistrationData } from '../../services/userRegistrationService';

const registrationSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'operador']),
  department_id: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface UserRegistrationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const UserRegistrationForm: React.FC<UserRegistrationFormProps> = ({ onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const registrationData: UserRegistrationData = {
        email: data.email,
        password: data.password,
        role: data.role,
        department_id: data.department_id ? parseInt(data.department_id) : undefined,
      };

      await userRegistrationService.registerUser(registrationData);
      onSuccess();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al registrar usuario';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Registrar Nuevo Usuario</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            {...register('email')}
            type="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="usuario@ejemplo.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña *
          </label>
          <input
            {...register('password')}
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Mínimo 6 caracteres"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirmar Contraseña *
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Repite la contraseña"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Rol *
          </label>
          <select
            {...register('role')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="operador">Operador</option>
            <option value="admin">Administrador</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        {/* Department ID (only for operadores) */}
        {selectedRole === 'operador' && (
          <div>
            <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">
              ID del Departamento
            </label>
            <input
              {...register('department_id')}
              type="number"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ej: 1, 2, 3..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Opcional. Deja vacío si no hay departamento específico.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Registrando...' : 'Registrar Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserRegistrationForm;
