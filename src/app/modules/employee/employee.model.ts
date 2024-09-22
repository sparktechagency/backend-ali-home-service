import { model, Schema } from 'mongoose';
import { ImageSchema } from '../../../common/schemas/image.schema';
import { IEmployee, Iname } from './employee.interface';
const nameSchema = new Schema<Iname>({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
});
const employeeSchema = new Schema<IEmployee>(
  {
    name: nameSchema,
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    image: ImageSchema,
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Employee = model<IEmployee>('Employee', employeeSchema);
export default Employee;
