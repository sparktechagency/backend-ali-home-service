import { z } from 'zod';

const insertEmployeeSchema = z.object({
  body: z.object({
    owner: z.string().uuid(), // Assuming owner is a string or foreign key ID
    shop: z.string().uuid(), // Assuming shop is a string or foreign key ID
    user: z.string().uuid(), // Assuming shop is a string or foreign key ID
    phoneNumber: z.string().min(10).max(15), // Phone number length validation
    password: z.string().min(8), // Assuming minimum password length is 8 characters
    department: z.string(),
    isDeleted: z.boolean(), // Boolean flag to check if the employee is deleted
  }),
});
const updateEmployeeSchema = z.object({
  body: z.object({
    owner: z.string().uuid().optional(), // Owner can be optional
    shop: z.string().uuid().optional(), // Shop can be optional
    user: z.string().uuid().optional(), // User can be optional
    phoneNumber: z.string().min(10).max(15).optional(), // Phone number can be optional
    password: z.string().min(8).optional(), // Password can be optional
    department: z.string().optional(), // Department can be optional
    isDeleted: z.boolean().optional(), // isDeleted can be optional
  }),
});

export const employeeValidation = {
  insertEmployeeSchema,
  updateEmployeeSchema,
};
