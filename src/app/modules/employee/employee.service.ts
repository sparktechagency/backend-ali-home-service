/* eslint-disable @typescript-eslint/no-explicit-any */
import { IEmployee } from './employee.interface';
import Employee from './employee.model';

const GetAllMyEmployees = async (query: Record<string, any>) => {
  const result = await Employee.find(query).populate('user');
  return result;
};

const getSingleEmployee = async (id: string) => {
  const result = await Employee.findById(id).populate('user');
  return result;
};

const updateEmployee = async (id: string, payload: Partial<IEmployee>) => {
  const result = await Employee.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

export const employeeServices = {
  GetAllMyEmployees,
  getSingleEmployee,
  updateEmployee,
};
