/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryBuilder from '../../builder/QueryBuilder';
import calculatePagination from '../../shared/paginationHelper';
import { sendNotification } from '../notification/notification.utils';
import { Provider } from '../provider/provider.model';
import { hireRequestFilterableFields } from './hireRequest.constant';
import { IhireRequest } from './hireRequest.interface';
import HireRequest from './hireRequest.model';

const insertHireRequestIntoDb = async (payload: IhireRequest) => {
  const findFcmToken = await Provider.findById(payload?.provider).select(
    'fcmToken',
  );
  console.log(payload);

  // const findCustomer = await Customer.findById(payload?.customer).select(
  //   'fcmToken',
  // );
  const result = await HireRequest.create(payload);
  const message = {
    title: 'New hire request',
    body: 'A customer sent a hire request. please check the dashboard',
    data: {
      receiver: payload?.provider,
      type: 'hireRequest',
    },
  };
  await sendNotification([findFcmToken?.fcmToken as string], message);
  return result;
};

//  get all my hire request
const getAllMyHireRequest = async (query: Record<string, any>) => {
  const {
    searchTerm,
    profileId,
    page: pages,
    limit: limits,
    size: sizes,
    ...others
  } = query;
  const andCondition: any[] = [];

  // Add searchTerm condition
  if (searchTerm) {
    andCondition.push({
      $or: hireRequestFilterableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  // Add other filters
  if (Object.keys(others).length) {
    andCondition.push({
      $and: Object.entries(others).map(([field, value]) => ({
        [field]: value,
      })),
    });

    // Add the isDeleted condition
    andCondition.push({ isDeleted: false });
  }

  // Pagination and sorting
  const { page, limit } = calculatePagination(query);
  const skip = (page - 1) * limit;

  // Add main condition
  const WhereCondition = andCondition.length > 0 ? { $and: andCondition } : {};

  // Create the aggregation pipeline
  const pipeline: any[] = [
    {
      $match: WhereCondition, // Apply filter condition
    },
    {
      $lookup: {
        from: 'services', // Lookup in 'Service' collection
        let: { serviceId: '$service' }, // Reference service ID from hireRequest
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$serviceId'], // Match service ID
              },
            },
          },
          {
            $lookup: {
              from: 'shops', // Lookup in 'Shop' collection
              let: { shopId: '$shop' }, // Reference shop ID from service
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$shopId'], // Match shop ID
                    },
                  },
                },
                {
                  $lookup: {
                    from: 'providers', // Lookup in 'Provider' collection
                    let: { providerId: '$provider' }, // Reference provider ID from shop
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ['$_id', '$$providerId'] }, // Match provider ID
                              { $eq: ['$profileId', profileId] }, // Match profileId to provider
                            ],
                          },
                        },
                      },
                    ],
                    as: 'providerDetails', // Get provider details
                  },
                },
                {
                  $unwind: {
                    path: '$providerDetails', // Unwind provider details array
                    preserveNullAndEmptyArrays: true, // Keep shops without providers
                  },
                },
              ],
              as: 'shopDetails', // Get shop details
            },
          },
          {
            $unwind: {
              path: '$shopDetails', // Unwind shop details array
              preserveNullAndEmptyArrays: true, // Keep services without shops
            },
          },
        ],
        as: 'serviceDetails', // Get service details
      },
    },

    {
      $unwind: {
        path: '$serviceDetails', // Unwind service details array
        preserveNullAndEmptyArrays: true, // Keep hire requests without services
      },
    },
    {
      $lookup: {
        from: 'customers', // Lookup in 'Customer' collection
        localField: 'customer', // Field in HireRequest
        foreignField: '_id', // Field in Customer
        as: 'customerDetails', // Output array field for customer details
      },
    },
    {
      $unwind: '$customerDetails', // Unwind to get single customer object
    },

    {
      $project: {
        customerName: '$customerDetails.name',
        customerImage: '$customerDetails.image',
        service: '$serviceDetails._id',
        shop: '$serviceDetails.shopDetails._id',
        provider: '$serviceDetails.shopDetails.providerDetails._id',
        profileId: '$serviceDetails.shopDetails.providerDetails.profileId',
        address: 1,
        description: 1,
        status: 1,
        priority: 1,
        isDeleted: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $facet: {
        total: [{ $count: 'total' }],
        data: [
          { $skip: skip }, // Skip for pagination
          { $limit: limit }, // Limit the number of results
        ],
      },
    },
  ];

  const result = await HireRequest.aggregate(pipeline);

  const total = result[0]?.total[0]?.total || 0; // Get total count
  const data = result[0]?.data || []; // Get paginated data

  const totalPage = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPage,
    },
  };
};

// customer

const getAllHireRequests = async (query: Record<string, any>) => {
  const hireModel = new QueryBuilder(
    HireRequest.find().populate({
      path: 'service',
      populate: [
        {
          path: 'category', // Populate category within service
          select: 'title', // Replace with actual fields from category
        },
        {
          path: 'shop', // Populate shop within service
          select: 'name', // Replace with actual fields from shop
        },
      ],
    }),
    query,
  )
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await hireModel.modelQuery;
  const meta = await hireModel.countTotal();

  return {
    data,
    meta,
  };
};

const getSingleHireReuqest = async (id: string) => {
  const result = await HireRequest.findById(id)
    .populate({
      path: 'customer',
      select: 'name address location image',
      populate: {
        path: 'user',
        select: 'countryCode phoneNumber',
      },
    })
    .populate({
      path: 'service',
      populate: {
        path: 'category',
        select: 'title',
      },
    });
  return result;
};
const updateHireRequest = async (
  id: string,
  payload: Partial<IhireRequest>,
) => {
  const result = await HireRequest.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

export const hirRequestServices = {
  insertHireRequestIntoDb,
  getAllHireRequests,
  getAllMyHireRequest,
  getSingleHireReuqest,
  updateHireRequest,
};
