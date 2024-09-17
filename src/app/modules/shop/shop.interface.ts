import { Model, ObjectId } from 'mongoose';
import { Iimage, Ilocation } from '../../interface/common';

export interface Ishop {
  provider: ObjectId;
  address: string;
  location: Ilocation;
  name: string;
  license?: string;
  image: Iimage;
  isDeleted?: boolean;
}
export interface ShopModel extends Model<Ishop> {
  isShopExistUnderSameProvider(provider: ObjectId): Promise<Ishop>;
}
