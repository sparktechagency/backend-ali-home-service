/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryBuilder from '../../builder/QueryBuilder';
import { quotesSearchabFields } from './quotes.constant';
import { IQuotes } from './quotes.interface';
import { Quotes } from './quotes.model';

const insertQuotesintoDb = async (payload: IQuotes) => {
  const result = await Quotes.create(payload);
  return result;
};

const getProviderWiseQuotes = async (query: Record<string, any>) => {
  const { searchTerm, providerId, ...others } = query;
  const andCondition: any[] = [];

  // Add searchTerm condition
  if (searchTerm) {
    andCondition.push({
      $or: quotesSearchabFields.map((field) => ({
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
  }

  // Add the isDeleted condition
  andCondition.push({
    isDeleted: false,
  });

  // Pagination and sorting
  const page = query.page ? parseInt(query.page) : 1;
  const limit = query.limit ? parseInt(query.limit) : 10;
  const skip = (page - 1) * limit;

  // Main condition
  const WhereCondition = andCondition.length > 0 ? { $and: andCondition } : {};

  // Create the aggregation pipeline
  const pipeline: any[] = [
    {
      $match: WhereCondition, // Apply filter conditions
    },
    {
      $lookup: {
        from: 'services', // Lookup in 'Service' collection
        let: { serviceId: '$service' }, // Reference service ID from quotes
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
                      $and: [
                        { $eq: ['$_id', '$$shopId'] }, // Match shop ID
                        { $eq: ['$provider', providerId] }, // Match provider ID from query
                      ],
                    },
                  },
                },
              ],
              as: 'shopDetails', // Get shop details
            },
          },
          {
            $unwind: '$shopDetails', // Unwind shop details array
          },
        ],
        as: 'serviceDetails', // Get service details
      },
    },
    {
      $unwind: '$serviceDetails', // Unwind service details array
    },
    {
      $project: {
        customer: 1,
        service: '$serviceDetails._id',
        shop: '$serviceDetails.shopDetails._id',
        provider: '$serviceDetails.shopDetails.provider',
        fee: 1,
        date: 1,
        status: 1,
        isDeleted: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $facet: {
        total: [{ $count: 'total' }],
        data: [
          { $skip: skip }, // Pagination skip
          { $limit: limit }, // Pagination limit
        ],
      },
    },
  ];

  const result = await Quotes.aggregate(pipeline);

  const total = result[0]?.total[0]?.total || 0; // Get the total count
  const quotes = result[0]?.data || []; // Get paginated quotes

  const totalPages = Math.ceil(total / limit);

  return {
    data: quotes,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

const getAllQuotes = async (query: Record<string, any>) => {
  const QuoteModel = new QueryBuilder(Quotes.find(), query)
    .search([])
    .filter()
    .paginate()
    .fields()
    .sort();

  const data = await QuoteModel.modelQuery;
  const meta = await QuoteModel.countTotal();

  return {
    data,
    meta,
  };
};

const getSingleQuotes = async (id: string) => {
  const result = await Quotes.findById(id).populate('service');
  return result;
};

const updateQuotes = async (id: string, payload: Partial<IQuotes>) => {
  const result = await Quotes.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

export const quotesServices = {
  insertQuotesintoDb,
  getAllQuotes,
  getProviderWiseQuotes,
  getSingleQuotes,
  updateQuotes,
};
