import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { employeeServices } from './employee.service';

const GetAllMyEmployees = catchAsync(async (req: Request, res: Response) => {
  const result = await employeeServices.GetAllMyEmployees(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Employees retrieved successfully',
    data: result,
  });
});
const getSingleEmployee = catchAsync(async (req: Request, res: Response) => {
  const result = await employeeServices.getSingleEmployee(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Employee retrieved successfully',
    data: result,
  });
});
const updateEmployee = catchAsync(async (req: Request, res: Response) => {
  const result = await employeeServices.updateEmployee(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Employee updated successfully',
    data: result,
  });
});

export const employeeControllers = {
  GetAllMyEmployees,
  getSingleEmployee,
  updateEmployee,
};
